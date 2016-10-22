import { EventData, Observable, fromObject } from "data/observable";
import { Page } from "ui/page";
import { View } from 'ui/core/view';
import { takePicture, requestPermissions } from "nativescript-camera";
import * as appModule from "application";

import * as trace from "trace";
trace.addCategories(trace.categories.Debug);
trace.enable();

export function navigatingTo(args: EventData) {
    var page = <Page>args.object;
    let picturePath = null;

    page.bindingContext = fromObject({cameraImage: picturePath, saveToGallery: true});
}

export function onRequestPermissionsTap(args: EventData) {
    requestPermissions();
}

export function onTakePictureTap(args: EventData) {
    let page = <Page>(<View>args.object).page;
    let saveToGallery = page.bindingContext.get("saveToGallery");
    takePicture({saveToGallery: saveToGallery, sourceType: "PhotoLibrary"}).
        then((imageAsset) => {
            page.bindingContext.set("cameraImage", imageAsset);
        }, 
        (err) => {
            console.log("Error -> " + err.message);
        });
}