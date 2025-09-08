const prompt = require('prompt-sync')();
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

var product_URL
login_URL = "https://www.ssactivewear.com/myaccount/login"
checkout_URL = "https://www.ssactivewear.com/checkout/"

async function givePage(){
    product_URL = prompt("Please enter the URL of the product: ")
    if(!product_URL.includes('http')){
        product_URL = prompt("ERROR! Please enter the FULL URL including https: ")
    }
    const browser = await puppeteer.launch({headless: false});
    const page = (await browser.pages())[0];
    page.on('dialog', async dialog => {
        console.log(dialog.message());
        await dialog.dismiss();
        });
    return page;
}

async function login(page){

    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');
    await page.goto(login_URL)
    await page.waitForSelector('#M_M_zEmailTB')
    await page.type('#M_M_zEmailTB', '')
    await page.waitForSelector('#M_M_zPasswordTB')
    await page.type('#M_M_zPasswordTB', '')
    await page.waitForSelector('#M_M_zPageLoginBTN')
    await page.click('#M_M_zPageLoginBTN')   
    await page.waitForNavigation() 
}

var numberofcolors
var color = []
var id = []
async function scrape(page){
    await page.goto(product_URL)
    await page.waitForSelector('#ltkpopup-close-button')
    await page.click('#ltkpopup-close-button')
    await page.select("#M_M_zGridColors", "0")
    
    numberofcolors = await page.evaluate( () => {
        return document.querySelector('#M_M_zGrid').childElementCount
    })

    for(i=0; i<numberofcolors; i++){
        color[i] = await page.evaluate( i => {
            return document.querySelector('#M_M_zGrid').children[i].getElementsByClassName("name")[0].innerText
        }, i)
        id[i] = await page.evaluate( i => {
            return document.querySelector('#M_M_zGrid').children[i].getAttribute('id')
        }, i)
    }
}

var instock
async function addtocart(page){

    for(i=0; i<numberofcolors; i++){
        console.log(`${i}: `+color[i])
    }
    var selected = prompt('Please select a color by typing the respected number infront: ')
    if(selected > numberofcolors-1){
        selected = prompt("Error: Choose a correct value: ")  
    }
    var quantity = prompt('Enter a quantity: ')
    var delay = prompt('Enter delay in milliseconds (1000ms = 1sec): ')
    instock = await page.$eval(`#${id[selected]} > div.gR > div.i > span:nth-child(6) > span.nsksg`, elem => elem.innerText)
    if(instock.includes(',')){
        instock = instock.replace(',' , '')
    }
    if(instock == 0){
        console.log("Product is not yet available. Program will check the website constantly");
    }
    while(instock == 0){
        await page.waitFor(Number(delay))
        await page.reload({waitUntil: 'networkidle2'});
        await page.select("#M_M_zGridColors", "0")
        instock = await page.$eval(`#${id[selected]} > div.gR > div.i > span:nth-child(6) > span.nsksg`, elem => elem.innerText)
        if(instock.includes(',')){
            instock = instock.replace(',' , '')
        }
    }
    console.log("Product is in Stock, checking out")
    if(quantity > instock){
        quantity = instock
        console.log("Enter Quantity was more than available, checking out maximum available: "+instock)
    }
    await page.type(`#${id[selected]} > div.gR > div:nth-child(3) > span.mb3mt2> input[type="number"]`, quantity)
    await page.click('#aToCDesk')
    await page.waitFor(500)
}

async function checkoout(page){
    await page.goto(checkout_URL)
}

async function bot(){
    var  page = await givePage()
    await login(page)
    await scrape(page)
    await addtocart(page)
    await checkoout(page)
}

bot()

