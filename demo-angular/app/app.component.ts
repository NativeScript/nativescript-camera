import { Component } from '@angular/core';
import { takePicture, requestPermissions } from 'nativescript-camera';
import { ImageSource } from 'tns-core-modules/image-source';
import { ImageAsset } from 'tns-core-modules/image-asset';
import { layout } from 'tns-core-modules/utils/utils';
import * as app from "tns-core-modules/application";

@Component({
    selector: 'my-app',
    templateUrl: './app.component.html'
})
export class AppComponent {
    public saveToGallery: boolean = true;
    public cameraImage: ImageAsset;

    onTakePictureTap(args) {
        requestPermissions().then(
            () => {
                takePicture({ width: 300, height: 300, keepAspectRatio: true, saveToGallery: this.saveToGallery })
                    .then((imageAsset: any) => {
                        this.cameraImage = imageAsset;

                        // if you need image source
                        let source = new ImageSource();
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
                    }, (error) => {
                        console.log("Error: " + error);
                    });
            },
            () => alert('permissions rejected')
        );
    }
}
