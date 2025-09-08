import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

puppeteer.use(StealthPlugin())

// Helper function to parse cookies from the page
async function parseCookies(page) {
    const cookies = await page.cookies();
    let cookieList = "";
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        let cookieString = cookie.name + "=" + cookie.value;
        if (i != (cookies.length - 1)) {
            cookieString = cookieString + "; ";
        }
        cookieList = cookieList + cookieString;
    }
    return cookieList;
}

// Function to add item to cart
async function addToCartRequest(page, productURL) {
    // Wait for necessary elements to be loaded
    await page.waitForSelector("input[name='section-id']");
    await page.waitForSelector("input[name='product-id']");
    await page.waitForSelector("input[name='id']");

    // Get required form values from the page
    const sectionId = await page.evaluate(() => 
        document.querySelector("input[name='section-id']").getAttribute("value")
    );
    const productId = await page.evaluate(() => 
        document.querySelector("input[name='product-id']").getAttribute("value")
    );
    const nameId = await page.evaluate(() => 
        document.querySelector("input[name='id']").getAttribute("value")
    );

    const cookieList = await parseCookies(page);
    const webBoundary = "----XXX";
    
    // Prepare the add to cart request
    const addRequestForm = {
        "method": "POST",
        "headers": {
            "accept": "application/javascript",
            "accept-language": "en-US,en;q=0.9",
            "content-type": `multipart/form-data; boundary=${webBoundary}`,
            "sec-ch-ua": "\"Chromium\";v=\"122\", \"Not(A:Brand\";v=\"24\", \"Microsoft Edge\";v=\"122\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
            "cookie": cookieList,
            "Referer": productURL
        },
        "body": `--${webBoundary}\r\nContent-Disposition: form-data; name=\"form_type\"\r\n\r\nproduct\r\n--${webBoundary}\r\nContent-Disposition: form-data; name=\"utf8\"\r\n\r\n✓\r\n--${webBoundary}\r\nContent-Disposition: form-data; name=\"id\"\r\n\r\n${nameId}\r\n--${webBoundary}\r\nContent-Disposition: form-data; name=\"product-id\"\r\n\r\n${productId}\r\n--${webBoundary}\r\nContent-Disposition: form-data; name=\"section-id\"\r\n\r\n${sectionId}\r\n--${webBoundary}\r\nContent-Disposition: form-data; name=\"quantity\"\r\n\r\n1\r\n--${webBoundary}--\r\n`
    };

    // Send add to cart request
    await page.evaluate(async (addRequestForm) => {
        try {
            let response = await fetch("https://www.stanley1913.com/cart/add.js", addRequestForm);
            if (!response.ok) {
                throw new Error(`Add request error! Status: ${response.status}`);
            }
        } catch (error) {
            console.error("Add Request Error: ", error);
        }
    }, addRequestForm);
}

// Main function to run the cart and checkout process
async function addToCartAndCheckout(productURL) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        // Navigate to product page
        await page.goto(productURL);
        
        // Add item to cart
        await addToCartRequest(page, productURL);
        
        // Navigate to checkout
        await page.goto("https://www.stanley1913.com/checkout");
        
        console.log("Successfully added to cart and navigated to checkout!");
    } catch (error) {
        console.error("Error during process:", error);
    }
}

// Example usage
const productURL = "https://www.stanley1913.com/products/the-fall-refresh-quencher-h2-o-flowstate%E2%84%A2-tumbler-i-30-oz?variant=44560128344191";
addToCartAndCheckout(productURL);
