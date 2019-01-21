import { AppiumDriver, createDriver, SearchOptions, Direction, UIElement, Point, Locator } from "nativescript-dev-appium";
import { isSauceLab, runType } from "nativescript-dev-appium/lib/parser";
import { expect } from "chai";
import { exec } from "child_process";

const isSauceRun = isSauceLab;
const isAndroid: boolean = runType.includes("android");

describe("Camera", () => {
    let driver: AppiumDriver;

    before(async () => {
        driver = await createDriver();
        driver.defaultWaitTime = 15000;
    });

    after(async () => {
        if (isSauceRun) {
            driver.sessionId().then(function (sessionId) {
                console.log("Report: https://saucelabs.com/beta/tests/" + sessionId);
            });
        }
        await driver.quit();
        console.log("Driver quits!");
    });

    afterEach(async function () {
        if (this.currentTest.state === "failed") {
            await driver.logScreenshot(this.currentTest.title);
        }
    });

    it("should take a picture", async function () {
        const takePictureButton = await driver.findElementByText("Take Picture");
        await takePictureButton.click();
        await driver.wait(1000);
        if (isAndroid) {
            let allow = await driver.findElementByTextIfExists("ALLOW", SearchOptions.exact);
            if (allow !== undefined) {
                await allow.click();
                let allowSecond = await driver.findElementByTextIfExists("ALLOW", SearchOptions.exact);
                await allowSecond.click();
            }
            let geoTagConfirm = await driver.findElementByTextIfExists("Next", SearchOptions.contains)
            if(geoTagConfirm !== undefined){
                await geoTagConfirm.click();
            }

            let shutterBtn = await driver.findElementByAccessibilityId("Shutter");
            await shutterBtn.click();
            let acceptBtn = await driver.findElementByAccessibilityId("Done");
            await acceptBtn.click();
        } else {
            let ok = await driver.findElementByTextIfExists("OK", SearchOptions.exact);
            if(ok !== undefined){
                await ok.click();
                let okBtn = await driver.findElementByTextIfExists("OK", SearchOptions.exact);
                await okBtn.click();
            }
            let photos = await driver.findElementByText("Photos", SearchOptions.exact);
            expect(photos).to.exist;
            await driver.wait(2000);
            await driver.clickPoint(50, 110); // Select directory
            await driver.wait(2000);
            await driver.clickPoint(50, 240); // Select image
        }
        const saveToGalleryLabel = await driver.findElementByText("saveToGallery");
        expect(saveToGalleryLabel).to.exist;
        const imageDisplayedInfo = await driver.findElementByText("Displayed Size: ", SearchOptions.contains);
        expect(imageDisplayedInfo).to.exist;
        const imageInfo = await driver.findElementByText("Image Size: ", SearchOptions.contains);
        expect(imageInfo).to.exist;
        
    });
});