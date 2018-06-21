import { Component } from '@angular/core';
import { takePicture, requestPermissions } from 'nativescript-camera';
import { ImageAsset } from 'tns-core-modules/image-asset';

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
                    }, (error) => {
                        console.log("Error: " + error);
                    });
            },
            () => alert('permissions rejected')
        );
    }
}
