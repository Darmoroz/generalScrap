import axios from 'axios';
import { JSDOM } from 'jsdom';
import path from 'path';
import fs from 'fs';

import { parseJSONFile } from '../commonUtils/parseJSONFile.js';
import { saveToJson } from '../commonUtils/saveToJson.js';
import { normalizeStr } from '../commonUtils/normalizeStr.js';
import { saveImg } from '../commonUtils/saveImg.js';

import { delay } from '../commonUtils/delay.js';

// const jsonFilePath = './inData/jroneFull';
const jsonFilePath = './inData/slFull';

async function getLinksEachPage(jsonPath) {
  // const items = await parseJSONFile(jsonPath);
  const items = [];
  for (let idx = 0; idx < items.length; idx++) {
    // for (let idx = 0; idx < 5; idx++) {
    const item = items[idx];
    const sku = item.sku.trim();
    try {
      const { data } = await axios.get(
        `https://master.shop/search?query=${sku}&filters=nom_cat:23`
      );
      const { document } = new JSDOM(data).window;
      const links = [
        ...document.querySelectorAll('.js__goods .tile_item_wrap .tile_cart_img a.tile_link'),
      ]?.map(i => i.href);
      item.sku = sku;
      if (links.length > 0) {
        item.links = [links[0]];
        item.excelLinks = links[0];
      } else {
        item.links = links;
        item.excelLinks = '';
      }
      console.log(idx, '/', items.length - 1);
    } catch (error) {
      item.links = 'error';
      console.log(error);
    }
    await delay(1000);
  }
  await saveToJson('./', 'slTemp', items);
}

// getLinksEachPage(jsonFilePath);

async function getInfoEachDetail(jsonPath) {
  const items = await parseJSONFile(jsonPath);
  const result = [];
  for (let idxMain = 0; idxMain < items.length; idxMain++) {
    // for (let idxMain = 0; idxMain < 4; idxMain++) {
    const item = items[idxMain];
    const linkItem = item.links;
    if (!linkItem) {
      result.push({ ...item });
      console.log(idxMain, '/', items.length - 1, 'no-links');

      continue;
    }
    try {
      const { data } = await axios.get(linkItem);
      const { document } = new JSDOM(data).window;

      const skuDonor = normalizeStr(
        document.querySelector('h1 .article')?.textContent.replace(/\([^)]*\)/g, '')
      );

      const nameFirstEl = document.querySelector('h1 .good_page_name');
      const nameSecEl = document.querySelector('h1 .car_applicability');
      const nameFirstPart = nameFirstEl ? nameFirstEl.textContent : '';
      const nameSecPart = nameSecEl ? nameSecEl.innerHTML.replaceAll('<br>', ',') : '';
      const nameItem = normalizeStr(`${nameFirstPart} ${nameSecPart}`);
      const price = normalizeStr(
        document
          .querySelector('.js_price_html .main_price span')
          ?.textContent.replace(/грн|\s/g, '')
      );

      const imglinks = [
        ...document.querySelectorAll(
          '.good_page_slider_big .good_page_slider_item a.js__good_lightGallery'
        ),
      ].map(i => i.dataset.src);

      const oeCodes = [];
      const crossCodes = [];
      const codesElemets = [...document.querySelectorAll('div.oe_kodes')];
      for (let idxCodes = 0; idxCodes < codesElemets.length; idxCodes++) {
        const codeEl = codesElemets[idxCodes];
        const prevElTitle = codeEl.previousElementSibling.textContent;
        const codes = [...codeEl.querySelectorAll('span')].map(i => i.textContent);
        if (prevElTitle.includes('OE')) {
          oeCodes.push(...codes);
        }
        if (prevElTitle.includes('КРОС')) {
          crossCodes.push(...codes);
        }
      }

      const applicability = [];
      const applicabilityElements = [
        ...document.querySelectorAll('div[data-tabname="tab_applicability"] .applicability_item'),
      ];
      for (let idxApplic = 0; idxApplic < applicabilityElements.length; idxApplic++) {
        const applicEl = applicabilityElements[idxApplic];
        const brand = applicEl.querySelector('span').textContent;
        const models = [...applicEl.querySelectorAll('.applicability_item_two')].map(i => {
          const model = i.querySelector('span')?.textContent;
          const years = [...i.querySelectorAll('.applicability_item_there span')].map(
            i => i?.textContent
          );
          return { model, years };
        });
        applicability.push({ brand, models });
      }
      result.push({
        ...item,
        skuDonor,
        nameItem,
        price,
        imglinks,
        oeCodes,
        crossCodes,
        applicability,
      });
      console.log(idxMain, '/', items.length - 1);
      await delay(1000);
    } catch (error) {
      result.push({ ...item, errorReq: true });
    }
  }
  await saveToJson('./', 'slFull', result);
}

// getInfoEachDetail(jsonFilePath);

async function transformCodes(fileName) {
  const fullPath = path.resolve(fileName);
  const items = await parseJSONFile(fullPath);
  items.forEach((it, idx) => {
    // console.log(it)
    it.oe = it?.oeCodes?.join('\n');
    it.cross = it?.crossCodes?.join('\n');
  });
  await saveToJson('./', 's', items);
}

// transformCodes(jsonFilePath)

async function getImages(jsonPath, folderPath) {
  const result = [];
  const folderPathBig = path.resolve(`./images/${folderPath}/big/`);
  const folderPathSmall = path.resolve(`./images/${folderPath}/small/`);
  if (!fs.existsSync(folderPathBig)) {
    fs.mkdirSync(folderPathBig);
  }
  if (!fs.existsSync(folderPathSmall)) {
    fs.mkdirSync(folderPathSmall);
  }
  const items = await parseJSONFile(jsonPath);
  for (let idx = 0; idx < items.length; idx++) {
    console.log('item', idx,'/', items.length-1)

    const item = items[idx];
    const hasItemImg = item.links;
    if (!hasItemImg) {
      result.push(item);
      continue;
    }
    const imgName = item.skuDonor.replaceAll(' ', '-').replace(/[\\/:*?"<>|]/g, '');
    const imgLinks = item.imglinks;
    const imgSmallPath = `./images/${folderPath}/small/`;
    const imgBigPath = `./images/${folderPath}/big/`;
    const imgSmall = [];
    const imgBig = [];
    for (let idxImg = 0; idxImg < imgLinks.length; idxImg++) {
      const linkBig = imgLinks[idxImg];
      const linkSmall = linkBig.replace('big', 'small');
      const hasImg = linkBig.includes('noimage_market_cats');
      if (hasImg) {
        imgSmall.push(`${imgSmallPath}noimage.png`);
        imgBig.push(`${imgBigPath}noimage.png`);
        continue;
      }
      const imgNameFull = `${imgName}_${idxImg + 1}.jpg`;
      const imgBigPathFull=imgBigPath + imgNameFull;
      const imgSmallPathFull=imgSmallPath + imgNameFull
      try {
        await saveImg(linkBig, imgBigPathFull);
        imgBig.push(imgBigPathFull);
        await saveImg(linkSmall, imgSmallPathFull);
        imgSmall.push(imgSmallPathFull);
        await delay(1000);
      } catch (error) {
        console.log(error);
        continue;
      }
      console.log('img',idxImg,'/',imgLinks.length-1)
    }
    item.imgBig=imgBig.join(';')
    item.imgSmall=imgSmall.join(';')
    result.push(item)
  }
  await saveToJson('./', folderPath, result)
}

// await getImages(jsonFilePath, 'jrone')
await getImages(jsonFilePath, 'sl');
