import axios from 'axios';
import path from 'path';
import fs from 'fs';
import { JSDOM } from 'jsdom';
import tough from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';

import { BASE_URL, CATEGORIES } from './startData.js';
import { normalizeStr } from '../commonUtils/normalizeStr.js';
import { saveToJson } from '../commonUtils/saveToJson.js';
import { parseJSONFile } from '../commonUtils/parseJSONFile.js';
import { delay } from '../commonUtils/delay.js';
import { saveImg } from '../commonUtils/saveImg.js';

async function getProductsLinks(categories, resultFileName) {
  const categoriesLinks = categories.map(it => `${BASE_URL}${it}`);
  const result = {};
  for (let idxCat = 0; idxCat < categoriesLinks.length; idxCat++) {
    const categoryName = `${categories[idxCat].split('-')[1]}-${categories[idxCat].split('-')[2]}`;
    let page = 1;
    let isLastPage = false;
    let lastPage = null;
    let categoryLink = categoriesLinks[idxCat];
    const linksTotalByCategory = [];
    while (!isLastPage) {
      try {
        const { data } = await axios.get(`${categoryLink}${page}?product_items_per_page=48`);
        const { document } = new JSDOM(data).window;

        if (page === 1) {
          lastPage = +document.querySelector('div[data-bazooka="Paginator"]').dataset
            .paginationPagesCount;
        }
        if (page === lastPage) {
          isLastPage = true;
        }
        const links = [...document.querySelectorAll('.b-product-gallery>li')].map(prod => {
          const prodId = prod.dataset.productId;
          const nameUk = normalizeStr(prod.querySelector('.b-product-gallery__image-link')?.title);
          const url = prod.querySelector('.b-product-gallery__image-link')?.href;
          const urlUk = `https://turbosklad.com.ua${url}`;
          const urlRu = `https://turbosklad.com.ua${url.replace('/ua/', '/')}`;
          const sku = normalizeStr(prod.querySelector('.b-product-gallery__sku')?.textContent);
          let price = parseFloat(
            prod
              .querySelector('.b-product-gallery__current-price')
              ?.textContent.replace(/₴|\s/g, '')
          );
          if (isNaN(price)) {
            price = null;
          }
          return { prodId, urlUk, urlRu, sku, nameUk, price };
        });
        linksTotalByCategory.push(...links);
        page++;
      } catch (error) {
        console.log(error);
        continue;
      }
    }
    result[`${categoryName}`] = linksTotalByCategory;
  }
  await saveToJson('./', resultFileName, result);
}

// getProductsLinks(CATEGORIES, 'turboSkladLinks');

const cookieJar = new tough.CookieJar();
const client = wrapper(
  axios.create({
    jar: cookieJar,
    withCredentials: true,
  })
);
cookieJar.setCookieSync('site_lang=ru', 'https://turbosklad.com.ua');

async function getFullInfoAboutProduct(jsonPath, resutFileName) {
  const productsObj = await parseJSONFile(jsonPath);
  const objKeys = Object.keys(productsObj);
  for (let idxKeys = 0; idxKeys < objKeys.length; idxKeys++) {
    // for (let idxKeys = 0; idxKeys < 1; idxKeys++) {
    const objKey = objKeys[idxKeys];
    const products = productsObj[objKey];
    for (let idxProd = 0; idxProd < products.length; idxProd++) {
      // for (let idxProd = 0; idxProd < 1; idxProd++) {
      const product = products[idxProd];
      const ruUrl = product.urlRu;
      try {
        const { data } = await client.get(ruUrl);
        const { document } = new JSDOM(data).window;
        const images = [...document.querySelectorAll('div.js-product-gallery-overlay img')].map(
          i => i.src
        );
        const nameRu = document.querySelector('span[data-qaid="product_name"]')?.textContent;
        const desc = document.querySelector('.b-user-content')?.innerHTML;
        const spec = [
          ...document.querySelectorAll('.b-product-info td.b-product-info__cell'),
        ].reduce((acc, cur, idx, arr) => {
          if (idx % 2 === 0) {
            acc[normalizeStr(cur?.textContent)] = normalizeStr(arr[idx + 1]?.textContent);
          }
          return acc;
        }, {});
        product.images = images;
        product.nameRu = nameRu;
        product.desc = desc;
        const specKeys = Object.keys(spec);
        specKeys.forEach(key => {
          product[key] = spec[key];
        });

        console.log(idxProd, '/', products.length - 1);
      } catch (error) {
        console.log(error);
        continue;
      }
    }
  }
  await saveToJson('./', resutFileName, productsObj);
}

// getFullInfoAboutProduct('turboSkladLinks','turboSkladLinksFull');

async function downloadImgs(jsonPath, resutFileName) {
  const productsObj = await parseJSONFile(jsonPath);
  const objKeys = Object.keys(productsObj);
  for (let idxKeys = 0; idxKeys < objKeys.length; idxKeys++) {
  // for (let idxKeys = 0; idxKeys < 1; idxKeys++) {
    const objKey = objKeys[idxKeys];
    const imgsCommonFolderPath = path.resolve('images').replace(/\\/g,'/');
    const imgCategoryFolderPath = `${imgsCommonFolderPath}/${objKey}`;
    if (!fs.existsSync(imgsCommonFolderPath)) {
      fs.mkdirSync(imgsCommonFolderPath);
    }
    if (!fs.existsSync(imgCategoryFolderPath)) {
      fs.mkdirSync(imgCategoryFolderPath);
    }
    console.log(objKey);
    const products = productsObj[objKey];
    for (let idxProd = 0; idxProd < products.length; idxProd++) {
    // for (let idxProd = 0; idxProd < 1; idxProd++) {
      const product = products[idxProd];
      const imgsLinks = product.images;
      const pics = [];
      for (let idxImg = 0; idxImg < imgsLinks.length; idxImg++) {
        const imgLink = imgsLinks[idxImg];
        const imgLinkSplit = imgLink.split('/');
        const imgName = imgLinkSplit[imgLinkSplit.length - 1].replace('_h640', '');
        pics.push(`./images/${objKey}/${imgName}`);
        const fullImgPath = `${imgCategoryFolderPath}/${imgName}`;
        try {
          await saveImg(imgLink, fullImgPath)
        } catch (error) {
          console.log(error);
          continue;
        }
      }
      product.pics = pics.join(';');
			console.log('product idx->',idxProd)

    }
  }
  await saveToJson('./', resutFileName, productsObj);
}
downloadImgs('turboSkladLinksFull', 'turboSklad');
