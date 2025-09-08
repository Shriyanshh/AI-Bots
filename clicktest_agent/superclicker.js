const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());



const locateChrome = require('chrome-location');
const URL = "https://cpstest.org/5-seconds.php"

async function givePage(){
    const browser = await puppeteer.launch({headless: false, executablePath: locateChrome});
    const page = await browser.newPage();
    return page;
}

async function run(){
    const page = await givePage();
    //const cursor = createCursor(page)
    await page.goto(URL); 


    await page.waitForSelector("#clickarea")
    await new Promise(resolve => setTimeout(resolve, 5000));

    while(true){
        await page.evaluate(() => document.getElementById("clickarea").click());
        //await new Promise(resolve => setTimeout(resolve, 0));
    }
    

}


run();


