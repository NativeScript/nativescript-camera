import types = require("utils/types");
import * as imageSourceModule from "image-source";
import * as imageAssetModule from "image-asset";
import * as frameModule from "ui/frame";
import * as trace from "trace";

class UIImagePickerControllerDelegateImpl extends NSObject implements UIImagePickerControllerDelegate {
    public static ObjCProtocols = [UIImagePickerControllerDelegate];

    static new(): UIImagePickerControllerDelegateImpl {
        return <UIImagePickerControllerDelegateImpl>super.new();
    }

    private _callback: (result?) => void;

    private _width: number;
    private _height: number;
    private _keepAspectRatio: boolean;
    private _saveToGallery: boolean;

    public initWithCallback(callback: (result?) => void): UIImagePickerControllerDelegateImpl {
        this._callback = callback;
        return this;
    }

    public initWithCallbackAndOptions(callback: (result?) => void, options?): UIImagePickerControllerDelegateImpl {
        this._callback = callback;
        if (options) {
            this._width = options.width;
            this._height = options.height;
            this._saveToGallery = options.saveToGallery;
            this._keepAspectRatio = types.isNullOrUndefined(options.keepAspectRatio) ? true : options.keepAspectRatio;
        }
        return this;
    }

    // create date from a string with format yyyy:MM:dd HH:mm:ss (like the format used in image description)
    private createDateFromString(value: string): Date {
        let year = parseInt(value.substr(0, 4));
        let month = parseInt(value.substr(5, 2));
        let date = parseInt(value.substr(8, 2));

        let hour = parseInt(value.substr(11, 2));
        let minutes = parseInt(value.substr(14, 2));
        let seconds = parseInt(value.substr(17, 2));

        return new Date(year, month - 1, date, hour, minutes, seconds);
    }

    imagePickerControllerDidFinishPickingMediaWithInfo(picker, info): void {
        if (info) {
            let creationDate: Date = new Date();
            let picInfo = info.valueForKey(UIImagePickerControllerMediaMetadata);
            if (picInfo) {
                let tiff = picInfo.valueForKey("{TIFF}");
                if (tiff) {
                    let creationDateStr = tiff.valueForKey("DateTime");
                    creationDate = this.createDateFromString(creationDateStr);
                }
            }
            let source = info.valueForKey(UIImagePickerControllerOriginalImage);
            if (source) {
                let image = null;
                let imageSource: typeof imageSourceModule = require("image-source");

                let imageSourceResult = imageSource.fromNativeSource(source);

                if (this._callback) {
                    let imageAsset: imageAssetModule.ImageAsset;
                    if (this._saveToGallery) {
                        PHPhotoLibrary.sharedPhotoLibrary().performChangesCompletionHandler(() => {PHAssetChangeRequest.creationRequestForAssetFromImage(imageSourceResult.ios);}, (success, err) => {
                            if (success) {
                                let fetchOptions = PHFetchOptions.alloc().init();
                                let sortDescriptors = NSArray.arrayWithObject(NSSortDescriptor.sortDescriptorWithKeyAscending("creationDate", false));
                                fetchOptions.sortDescriptors = sortDescriptors;
                                fetchOptions.predicate = NSPredicate.predicateWithFormatArgumentArray("mediaType = %d", NSArray.arrayWithObject(PHAssetMediaType.Image));
                                let fetchResult = PHAsset.fetchAssetsWithOptions(fetchOptions);
                                for(let i = 0; i < fetchResult.count; i++) {
                                    if (creationDate.valueOf() < (<PHAsset>fetchResult[i]).creationDate.valueOf()) {
                                        let asset = <PHAsset>fetchResult[i];
                                        imageAsset = new imageAssetModule.ImageAsset(asset);
                                        break;
                                    }
                                }
                                this.setImageAssetAndCallCallback(imageAsset);
                            } else {
                                trace.write("An error ocured while saving image to gallery: " + err , trace.categories.Error, trace.messageType.error);
                            }

                        });
                    }
                    else {
                        imageAsset = new imageAssetModule.ImageAsset(imageSourceResult.ios);
                        this.setImageAssetAndCallCallback(imageAsset);
                    }
                }
            }
        }
        picker.presentingViewController.dismissViewControllerAnimatedCompletion(true, null);
        listener = null;
    }

    private setImageAssetAndCallCallback(imageAsset: imageAssetModule.ImageAsset) {
        imageAsset.options = {
            width: this._width,
            height: this._height,
            keepAspectRatio: this._keepAspectRatio
        };
        this._callback(imageAsset);
    }

    imagePickerControllerDidCancel(picker): void {
        picker.presentingViewController.dismissViewControllerAnimatedCompletion(true, null);
        listener = null;
    }
}

var listener;

export var takePicture = function (options): Promise<any> {
    return new Promise((resolve, reject) => {
        listener = null;
        let imagePickerController = UIImagePickerController.new();
        let reqWidth = 0;
        let reqHeight = 0;
        let keepAspectRatio = true;
        let saveToGallery = true;
        if (options) {
            reqWidth = options.width || 0;
            reqHeight = options.height || reqWidth;
            keepAspectRatio = types.isNullOrUndefined(options.keepAspectRatio) ? true : options.keepAspectRatio;
            saveToGallery = options.saveToGallery ? true : false;
        }

        let authStatus = PHPhotoLibrary.authorizationStatus();
        if (authStatus !== PHAuthorizationStatus.Authorized) {
            saveToGallery = false;
        }

        if (reqWidth && reqHeight) {
            listener = UIImagePickerControllerDelegateImpl.new().initWithCallbackAndOptions(resolve, { width: reqWidth, height: reqHeight, keepAspectRatio: keepAspectRatio, saveToGallery: saveToGallery });
        } else if (saveToGallery) {
            listener = UIImagePickerControllerDelegateImpl.new().initWithCallbackAndOptions(resolve, { saveToGallery: saveToGallery, keepAspectRatio: keepAspectRatio });
        }
        else {
            listener = UIImagePickerControllerDelegateImpl.new().initWithCallback(resolve);
        }
        imagePickerController.delegate = listener;

        let sourceType = UIImagePickerControllerSourceType.Camera;
        let mediaTypes = UIImagePickerController.availableMediaTypesForSourceType(sourceType);

        if (mediaTypes) {
            imagePickerController.mediaTypes = mediaTypes;
            imagePickerController.sourceType = sourceType;
        }

        imagePickerController.modalPresentationStyle = UIModalPresentationStyle.CurrentContext;

        let frame: typeof frameModule = require("ui/frame");

        let topMostFrame = frame.topmost();
        if (topMostFrame) {
            let viewController: UIViewController = topMostFrame.currentPage && topMostFrame.currentPage.ios;
            if (viewController) {
                viewController.presentViewControllerAnimatedCompletion(imagePickerController, true, null);
            }
        }
    });
}

export var isAvailable = function () {
    return UIImagePickerController.isSourceTypeAvailable(UIImagePickerControllerSourceType.Camera);
}

export var requestPermissions = function () {
    let authStatus = PHPhotoLibrary.authorizationStatus();
    if (authStatus === PHAuthorizationStatus.NotDetermined) {
        PHPhotoLibrary.requestAuthorization((auth) => {
            if (auth === PHAuthorizationStatus.Authorized) {
                if (trace.isEnabled()) {
                    trace.write("Application can access photo library assets.", trace.categories.Debug);
                }
                return;
            }
        })
    } else if (authStatus !== PHAuthorizationStatus.Authorized) {
        if (trace.isEnabled()) {
            trace.write("Application can not access photo library assets.", trace.categories.Debug);
        }
    }
}
