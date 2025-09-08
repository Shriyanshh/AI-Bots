const puppeteer = require('puppeteer-extra');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');
const { google } = require('googleapis');

puppeteer.use(stealthPlugin());

const saveInfoButtonSelector = 'button._acan._acap._acas._aj1-[type="button"]';


var profiles = [
    'https://www.instagram.com/tomferry/',
    'https://www.instagram.com/anthony_the_dreamer92/',
    'https://www.instagram.com/lifeasrob/',
    'https://www.instagram.com/a.whitaker228/',
    'https://www.instagram.com/cousineaurealestate/',
    'https://www.instagram.com/jamesagreenrealestate/'
]

async function checkMessageButton(page) {
    const messageButtonSelector = 'div[role="button"][tabindex="0"]';
    const messageButton = await page.$(messageButtonSelector);

    if (messageButton) {
        console.log("Message button found on profile.");
        return messageButton;
    } else {
        console.log("Message button not found.");
        return null;
    }
}

async function loginToInstagram(page, username, password) {
    console.log("Navigating to Instagram login page...");
    await page.goto('https://www.instagram.com/accounts/login/');
    
    await page.waitForTimeout(5000);  // Wait for the login page to load properly

    console.log("Typing email...");
    await page.type('input[aria-label="Phone number, username, or email"]', username);
    
    console.log("Typing password...");
    await page.type('input[aria-label="Password"]', password);

    console.log("Clicking login...");
    await page.click('button[type="submit"]');

    await page.waitForTimeout(10000);  // Wait for the redirection after login

    // Check if the login was successful
    try {
        await page.waitForSelector(saveInfoButtonSelector, { timeout: 10000 });
        console.log("Login successful!");
    } catch (e) {
        console.error("Login failed or it took too long to load the next page.");
        throw e; // Propagate the error
    }
}

async function navigateToProfileAndCheckMessageButton(page, rowNumber) {
    const profileLink = profiles[rowNumber]
    if (!profileLink) {
        console.error("No more profiles left to navigate to.");
        return;
    }

    console.log(`Navigating to profile: ${profileLink}`);
    await page.goto(profileLink);

    // Wait for the profile page to load
    await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

    const messageButton = await checkMessageButton(page);

    if (messageButton) {
        console.log("Message button found on the profile. Clicking...");
        await messageButton.click();
    } else {
        console.log("Message button not found on the profile. Navigating to the next profile...");
    }

    //Next step would be to write and send message
    await sendMessage(page)

}

async function sendMessage(page){
    //implement this :)
}

async function main() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await loginToInstagram(page, '', '');
    for(i=0; i < profiles.length; i++){
        await navigateToProfileAndCheckMessageButton(page, i);
    }
    
}

main();
