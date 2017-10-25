import * as typesModule from "utils/types";
import * as utilsModule from "utils/utils";
import * as applicationModule from "application";
import * as imageSourceModule from "image-source";
import * as imageAssetModule from "image-asset";
import * as trace from "trace";
import * as platform from "platform";

let REQUEST_IMAGE_CAPTURE = 3453;
let REQUEST_REQUIRED_PERMISSIONS = 1234;

export let takePicture = function (options?): Promise<any> {
    return new Promise((resolve, reject) => {
        try {
            if ((<any>android.support.v4.content.ContextCompat).checkSelfPermission(applicationModule.android.currentContext,
                (<any>android).Manifest.permission.CAMERA) !== android.content.pm.PackageManager.PERMISSION_GRANTED) {
                reject(new Error("Application does not have permissions to use Camera"));
                return;
            }

            let types: typeof typesModule = require("utils/types");
            let utils: typeof utilsModule = require("utils/utils");

            let saveToGallery;
            let reqWidth;
            let reqHeight;
            let shouldKeepAspectRatio;

            let density = utils.layout.getDisplayDensity();
            if (options) {
                saveToGallery = options.saveToGallery ? true : false;
                reqWidth = options.width ? options.width * density : 0;
                reqHeight = options.height ? options.height * density : reqWidth;
                shouldKeepAspectRatio = types.isNullOrUndefined(options.keepAspectRatio) ? true : options.keepAspectRatio;
            }

            if ((<any>android.support.v4.content.ContextCompat).checkSelfPermission(applicationModule.android.currentContext,
                (<any>android).Manifest.permission.WRITE_EXTERNAL_STORAGE) !== android.content.pm.PackageManager.PERMISSION_GRANTED) {
                saveToGallery = false;
            }

            let takePictureIntent = new android.content.Intent(android.provider.MediaStore.ACTION_IMAGE_CAPTURE);
            let dateStamp = createDateTimeStamp();

            let picturePath: string;
            let nativeFile;
            let tempPictureUri;

            if (saveToGallery) {
                picturePath = android.os.Environment.getExternalStoragePublicDirectory(
                    android.os.Environment.DIRECTORY_DCIM).getAbsolutePath() + "/Camera/" + "NSIMG_" + dateStamp + ".jpg";
                nativeFile = new java.io.File(picturePath);
            } else {
                picturePath = utils.ad.getApplicationContext().getExternalFilesDir(null)
                    .getAbsolutePath() + "/" + "NSIMG_" + dateStamp + ".jpg";
                nativeFile = new java.io.File(picturePath);
            }

            let sdkVersionInt = parseInt(platform.device.sdkVersion);
            if (sdkVersionInt >= 21) {
                tempPictureUri = (<any>android.support.v4.content).FileProvider.getUriForFile(applicationModule.android.currentContext,
                    applicationModule.android.nativeApp.getPackageName() + ".provider", nativeFile);
            }
            else {
                tempPictureUri = android.net.Uri.fromFile(nativeFile);
            }

            takePictureIntent.putExtra(android.provider.MediaStore.EXTRA_OUTPUT, tempPictureUri);

            if (options && options.cameraFacing === "front") {
                takePictureIntent.putExtra("android.intent.extras.CAMERA_FACING", android.hardware.Camera.CameraInfo.CAMERA_FACING_FRONT);
            }

            if (takePictureIntent.resolveActivity(utils.ad.getApplicationContext().getPackageManager()) != null) {

                let appModule: typeof applicationModule = require("application");

                appModule.android.on("activityResult", (args) => {
                    const requestCode = args.requestCode;
                    const resultCode = args.resultCode;

                    if (requestCode === REQUEST_IMAGE_CAPTURE && resultCode === android.app.Activity.RESULT_OK) {
                        if (saveToGallery) {
                            try {
                                let callback = new android.media.MediaScannerConnection.OnScanCompletedListener({
                                    onScanCompleted: function (path, uri) {
                                        if (trace.isEnabled()) {
                                            trace.write(`image from path ${path} has been successfully scanned!`, trace.categories.Debug);
                                        }
                                    }
                                });
                                android.media.MediaScannerConnection.scanFile(appModule.android.context, [picturePath], null, callback);
                            } catch (ex) {
                                if (trace.isEnabled()) {
                                    trace.write(`An error occurred while scanning file ${picturePath}: ${ex.message}!`, trace.categories.Debug);
                                }
                            }
                        }

                        let exif = new android.media.ExifInterface(picturePath);
                        let orientation = exif.getAttributeInt(android.media.ExifInterface.TAG_ORIENTATION,
                            android.media.ExifInterface.ORIENTATION_NORMAL);
                        if (orientation === android.media.ExifInterface.ORIENTATION_ROTATE_90) {
                            rotateBitmap(picturePath, 90);
                        } else if (orientation === android.media.ExifInterface.ORIENTATION_ROTATE_180) {
                            rotateBitmap(picturePath, 180);
                        } else if (orientation === android.media.ExifInterface.ORIENTATION_ROTATE_270) {
                            rotateBitmap(picturePath, 270);
                        }

                        let asset = new imageAssetModule.ImageAsset(picturePath);
                        asset.options = {
                            width: reqWidth,
                            height: reqHeight,
                            keepAspectRatio: shouldKeepAspectRatio
                        };
                        resolve(asset);
                    }
                });

                appModule.android.foregroundActivity.startActivityForResult(takePictureIntent, REQUEST_IMAGE_CAPTURE);

            }
        } catch (e) {
            if (reject) {
                reject(e);
            }
        }
    });
};

export let isAvailable = function () {
    let utils: typeof utilsModule = require("utils/utils");

    return utils.ad.getApplicationContext().getPackageManager().hasSystemFeature(android.content.pm.PackageManager.FEATURE_CAMERA);
};

export let requestPermissions = function () {
    if ((<any>android.support.v4.content.ContextCompat).checkSelfPermission(applicationModule.android.currentContext,
        (<any>android).Manifest.permission.WRITE_EXTERNAL_STORAGE) !== android.content.pm.PackageManager.PERMISSION_GRANTED ||
        (<any>android.support.v4.content.ContextCompat).checkSelfPermission(applicationModule.android.currentContext,
        (<any>android).Manifest.permission.CAMERA) !== android.content.pm.PackageManager.PERMISSION_GRANTED) {
        (<any>android.support.v4.app.ActivityCompat).requestPermissions(applicationModule.android.currentContext, [(<any>android).Manifest.permission.CAMERA, (<any>android).Manifest.permission.WRITE_EXTERNAL_STORAGE], REQUEST_REQUIRED_PERMISSIONS);
    }
};

let createDateTimeStamp = function () {
    let result = "";
    let date = new Date();
    result = date.getFullYear().toString() +
        ((date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1).toString() : (date.getMonth() + 1).toString()) +
        (date.getDate() < 10 ? "0" + date.getDate().toString() : date.getDate().toString()) + "_" +
        date.getHours().toString() +
        date.getMinutes().toString() +
        date.getSeconds().toString();
    return result;
};

let rotateBitmap = function (picturePath, angle) {
    try {
        let matrix = new android.graphics.Matrix();
        matrix.postRotate(angle);
        let bmOptions = new android.graphics.BitmapFactory.Options();
        let oldBitmap = android.graphics.BitmapFactory.decodeFile(picturePath, bmOptions);
        let finalBitmap = android.graphics.Bitmap.createBitmap(oldBitmap, 0, 0, oldBitmap.getWidth(), oldBitmap.getHeight(), matrix, true);
        let out = new java.io.FileOutputStream(picturePath);
        finalBitmap.compress(android.graphics.Bitmap.CompressFormat.JPEG, 100, out);
        out.flush();
        out.close();
    } catch (ex) {
        if (trace.isEnabled()) {
            trace.write(`An error occurred while rotating file ${picturePath} (using the original one): ${ex.message}!`,
                trace.categories.Debug);
        }
    }
};