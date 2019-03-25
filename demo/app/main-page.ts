import { EventData, Observable, fromObject } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";
import { View } from 'tns-core-modules/ui/core/view';
import { takePicture, requestPermissions } from "nativescript-camera";

import * as trace from "tns-core-modules/trace";
trace.addCategories(trace.categories.Debug);
trace.enable();

export function navigatingTo(args: EventData) {
    let page = <Page>args.object;
    let picturePath = null;

    page.bindingContext = fromObject({
        cameraImage: picturePath,
        saveToGallery: false,
        allowsEditing:  false,
        keepAspectRatio: true,
        width: 320,
        height: 240
    });
}

export function onTakePictureTap(args: EventData) {
    let page = <Page>(<View>args.object).page;
    let saveToGallery = page.bindingContext.get("saveToGallery");
    let allowsEditing = page.bindingContext.get("allowsEditing");
    let keepAspectRatio = page.bindingContext.get("keepAspectRatio");
    let width = page.bindingContext.get("width");
    let height = page.bindingContext.get("height");
    requestPermissions().then(
        () => {
            takePicture({ width: width, height: height, keepAspectRatio: keepAspectRatio, saveToGallery: saveToGallery, allowsEditing: allowsEditing }).
                then((imageAsset) => {
                    page.bindingContext.set("cameraImage", imageAsset);
                    imageAsset.getImageAsync(function (nativeImage) {
                        let scale = 1;
                        let actualWidth = 0;
                        let actualHeight = 0;
                        if (imageAsset.android) {
                            // get the current density of the screen (dpi) and divide it by the default one to get the scale
                            scale = nativeImage.getDensity() / android.util.DisplayMetrics.DENSITY_DEFAULT;
                            actualWidth = nativeImage.getWidth();
                            actualHeight = nativeImage.getHeight();
                        } else {
                            scale = nativeImage.scale;
                            actualWidth = nativeImage.size.width * scale;
                            actualHeight = nativeImage.size.height * scale;
                        }
                        let labelText = `Displayed Size: ${actualWidth}x${actualHeight} with scale ${scale}\n` +
                            `Image Size: ${Math.round(actualWidth / scale)}x${Math.round(actualHeight / scale)}`;
                        page.bindingContext.set("labelText", labelText);

                    console.log(`${labelText}`);

                    });
                },
                    (err) => {
                        console.log("Error -> " + err.message);
                    });
        },
        () => alert('permissions rejected')
    );
}