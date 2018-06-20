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
                        if (imageAsset.android) {
                            // get the current density of the screen (dpi) and divide it by the default one to get the scale
                            scale = nativeImage.getDensity() / android.util.DisplayMetrics.DENSITY_DEFAULT;
                        } else {
                            scale = imageAsset.nativeImage.scale;
                        }
                        console.log(`Displayed Size: ${imageAsset.options.width}x${imageAsset.options.height} with scale ${scale}`);
                        console.log(`Computed Size: ${imageAsset.options.width / scale}x${imageAsset.options.height / scale}`);
                    });
                },
                    (err) => {
                        console.log("Error -> " + err.message);
                    });
        },
        () => alert('permissions rejected')
    );
}