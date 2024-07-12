import axios from 'axios';
import fs from 'fs';
import { JSDOM } from 'jsdom';
import excel from 'excel4node';

import { saveToJson } from '../commonUtils/saveToJson.js';
import { parseJSONFile } from '../commonUtils/parseJSONFile.js';
import { normalizeStr } from '../commonUtils/normalizeStr.js';
import { delay } from '../commonUtils/delay.js';
import { saveImg } from '../commonUtils/saveImg.js';
import { BASE_URL_RU, BASE_URL_UA, CATEGORIES, FILES_CAT } from './initData.js';

import { getFilesPath } from './getFilesPath.js';

//* зупинилися на індекс 20 включно

const startCatIdx = 20;

const startPage = 1;
const PER_PAGE = 24;
const MAX_RETRIES = 5;
const jsonFilesDir = 'data';
const mainUrls = [BASE_URL_UA, BASE_URL_RU];

for (let idxMainUrl = 0; idxMainUrl < mainUrls.length; idxMainUrl++) {
  const mainUrl = mainUrls[idxMainUrl];

  for (let idx = startCatIdx; idx < CATEGORIES.length; idx++) {
    // for (let idx = 0; idx < 1; idx++) {
    const categoryUrl = CATEGORIES[idx];
    const category = mainUrl.includes('/ua')
      ? FILES_CAT[(idx + 1) * 2 - 1]
      : FILES_CAT[(idx + 1) * 2 - 2];
    let page = startPage;
    const lang = mainUrl.includes('/ua') ? 'ua' : 'ru';
    let fileName = null;
    if (typeof categoryUrl === 'function') {
      fileName = categoryUrl(1).replace('search/p-1?q=', '');
    } else {
      fileName = categoryUrl.replace(/\//g, '-');
    }
    const jsonFileName = `${jsonFilesDir}/${fileName}-${lang}`;
    console.log(jsonFileName);
    await getFirstPartOfData(page, mainUrl, categoryUrl, category, jsonFileName);
  }
}

await getScondPartOfData(jsonFilesDir);
await createExcelFileFromJson(jsonFilesDir);

async function getFirstPartOfData(page, baseUrl, categoryUrl, category, resultsFileName) {
  const results = [];
  let lastPage = null;
  while (page) {
    let pageLink = null;
    if (typeof categoryUrl === 'function') {
      pageLink = `${baseUrl}/${categoryUrl(page)}`;
    } else {
      pageLink = `${baseUrl}/product/${categoryUrl}/p-${page}`;
    }
    console.log(
      `PAGE-> ${page} (${baseUrl.includes('/ua') ? 'ua' : 'ru'} ${
        typeof categoryUrl === 'function' ? categoryUrl(page) : categoryUrl
      })`
    );
    try {
      const { data } = await axios.get(pageLink);
      const { document } = new JSDOM(data).window;
      if (page === startPage) {
        const lastPageEl = document.querySelector('.paginator .paginator__page:last-child a');
        lastPage = lastPageEl ? Number(lastPageEl.textContent) : 1;
      }
      const products = [
        ...document.querySelectorAll('.list-cards-product .card-product__content'),
      ].map(el => {
        const url = el.querySelector('a.card-product__img-box').href;
        const sku = el.querySelector('.card-product__art').textContent.replace(/Код: /g, '');
        const price = el.querySelector('.product-price__current strong')?.textContent;
        const prevImgEl = el.querySelector('img.card-product__img');
        const prevImg = baseUrl + prevImgEl.src;
        const link = baseUrl + url;
        const title = prevImgEl.alt;
        const spec = [...el.querySelectorAll('.product-features .product-features__text')].reduce(
          (acc, cur) => {
            const key = cur.title;
            const value = cur?.textContent;
            acc[key] = acc[key] ? [...acc[key], value] : (acc[key] = [value]);

            return acc;
          },
          {}
        );
        Object.keys(spec).forEach(key => {
          spec[key] = spec[key].join(', ');
        });
        return { link, category, sku, title, price, prevImg, ...spec };
      });
      if (products.length !== PER_PAGE) {
        if (page === lastPage) {
          results.push(...products);
          console.log('total items', results.length - 1);
          break;
        }
        continue;
      }
      results.push(...products);
      console.log('total items', results.length - 1);
      page++;
      if (page > lastPage) {
        break;
      }
    } catch (error) {
      console.log('request error', error.message);
    }
  }
  try {
    await saveToJson('./', resultsFileName.replace(), results);
  } catch (error) {
    console.log(error);
    console.log('error save resultJson FirstPart');
  }
}

async function getScondPartOfData(dirPath) {
  const filesPath = await getFilesPath(dirPath);
  for (let idx = 0; idx < filesPath.length; idx++) {
    // for (let idx = 0; idx < 1; idx++) {
    const filePath = filesPath[idx];
    const products = await parseJSONFile(filePath.replace(/.json/g, ''));
    let idxProd = 0;
    while (idxProd < products.length) {
      // while (idxProd < 3) {
      const product = products[idxProd];
      const { link, sku, price } = product;
      let retries = 0;
      while (retries < MAX_RETRIES) {
        try {
          const { data } = await axios.get(link);
          const { document } = new JSDOM(data).window;
          const infoProduct = [...document.querySelectorAll('script[type="application/ld+json"]')]
            .map(i => JSON.parse(i.textContent))
            .find(i => i['@type'] === 'Product');
          product.brand = infoProduct?.brand?.name;

          const imgs = infoProduct?.image;
          if (Array.isArray(imgs)) {
            product.imgs = imgs.join(';');
          } else {
            product.imgs = imgs;
          }
          product.description = normalizeStr(
            document.querySelector('.product__block.text-base>p')?.textContent
          );
          const prodSpec = infoProduct.description?.split('. ');
          prodSpec.forEach(it => {
            const splitIt = it.split(': ');
            const key = splitIt?.[0];
            const value = it.replace(`${key}:`, '').trim();
            if (!product[key]) {
              product[key] = value;
            } else {
              const productKeySplit = product[key].split(', ');
              productKeySplit.push(value);
              const uniqValue = [...new Set(productKeySplit)].join(', ');
              product[key] = uniqValue;
            }
          });
          product.userSKU = `1${sku}`;
          product.userPrice = Math.ceil(price - price * 0.05);
          retries = MAX_RETRIES;
          const splitFilePath = filePath.split('\\');
          const filesLang = splitFilePath[splitFilePath.length - 1];
          console.log(`Success: ${idxProd}/${products.length - 1} ${filesLang}`);
        } catch (error) {
          console.log(error);
          console.log(`Request error at file ${idx} and product's  index ${idxProd}`);
          retries++;
          if (retries === MAX_RETRIES) {
            product['error'] = true;
            console.log(
              `Failed after ${MAX_RETRIES} retries for file ${idx} and product's index ${idxProd}`
            );
          }
        }
      }
      idxProd++;
    }
    try {
      await saveToJson('', filePath.replace(/.json/g, ''), products);
    } catch (error) {
      console.log('error save resultJson SecondPart');
    }
  }
}

async function createExcelFileFromJson(dirPath) {
  const filesPath = await getFilesPath(dirPath);
  for (let idx = 0; idx < filesPath.length; idx++) {
    const filePath = filesPath[idx];
    const products = await parseJSONFile(filePath.replace(/.json/g, ''));
    products.forEach(it => {
      delete it.link;
      delete it.description;
      delete it['Примечание'];
      delete it['Примітка'];
    });
    const splitFilePath = filePath.replace(/.json/g, '').split('\\');
    const wb = new excel.Workbook();
    const workSheetName = splitFilePath[splitFilePath.length - 1].slice(-32).replace(/-/g, '');
    const ws = wb.addWorksheet(workSheetName);

    const keysUniq = new Set();
    products.forEach(it => {
      Object.keys(it).forEach(key => keysUniq.add(key));
    });
    const headers = [...keysUniq];
    headers.forEach((key, colIndex) => {
      ws.cell(1, colIndex + 1).string(key);
    });
    products.forEach((item, rowIndex) => {
      headers.forEach((key, colIndex) => {
        const value = item[key];
        if (typeof value === 'number') {
          ws.cell(rowIndex + 2, colIndex + 1).number(value);
        } else if (typeof value === 'string') {
          ws.cell(rowIndex + 2, colIndex + 1).string(value);
        } else {
          ws.cell(rowIndex + 2, colIndex + 1).string(String(value !== undefined ? value : ''));
        }
      });
    });
    wb.write(filePath.replace(/json|data/g, 'xlsx'));
    console.log('Excel file has been created');
  }
}

async function fixFoo(dirPath) {
  const filesPath = await getFilesPath(dirPath);
  for (let idx = 0; idx < filesPath.length; idx++) {
    const filePath = filesPath[idx];
    const products = await parseJSONFile(filePath.replace(/.json/g, ''));
    products.forEach(it => {
      const { imgs } = it;
      if (Array.isArray(imgs)) {
        it.imgs = imgs.join(';');
      } else {
        it.imgs = imgs;
      }
    });
    try {
      await saveToJson('', filePath.replace(/.json/g, ''), products);
    } catch (error) {
      console.log('error save resultJson SecondPart');
    }
  }
}

async function getUniqKeys(dirPath) {
  const filesPath = await getFilesPath(dirPath);
  for (let idx = 0; idx < filesPath.length; idx++) {
    const filePath = filesPath[idx];
    const products = await parseJSONFile(filePath.replace(/.json/g, ''));
    const keysUniq = new Set();
    products.forEach(it => {
      Object.keys(it).forEach(key => keysUniq.add(key));
    });
    console.log(filePath);
    console.log(keysUniq);
  }
}

// fixFoo(jsonFilesDir);
// getUniqKeys(jsonFilesDir);
