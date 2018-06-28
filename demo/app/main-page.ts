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

    page.bindingContext = fromObject({ cameraImage: picturePath, saveToGallery: true });
}

export function onTakePictureTap(args: EventData) {
    let page = <Page>(<View>args.object).page;
    let saveToGallery = page.bindingContext.get("saveToGallery");
    requestPermissions().then(
        () => {
            takePicture({ width: 300, height: 300, keepAspectRatio: true, saveToGallery: saveToGallery }).
                then((imageAsset) => {
                    page.bindingContext.set("cameraImage", imageAsset);
                    imageAsset.getImageAsync(function (nativeImage) {
                        let scale = 1;
                        let height = 0;
                        let width = 0;
                        if (imageAsset.android) {
                            // get the current density of the screen (dpi) and divide it by the default one to get the scale
                            scale = nativeImage.getDensity() / android.util.DisplayMetrics.DENSITY_DEFAULT;
                            height = imageAsset.options.height;
                            width = imageAsset.options.width;
                        } else {
                            scale = nativeImage.scale;
                            width = nativeImage.size.width * scale;
                            height = nativeImage.size.height * scale;
                        }
                        console.log(`Displayed Size: ${width}x${height} with scale ${scale}`);
                        console.log(`Image Size: ${width / scale}x${height / scale}`);
                    });
                },
                    (err) => {
                        console.log("Error -> " + err.message);
                    });
        },
        () => alert('permissions rejected')
    );
}