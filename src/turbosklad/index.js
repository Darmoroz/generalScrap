import axios from 'axios';
import { JSDOM } from 'jsdom';

import { BASE_URL, CATEGORIES } from './startData.js';
import { normalizeStr } from '../commonUtils/normalizeStr.js';
import { saveToJson } from '../commonUtils/saveToJson.js';
import { parseJSONFile } from '../commonUtils/parseJSONFile.js';
import { delay } from '../commonUtils/delay.js';

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

async function getFullInfoAboutProduct(jsonPath) {
  const productsObj = await parseJSONFile(jsonPath);
  const objKeys = Object.keys(productsObj);
  // for (let idxKeys = 0; idxKeys < objKeys.length; idxKeys++) {
  for (let idxKeys = 0; idxKeys < 1; idxKeys++) {
    const objKey = objKeys[idxKeys];
    const products = productsObj[objKey];
    // for (let idxProd = 0; idxProd < products.length; idxProd++) {
    for (let idxProd = 0; idxProd < 1; idxProd++) {
      const product = products[idxProd];
      const ukUrl = product.urlUk;
      const ruUrl = product.urlRu;
      try {
				console.log(ruUrl)
        const { data } = await axios.get(ruUrl);
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
						acc[normalizeStr(cur?.textContent)]= normalizeStr(arr[idx+1]?.textContent)
          } 
          return acc;
        }, {});
				product.images = images;
				product.nameRu = nameRu;
				product.desc = desc;
        console.log(nameRu);
        console.log(desc);
      } catch (error) {
        console.log(error);
        continue;
      }
    }
    console.log(products.length);
  }
  console.log();
}

getFullInfoAboutProduct('turboSkladLinks');
