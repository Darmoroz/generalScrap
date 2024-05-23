import axios from 'axios';
import { JSDOM } from 'jsdom';
import { slugify } from 'transliteration';
import puppeteer from 'puppeteer';


import { itemLinks, startObject } from './startData.js';
import { normalizeStr } from '../commonUtils/normalizeStr.js';
import { delay } from '../commonUtils/delay.js';
import { parseJSONFile } from '../commonUtils/parseJSONFile.js';
import { saveToJson } from '../commonUtils/saveToJson.js';

async function getInfoEachItem(itemLinks) {
  const result = [];

  // for (let idx = 0; idx < itemLinks.length; idx++) {
  for (let idx = 0; idx < 1; idx++) {
    try {
      const itemLink = itemLinks[idx];
      const ukrLink = itemLink.ukrLink;
      const item = { ukrLink, ...startObject };
      const spec = { ...item.spec };
      const { data } = await axios.get(ukrLink);
      await delay(2000);
      const { document } = new JSDOM(data).window;
      const ruLink = document.querySelector('link[hreflang="ru"]').getAttribute('href');
      const resRu = await axios.get(ruLink);
      await delay(2000);
      const docRu = new JSDOM(resRu.data).window.document;
      const sku = document.querySelector('meta[itemprop="sku"]')?.getAttribute('content');
      const fullNameRu = docRu.querySelector('h1.one-tovar__name')?.textContent.replace(sku, '');
      const nameRu = normalizeStr(
        fullNameRu
          .replace(', 3,5мм толщ.', '')
          .replace(', 4 мм толщ.', '')
          .replace(', 3,5 mm толщ.', '')
          .replace(/x7|x6/, '')
          .replace(', 3,5 мм толщ.', '')
      );
      const fullNameUk = document.querySelector('h1.one-tovar__name')?.textContent.replace(sku, '');
      const nameUk = normalizeStr(
        fullNameUk
          .replace(', 3,5мм товщ.', '')
          .replace(', 4 мм товщ.', '')
          .replace(/x7|x6/g, '')
          .replace(', 3,5 мм товщ.', '')
      );
      const price = document.querySelector('span[itemprop="price"]')?.getAttribute('content');
      const images = [...document.querySelectorAll('.one-tovar__gallery .owl-item img')]
        .map(i => i.src)
        .join(';');
      const descUkr = normalizeStr(
        document.querySelector('.one-tovar__txt.blockRawHtml')?.innerHTML
      );
      const descRu = normalizeStr(docRu.querySelector('.one-tovar__txt.blockRawHtml')?.innerHTML);

      const volumeEl = [...document.querySelectorAll('.one-tovar__specif')].filter(i =>
        i?.textContent?.includes('Объем')
      );
      let volume = null;
      if (volumeEl.length > 0) {
        volume = normalizeStr(volumeEl[0].textContent.replace(/Объем:|мл/g, '')) / 1000;
      }

      const materialEl = [...document.querySelectorAll('.one-tovar__specif')].filter(
        i => i?.textContent?.includes('Матеріал:') || i?.textContent?.includes('Материал:')
      );
      let materil = null;
      if (materialEl.length > 0) {
        materil = normalizeStr(materialEl[0].textContent.replace(/Матеріал:|Материал:/g, ''));
      }

      const manufactureEl = [...document.querySelectorAll('.one-tovar__specif')].filter(
        i =>
          i?.textContent?.includes('Країна виробник:') ||
          i?.textContent?.includes('Страна производитель:')
      );
      let manufactureCountry = null;
      if (manufactureEl.length > 0) {
        manufactureCountry = normalizeStr(
          manufactureEl[0].textContent.replace(/Країна виробник:|Страна производитель:/g, '')
        );
      }
      console.log(images);
      item['ruLink'] = ruLink;
      item['Артикул'] = sku;
      item['Родительский артикул'] = sku;
      item['Артикул модели'] = sku;
      spec['Артикул'] = sku;
      item['Бренд'] = 'Brioni';
      item.fullnameUk = fullNameUk;
      item.fullNameRu = fullNameRu;
      item['Название модификации (UA)'] = nameUk;
      item['Название (UA)'] = nameUk;
      item['Название модификации (RU)'] = nameRu;
      item['Название (RU)'] = nameRu;
      item['Цена'] = price;
      item['Фото'] = images;
      item['Описание товара (UA)'] = descUkr;
      item['Описание товара (RU)'] = descRu;
      spec['Объем, л'] = volume;
      spec['Материал'] = materil;
      spec['Страна производитель'] = manufactureCountry;
      item.spec = spec;
      result.push(item);
      console.log(idx);
    } catch (error) {
      console.log(error);
      continue;
    }
  }
  await saveToJson('./', 'res1', result);
}

// await getInfoEachItem(itemLinks);

async function getAlias(jsonPath) {
	const items = await parseJSONFile(jsonPath)
	items.forEach((it,idx)=>{
		const name=it["Название (RU)"].replace(/"/g,'').replace(/[().,\/]/g, '') + '-'+idx
		const alias = slugify(name, { lowercase: true, separator: '-' });
		it['Алиас']=alias;
		it['Ссылка']=`https://brizoll.com/${alias}/`;

	})
	await saveToJson('./', 'resSlug', items)
}

// getAlias('res')


async function getImages(jsonPath) {
	const items = await parseJSONFile(jsonPath)
	const browser = await puppeteer.launch({
		// headless:false,
		defaultViewport: null,
	});
	const [page] = await browser.pages();
	for (let idx = 0; idx < items.length; idx++) {
		const item = items[idx];
		const url=item.ukrLink
		try {
			await page.goto(url, { timeout: 90000 });
				const images = await page.evaluate(()=>{
					return [...document.querySelectorAll('.one-tovar__gallery .owl-item img')]
					.map(i => i.src)
				})
				item['Фото']=images.join(';');;
				console.log('images length',images.length);
				console.log(idx)
			
		} catch (error) {
			console.log(error)
			continue
		}
	}
	await saveToJson('./', 'totalRes', items)
}

// getImages('res')

async function createFinalFiles(jsonPath) {
	const items = await parseJSONFile(jsonPath)
	const spec= items.map(it=>({...it.spec, 'Название (UA)':it['Название (UA)'], 'Название (RU)':it['Название (RU)']}))
	const common=items.map(({ukrLink,spec,ruLink,fullnameUk, fullNameRu, ...rest})=>rest)
	await saveToJson('./', 'specBrioni', spec)
	await saveToJson('./', 'commonBrioni', common)
}

createFinalFiles('totalRes')