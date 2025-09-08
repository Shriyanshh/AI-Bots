const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const PRODUCT_URL = "https://www.stanley1913.com/products/adventure-quencher-travel-tumbler-30-oz?variant=53972718780776"

var cookies = "";

async function givePage(){
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    return page;
}

async function parseCookies(page){
    const cookies = await page.cookies();
    let cookieList = "";
    for(let i = 0; i < cookies.length; i++){
        let cookie = cookies[i];
        let cookieString = cookie.name + "=" + cookie.value;
        if(i != (cookies.length - 1)){
            cookieString = cookieString + "; ";
        }
        cookieList = cookieList + cookieString;
    }
    console.log(cookieList);
    return cookieList;
}

async function add_to_cart(page){
    await page.waitForSelector('button[name="add"]');
    cookies = await parseCookies(page);

    const ID = await page.evaluate(() => {
        return document.querySelector("input[name='id']").getAttribute("value");
    })

    const sectionID = await page.evaluate(() => {
        return document.querySelector("input[name='section-id']").getAttribute("value");
    })

    const prodID = await page.evaluate(() => {
        return document.querySelector("input[name='product-id']").getAttribute("value");
    })

    await page.evaluate( async (cookies, PRODUCT_URL, ID, sectionID, prodID) => {
        let response = await fetch("https://www.stanley1913.com/cart/add", {
            "headers": {
            "accept": "application/javascript",
            "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryXXtAjYliOTrIf4da",
            "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Google Chrome\";v=\"133\", \"Chromium\";v=\"133\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"macOS\"",
            "x-requested-with": "XMLHttpRequest",
            "cookie": cookies,
            "Referer": PRODUCT_URL,
            "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": `------WebKitFormBoundaryXXtAjYliOTrIf4da\r\nContent-Disposition: form-data; name=\"form_type\"\r\n\r\nproduct\r\n------WebKitFormBoundaryXXtAjYliOTrIf4da\r\nContent-Disposition: form-data; name=\"utf8\"\r\n\r\n✓\r\n------WebKitFormBoundaryXXtAjYliOTrIf4da\r\nContent-Disposition: form-data; name=\"id\"\r\n\r\n${ID}\r\n------WebKitFormBoundaryXXtAjYliOTrIf4da\r\nContent-Disposition: form-data; name=\"properties[Shipping]\"\r\n\r\n\r\n------WebKitFormBoundaryXXtAjYliOTrIf4da\r\nContent-Disposition: form-data; name=\"product-id\"\r\n\r\n${prodID}\r\n------WebKitFormBoundaryXXtAjYliOTrIf4da\r\nContent-Disposition: form-data; name=\"section-id\"\r\n\r\n${sectionID}\r\n------WebKitFormBoundaryXXtAjYliOTrIf4da\r\nContent-Disposition: form-data; name=\"quantity\"\r\n\r\n1\r\n------WebKitFormBoundaryXXtAjYliOTrIf4da\r\nContent-Disposition: form-data; name=\"sections\"\r\n\r\ncart-notification-product,cart-notification-button,cart-icon-bubble\r\n------WebKitFormBoundaryXXtAjYliOTrIf4da\r\nContent-Disposition: form-data; name=\"sections_url\"\r\n\r\n/products/clean-slate-quencher-h20-flowstate-tumbler-30-oz-soft-rain\r\n------WebKitFormBoundaryXXtAjYliOTrIf4da--\r\n`,
            "method": "POST"
        });
    }, cookies, PRODUCT_URL, ID, sectionID, prodID);

}

async function get_shipping_token(page){
    let response = await page.evaluate(async (cookies, PRODUCT_URL) => {
            let response = await fetch("https://www.stanley1913.com/cart.js", {
                "headers": {
                  "accept": "*/*",
                  "accept-language": "en-US,en;q=0.9",
                  "priority": "u=1, i",
                  "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Google Chrome\";v=\"133\", \"Chromium\";v=\"133\"",
                  "sec-ch-ua-mobile": "?0",
                  "sec-ch-ua-platform": "\"macOS\"",
                  "sec-fetch-dest": "empty",
                  "sec-fetch-mode": "cors",
                  "sec-fetch-site": "same-origin",
                  "cookie": cookies,
                  "Referer": PRODUCT_URL,
                  "Referrer-Policy": "strict-origin-when-cross-origin"
                },
                "body": null,
                "method": "GET"
              });

            response = await response.json();
            return response;
    }, cookies, PRODUCT_URL);

    
    let token = response.token.split("?")[0];
    console.log(token)
    let shipping_url = "https://www.stanley1913.com/checkouts/cn/" + token + "/information"
    await page.goto(shipping_url)
}

async function run(){
    const page = await givePage();
    await page.goto(PRODUCT_URL);
    await add_to_cart(page);
    await get_shipping_token(page);
    console.log('Done');
}

run();
