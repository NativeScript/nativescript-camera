# NativeScript Camera [![Build Status](https://travis-ci.org/NativeScript/nativescript-camera.svg?branch=master)](https://travis-ci.org/NativeScript/nativescript-camera)

Welcome to the `nativescript-camera` plugin for NativeScript framework 

## (Optional) Prerequisites / Requirements

- installed [NativeScript-CLI](https://github.com/NativeScript/nativescript-cli)

# Working with the camera plugin

## Overview

Almost every mobile application needs the option to capture, save and share images. 
The NativeScript camera plugin was designed for the first two parts of the job (taking a picture and optionally saving to device storage).

## Installation

Navigate to project folder and run NativeScript-CLI command 
``` 
tns plugin add nativescript-camera
``` 

Plugin could be added as a standard npm dependency running command 
``` 
npm install nativescript-camera --save 
``` 

> Note: the `--save` flag will add the plugin as dependency in your package.json file

## API

### Methods

| Method | Description |
| --- | --- |
| takePicture(options?: CameraOptions) | Take a photo using the camera with an optional parameter for setting different camera options. |
| requestPermissions() | Request permission from the user for access to their saved photos as well as access to their camera. Returns a Promise. |
| requestCameraPermissions() | Request permission from the user for access to their camera. Returns a Promise. |
| requestPhotosPermissions() | Request permission from the user for access to their saved photos. Returns a Promise. |
| isAvailable() | Is the device camera available to use. |

### CameraOptions
| Property | Default | Platform | Description |
| --- | --- | --- | --- |
| width | 0 | Both | Defines the desired width (in device independent pixels) of the taken image. It should be used with height property. If `keepAspectRatio` actual image width could be different in order to keep the aspect ratio of the original camera image. The actual image width will be greater than requested if the display density of the device is higher (than 1) (full HD+ resolutions). |
| height | 0 | Both | Defines the desired height (in device independent pixels) of the taken image. It should be used with width property. If `keepAspectRatio` actual image width could be different in order to keep the aspect ratio of the original camera image. The actual image height will be greater than requested if the display density of the device is higher (than 1) (full HD+ resolutions). |
| keepAspectRatio | true | Both | Defines if camera picture aspect ratio should be kept during picture resizing. This property could affect width or height return values. |
| saveToGallery | true | Both | Defines if camera picture should be copied to photo Gallery (Android) or Photos (iOS) |
| allowsEditing | false | iOS | Defines if camera "Retake" or "Use Photo" screen forces the user to crop camera picture to a square and optionally lets them zoom in. |
| cameraFacing | rear | Both | The initial camera facing. Use 'front' for selfies. |


> Note: The `saveToGallery` option might have unexpected behavior on Android! Some vendor camera apps (e.g. LG) will save all captured images to the gallery regardless of what the value of `saveToGallery` is. This behavior cannot be controlled by the camera plugin and if you must exclude the captured image from the photo gallery, you will need to get a local storage read/write permission and write custom code to find the gallery location and delete the new image from there.

## Usage 

### Requesting permissions

Both Android and iOS require explicit permissions in order for the application to have access to the camera and save photos to the device. Once the user has granted permissions the camera module can be used.

```JavaScript
camera.requestPermissions().then(
function success() {
// permission request accepted or already granted 
// ... call camera.takePicture here ...
}, 
function failure() {
// permission request rejected
// ... tell the user ...
}
);
```

> **Note for Android:** Older versions of Android that don't use a request permissions popup won't be affected by the usage of the requestPermissions method.

> **Note for iOS:** If the user rejects permissions from the iOS popup, the app is not allowed to ask again. You can instruct the user to go to app settings and enable the camera permission manually from there. Additionally, [App Store Guideline 5.1.1](https://developer.apple.com/app-store/review/guidelines/#data-collection-and-storage) requires apps to clarify the usage of the camera and photo library. To do so, edit your `app/App_Resources/iOS/Info.plist` and add the following clarifications:

```
<key>NSCameraUsageDescription</key>
<string>enter your camera permission request text here</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>enter your photo library permission request text here</string>
```

### Using the camera module to take a picture

Using the camera module is relatively simple. 
However, there are some points that need a little bit more explanation.

In order to use the camera module, just require it, as shown in Example 1:

> Example 1: Require camera module in the application
``` JavaScript
var camera = require("nativescript-camera");
```
``` TypeScript
import * as camera from "nativescript-camera";
```

Then you are ready to use it:
> Example 2: How to take a picture and to receive image asset
``` JavaScript
var imageModule = require("tns-core-modules/ui/image");
camera.takePicture()   
    .then(function (imageAsset) {
        console.log("Result is an image asset instance");
        var image = new imageModule.Image();
        image.src = imageAsset;
    }).catch(function (err) {
        console.log("Error -> " + err.message);
    });
```
``` TypeScript
import { Image } from "tns-core-modules/ui/image";
camera.takePicture().
    then((imageAsset) => {
        console.log("Result is an image asset instance");
        var image = new Image();
        image.src = imageAsset;
    }).catch((err) => {
        console.log("Error -> " + err.message);
    });
```

The code in __Example 2__ will start the native platform camera application. After taking the picture and tapping the button `Save` (Android) or `use image` (iOS), the promise will resolve the `then` part and image asset will be set as `src` of the `ui/image` control.

### Using the options to take memory efficient picture

__Example 2__ shows how to take a picture using the NativeScript camera module. However, it takes a huge image (even mid-level devices has a 5MP camera, which results in a image 2580x2048, which in bitmap means approximately 15 MB). In many cases you don't need such a huge picture to show an image with 100x100 size, so taking a big picture is just a waste of memory. The camera takePicture() method accepts an optional parameter that could help in that case. With that optional parameter, you could set some properties like:

* __width__: The desired width of the picture (in device independent pixels).
* __height__: The desired height of the picture (in device independent pixels).
* __keepAspectRatio__: A boolean parameter that indicates if the aspect ratio should be kept.
* __saveToGallery__: A boolean parameter that indicates if the original taken photo will be saved in "Photos" for Android and in "Camera Roll" in iOS
* __allowsEditing__: (iOS Only) A boolean parameter that indicates if the camera "Retake" or "Use Photo" screen forces the user to crop camera picture to a square and optionally lets them zoom in.
* __cameraFacing__: Start with either the "front" or "rear" (default) camera of the device. The current implementation doesn't work on all Android devices, in which case it falls back to the default behavior.

What does `device independent pixels` mean? The NativeScript layout mechanism uses device-independent pixels when measuring UI controls. This allows you to declare one layout and this layout will look similar to all devices (no matter the device's display resolution). In order to get a proper image quality for high resolution devices (like iPhone retina and Android Full HD), camera will return an image with bigger dimensions. For example, if we request an image that is 100x100, on iPhone 6 the actual image will be 200x200 (since its display density factor is 2 -> 100*2x100*2).
Setting the `keepAspectRatio` property could result in a different than requested width or height. The camera will return an image with the correct aspect ratio but generally only one (from width and height) will be the same as requested; the other value will be calculated in order to preserve the aspect of the original image.

__Example 3__ shows how to use the options parameter:
> Example 3: How to setup `width`, `height`, `keepAspectRatio` and `saveToGallery` properties for the camera module

``` JavaScript
var imageModule = require("tns-core-modules/ui/image");

var options = { width: 300, height: 300, keepAspectRatio: false, saveToGallery: true };
camera.takePicture(options)   
    .then(function (imageAsset) {
        console.log("Size: " + imageAsset.options.width + "x" + imageAsset.options.height);
        console.log("keepAspectRatio: " + imageAsset.options.keepAspectRatio);
        console.log("Photo saved in Photos/Gallery for Android or in Camera Roll for iOS");
    }).catch(function (err) {
        console.log("Error -> " + err.message);
    });
```
``` TypeScript
import { Image } from "tns-core-modules/ui/image";

var options = { width: 300, height: 300, keepAspectRatio: false, saveToGallery: true };
camera.takePicture(options).
    then((imageAsset) => {
        console.log("Size: " + imageAsset.options.width + "x" + imageAsset.options.height);
        console.log("keepAspectRatio: " + imageAsset.options.keepAspectRatio);
        console.log("Photo saved in Photos/Gallery for Android or in Camera Roll for iOS");
    }).catch((err) => {
        console.log("Error -> " + err.message);
    });
```

### Check if the device has available camera

The first thing that the developers should check if the device has an available camera.
The method isAvaiable will return true if the camera hardware is ready to use or false if otherwise.

```
var isAvailable = camera.isAvailable(); 
```

> Note: This method will return false when used in iOS simulator (as the simulator does not have camera hardware)

## Contribute
We love PRs! Check out the [contributing guidelines](CONTRIBUTING.md). If you want to contribute, but you are not sure where to start - look for [issues labeled `help wanted`](https://github.com/NativeScript/nativescript-camera/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22).

## Get Help 
Please, use [github issues](https://github.com/NativeScript/nativescript-camera/issues) strictly for [reporting bugs](CONTRIBUTING.md#reporting-bugs) or [requesting features](CONTRIBUTING.md#requesting-new-features). For general questions and support, check out [Stack Overflow](https://stackoverflow.com/questions/tagged/nativescript) or ask our experts in [NativeScript community Slack channel](http://developer.telerik.com/wp-login.php?action=slack-invitation).

![](https://ga-beacon.appspot.com/UA-111455-24/nativescript/nativescript-camera?pixel)
