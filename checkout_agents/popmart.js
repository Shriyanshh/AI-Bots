const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

/* Readline is much better than using prompt-sync library 
because it does not interfere with the browser processes */

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const product_url = "https://www.popmart.com/us/products/1532/CRYBABY-Crying-Again-Series-Figures";

async function givePage(){
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    return page;
  }

/* Let user login manually */
async function login(page) {
    console.log("Redirecting to login page. Please log in manually.");
    await page.goto('https://www.popmart.com/us/user/login');
    return new Promise((resolve) => {
        rl.question('Please enter a key after inputting search criteria: ', (answer) => {
            console.log(`Thank you for your valuable feedback: ${answer}`);
            rl.close();
            resolve();
        });
    });
}

async function addToCart(page){
    console.log("Navigating to product page...")
    await page.goto(product_url);
    await page.waitForSelector("div[class='index_usBtn__2KlEx index_red__kx6Ql index_btnFull__F7k90']");
    await page.click("div[class='index_usBtn__2KlEx index_red__kx6Ql index_btnFull__F7k90']");
    await page.waitForSelector("div[class='ant-notification-notice index_noticeContainer__FPr4q ant-notification-notice-closable']", {
        visible: true,
    });
    console.log("Item added to cart");
    console.log("Redirecting to cart page...");
}

async function cart(page){
    await page.goto("https://www.popmart.com/us/largeShoppingCart");
    await page.waitForSelector("div[class='index_checkbox__w_166']");
    await page.click("div[class='index_checkbox__w_166']");
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.waitForSelector("button[class='ant-btn ant-btn-primary ant-btn-dangerous index_checkout__V9YPC']");
    await page.click("button[class='ant-btn ant-btn-primary ant-btn-dangerous index_checkout__V9YPC']");
}

async function fillPayment(page){
    await page.waitForSelector("svg[class='index_logo__60HkO']");
    await page.waitForFunction(() => {
        const elements = document.querySelectorAll("svg[class='index_logo__60HkO']");
        return elements.length === 0;
    });
    await page.waitForSelector("div[class='index_optionItemActive__RTvr3 index_optionItemUnDisabled__MKDtL']", {
        visible: true,
    });

    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.click("button[class='ant-btn ant-btn-primary ant-btn-dangerous index_placeOrderBtn__wgYr6'][type='button']");

    await page.waitForSelector("div[class='index_optionItem__yLztv']");
    await page.click("div[class='index_optionItem__yLztv']");

    await new Promise(resolve => setTimeout(resolve, 3000));

    await page.waitForSelector("input[name='holderName']", 'John Doe');
    await page.type("input[name='holderName']", 'John Doe');

    const iframeElements = await page.$$("iframe[src*='adyen']");
    for (const iframeElement of iframeElements) {
        const cardIframe = await iframeElement.contentFrame();
        if (await cardIframe.$("input[data-fieldtype='encryptedCardNumber']")) {
            await cardIframe.type("input[data-fieldtype='encryptedCardNumber']", '4929599938114155');
        }
        if (await cardIframe.$("input[data-fieldtype='encryptedExpiryDate']")) {
            await cardIframe.type("input[data-fieldtype='encryptedExpiryDate']", '04/28');
        }
        if (await cardIframe.$("input[data-fieldtype='encryptedSecurityCode']")) {
            await cardIframe.type("input[data-fieldtype='encryptedSecurityCode']", '325');
        }
    }

    await page.waitForSelector("button[class='adyen-checkout__button adyen-checkout__button--pay'][type='button']");
    await page.click("button[class='adyen-checkout__button adyen-checkout__button--pay'][type='button']");
    console.log("Payment submitted");
}
async function checkout() {
    var page = await givePage();
    await login(page);
    await addToCart(page); 
    await cart(page);
    await fillPayment(page);
}

checkout()
