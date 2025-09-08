// Developed by @BlazarusTech

// x-shopify-storefront-access-token:
// 2a1ffada6512bf238885987120eba877
// gid://shopify/ProductVariant/44559841656959

import fetch from 'node-fetch';
import puppeteer from 'puppeteer-extra';
import pStealth from 'puppeteer-extra-plugin-stealth';

puppeteer.use(pStealth());

const STORE_FRONT_ACCESS_TOKEN = '2a1ffada6512bf238885987120eba877';
const SHOPIFY_STORE_URL = 'https://www.stanley1913.com/api/unstable/graphql.json';

const createCheckout = async () => {
  const query = `
    mutation {
      cartCreate(input: { 
        lines: [{ merchandiseId: "gid://shopify/ProductVariant/44559841656959", quantity: 1 }],
        buyerIdentity: { email: "johntestdoe@gmail.com", phone: "+96597211016" },
        delivery: {
          addresses: [{
            address:
              { 
                deliveryAddress: { address1: "1601 JEROME AVENUE", city: "ASTORIA", countryCode: US, firstName:"Dum", lastName: "Dumn", zip: "97103",phone:"+96566661235" }
              }
          }
          ]
        }
      }) {
        cart {
          id
          checkoutUrl
        }
        userErrors {
          field
          message
        }
      }
    }`;

  try {
    const response = await fetch(SHOPIFY_STORE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STORE_FRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();

    return data.data.cartCreate.cart;
  } catch (error) {
    console.error('Error creating checkout:', error);
    return null;
  }
};

const openCheckoutInBrowser = async (checkoutUrl) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto(`${checkoutUrl}`, { waitUntil: 'domcontentloaded' });
    console.log("Page loaded successfully.");

    //Skip to Payment page
    await page.click('button[type=submit]');
    await page.waitForNavigation()
    // await new Promise(resolve => setTimeout(resolve, 500));
    await page.click('button[type=submit]');

    //Card Details
    let iframeCard = await page.waitForSelector("iframe[title='Field container for: Card number']");
    let cardName = await iframeCard.contentFrame()
    await cardName.type("#number", "4485 4080 8415 0730")
    console.log("Card Name inputted")

    iframeCard = await page.waitForSelector("iframe[title='Field container for: Expiration date (MM / YY)']");
    let expirationDate = await iframeCard.contentFrame();
    await expirationDate.type("#expiry", "08/26")
    console.log("Card Expirty Date inputted")
    
    iframeCard = await page.waitForSelector("iframe[title='Field container for: Security code']");
    let cvv = await iframeCard.contentFrame();
    await cvv.type("#verification_value", "118")
    console.log("Card CVV inputted")

    await page.click('button[type=submit]');
  } catch (error) {
    console.error('Error during Puppeteer interaction:', error);
  }
};

const initiateCheckout = async () => {
  try {
    const checkout = await createCheckout();
    if (!checkout) return;  // If checkout creation failed, do not proceed

    await openCheckoutInBrowser(checkout.checkoutUrl);
  } catch (error) {
    console.error('Error:', error);
  }
};

initiateCheckout();
