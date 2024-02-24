import chalk from 'chalk';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
// import { getDetailInfoItems } from './utils/getDetailInfoItems.js';
// import { getUrlsEachItem } from './utils/getUrlsEachItem.js';
// import { saveToJson } from '../commonUtils/saveToJson.js';
import { getDetailInfoItemsPup } from './utils/getDetailInfoItemsPup.js';
import { urlsEachItem } from './workingData/urlsEachItem.js';
puppeteer.use(StealthPlugin());

const pathResult = '../../data/barb_ua/';
const fileUrlsResult = `barbUrls.json`;

async function main() {
  try {
    // const urlsItemsByCity = await getUrlsEachItem();
    // await saveToJson(pathResult, fileUrlsResult, urlsItemsByCity);

    // const detailInfoItems = await getDetailInfoItems(urlsEachItem);
    // await saveToJson(pathResult, 'result_barb.json', detailInfoItems);

    const browser = await puppeteer.launch({
      headless: false,
      //   // defaultViewport: { width: 1920, height: 1080 },
      defaultViewport: null,
    });
    const [page] = await browser.pages();
    const resultFull = await getDetailInfoItemsPup(page, urlsEachItem);
    await page.close();
  } catch (error) {
    console.log(chalk.red(error));
  }
  // browser.close();
}

main();
