import { EventData, Observable, fromObject } from "data/observable";
import { Page } from "ui/page";
import { View } from 'ui/core/view';
import { takePicture, requestPermissions } from "nativescript-camera";
import * as appModule from "application";
import * as imageSourceModule from "image-source";

import { ImagePicker, ImageOptions } from "nativescript-imagepicker";

import * as trace from "trace";
trace.addCategories(trace.categories.Debug);
trace.enable();

var list;

export function navigatingTo(args: EventData) {
    var page = <Page>args.object;
    let picturePath = null;
    list = page.getViewById("urls-list");
    page.bindingContext = fromObject({ cameraImage: picturePath, saveToGallery: true });
}

export function onRequestPermissionsTap(args: EventData) {
    requestPermissions();
}

export function onTakePictureTap(args: EventData) {
    let page = <Page>(<View>args.object).page;
    let saveToGallery = page.bindingContext.get("saveToGallery");
    takePicture({ width: 180, height: 180, keepAspectRatio: false, saveToGallery: saveToGallery }).
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


export function onSelectMultipleTap(args) {
    var imagepicker = require("nativescript-imagepicker");
    var context = imagepicker.create({
        mode: "multiple"
    });
    startSelection(context);
}


export function onSelectSingleTap(args) {
    var imagepicker = require("nativescript-imagepicker");
    var context = imagepicker.create({
        mode: "single"
    });
    startSelection(context);
}


export function startSelection(context) {
    context
        .authorize()
        .then(() => {
            list.items = [];
            return context.present();
        })
        .then(selection => {
            console.log("Selection done:");
            var tempList = [];
            selection.forEach(function (selected) {
                console.log("----------------");
                console.log("uri: " + selected.uri);
                console.log("fileUri: " + selected.fileUri);
                tempList.push(selected);
            });
            list.items = tempList;
        }).catch((e) => {
            console.log(e);
        });
}