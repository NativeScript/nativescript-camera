import { EventData, Observable, fromObject } from "data/observable";
import { Page } from "ui/page";
import { View } from 'ui/core/view';
import { takePicture, requestPermissions } from "nativescript-camera";
import * as appModule from "application";
import * as imageSourceModule from "image-source";

import * as trace from "trace";
trace.addCategories(trace.categories.Debug);
trace.enable();

export function navigatingTo(args: EventData) {
    let page = <Page>args.object;
    let picturePath = null;

    page.bindingContext = fromObject({cameraImage: picturePath, saveToGallery: true});
}

export function onRequestPermissionsTap(args: EventData) {
    requestPermissions();
}

export function onTakePictureTap(args: EventData) {
    let page = <Page>(<View>args.object).page;
    let saveToGallery = page.bindingContext.get("saveToGallery");
    takePicture({width: 180, height: 180, keepAspectRatio: false, saveToGallery: saveToGallery}).
        then((imageAsset) => {
            let source = new imageSourceModule.ImageSource();
            source.fromAsset(imageAsset).then((source) => {
                console.log(`Size: ${source.width}x${source.height}`);
            });
            page.bindingContext.set("cameraImage", imageAsset);
        },
        (err) => {
            console.log("Error -> " + err.message);
        });
}