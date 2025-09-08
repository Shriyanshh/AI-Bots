const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const readline = require('readline');
const locateChrome = require('chrome-location');
const prompt = require('prompt-sync')();

var prompter;

const LOGIN_URL = "https://www.rickhindererknives.com/login/"
const PRODUCT_URL = "https://www.rickhindererknives.com/project-x-clip-point-s45vn-stonewash-bronze"
const CHECKOUT_URL = "https://checkout.rickhindererknives.com/checkout"
const OOS_URL = "https://www.rickhindererknives.com/xm-18-3-5-spearpoint-s45vn-steel-flame-kaos-warrior-bpu-bronze-warrior-clip-tab-set"


const USER = "";
const PASSWORD = ""


const MONITOR_DELAY = 1200;

async function givePage() {
    let browser = await puppeteer.launch({ headless: false, executablePath: locateChrome });
    let page = await browser.newPage();
    await page.goto(LOGIN_URL);

    await page.waitForSelector("input[type='email']");
    await page.type("input[type='email']", USER)
    await page.type("input[type='password']", PASSWORD)

    return page;
}


async function inStock(page){
    await page.waitForSelector("button[aria-label='addtocart']")
    let instock = await page.evaluate(() => {
        let instock = document.querySelector("button[aria-label='addtocart']").disabled == false
        return instock;
    })

    return instock;
}


async function atc(page){
    await page.waitForSelector("button[aria-label='addtocart']");
    console.log("selector found!");

    /*await page.evaluate(() => {
        let colors = document.getElementsByClassName('swatch-list')[0].childNodes
        for (let i = 0; i < colors.length; i++){
            let color_node = colors[i];
            if(!(color_node.className.includes('unavailable'))){
                color_node.click()
                break
            }
        }
    })*/

    await page.click("button[aria-label='addtocart']")
    await page.waitForSelector("button[class='button full-width']");
    await page.click("button[class='button full-width']")
}


async function checkout(page){
    console.log("In checkout flow");

    await page.waitForSelector("input[name='orderComment']");
    await new Promise(resolve => setTimeout(resolve, 3500));
    await page.evaluate(() => {
        document.querySelector("button[type='submit']").click();
    })


    await page.waitForSelector("div[id='authorizenet-ccNumber']");
    await new Promise(resolve => setTimeout(resolve, 6000));

    console.log('getting card frames')
    let credit_card_iframes = await page.$$('iframe');

    let card_number = await credit_card_iframes[0].contentFrame();
    await card_number.type("#card-number", "5275210008638530")

    let expiry = await credit_card_iframes[1].contentFrame()
    await expiry.type("#card-expiry", "08/27")

    let card_name = await credit_card_iframes[2].contentFrame()
    await card_name.type("#card-name", "Chance Manns");

    let card_code = await credit_card_iframes[3].contentFrame()
    await card_code.type("#card-code", "744")

    await page.evaluate(() => document.querySelector("button[id='checkout-payment-continue']").click());

}


async function run(){
    var page = await givePage();
    await new Promise(resolve => setTimeout(resolve, 12000));
    //await page.goto(PRODUCT_URL);
    await page.goto(OOS_URL);

    let in_stock = await inStock(page)
    while(!in_stock){
        console.log("Not in stock!")
        await page.reload()
        await new Promise(resolve => setTimeout(resolve, MONITOR_DELAY))
        in_stock = await inStock(page)
    }

    console.log('Product in stock!')

    //prompter = prompt("Enter key to continue: ");

    await atc(page);
    await new Promise(resolve => setTimeout(resolve, 2500));
    await checkout(page);
}

run();


