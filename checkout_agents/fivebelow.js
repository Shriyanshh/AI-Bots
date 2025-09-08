const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const xlsx = require('xlsx');
puppeteer.use(StealthPlugin());

const locateChrome = require('chrome-location');
var numPerOrder = "2";

var masterMap;
var numProfile = 0;

var counter = 0;

function registerProfiles(){
    //email, cc#, exp month, exp year, cvv
    let path = "output.xlsx";
    const workbook = xlsx.readFile(path);

    // Assuming that your data is in the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert the data into JSON
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Structure to store the data
    let structuredData = data.map((row) => ({
        product: row["Product"],
        qty: row["Quantity"],
        shipping: row["Shipping"], 
        address2: row["address2"],
        email: row.Email,
        creditCardNumber: row['Credit card number'],
        cardExpMonth: row['card exp month'],
        cardExpYear: row['card exp year'],
        cvv: row.cvv,
        same: row["SameAddress"],
        address: row["Address"],
        firstname: row["Firstname"],
        lastname: row["Lastname"]
    }));

    return structuredData;

}

async function tryType(page, selector, value){
    try{
        await page.type(selector, value);
    } catch (ex){
        console.log(ex);
    }
}


async function givePage(){
    const browser = await puppeteer.launch({headless: false, executablePath: locateChrome});
    const page = await browser.newPage();
    return page;
}

async function addtoCart(page){

    await page.waitForSelector("button[data-cy='buyBox__addToCartButton']");

    await page.click("input[name='qty']", {clickCount: 3});
    await new Promise(resolve => setTimeout(resolve, 500));
    await page.type("input[name='qty']", numPerOrder);
    
    await page.evaluate(() => document.querySelector("#shipToHome").click());
    await new Promise(resolve => setTimeout(resolve, 200));

    console.log("Adding item to cart");
    await page.evaluate(() => document.querySelector("button[data-cy='buyBox__addToCartButton']").click());

    return true
}

async function billing(page){

    await page.goto("https://www.fivebelow.com/checkout");
    await page.waitForSelector("#custEmailId");
    console.log("ENTERED BILLING STAGE");

    await page.type("#custEmailId", masterMap[numProfile].email);
    await page.type("#fname", "Justin");
    await page.type("#lname", "Yu");
    await page.type("#custAddress", masterMap[numProfile].shipping.toString());
    await new Promise(resolve => setTimeout(resolve, 1500));
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.type("#phoneNo", "9173765458");

    if(masterMap[numProfile].address2 != '' && masterMap[numProfile].address2 != null){
        await page.evaluate(() => document.querySelector("div[aria-label='toggle to adding address line 2, example add appartment #, floor etc. (optional)']").click())
        await page.waitForSelector("#custAddress2")
        await page.type("#custAddress2", masterMap[numProfile].address2);
    }

    await page.evaluate(() => document.getElementsByTagName("button")[0].click());
}

async function submitOrder(page){

    console.log("Entered PAYMENT stage");
    //VISA, 4485139376074441, 9/2025, 354
    await page.waitForSelector('#eProtect-iframe');
    let iframeElement = await page.$('#eProtect-iframe'); 
    let frame = await iframeElement.contentFrame();
    await new Promise(resolve => setTimeout(resolve, 1000));


    await tryType(frame, "input[id='accountNumber']", masterMap[numProfile].creditCardNumber)
    await frame.type("#cvv", masterMap[numProfile].cvv);
    await frame.select("#expMonth", masterMap[numProfile].cardExpMonth);
    await frame.select("#expYear", masterMap[numProfile].cardExpYear);

    if(masterMap[numProfile].same.toLowerCase().trim() == 'no'){
        console.log("inputting different billing address...")
        await new Promise(resolve => setTimeout(resolve, 500));
        await page.evaluate(() => {
            document.querySelector("label[for='billingAddChkbox']").lastElementChild.click();
        })

        await new Promise(resolve => setTimeout(resolve, 500));
        await page.type("#firstName", masterMap[numProfile].firstname);
        await page.type("#lastName", masterMap[numProfile].lastname);
        await page.type("#address1", masterMap[numProfile].address);
        await new Promise(resolve => setTimeout(resolve, 1500));
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
    }

    await new Promise(resolve => setTimeout(resolve, 1500));
    await page.evaluate(() => document.getElementsByTagName("button")[0].click());
    console.log("Order placed!")


    await new Promise(resolve => setTimeout(resolve, 15000));
}

async function outOfStock(page){
    await page.waitForSelector("button[data-cy='buyBox__addToCartButton']");

    let outOfStock = await page.evaluate(() => {
        return document.querySelector("button[data-cy='buyBox__addToCartButton']").innerText == "sold out";
    });


    return outOfStock;
}


async function run(){
    console.log("VERSION 2.0.1");
    masterMap = registerProfiles();
    let PRODUCT_URL = masterMap[numProfile].product.toString().trim();
    numPerOrder = masterMap[numProfile].qty.toString().trim();

    while(true){
        var page = await givePage();
        await page.goto(PRODUCT_URL);
        let res = await outOfStock(page);

        while(res){
            await page.reload();
            res = await outOfStock(page);
            if(res){
                console.log("Out of stock!")
                await new Promise(resolve => setTimeout(resolve, 30000));
                await new Promise(resolve => setTimeout(resolve, 30000));
                await new Promise(resolve => setTimeout(resolve, 30000));
                await new Promise(resolve => setTimeout(resolve, 30000));
                await new Promise(resolve => setTimeout(resolve, 30000));
                await new Promise(resolve => setTimeout(resolve, 30000));
                counter += 1;
                if (counter == 10){
                    counter = 0
                    await page.close();
                    page = await givePage();
                    await page.goto(PRODUCT_URL);
                    res = await outOfStock(page);
                }
                //await page.waitForTimeout(30000)
            }
    }

        console.log("Item detected!");
        await addtoCart(page);
        await billing(page);
        await submitOrder(page);
        await page.close();
        numProfile += 1;
        if(numProfile >= masterMap.length){
            numProfile = 0;
        }
        
    }
}


run();