import { Component } from '@angular/core';
import { takePicture, requestPermissions } from 'nativescript-camera';
import * as imageSourceModule from 'image-source';

@Component({
	selector: 'my-app',
	templateUrl: './app.component.html' 
})
export class AppComponent {
    public saveToGallery: boolean = false;

    /**
     *
     */
    constructor() {
        this.saveToGallery = true;
    }

    onTakePictureTap(args) {
        let imageView = args.object.page.getViewById("image");
        takePicture({width: 180, height: 180, keepAspectRatio: false, saveToGallery: this.saveToGallery}).then((imageAsset) => {
            let source = new imageSourceModule.ImageSource();
            source.fromAsset(imageAsset).then((source) => {
                console.log(`Size: ${source.width}x${source.height}`);
            });
            imageView.src = imageAsset;
        });
    }

    onRequestPermissionsTap() {
        requestPermissions();
    }
}
