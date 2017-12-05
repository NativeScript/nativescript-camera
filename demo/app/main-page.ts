import { EventData, Observable, fromObject } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";
import { View } from 'tns-core-modules/ui/core/view';
import { takePicture, requestPermissions } from "nativescript-camera";
import * as appModule from "tns-core-modules/application";
import * as imageSourceModule from "tns-core-modules/image-source";
import { layout } from 'tns-core-modules/utils/utils';
import * as app from "tns-core-modules/application";

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
            takePicture({ width: 180, height: 180, keepAspectRatio: true, saveToGallery: saveToGallery }).
                then((imageAsset) => {
                    page.bindingContext.set("cameraImage", imageAsset);

                    // if you need image source
                    let source = new imageSourceModule.ImageSource();
                    source.fromAsset(imageAsset).then((source) => {
                        let width = source.width;
                        let height = source.height;
                        if (app.android) {
                            // the android dimensions are in device pixels
                            width = layout.toDeviceIndependentPixels(width);
                            height = layout.toDeviceIndependentPixels(height);
                        }

                        console.log(`Size: ${width}x${height}`);
                    });
                },
                (err) => {
                    console.log("Error -> " + err.message);
                });
        },
        () => alert('permissions rejected')
    );
}