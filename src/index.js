import axios from 'axios';
import puppeteer from 'puppeteer';
import chalk from 'chalk';
import fs from 'fs';
import { JSDOM } from 'jsdom';

const savePath = `../data/`;
const saveFileName = '.json'; //!

async function main(params) {
  try {
  } catch (error) {
    console.log(chalk.red(error));
  }
}

main();

// (async function () {
//   for (let i = 0; i < URLS_PATH.length; i++) {
//     const category = URLS_PATH[i];
//     try {
//       const { data } = await axios.get(``); //!
//       const { document } = new JSDOM(data).window;
//       const products = [...document.querySelector('').querySelectorAll('')]; //!
//     } catch (error) {
//       console.log(chalk.red(error));
//     }
//   }
//   // saveDataCSV(convertToCSV(result.flat()), outputFileName);
// })();
