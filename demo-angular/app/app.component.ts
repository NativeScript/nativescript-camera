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
                            if (imageAsset.android) {
                                // get the current density of the screen (dpi) and divide it by the default one to get the scale
                                scale = nativeImage.getDensity() / android.util.DisplayMetrics.DENSITY_DEFAULT;
                            } else {
                                scale = imageAsset.nativeImage.scale;
                            }
                            console.log(`Displayed Size: ${imageAsset.options.width}x${imageAsset.options.height} with scale ${scale}`);
                            console.log(`Computed Size: ${imageAsset.options.width / scale}x${imageAsset.options.height / scale}`);
                        });
                    }, (error) => {
                        console.log("Error: " + error);
                    });
            },
            () => alert('permissions rejected')
        );
    }
}
