# nativescript-camera
NativeScript plugin to empower using device camera.

Steps to create redistributable package.

1. cd to root folder of the plugin.
2. npm install
3. ./create.sh

This will create a `nativescript-camera-*.tgz` file (* stands for version) within ./dist folder.

Prerequisites:

1. tns-core-modules >= 2.4.0
2. tns-core-modules-widgets >= 2.4.0
3. tns-platform-declarations@next

> Note: On Android 6.0 and above it is neccessary to request permissions for camera (to be able to take picture) and access for Photos (to be able to share the image via Google Photos app).
NativeScript-camera plug-in has a dedicated method called `requestPermissions()` which can be used in that case.
