import axios from 'axios';
import puppeteer from 'puppeteer';
import chalk from 'chalk';
import fs from 'fs';
import { JSDOM } from 'jsdom';
import { parseJSONFile } from './commonUtils/parseJSONFile.js';
import { saveToJson } from './commonUtils/saveToJson.js';

async function main() {
  try {
    const items = await parseJSONFile('mastershopFull');
    console.log(items.length);
    const uniqByLink = getUniqObjByKey(items, 'links');
    console.log(uniqByLink.length);
    await saveToJson('', 'mastershopFull', uniqByLink);
  } catch (error) {
    console.log(chalk.red(error));
  }
}

await main();

function getUniqObjByKey(array, key) {
  const seen = new Set();
  return array.filter(item => {
    const keyValue = item[key];
    if (!seen.has(keyValue)) {
      seen.add(keyValue);
      return true;
    }
    return false;
  });
}