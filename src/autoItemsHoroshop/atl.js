import axios from 'axios';
import puppeteer from 'puppeteer';
import { JSDOM } from 'jsdom';
import { slugify } from 'transliteration';
import { delay } from '../commonUtils/delay.js';
import { saveToJson } from '../commonUtils/saveToJson.js';
import { parseJSONFile } from '../commonUtils/parseJSONFile.js';
// todo
// const RES = [];
// await getAtlFirst()

// todo
// const filePathToJSONFirst = './workData/atl/motorOils.json';
// mainFirst(filePathToJSONFirst);

// todo
// const filePathToJSONSec = './workData/atl/motorOilsAtl.json';
// mainSecond(filePathToJSONSec);

// todo
// const filePathToJSONThird = './workData/atl/motorOilsAtl.json';
// getDesc(filePathToJSONThird);

// todo
// const filePathToJSONFourth = './workData/atl/motorOilsAtl.json';
// getPicsAddSpec(filePathToJSONFourth);

// todo
// const filePathToJSONFifth = './workData/atl/motorOilsAtl.json';
// createSpecAndCommonJSON(filePathToJSONFifth);

async function getAtlFirst() {
	for (let idx = 2; idx < 86; idx++) {
		try {
    const response = await fetch(
      `https://atl.ua/ua/avtohimiya/masla/motornye/page-${idx}?brand=mazda-brand,mitsubishi-brand,vag,subaru-brand,mobis,motul,bmw-brand,nissan-brand,aral,toyota-brand,elf,ford-brand,general-motors,mercedes-benz-brand,prista-oil,total,honda-brand,shell,mobil,castrol,liqui-moly,hyundaikia&emkosttary=1l,4l,41l,5l,20l,60l,2l,0946l`,
      {
        headers: {
          accept: 'application/json, text/plain, */*',
          'accept-language': 'ua',
          'cache-control': 'no-cache',
          pragma: 'no-cache',
          priority: 'u=1, i',
          'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'x-csrf-token': 'nEAWAmY92HPfMRhiGoaybFzdwkDlWa2Bra7835GN',
          'x-requested-with': 'XMLHttpRequest',
          'x-xsrf-token':
            'eyJpdiI6IkNud2xlWFhtY24xdXRTb2hMSmpkbmc9PSIsInZhbHVlIjoiN21LN1c5TjA5NEo5VXpjcm1hRFZ2eXRna0lralg2dEhcL2V2YUdwdTVvbkZYOGVHQXoyYVQ2QWxDSlhKYStHekQiLCJtYWMiOiJhNTQyMjk3OWNjNjA1Y2E0YWNmN2IxMTFhMDlhODcwZTBkYzM2MTI5ZTU0NDU3NzNkYjQzZDk1OGQ3NGYzODUxIn0=',
        },
        referrer:
          `https://atl.ua/ua/avtohimiya/masla/motornye/page-${idx-1}?brand=mazda-brand,mitsubishi-brand,vag,subaru-brand,mobis,motul,bmw-brand,nissan-brand,aral,toyota-brand,elf,ford-brand,general-motors,mercedes-benz-brand,prista-oil,total,honda-brand,shell,mobil,castrol,liqui-moly,hyundaikia&emkosttary=1l,4l,41l,5l,20l,60l,2l,0946l`,
        referrerPolicy: 'strict-origin-when-cross-origin',
        body: null,
        method: 'GET',
        mode: 'cors',
        credentials: 'include',
      }
    );
			const data = await response.json();
			RES.push(...data.products);
			await new Promise(resolve => setTimeout(resolve, 2000))
		} catch (error) {
			console.log(error)
		}
		}
}

async function mainFirst(filePath) {
  try {
    const items = await parseJSONFile(filePath);
    const newItems = items.map(i => {
      return {
        urlUk: i.url,
        urlRu: i.url.replace('/ua/', '/'),
        id: i.product_id,
        Артикул: i.sku,
        'Родительский артикул': i.sku,
        'Артикул модели': i.sku,
        'Название модификации (UA)': `${i.title
          .replace(/моторне|моторна|масло|олива|напівсинтетичне|синтетичне/gi, '')
          .trim()} моторна олива`,
        'Название модификации (RU)': `${i.title_for_ga4
          .replace(/масло|моторное|синтетическое|полусинтетическое/gi, '')
          .trim()} моторное масло`,
        'Название (UA)': `${i.title
          .replace(/моторне|моторна|масло|олива|напівсинтетичне|синтетичне/gi, '')
          .trim()} моторна олива`,
        'Название (RU)': `${i.title_for_ga4
          .replace(/масло|моторное|синтетическое|полусинтетическое/gi, '')
          .trim()} моторное масло`,
        Бренд: i.brand_title,
        Раздел: null,
        Цена: i.price,
        'Старая цена': null,
        Валюта: 'UAH',
        Отображать: 'Да',
        Наличие: 'В наявності',
        'Дополнительные разделы': null,
        Фото: null,
        Галерея: null,
        'Обзор 360': null,
        Алиас: null,
        Ссылка: null,
        'Дата добавления': null,
        'HTML title (UA)': null,
        'HTML title (RU)': null,
        'META keywords (UA)': null,
        'META keywords (RU)': null,
        'META description (UA)': null,
        'META description (RU)': null,
        'h1 заголовок (UA)': null,
        'h1 заголовок (RU)': null,
        Поставщик: null,
        Иконки: null,
        'Скидка %': 0,
        Популярность: 0,
        Количество: 0,
        'Описание товара (UA)': null,
        'Описание товара (RU)': null,
        'Короткое описание (UA)': null,
        'Короткое описание (RU)': null,
        Цвет: null,
        'Тип гарантии': null,
        'Гарантийный срок, мес.': 0,
        'Дата и время окончания акции': null,
        'Текст акции (UA)': null,
        'Текст акции (RU)': null,
        'Описание для маркетплейсов (UA)': null,
        'Описание для маркетплейсов (RU)': null,
        'Выгружать на маркетплейсы': null,
        'Состояние товара': null,
        'Только для взрослых': 'Нет',
        'Код УКТ ВЭД': null,
        '«Оплата частями» ПриватБанка': 'Выкл',
        '«Покупка частями» от monobank': 'Выкл',
        'Уникальный код налога': null,
        Штрихкод: null,
        'Код производителя товара (MPN)': null,
        'На складе для Prom': 'Нет',
        'Электронный товар': 'Нет',
        'Аксессуары(разделы)': null,
        spec: {
          Артикул: i.sku,
          'Название(UA)': null,
          'Название(RU)': null,
          Виробник: i.brand_title,
          'Виконання фільтра': null,
          'Вид палива': null,
          Висота: null,
          'Зовнішній діаметр': null,
          'Діаметр ущільновальної прокладки': null,
          'Внутрішня нарізь': null,
          Додатково: null,
          Гарантія: null,
          Довжина: null,
          Ширина: null,
          'Тип фільтра': null,
          'Внутрішній діаметр': null,
          'Діаметр трубки виходу пального (випускний)': null,
          'Діаметр трубки подачі пального (впускний)': null,
          'Зовнішній діаметр корпуса 2': null,
          'Країна виробник': Object.values(i.characteristics).find(
            i => i.group_title === 'Країна виробник'
          )?.value_title,
          Двигун: Object.values(i.characteristics).find(i => i.group_title === 'Двигун')
            ?.value_title,
          Вязкість: Object.values(i.characteristics).find(i => i.group_title === "В'язкість")
            ?.value_title,
          Cклад: Object.values(i.characteristics).find(i => i.group_title === 'Cклад')?.value_title,
          'Вид тари': Object.values(i.characteristics).find(i => i.group_title === 'Вид тари')
            ?.value_title,
          'Ємність тари': Object.values(i.characteristics).find(
            i => i.group_title === 'Ємність тари'
          )?.value_title,
          'Класифікація API': i.topCharacteristics.find(i => i.group_title === 'Класифікація API')
            ?.value_title,
          'Класифікація ACEA': i.topCharacteristics.find(i => i.group_title === 'Класифікація ACEA')
            ?.value_title,
        },
      };
    });
    await saveToJson('./workData/atl/', 'motorOilsAtl.json', newItems);
  } catch (error) {
    console.log('atl', error);
  }
}

async function mainSecond(filePath) {
  const aliasRes = [];
  let counter = 0;
  try {
    const items = await parseJSONFile(filePath);
    items.forEach(i => {
      const alias = slugify(i['Название (UA)'], { lowercase: true, separator: '-' });
      i['Название модификации (UA)'] = i['Название модификации (UA)'].includes(i['Артикул'])
        ? `${i['Артикул']} ${i['Название модификации (UA)'].replace(i['Артикул'], '')}`
        : `${i['Артикул']}  ${i['Название модификации (UA)']}`;
      i['Название модификации (RU)'] = i['Название модификации (RU)'].includes(i['Артикул'])
        ? `${i['Артикул']} ${i['Название модификации (RU)'].replace(i['Артикул'], '')}`
        : `${i['Артикул']}  ${i['Название модификации (RU)']}`;
      i['Название (UA)'] = i['Название (UA)'].includes(i['Артикул'])
        ? `${i['Артикул']} ${i['Название (UA)'].replace(i['Артикул'], '')}`
        : `${i['Артикул']} ${i['Название (UA)']}`;
      i['Название (RU)'] = i['Название (RU)'].includes(i['Артикул'])
        ? `${i['Артикул']} ${i['Название (RU)'].replace(i['Артикул'], '')}`
        : `${i['Артикул']} ${i['Название (RU)']}`;
      i['Раздел'] = 'Моторна олива';
      i['Аксессуары(разделы)'] = 'Оливний фільтр';
      if (!aliasRes.includes(alias)) {
        aliasRes.push(alias);
        i['Алиас'] = alias;
      } else {
        aliasRes.push(`${alias}-${counter}`);
        counter++;
        i['Алиас'] = `${alias}-${counter}`;
      }
      i['Ссылка'] = `https://oluva.shop/${i['Алиас']}`;
      i.spec['Название(UA)'] = i['Название (UA)'];
      i.spec['Название(RU)'] = i['Название (RU)'];
    });
    await saveToJson('./', 'motorOilsAtl.json', items);
  } catch (error) {
    console.log('atl', error);
  }
}

async function getDesc(filePath) {
  const result = [];
  const items = await parseJSONFile(filePath);
  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx];
    const { urlUk, urlRu } = item;
    try {
      const descUk = await getAddInfo(urlUk);
      const descRu = await getAddInfo(urlRu);
      item['Описание товара (UA)'] = descUk;
      item['Описание товара (RU)'] = descRu;
      result.push(item);
      console.log(idx, '/', items.length - 1);
    } catch (error) {
      console.log(error);
    }
  }
  await saveToJson('./', 'motorOilsAtl.json', result);
}

async function getAddInfo(url) {
  try {
    const { data } = await axios.get(url);
    await delay(500);
    const { document } = new JSDOM(data).window;
    const desc = document.querySelector('.product_description_text')?.innerHTML;
    return desc;
  } catch (error) {
    console.log(error);
  }
}

async function getPicsAddSpec(filePath) {
  const result = [];
  const items = await parseJSONFile(filePath);
  const browser = await puppeteer.launch({
    // headless: false,
    timeout: 300000,
    defaultViewport: { width: 1980, height: 1080 },
  });
  const [page] = await browser.pages();

  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx];
    const { urlUk } = item;
    try {
      await page.goto(urlUk);
      await delay(500);
      const [picLinks, specAdd] = await page.evaluate(() => {
        const picLinks = document.querySelector('.product_image_container>img')?.src;
        const specAdd = [...document.querySelectorAll('.specs_item')]
          .filter(i => i.querySelector('.spec_title')?.textContent.includes('Допуск'))
          ?.reduce((acc, curr) => {
            const key = curr.querySelector('.spec_title')?.textContent;
            const value = curr.querySelector('.spec_value_link')?.textContent;
            acc[key] = value;
            return acc;
          }, {});
        return [picLinks, specAdd];
      });
      item['Фото'] = picLinks;
      item.spec = { ...item.spec, ...specAdd };
      result.push(item);
      console.log(idx, '/', items.length - 1);
    } catch (error) {
      console.log(error);
    }
  }
  await saveToJson('./', 'motorOilsAtl.json', result);
  await browser.close();
}

async function createSpecAndCommonJSON(filePath) {

  try {
    const items = await parseJSONFile(filePath);
    const spec= items.map(i=>i.spec)
    await saveToJson('./', 'specMotorOils.json', spec)
    items.forEach(item=>{
      delete item.id
      delete item.urlUk
      delete item.urlRu
      delete item.spec
    })
    await saveToJson('./', 'commonMotorOils.json', items)
  } catch (error) {
    console.log(error)
  }
}