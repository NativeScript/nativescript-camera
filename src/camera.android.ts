import { Utils, Application, Device, Trace, ImageAsset } from "@nativescript/core";
import * as permissions from "nativescript-permissions";

let REQUEST_IMAGE_CAPTURE = 3453;
declare let global: any;

let useAndroidX = function () {
    return global.androidx && global.androidx.appcompat;
};
const FileProviderPackageName = useAndroidX() ? global.androidx.core.content : global.android.support.v4.content;

export let takePicture = function (options?): Promise<any> {
    return new Promise((resolve, reject) => {
        try {
            if (!permissions.hasPermission(android.Manifest.permission.CAMERA)) {
                reject(new Error("Application does not have permissions to use Camera"));

                return;
            }

            let saveToGallery = true;
            let reqWidth = 0;
            let reqHeight = 0;
            let shouldKeepAspectRatio = true;

            let density = Utils.layout.getDisplayDensity();
            if (options) {
                saveToGallery = Utils.isNullOrUndefined(options.saveToGallery) ? saveToGallery : options.saveToGallery;
                reqWidth = options.width ? options.width * density : reqWidth;
                reqHeight = options.height ? options.height * density : reqWidth;
                shouldKeepAspectRatio = Utils.isNullOrUndefined(options.keepAspectRatio) ? shouldKeepAspectRatio : options.keepAspectRatio;
            }

            if (!permissions.hasPermission(android.Manifest.permission.WRITE_EXTERNAL_STORAGE)) {

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
                picturePath = Utils.android.getApplicationContext().getExternalFilesDir(null).getAbsolutePath() + "/" + "NSIMG_" + dateStamp + ".jpg";
                nativeFile = new java.io.File(picturePath);
            }

            let sdkVersionInt = parseInt(Device.sdkVersion);
            if (sdkVersionInt >= 21) {
                tempPictureUri = FileProviderPackageName.FileProvider.getUriForFile(
                  Application.android.context,
                  Application.android.nativeApp.getPackageName() + ".provider", nativeFile);
            } else {
                tempPictureUri = android.net.Uri.fromFile(nativeFile);
            }

            takePictureIntent.putExtra(android.provider.MediaStore.EXTRA_OUTPUT, tempPictureUri);

            if (options && options.cameraFacing === "front") {
                takePictureIntent.putExtra("android.intent.extras.CAMERA_FACING",
                    android.hardware.Camera.CameraInfo.CAMERA_FACING_FRONT);
            } else {
                takePictureIntent.putExtra("android.intent.extras.CAMERA_FACING",
                    android.hardware.Camera.CameraInfo.CAMERA_FACING_BACK);
            }

            if (takePictureIntent.resolveActivity(Utils.android.getApplicationContext().getPackageManager()) != null) {

                // Remove previous listeners if any
                Application.android.off("activityResult");

                Application.android.on("activityResult", (args) => {
                    const requestCode = args.requestCode;
                    const resultCode = args.resultCode;

                    if (requestCode === REQUEST_IMAGE_CAPTURE && resultCode === android.app.Activity.RESULT_OK) {
                        if (saveToGallery) {
                            try {
                                let callback = new android.media.MediaScannerConnection.OnScanCompletedListener({
                                    onScanCompleted: function (path, uri) {
                                        if (Trace.isEnabled()) {
                                            Trace.write(`image from path ${path} has been successfully scanned!`, Trace.categories.Debug);
                                        }
                                    }
                                });

                                android.media.MediaScannerConnection.scanFile(Application.android.context, [picturePath], null, callback);
                            } catch (ex) {
                                if (Trace.isEnabled()) {
                                    Trace.write(`An error occurred while scanning file ${picturePath}: ${ex.message}!`,
                                        Trace.categories.Debug);
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

                        if (shouldKeepAspectRatio) {
                            let pictureWidth = exif.getAttributeInt(android.media.ExifInterface.TAG_IMAGE_WIDTH, 0);
                            let pictureHeight = exif.getAttributeInt(android.media.ExifInterface.TAG_IMAGE_LENGTH, 0);
                            let isPictureLandscape = pictureWidth > pictureHeight;
                            let areOptionsLandscape = reqWidth > reqHeight;
                            if (isPictureLandscape !== areOptionsLandscape) {
                                let oldReqWidth = reqWidth;
                                reqWidth = reqHeight;
                                reqHeight = oldReqWidth;
                            }
                        }

                        let asset = new ImageAsset(picturePath);
                        asset.options = {
                            width: reqWidth,
                            height: reqHeight,
                            keepAspectRatio: shouldKeepAspectRatio
                        };
                        resolve(asset);
                    } else if (resultCode === android.app.Activity.RESULT_CANCELED) {
                        // User cancelled the image capture
                        reject(new Error("cancelled"));
                    }
                });

                Application.android.foregroundActivity.startActivityForResult(takePictureIntent, REQUEST_IMAGE_CAPTURE);

            }
        } catch (e) {
            if (reject) {
                reject(e);
            }
        }
    });
};

export let isAvailable = function () {

    return Utils.android
        .getApplicationContext()
        .getPackageManager()
        .hasSystemFeature(android.content.pm.PackageManager.FEATURE_CAMERA);
};

export let requestPermissions = function () {
    return permissions.requestPermissions([
      android.Manifest.permission.WRITE_EXTERNAL_STORAGE,
      android.Manifest.permission.CAMERA
    ]);
};

export let requestPhotosPermissions = function () {
    return permissions.requestPermissions([
        android.Manifest.permission.WRITE_EXTERNAL_STORAGE,
    ]);
};

export let requestCameraPermissions = function () {
    return permissions.requestPermissions([
        android.Manifest.permission.CAMERA
    ]);
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
        let finalBitmap = android.graphics.Bitmap.createBitmap(
            oldBitmap, 0, 0, oldBitmap.getWidth(), oldBitmap.getHeight(), matrix, true);
        let out = new java.io.FileOutputStream(picturePath);
        finalBitmap.compress(android.graphics.Bitmap.CompressFormat.JPEG, 100, out);
        out.flush();
        out.close();
    } catch (ex) {
        if (Trace.isEnabled()) {
            Trace.write(`An error occurred while rotating file ${picturePath} (using the original one): ${ex.message}!`,
                Trace.categories.Debug);
        }
    }
};
