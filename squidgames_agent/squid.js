const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const readline = require('readline');
const locateChrome = require('chrome-location');

// to use this bot here are the steps
/* 
  1. You must go to google.com and search up "squid games"
  2. Click the easter egg card at bottom to activate red light green light game 
*/

const target_url = "https://www.google.com/"
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function givePage(){
    const browser = await puppeteer.launch({headless: false, executablePath: locateChrome});
    const page = await browser.newPage();
    return page;
}

async function checkHead(page){
    console.log('checking head')
    await page.evaluate(() => {
        const headRegion = {
            x: 726, // Example x-coordinate
            y: 65,  // Example y-coordinate
            width: 47, // Example width
            height: 40 // Example height
        };
        const canvas = document.querySelector('canvas.GQ0mne');
        const ctx = canvas.getContext('2d');
        let previousData = null;
        let eyesVisible = false;

        function drawRed(){
            const canvas = document.querySelector('canvas.GQ0mne');
            const ctx = canvas.getContext('2d');
            
            // Hypothetical coordinates for the doll's head
            const headRegion = {
              x: 726, // Start at x = 100
              y: 65,  // Start at y = 50
              width: 47, // Width of 100 pixels
              height: 40 // Height of 100 pixels
            };
            
            ctx.strokeStyle = 'red'; 
            ctx.lineWidth = 10;
            ctx.strokeRect(headRegion.x, headRegion.y, headRegion.width, headRegion.height);
            }

        
        function hasHeadMoved() {
          const imageData = ctx.getImageData(
            headRegion.x,
            headRegion.y,
            headRegion.width,
            headRegion.height
          );
        
          if (!previousData) {
            previousData = imageData;
            return false;
          }
        
          let changedPixels = 0;
          const dataLength = imageData.data.length; // RGBA = 4 values per pixel
          for (let i = 0; i < dataLength; i += 4) {
            const diffR = Math.abs(imageData.data[i] - previousData.data[i]);
            const diffG = Math.abs(imageData.data[i + 1] - previousData.data[i + 1]);
            const diffB = Math.abs(imageData.data[i + 2] - previousData.data[i + 2]);
        
            const colorDiff = diffR + diffG + diffB;
            if (colorDiff > 50) {
              changedPixels++;cl
            }
          }
        
          const totalPixels = (headRegion.width * headRegion.height);
        
          const percentChanged = (changedPixels / totalPixels) * 100;
          const movementThresholdPercent = 50; // tweak this value as needed
        
          previousData = imageData;
        
          if (percentChanged > movementThresholdPercent) {
            console.log('Head moved! Changed pixels:', changedPixels, `(${percentChanged.toFixed(2)}%)`);
            if(eyesVisible){
              document.querySelector("div[aria-label='Stop']").firstElementChild.firstElementChild.click();
              console.log('Stop!')
              eyesVisible = false
            } else {
              document.querySelector("div[aria-label='Go']").firstElementChild.firstElementChild.click();
              console.log('Run!')
              eyesVisible = true
            }
            
            return true;
          }
          
          return false; 
        }
            
        
        console.log('Setting interval')
        setInterval(() => {
            drawRed()
            hasHeadMoved()
        }, 500);
    })
}




  async function run(){
    let page = await givePage();
    page.on('console', (msg) => {
        console.log(`[${msg.type()}] ${msg.text()}`);
    });

    await page.goto(target_url);

    /*await new Promise(resolve => setTimeout(resolve, 50000));
    console.log('Second delay')
    await new Promise(resolve => setTimeout(resolve, 50000));
    console.log('Delay finished')*/
    console.log('Navigated to site')
    userInput = await new Promise((resolve) => {
        rl.question('Enter "y" once you have logged in: ', (answer) => {
            rl.close();
            resolve(answer);
        });
    });

    //await page.goto(job_search_page_url);
    await checkHead(page)

}

run()


/*

function drawRed(){
const canvas = document.querySelector('canvas.GQ0mne');
const ctx = canvas.getContext('2d');

// Hypothetical coordinates for the doll's head
const headRegion = {
  x: 726, // Start at x = 100
  y: 65,  // Start at y = 50
  width: 47, // Width of 100 pixels
  height: 40 // Height of 100 pixels
};

// Draw the rectangle to visualize the head region
ctx.strokeStyle = 'red'; // Color of the rectangle
ctx.lineWidth = 10;
ctx.strokeRect(headRegion.x, headRegion.y, headRegion.width, headRegion.height);



}


*/