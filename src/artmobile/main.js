import axios from 'axios';
import fs from 'fs';
import { JSDOM } from 'jsdom';

import { saveToJson } from '../commonUtils/saveToJson.js';
import { parseJSONFile } from '../commonUtils/parseJSONFile.js';
import { normalizeStr } from '../commonUtils/normalizeStr.js';
import { saveImg } from '../commonUtils/saveImg.js';
import { BASE_URL_RU, CATEGORY, product } from './initData.js';


import {saveDataCSV} from './saveDataCSV.js'
import {convertToCSV} from'./convertToCsv.js'

const PER_PAGE = 100;
const startPage = 161;
// const LAST = 170;
const MAX_RETRIES = 5;
let page = startPage;

const initJsonFile = `${CATEGORY}_${startPage}`;

// await getFirstPartOfData(page);
// await getSecondPartOfData(initJsonFile);
// await getImages(initJsonFile);

async function getFirstPartOfData(page) {
  const results = [];
  let lastPage = null;
  while (page) {
    const pageLink = `${BASE_URL_RU + CATEGORY}?perPage=${PER_PAGE}&page=${page}`;
    console.log('PAGE->', page);
    try {
      const { data } = await axios.get(pageLink);
      const { document } = new JSDOM(data).window;
      if (page === startPage) {
        const isNotLastPage = parseInt(
          document.querySelector('ul.pagination .page-item:nth-last-child(2)')?.textContent
        );

        lastPage = isNotLastPage ? isNotLastPage : 1;
        // lastPage = LAST;
      }
      const products = [...document.querySelectorAll('.catalog-list .product-card')].map(
        productEl => {
          const id = productEl.dataset.product;
          const productLinkEl = productEl.querySelector('a.product-img-wrapper');
          const link = productLinkEl.href;
          const title = productLinkEl.title;
          const splitLink = link.split('/');
          const alias = splitLink[splitLink.length - 1];
          const price = productEl.querySelector('.price-block .price-value').textContent;
          return { id, link, title, alias, price };
        }
      );

      const productFull = products.map(prod => {
        const { id, link, title, alias, price } = prod;
        const url = 'https://artmobile.ua/home/catalog_products/item_';
        const productInfo = { ...product, id, link };
        productInfo['Товар'] = title;
        productInfo['Цена'] = price;
        productInfo['Адрес'] = alias;
        const splitAlias = alias.split('-');
        productInfo['Артикул'] = splitAlias[splitAlias.length - 1];
        productInfo['Заголовок страницы'] = title;
        productInfo['Описание страницы'] = `Купить ${title}`;

        return productInfo;
      });
      if (products.length !== PER_PAGE) {
        if (page === lastPage) {
          results.push(...productFull);
          console.log('items', results.length - 1);
          break;
        }
        continue;
      }
      results.push(...productFull);
      console.log('items', results.length - 1);
      page++;
      if (page > lastPage) {
        break;
      }
    } catch (error) {
      console.log('request error', error.message);
      // results.push({ error: pageLink });
    }
  }
  try {
    await saveToJson('./', initJsonFile, results);
  } catch (error) {
    console.log('error save resultJson FirstPart');
  }
}

async function getSecondPartOfData(initJsonFile) {
  const products = await parseJSONFile(initJsonFile);
  let idx = 0;
  while (idx < products.length) {
    // while (idx < 5) {
    const product = products[idx];
    const { link, id } = product;
    if (product['Категория'] !== '') {
      idx++;
      continue;
    }
    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const { data } = await axios.get(link);
        const { document } = new JSDOM(data).window;
        product['Описание'] = normalizeStr(document.querySelector('.page-content div')?.innerHTML);
        const regex = new RegExp(
          `"([^"]*https:\/\/artmobile\\.ua\\/home\\/catalog_products\\/item_${id}[^"]*)"`,
          'g'
        );
        const matches = data.match(regex);
        const imgs = matches ? matches.map(match => match.slice(1, -1)) : [];

        product.imgLinks = [...new Set(imgs)];

        const specAr = [...document.querySelectorAll('.characteristics-item')].map(el => {
          const key = normalizeStr(el.querySelector('.characteristics-title').textContent);
          const value = [...el.querySelectorAll('.characteristics-value div')]
            .map(i => normalizeStr(i.textContent))
            .join('; ');
          return [key, value];
        });
        specAr.forEach(([key, value]) => {
          product[key] = value;
        });
        product['Категория'] = [...document.querySelectorAll('.breadcrumb a[itemprop="item"]')]
          .map(it => normalizeStr(it.textContent))
          .join('/');
        console.log(`Success: ${idx}/${products.length - 1}`);
        retries = MAX_RETRIES;
      } catch (error) {
        console.log(`Request error at index ${idx}`);
        retries++;
        if (retries === MAX_RETRIES) {
          product['error'] = true;
          console.log(`Failed after ${MAX_RETRIES} retries for product ${id}`);
        }
      }
    }

    idx++;
  }

  try {
    await saveToJson('./', initJsonFile, products);
  } catch (error) {
    console.log('error save resultJson SecondPart');
  }
}

async function getImages(initJsonFile) {
  const products = await parseJSONFile(initJsonFile);
  const fullFolderName = 'img/';
  let errorCount = 0;
  let totalImgs = 0;
  if (!fs.existsSync(fullFolderName)) {
    fs.mkdirSync(fullFolderName);
  }
  for (let idx = 0; idx < products.length; idx++) {
    // for (let idx = 0; idx < 1; idx++) {
    const product = products[idx];
    const { id, imgLinks } = product;
 
    const images = [];
    for (let idxImgLink = 0; idxImgLink < imgLinks?.length; idxImgLink++) {
      const link = imgLinks[idxImgLink];
      const fileName = `prod-item-${id}-image-${images.length + 1}.jpg`;
      const path = `${fullFolderName}${fileName}`;
      try {
        await saveImg(link, path);
        images.push(fileName);
        totalImgs++;
      } catch (error) {
        // console.log(`downloadImg ERROR ${link}`, idx);
        errorCount++;
      }
    }
    if (images.length !== 0) {
      product['Изображения'] = images.join(', ');
    } else {
      product['Изображения'] = 'prod-item-no-image.jpg';
    }
    const isNotLog = idx % 40;
    if (!isNotLog) {
      console.log(idx, '/', products.length - 1);
    }
  }
  console.log('errorCount', errorCount);
  console.log('totalImgs', totalImgs);
  try {
    await saveToJson('./', initJsonFile, products);
  } catch (error) {
    console.log('error save resultJson getImages');
  }
}


