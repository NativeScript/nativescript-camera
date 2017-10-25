import { Component } from '@angular/core';
import { takePicture, requestPermissions } from 'nativescript-camera';
import { ImageSource } from 'tns-core-modules/image-source';
import { ImageAsset } from 'tns-core-modules/image-asset';

@Component({
    selector: 'my-app',
    templateUrl: './app.component.html'
})
export class AppComponent {
    public saveToGallery: boolean = true;
    public cameraImage: ImageAsset;

    onTakePictureTap(args) {
        takePicture({ width: 180, height: 180, keepAspectRatio: false, saveToGallery: this.saveToGallery })
        .then((imageAsset) => {
            let source = new ImageSource();
            source.fromAsset(imageAsset).then((source) => {
                console.log(`Size: ${source.width}x${source.height}`);
            })
            this.cameraImage = imageAsset;
        }, (error) => {
            console.log("Error: " + error)
        });
    }

    onRequestPermissionsTap() {
        requestPermissions();
    }
}
