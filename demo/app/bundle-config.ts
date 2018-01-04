if ((<any>global).TNS_WEBPACK) {
    // registers tns-core-modules UI framework modules
    require("bundle-entry-points");

    // register application modules
    const context = require.context("~/", true, /page\.(xml|css|js|ts|scss|less|sass)$/);
    global.registerWebpackModules(context);
    global.registerModule("nativescript-camera", () => require("nativescript-camera"));
}