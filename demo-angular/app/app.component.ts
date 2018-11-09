import { Component } from '@angular/core';
import { takePicture, requestPermissions } from 'nativescript-camera';
import { ImageAsset } from 'tns-core-modules/image-asset';

@Component({
    selector: 'my-app',
    templateUrl: './app.component.html'
})
export class AppComponent {
    public saveToGallery: boolean = false;
    public keepAspectRatio: boolean = true;
    public width: number = 320;
    public height: number = 240;
    public cameraImage: ImageAsset;
    public actualWidth: number;
    public actualHeight: number;
    public scale: number = 1;
    public labelText: string;

    onTakePictureTap(args) {
        requestPermissions().then(
            () => {
                takePicture({ width: this.width, height: this.height, keepAspectRatio: this.keepAspectRatio, saveToGallery: this.saveToGallery })
                    .then((imageAsset: any) => {
                        this.cameraImage = imageAsset;
                        let that = this;
                        imageAsset.getImageAsync(function (nativeImage) {
                            if (imageAsset.android) {
                                // get the current density of the screen (dpi) and divide it by the default one to get the scale
                                that.scale = nativeImage.getDensity() / android.util.DisplayMetrics.DENSITY_DEFAULT;
                                that.actualWidth = nativeImage.getWidth();
                                that.actualHeight = nativeImage.getHeight();
                            } else {
                                that.scale = nativeImage.scale;
                                that.actualWidth = nativeImage.size.width * that.scale;
                                that.actualHeight = nativeImage.size.height * that.scale;
                            }
                            that.labelText = `Displayed Size: ${that.actualWidth}x${that.actualHeight} with scale ${that.scale}\n` +
                                `Image Size: ${Math.round(that.actualWidth / that.scale)}x${Math.round(that.actualHeight / that.scale)}`;

                            console.log(`${that.labelText}`);
                        });
                    }, (error) => {
                        console.log("Error: " + error);
                    });
            },
            () => alert('permissions rejected')
        );
    }
}
