# Example for using nativescript-camera plugin
## This example demonstrates how to use plugin with nativescript-angular and webpack

Steps to start example.

1. npm install
2. Due to a bug with the used version of @angular, a single line from file
node_modules/@angular/compiler/index.js (line 38: export * from './src/template_parser/template_ast';) should be deleted, since its duplicated.
3. tns platform add android - to add platform before starting webpack process
4. npm run start-android
