const ac = require("@antiadmin/anticaptchaofficial");
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

puppeteer.use(StealthPlugin())

ac.setAPIKey("db7b97d0854d0f70287ec093d8083fd7");


async function launchProductPage(link){
    const launchPuppeteer = await puppeteer.launch({headless: false});
    const captchaPage = await launchPuppeteer.newPage();
    try {
        await captchaPage.goto(link);
    }
    catch (error) {
        console.error("The initial launch of the page was unsuccessful: ", error);
    }
    return captchaPage;
}

async function getSiteKey(page){
    try{
        await page.waitForSelector("div[id='recaptcha-demo']");
        const siteKey = await page.$eval("div[id='recaptcha-demo']", (element, keyAttr) => {
            return element.getAttribute(keyAttr);
        }, "data-sitekey");
        return siteKey;
    }
    catch (error){
        console.error("Ran into error when getting the site key: ", error);
    }
}

async function run(){
    captchaLink = "https://www.google.com/recaptcha/api2/demo";
    let captchaPage = await launchProductPage(captchaLink);
    siteKey = await getSiteKey(captchaPage);
    
    try{
        let token = await ac.solveRecaptchaV2Proxyless(captchaLink, siteKey);
        await captchaPage.$eval("textarea[id='g-recaptcha-response']", (element, tkn) => {
            element.innerText = tkn;
        }, token);
        
        await captchaPage.waitForTimeout(5000);
        //await new Promise(resolve => setTimeout(resolve, 5000)); //If I try to hit the submit button right after I update the inner text it doesn't work, I have to wait a couple secs
        console.log(siteKey);
        console.log(token);
        console.log("Captcha has been solved. You may now hit the submit button.");
    }
    //document.querySelector("textarea[id='g-recaptcha-response']").innerText = "";
    catch(error){
        console.error("Error when solving captcha: ", error);
        
    }
    
}

run();