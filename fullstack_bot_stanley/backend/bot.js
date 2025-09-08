import fetch from 'node-fetch'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

puppeteer.use(StealthPlugin())

const productURL = "https://www.stanley1913.com/products/clean-slate-quencher-h20-flowstate-tumbler-40-oz?variant=44559841165439";
const productURLInfo = productURL.split(".com")[1];
const addToCartURL = "https://www.stanley1913.com/cart/add";
const checkoutURL = "https://www.stanley1913.com/checkout";

async function parseCookies(page) {
    const cookies = await page.cookies();
    let cookieList = "";
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        let cookieString = cookie.name + "=" + cookie.value;
        if (i != (cookies.length - 1)) {
            cookieString = cookieString + "; ";;
        }
        cookieList = cookieList + cookieString;
    }
}

async function productInStock(link){
    const variantId = link.split("?")[1].split("=")[1];
    let response = await fetch(link.split("?")[0] + ".js").then(response => {
          if (!response.ok) {
            throw new Error("HTTP error! Status: ${response.status}");
          }
          const contentType = response.headers.get("content-type");
          
          if (contentType && contentType.includes("application/json")) {
            return response.json();
          } else {
            return response.text();
          }
        })
        .catch(error => {
          console.error("Error: ", error);
        });
  
    try {
        const parsedResponse = JSON.parse(response);
        const variantsArray = parsedResponse.variants;
        for (const variant of variantsArray) {
          if (variant.id == variantId && variant.available) {
            console.log(Boolean(variant.available));
            return Boolean(variant.available);
          }
        }
        
        return false;
        
      } catch (error) {
        console.error("Error parsing response: ", error.message);
        return false;
      }
  }


async function getTaskStatus(productUrl, taskID) {
  try {
    const response = await fetch('http://localhost:3001/task/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: taskID }),
    });

    const status = await response.json();
    if (!status.success) {
      throw new Error('Failed to fetch task status');
    }
    return status.taskStatus; 

  } catch (error) {
    console.error('Error fetching task status:', error.message);
    return null;
  }
}

async function addToCartRequest(page, url) {
    await page.waitForSelector("input[name='section-id']");
    await page.waitForSelector("input[name='product-id']");
    await page.waitForSelector("input[name='id']");

    const sectionId = await page.evaluate(() => {
        return document.querySelector("input[name='section-id']").getAttribute("value");
    })
    const productId = await page.evaluate(() => {
        return document.querySelector("input[name='product-id']").getAttribute("value");
    })
    const nameId = await page.evaluate(() => {
        return document.querySelector("input[name='id']").getAttribute("value");
    })

    const productColor = await page.evaluate((nameId) => {
        return document.getElementById(nameId).getAttribute("value");
    },nameId)
  
    const cookieList = await parseCookies(page);
    const webBoundary = "----XXX"; // Can be arbitrary, just needs to have 4 dashes and request data can't contain the boundary
    
    const addRequestForm = {
        "method": "POST",
        "headers": {
            "accept": "application/javascript",
            "accept-language": "en-US,en;q=0.9",
            "content-type": `multipart/form-data; boundary=${webBoundary}`,
            "sec-ch-ua": "\"Chromium\";v=\"122\", \"Not(A:Brand\";v=\"24\", \"Microsoft Edge\";v=\"122\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
            "cookie": cookieList,
            "Referer": url,
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": `--${webBoundary}\r\nContent-Disposition: form-data; name=\"form_type\"\r\n\r\nproduct\r\n--${webBoundary}\r\nContent-Disposition: form-data; name=\"utf8\"\r\n\r\n✓\r\n--${webBoundary}\r\nContent-Disposition: form-data; name=\"id\"\r\n\r\n${nameId}\r\n--${webBoundary}\r\nContent-Disposition: form-data; name=\"product-id\"\r\n\r\n${productId}\r\n--${webBoundary}\r\nContent-Disposition: form-data; name=\"section-id\"\r\n\r\n${sectionId}\r\n--${webBoundary}\r\nContent-Disposition: form-data; name=\"quantity\"\r\n\r\n1\r\n--${webBoundary}\r\nContent-Disposition: form-data; name=\"sections\"\r\n\r\ncart-notification-product,cart-notification-button,cart-icon-bubble\r\n--${webBoundary}\r\nContent-Disposition: form-data; name=\"sections_url\"\r\n\r\n${productURLInfo}\r\n--${webBoundary}--\r\n`
    };

    const addRequestResponse = await page.evaluate(async (addRequestForm) => {
        try {
            let response = await fetch("https://www.stanley1913.com/cart/add.js", addRequestForm);
            const body = await response.text();
            if (!response.ok) {
                throw new Error(`Add request error! Status: ${response.status}`);
            }
            
        } catch (error) {
            console.error("Add Request Error: ", error);
        }
    }, addRequestForm);
}

async function fillShippingInfo(page) {
    await page.waitForSelector("input[id='email']");
    await page.type("input[id='email']", "thonmaker344@gmail.com");
    await page.waitForSelector("input[name='firstName']");
    await page.type("input[name='firstName']","Bob");
    await page.waitForSelector("input[name='lastName']");
    await page.type("input[name='lastName']","Builder");
    await page.waitForSelector("input[name='address1']");
    await page.type("input[name='address1']", "2645 WOODWARD AVE");
    await page.waitForSelector("input[name='city']");
    await page.type("input[name='city']", "DETROIT");
    await page.waitForSelector("input[name='postalCode']");
    await page.type("input[name='postalCode']", "48201");
    await page.waitForSelector("input[name='phone']");
    await page.type("input[name='phone']", "2029182132");
    await page.waitForSelector("select[name='zone']");
    await page.select("select[name='zone']", "MI");
    const submitButton = await page.waitForSelector("button[type='submit']");
    await new Promise(resolve => setTimeout(resolve,1500));
    await submitButton.click();
}

async function selectShippingMethod(page) {
    await new Promise(resolve => setTimeout(resolve,3000));
    const continueToPayment = await page.waitForSelector("button[type='submit']");
    await continueToPayment.click();
}

async function fillPaymentInfo(page) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    await page.waitForSelector("iframe[title='Field container for: Card number']");
    let iframeCard = await page.$("iframe[title='Field container for: Card number']");
    let iframeCardContent = await iframeCard.contentFrame();
    await iframeCardContent.type("input[id='number']", "4539169331101084");

    let iframeName = await page.$("iframe[title='Field container for: Name on card']");
    let iframeNameContent = await iframeName.contentFrame();
    await iframeNameContent.type("input[id='name']", "Bob Builder");

    let iframeExpiration = await page.$("iframe[title='Field container for: Expiration date (MM / YY)']");
    let iframeExpirationContent = await iframeExpiration.contentFrame();
    await iframeExpirationContent.type("input[id='expiry']", "02 / 2026");

    let iframeCode = await page.$("iframe[title='Field container for: Security code']");
    let iframeCodeContent = await iframeCode.contentFrame();
    await iframeCodeContent.type("input[id='verification_value']", "951");

    const payNow = await page.waitForSelector("button[type='submit']");
    await payNow.click();
    console.log("Order was placed!");
}

async function launchProductPage(link){
    const launchPuppeteer = await puppeteer.launch({headless: false});
    const productPage = await launchPuppeteer.newPage();
    try {
        await productPage.goto(link);
    }
    catch (error) {
        console.error("The initial launch of the page was unsuccessful: ", error);
    }
    return productPage;
  }

async function run(productUrl, taskID){
    let inStock = false;
    console.log(`Running task ${taskID}`);
    while (!inStock){
      const stopRunning = await getTaskStatus(productUrl, taskID);
      
      if (stopRunning) {
        console.log(`Task ${taskID} deleted`);
        return; 
      }
      inStock = await productInStock(productUrl);
      if (inStock){
          console.log(`Product is in stock for ${productUrl}!`);
      }
      else{
          console.log(`Product is NOT in stock for ${productUrl}`);
          await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    const stopRunning = await getTaskStatus(productUrl, taskID);
    while (!stopRunning) {
      if (inStock) {
        let page = await launchProductPage(productUrl);
        await addToCartRequest(page, productURL);
        try {
            await page.goto("https://www.stanley1913.com/checkout");
        }
        catch (error) {
            console.error("The launching of the checkout page was unsuccessful: ", error);
        }
        await fillShippingInfo(page);
        await selectShippingMethod(page);
        await fillPaymentInfo(page);
        return
      }  
    }
    console.log(`Task ${taskID} finished`);
    return;
  }

export { run };