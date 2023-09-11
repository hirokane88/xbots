const ACCOUNT = "zen"; //zen, stoic, or enfp
const { MongoClient, ObjectId } = require("mongodb");
const puppeteer = require('puppeteer');
const { MONGOPASS, XPASS } = require("../config/passwords");
const days_of_posts = 200;
const start_date = new Date(); start_date.setDate(start_date.getDate() + 1);
// const start_date = new Date('2024-05-19');
const end_date = new Date().setDate(start_date.getDate() + days_of_posts + 1);
const accounts = {
  zen: { username: "zen_quotes_x", style: "~", hashtag: "zen" },
  stoic: { username: "stoic_quotes_x", style: "-", hashtag: "stoic"},
  enfp: { username: "enfp_quotes", style: "~", hashtag: "enfp"}
}

async function main() {
  const client = new MongoClient(`mongodb+srv://hirok:${MONGOPASS}@prod.yq6c3n4.mongodb.net/?retryWrites=true&w=majority`);
  await client.connect();
  const db = await client.db("quotes");
  const collection = db.collection(ACCOUNT);

  const browser = await puppeteer.launch({ headless: false }); // You can set headless to true for a headless browser
  const page = await browser.newPage();

  // Navigate to Twitter's login page
  await page.goto('https://twitter.com/login');

  // Fill in the login form and submit
  await new Promise(res => setTimeout(res, 2000));
  await page.type('input[name="text"]', accounts[ACCOUNT].username);
  await page.evaluate(() => {
    const next_button = [...document.querySelectorAll('div[role="button"]')].find(button => button.innerText.trim() === "Next");
    if (next_button) {
      next_button.click();
    } else {
      console.error('Next button not found.');
      process.exit(1);
    }
  });
  await new Promise(res => setTimeout(res, 2000));
  await page.type('input[name="password"]', XPASS);
  await page.evaluate(() => {
    const next_button = [...document.querySelectorAll('div[role="button"]')].find(button => button.innerText.trim() === "Log in");
    if (next_button) {
      next_button.click();
    } else {
      console.error('Log in button not found.');
      process.exit(1);
    }
  });
  await new Promise(res => setTimeout(res, 2000));

  //Schedule all of the posts
  for (let post_date = start_date; post_date <= end_date; post_date.setDate(post_date.getDate() + 1)) {
    const year = post_date.getFullYear();
    const month = post_date.getMonth() + 1;
    const day = post_date.getDate();

    // Type the quote in
    await new Promise(res => setTimeout(res, 1000));
    await page.click("a[aria-label='Post']");
    await new Promise(res => setTimeout(res, 1000));

    const document = await collection.findOne();
    const tweet = '"' + document.quote + '" ' + accounts[ACCOUNT].style + " " + document.author + " #" + ACCOUNT + " " + "#" + "quotes" + " ";
    await page.keyboard.type(tweet);

    // Schedule post
    await page.click("div[aria-label='Schedule post']");
    await new Promise(res => setTimeout(res, 1000));
    const selects = await page.$$('select');
    const monthSelector = selects[0];
    const daysSelector = selects[1];
    const yearSelector = selects[2];
    const hourSelector = selects[3];
    const minuteSelector = selects[4];
    const AMSelector = selects[5];
    await monthSelector.select(month + "");
    await daysSelector.select(day + "");
    await yearSelector.select(year + "");
    await hourSelector.select("6");
    await minuteSelector.select("30");
    await AMSelector.select("am");
    await page.evaluate(() => {
      const next_button = [...document.querySelectorAll('div[role="button"]')].find(button => button.innerText.trim() === "Confirm");
      if (next_button) {
        next_button.click();
      } else {
        console.error('Confirm button not found.');
        process.exit(1);
      }
    });
    await page.evaluate(() => {
      const button = [...document.querySelectorAll('div[role="button"]')].find(btn => btn.innerText.trim() === "Schedule");
      if (button) {
        button.click();
        return true;
      } else {
        console.error(`${innerText} button not found.`);
        process.exit(1);
      }
    });
    await collection.deleteOne({ _id: document._id });
  }
  await browser.close();
  await client.close();
  process.exit();
};

main();
