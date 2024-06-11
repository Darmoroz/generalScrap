import axios from 'axios';
import { JSDOM } from 'jsdom';

import { API_URL, BASE_URL_RU, BASE_URL_UA, CATALOG_URL, CATEGORIES_URL } from './initData.js';
import { normalizeStr } from '../commonUtils/normalizeStr.js';
import { saveToJson } from '../commonUtils/saveToJson.js';
import { parseJSONFile } from '../commonUtils/parseJSONFile.js';

async function getStartPartialProducts() {
  const resultsInfo = {};
  for (let idxCat = 0; idxCat < CATEGORIES_URL.length; idxCat++) {
    // for (let idxCat = 0; idxCat < 1; idxCat++) {
    console.log('category:', idxCat, '/', CATEGORIES_URL.length);
    const resultArr = [];
    const categoryUrl = CATEGORIES_URL[idxCat];
    const limit = 500;
    let offset = 0;
    let condition = true;
    let fullApiUrl = `${BASE_URL_UA}/${API_URL}/?category=${categoryUrl.replace(
      /-/g,
      '_'
    )}&category_folder_image=${categoryUrl.replace(/-/g, '_')}&&limit=${limit}&offset=${offset}`;

    try {
      while (condition) {
        const { data } = await axios.get(fullApiUrl);
        const items = data.rows.map(item => {
          const numberOfDetail = item.number;
          const name = item.name;
          const sku = name;
          const images = [];
          images.push(item.image);
          const linkUk = `${BASE_URL_UA}/${CATALOG_URL}/${categoryUrl}/${item.name_for_link}`;
          const brand = item.brand;
          const jroneCode = item.jrone;
          const ee = item.ee;
          const { document } = new JSDOM(item.note).window;
          const noteAboutAuto = [...document.querySelectorAll('li')].map(it => {
            const brand = it?.textContent;
            const note = it
              .querySelector('button')
              .dataset.originalTitle.replace(/<div class=text-uppercase>|<\/div>|\n/g, '')
              .trim();

            return { brand, note };
          });
          const spec = item.application.from_details?.map(it => ({ numOfTKR: it.link }));

          return {
            linkUk,
            sku,
            name,
            numberOfDetail,
            brand,
            images,
            jroneCode,
            ee,
            noteAboutAuto,
            spec,
          };
        });
        resultArr.push(...items);
        if (data.total_count <= offset) {
          condition = false;
        }
        offset += limit;
        fullApiUrl = `${BASE_URL_UA}/${API_URL}/?category=${categoryUrl.replace(
          /-/g,
          '_'
        )}&category_folder_image=${categoryUrl.replace(
          /-/g,
          '_'
        )}&&limit=${limit}&offset=${offset}`;
      }
    } catch (error) {
      console.log('request error', error);
    }
    resultsInfo[categoryUrl] = resultArr;
    console.log('total items By category', resultArr.length);
  }
  try {
    await saveToJson('./', 'turboAm', resultsInfo);
  } catch (error) {
    console.log('error save to JSON\n', error);
  }
}

// getStartPartialProducts();

async function getFinishPartialProducts(jsonPath) {
  const itemsObj = await parseJSONFile(jsonPath);
  const objKeys = Object.keys(itemsObj);
  for (let idxKeys = 0; idxKeys < objKeys.length; idxKeys++) {
    // for (let idxKeys = 0; idxKeys < 1; idxKeys++) {
    const itemsObjKey = objKeys[idxKeys];
    const items = itemsObj[itemsObjKey];
    console.log(itemsObjKey);
    for (let idxIt = 0; idxIt < items.length; idxIt++) {
      // for (let idxIt = 0; idxIt < 1; idxIt++) {
      const item = items[idxIt];
      const itemLink = item.linkUk;
      try {
        const { data } = await axios.get(itemLink);
        const { document } = new JSDOM(data).window;
        const images = [...document.querySelectorAll('.custom_slider ul>li img')]
          .map(i => i.src)
          .join(';');
        const specKeys = [
          ...document.querySelectorAll('.section_product_table table thead th'),
        ].map(i => i?.textContent?.trim());
        const spec = [...document.querySelectorAll('.section_product_table table tbody tr')].map(
          it => {
            const redObj = [...it.children].reduce((acc, curr, idx) => {
              acc[specKeys[idx]] = normalizeStr(curr?.textContent);
              return acc;
            }, {});

            return redObj;
          }
        );
        item.images = images;
        item.spec = spec;
        console.log(idxIt, '/', items.length - 1);
      } catch (error) {
        console.log('request error', error);
        continue;
      }
    }
  }
  try {
    await saveToJson('./', 'turboAmFull', itemsObj);
  } catch (error) {
    console.log('error save to JSON\n', error);
  }
}

// getFinishPartialProducts('turboAm');

async function createFileCRM(jsonPath) {
  const itemsObj = await parseJSONFile(jsonPath);
  const objKeys = Object.keys(itemsObj);
  for (let idxKeys = 0; idxKeys < objKeys.length; idxKeys++) {
  // for (let idxKeys = 0; idxKeys < 1; idxKeys++) {
    const itemsObjKey = objKeys[idxKeys];
    const items = itemsObj[itemsObjKey];
    for (let idxIt = 0; idxIt < items.length; idxIt++) {
    // for (let idxIt = 0; idxIt < 1; idxIt++) {
      const item = items[idxIt];
      item.name = itemsObjKey + ' ' + item.name;

      const description = `Бренд\n${item.brand}\nJrone\n${item.jroneCode}\nE&E Turbos\n${
        item.ee
      }\nМарки авто\n${item.noteAboutAuto.reduce((acc, curr) => {
        acc = acc + `${curr.brand}\n${curr.note}\n`;
        return acc;
      }, '')}`.slice(0, -1);
      item.description = description;
      const descriptionSec = `Бренд\n${item.brand}\nJrone\n${item.jroneCode}\nE&E Turbos\n${item.ee}\nМарки авто\n${item.spec.reduce(
        (acc, curr, idx) => {
          const objEntries=(idx+1)+")\n"+ Object.entries(curr).map(([key, value])=>`${key}:${value}`).join('\n')+'\n'

          acc=acc+objEntries
          return acc;
        },
        ''
      )}`;
      item.descriptionSec=descriptionSec
    }
  }
  try {
    await saveToJson('./', 'turboAmCRM', itemsObj);
  } catch (error) {
    console.log('error save to JSON\n', error);
  }

}

createFileCRM('turboAm');
