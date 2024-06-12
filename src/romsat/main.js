import axios from 'axios';
import { JSDOM } from 'jsdom';

import { BASE_URL_UA, CATEGORIES_URL, ITEM_COMMON, ITEM_SPEC } from './initData.js';
import { normalizeStr } from '../commonUtils/normalizeStr.js';
import { saveToJson } from '../commonUtils/saveToJson.js';
import { parseJSONFile } from '../commonUtils/parseJSONFile.js';

const mainLinks = CATEGORIES_URL.map(category => {
  const link = `${BASE_URL_UA}/${category}/?page=all`;

  return [link, category];
});

async function getStartPartialProducts(categoriesLinks, resultFileName) {
  const resultsInfo = {};
  let totalItems = 0;
  for (let idxCat = 0; idxCat < categoriesLinks.length; idxCat++) {
    // for (let idxCat = 0; idxCat < 1; idxCat++) {
    const categoryLink = categoriesLinks[idxCat][0];
    const cat = categoriesLinks[idxCat][1];
    console.log('category:', idxCat, '/', categoriesLinks.length - 1, '-->', categoryLink);
    try {
      const { data } = await axios.get(categoryLink);
      const { document } = new JSDOM(data).window;
      const category = [
        ...document.querySelectorAll(
          '.navigation .nav-item:not(:first-child) span[itemprop="name"]'
        ),
      ]
        .map(it => it.textContent.trim())
        .join('/');
      const resultArr = [
        ...document.querySelectorAll('.products_content-wrap>.products_content-wrap-item'),
      ].map(it => {
        const link = `https://romsat.ua${it.querySelector('a').href}`;
        const name = it.querySelector('a>img').alt.trim();
        const sku = it.querySelector('.article>span:last-child').textContent.trim();
        const priceUAH = parseInt(it.querySelector('.price').dataset.oldPrice.replace(/ /g, ''));
        const priceUSD = parseFloat(it.querySelector('.price').dataset.price);
        const donorId = it.querySelector('.add_favorites').getAttribute('item_id');
        return { link, donorId, sku, name, priceUAH, priceUSD, category };
      });
      resultsInfo[cat] = resultArr;
      totalItems += resultArr.length;
    } catch (error) {
      console.log('request error', error);
    }
  }
  try {
    await saveToJson('./', resultFileName, resultsInfo);
  } catch (error) {
    console.log('error save to JSON\n', error);
  }
  console.log('totalItems', totalItems);
}
// getStartPartialProducts(mainLinks, 'romsat');

async function getFinishPartialProducts(jsonPath) {
	const resultsCommon = {};
	const resultsSpec = {};
  const itemsObj = await parseJSONFile(jsonPath);
  const objKeys = Object.keys(itemsObj);
  for (let idxKeys = 0; idxKeys < objKeys.length; idxKeys++) {
  // for (let idxKeys = 0; idxKeys < 1; idxKeys++) {
    const commonArr = [];
    const specArr = [];
    const itemsObjKey = objKeys[idxKeys];
    const items = itemsObj[itemsObjKey];
    console.log(itemsObjKey);
    for (let idxIt = 0; idxIt < items.length; idxIt++) {
    // for (let idxIt = 0; idxIt < 1; idxIt++) {
      const item = items[idxIt];
      const { link, sku, name, category, priceUAH } = item;
      try {
        const { data } = await axios.get(link);
        const { document, HTMLElement } = new JSDOM(data).window;
        Object.defineProperty(HTMLElement.prototype, 'outerText', {
          get() {
            return this.outerHTML.replace(/<[^>]*>/g, ' ').trim();
          },
          set(value) {
            this.innerHTML = value;
          },
        });
        const brand = document.querySelector(
          '.card_page-cont .tab-content div[data-tab="1"] p a'
        )?.textContent;

        const images = JSON.parse(normalizeStr(document.querySelector('.catalog-detail-page>script')?.textContent.replace(/var srccc = |;/g,'').replace(/'/g,'"'))).map(el=>`https://romsat.ua${el.SRC}`).join(';')

        const aliasArr = link.split('/');
        const alias = aliasArr[aliasArr.length - 2];
        const url = `https://gamer-cat.com.ua/${alias}/`;

        const descDiv = [
          ...document.querySelector('.card_page-cont .tab-content div[data-tab="1"]').children,
        ];
        const desc = descDiv.reduce((acc, curr, idx) => {
          if (idx === 0) {
            return acc;
          }
          acc += curr?.outerHTML;
          return acc;
        }, '');

        const specEls = [
          ...document.querySelectorAll(
            '.product-main-specification .product-main-specification-row'
          ),
        ];
        const specElsMain = [
          ...document.querySelectorAll('.tab-content .product-main-specification ul>li'),
        ];
        const specInfoMain = specElsMain.reduce((acc, curr) => {
          const els = curr?.textContent.split(':');
          if (els) {
            const key = `${normalizeStr(els[0])}(UA)`;
            const preValue = normalizeStr(els[1]);
            const value =
              preValue?.length === 0
                ? preValue
                : preValue?.charAt(0).toUpperCase() + preValue?.slice(1);
            acc[key] = value ? value : 'Так';
          }
          return acc;
        }, {});

        const specInfo = specEls.reduce((acc, curr) => {
          const key = `${normalizeStr(curr.querySelector('.title').textContent)}(UA)`;
          const value = normalizeStr(curr.querySelector('.detail-list').outerText);
          acc[key] = value ? value : 'Так';
          return acc;
        }, {});

        const itemInfo = ITEM_COMMON;
        const itemSpec = ITEM_SPEC;
        itemInfo['Артикул'] = sku;
        itemInfo['Родительский артикул'] = sku;
        itemInfo['Артикул модели'] = sku;
        itemInfo['Название модификации (UA)'] = name;
        // itemInfo['Название модификации (RU)']=name;
        itemInfo['Название (UA)'] = name;
        // itemInfo['Название (RU)']=name;
        itemInfo['Бренд'] = brand;
        itemInfo['Раздел'] = category;
        itemInfo['Цена'] = priceUAH;
        itemInfo['Фото'] = images;
        itemInfo['Алиас'] = alias;
        itemInfo['Ссылка'] = url;
        itemInfo['Описание товара (UA)'] = desc;
        // itemInfo['Описание товара (RU)']= null;
        itemInfo['Короткое описание (UA)'] = null;
        // itemInfo['Короткое описание (RU)']= null;

        itemSpec['Артикул'] = sku;
        itemSpec['Название(UA)'] = name;
        // itemSpec['Название(RU)']=name;
        itemSpec['Бренд(UA)'] = brand;
        itemSpec['Бренд(RU)'] = brand;
        const specTemp = { ...itemSpec, ...specInfo, ...specInfoMain };

        commonArr.push(itemInfo);
        specArr.push(specTemp);
				console.log(idxIt,'/',items.length-1 )
      } catch (error) {
        console.log('request error', error);
      }
    }
		resultsCommon[itemsObjKey]=commonArr
		resultsSpec[itemsObjKey]=specArr
  }
  try {
    await saveToJson('./', 'commonRomsat', resultsCommon);
    await saveToJson('./', 'specRomsat', resultsSpec);
  } catch (error) {
    console.log('error save to JSON\n', error);
  }
}

// getFinishPartialProducts('romsat', 'test');
