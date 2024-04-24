import puppeteer from 'puppeteer';

import {delay} from '../commonUtils/delay.js'
import { saveToJson } from "../commonUtils/saveToJson.js";
import { filtersTotal } from "./workData/filtersTotal.js";

// !
result=[];
for (let idx = 0; idx < 10; idx++) {
  fetch(`https://auto-mechanic.parts/api/filters/catalog/?section=filtry-salona&offset=${idx*100}&limit=100&carId=&brandsId%5B%5D=232&orderBy=price&language=uk`).then(r=>r.json()).then(d=>{
    const data=d.data.products
    result.push(...data)
  })
}
const horoshop = {
  Артикул: null,
  'Родительский артикул': null,
  'Артикул модели': null,
  'Название модификации (UA)': null,
  'Название модификации (RU)': null,
  'Название (UA)': null,
  'Название (RU)': null,
  Бренд: null,
  Раздел: null,
  Цена: null,
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
};
const horoshopSpec = {
  Артикул: null,
  'Название(UA)': null,
  'Название(RU)': null,
  Виробник: null,
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
  'Країна виробник': null,
  Двигун: null,
  Вязкість: null,
  Cклад: null,
  'Вид тари': null,
  'Ємність тари': null,
  'Класифікація API': null,
  'Класифікація ACEA': null,
};

[]
  .map(i => i.properties)
  .flat()
  .map(i => ({ name: i.name + ' ' + i.nameId }))
  .map(i => i.name);

[].map(i => ({
  urlUk: `https://auto-mechanic.parts/uk/product/${i.unique}`,
  urlRu: `https://auto-mechanic.parts/ru/product/${i.unique}`,
  id: i.id,
  Артикул: i.code,
  'Родительский артикул': i.code,
  'Артикул модели': i.code,
  'Название модификации (UA)': `${i.code} ${i.brandName.replace(
    'FILTERS',
    'Filters'
  )} Фільтр салону`,
  'Название модификации (RU)': `${i.code} ${i.brandName.replace(
    'FILTERS',
    'Filters'
  )} Фильтр салона`,
  'Название (UA)': `${i.code} ${i.brandName.replace('FILTERS', 'Filters')} Фільтр салону`,
  'Название (RU)': `${i.code} ${i.brandName.replace('FILTERS', 'Filters')} Фильтр салона`,
  Бренд: i.brandName.replace('FILTERS', 'Filters'),
  Раздел: 'Інші фільтра/Фільтр салону',
  Цена: i.price,
  'Старая цена': null,
  Валюта: 'UAH',
  Отображать: 'Да',
  Наличие: 'В наявності',
  'Дополнительные разделы': null,
  Фото: null,
  Галерея: null,
  'Обзор 360': null,
  Алиас: `${i.code
    .replace('/', '-')
    .toLowerCase()
    .replace(/[\s\t\n]+/g, '-')}-${i.brandName.toLowerCase().replace(' ', '-')}-filtr-salonu`,
  Ссылка: `https://oluva.shop/${i.code
    .replace('/', '-')
    .toLowerCase()
    .replace(/[\s\t\n]+/g, '-')}-${i.brandName.toLowerCase().replace(' ', '-')}-filtr-salonu/`,
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
  'Описание товара (UA)':
    i.brandName === 'MANN'
      ? '<h3>Про виробника</h3><p>MANN-FILTER - світовий бренд у сфері технологій фільтрації для автомобільного та промислового секторів. Заснована в 1951 році як торгова марка компанією "Filterwerk Mann + Hummel". Сьогодні компанія виробляє більше 6800 різновидів фільтруючих елементів для повітря, масла, палива та салону, охоплюючи понад 97% ринку європейських автомобілів. Продукція MANN-FILTER відповідає вимогам OEM-виробників, забезпечуючи оригінальну якість на вторинному ринку. Компанія має багатий досвід фільтрації, готовий відповідати вимогам альтернативних приводів у майбутніх транспортних засобах.</p>'
      : '<h3>Про виробника</h3><p>WIX - це американський виробник та дистриб`ютор високоякісних фільтрів для моторного транспорту та спецобладнання, який належить до "Affinia Group" та Cypress Group. Компанія має 13 заводів у різних країнах, включаючи Україну, США, Венесуелу, Польщу, Мексику та Китай. Всі продукти WIX відповідають стандартам ISO / TS16949 / 14001 та є надійними та доступними для автолюбителів. WIX є офіційним постачальником для Toyota, Volkswagen Group, Nissan, Suzuki та Opel. Компанія має величезний асортимент фільтрів, включаючи ноу-хау, який продвигається на ринок тільки цією компанією, такі як Spin-flow та Aqua-tech.</p>',
  'Описание товара (RU)':
    i.brandName === 'MANN'
      ? '<h3>О производителе</h3>><p>MANN-FILTER – мировой бренд в сфере технологий фильтрации для автомобильного и промышленного секторов. Основана в 1951 году как торговая марка компанией "Filterwerk Mann+Hummel". Сегодня компания производит более 6800 разновидностей фильтрующих элементов для воздуха, масла, топлива и салона, включая более 97% рынка европейских автомобилей. Продукция MANN-FILTER отвечает требованиям OEM-производителей, обеспечивая оригинальное качество на вторичном рынке. Компания имеет богатый опыт фильтрации, готовый отвечать требованиям альтернативных приводов в будущих транспортных средствах.</p>'
      : '<h3>О производителе</h3><p>WIX - американский производитель и дистрибьютор высококачественных фильтров для моторного транспорта и спецоборудования, принадлежащий "Affinia Group" и Cypress Group. Компания имеет 13 заводов в разных странах, включая Украину, США, Венесуэлу, Польшу, Мексику и Китай. Все продукты WIX отвечают стандартам ISO/TS16949/14001 и являются надежными и доступными для автолюбителей. WIX является официальным поставщиком для Toyota, Volkswagen Group, Nissan, Suzuki и Opel. Компания имеет огромный ассортимент фильтров, включая ноу-хау, продвигающийся на рынок только этой компанией, такие как Spin-flow и Aqua-tech.</p>',
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
  'Аксессуары(разделы)': 'Інші фільтра/Повітряний фільтр',
  spec: {
    Артикул: i.code,
    'Название(UA)': `${i.code} ${i.brandName.replace('FILTERS', 'Filters')} Фільтр салону`,
    'Название(RU)': `${i.code} ${i.brandName.replace('FILTERS', 'Filters')} Фильтр салона`,
    Виробник: i.brandName.replace('FILTERS', 'Filters'),
    'Виконання фільтра': i.properties.find(ob => ob.nameId === 532)?.value,
    'Вид палива': null,
    Висота: formatMeasurement(i.properties.find(ob => ob.nameId === 103)?.value)
      ? formatMeasurement(i.properties.find(ob => ob.nameId === 103)?.value)
      : formatMeasurement(i.properties.find(ob => ob.nameId === 172)?.value),
    'Зовнішній діаметр': formatMeasurement(i.properties.find(ob => ob.nameId === 247)?.value)
      ? formatMeasurement(i.properties.find(ob => ob.nameId === 247)?.value)
      : formatMeasurement(i.properties.find(ob => ob.nameId === 662)?.value)
      ? formatMeasurement(i.properties.find(ob => ob.nameId === 662)?.value)
      : formatMeasurement(i.properties.find(ob => ob.nameId === 663)?.value),
    'Діаметр ущільновальної прокладки': formatMeasurement(
      i.properties.find(ob => ob.nameId === 3496)?.value
    ),
    'Внутрішня нарізь': formatMeasurement(i.properties.find(ob => ob.nameId === 149)?.value),
    Додатково: i.properties.find(ob => ob.nameId === 318)?.value
      ? i.properties.find(ob => ob.nameId === 318)?.value
      : i.properties.find(ob => ob.nameId === 541)?.value,
    Гарантія: null,
    Довжина: formatMeasurement(i.properties.find(ob => ob.nameId === 97)?.value)
      ? formatMeasurement(i.properties.find(ob => ob.nameId === 97)?.value)
      : formatMeasurement(i.properties.find(ob => ob.nameId === 520)?.value),
    Ширина: formatMeasurement(i.properties.find(ob => ob.nameId === 100)?.value)
      ? formatMeasurement(i.properties.find(ob => ob.nameId === 100)?.value)
      : formatMeasurement(i.properties.find(ob => ob.nameId === 524)?.value)
      ? formatMeasurement(i.properties.find(ob => ob.nameId === 524)?.value)
      : formatMeasurement(i.properties.find(ob => ob.nameId === 525)?.value),
    'Тип фільтра': null,
    'Внутрішній діаметр': formatMeasurement(i.properties.find(ob => ob.nameId === 246)?.value)
      ? formatMeasurement(i.properties.find(ob => ob.nameId === 246)?.value)
      : formatMeasurement(i.properties.find(ob => ob.nameId === 679)?.value)
      ? formatMeasurement(i.properties.find(ob => ob.nameId === 679)?.value)
      : formatMeasurement(i.properties.find(ob => ob.nameId === 680)?.value),
    'Діаметр трубки виходу пального (випускний)': formatMeasurement(
      i.properties.find(ob => ob.nameId === 609)?.value
    )
      ? formatMeasurement(i.properties.find(ob => ob.nameId === 609)?.value)
      : formatMeasurement(i.properties.find(ob => ob.nameId === 2009)?.value),
    'Діаметр трубки подачі пального (впускний)': formatMeasurement(
      i.properties.find(ob => ob.nameId === 608)?.value
    )
      ? formatMeasurement(i.properties.find(ob => ob.nameId === 608)?.value)
      : formatMeasurement(i.properties.find(ob => ob.nameId === 2006)?.value),
    'Зовнішній діаметр корпуса 2': null,
  },
}));

function formatMeasurement(value) {
  if (!value){
		return null
	}
	const parts = value?.replace(',','').split(".");

  
  if (parts.length === 2) {
    if (parts[1].length === 1) {
      parts[1] += "0";
    }
    return `${parts.join(".")} мм`;
  } else {
    return `${parts[0]}.00 мм`;
  }
}


[].forEach((item)=>{
  const findedItem=b.find(i=>i.id===item.id)
  item['Фото']=findedItem.images.map(url=>{
    const urlNew=`https://auto-mechanic.parts${url.split('.')[0]}-680bf6e.${url.split('.')[1]}`
    return urlNew
  })
})
console.log(filtersTotal.length)

// !automechParts

// async function main(items) {
//   try {
//     const browser = await puppeteer.launch({
//       // headless: false,
//       defaultViewport: {width:1980, height:1080},
//     });
//     const [page] = await browser.pages();

// 	const result=[]

// 		for (let idx = 0; idx < items.length; idx++) {
// 			const item = items[idx];
// 			const url=item.urlUk
// 			await page.goto(url)
// 			await delay(500)
// 			const pictureBtn=await page.$('div.um627v picture')
// 			if (pictureBtn) {
// 				pictureBtn.click();
// 			}
// 			await delay(500)
// 			const imgsUrls= await page.evaluate(()=>{
// 				const urls=[...document.querySelectorAll('div.mYZ83w picture._2ap4HP img._2aWYDv._2lM64i')].map(i=>i.src)
// 				return urls
// 			})
// 			result.push({...item, ['Фото']:imgsUrls})
// 			console.log(idx,'/',items.length-1)
// 		}
// 		await saveToJson('./','oilF.json', result)
//   } catch (error) {
//     console.log('ERROR!!!!', error);
//   }
// }

// await main(oilFilter)

// *
// const b=filtersTotal.map(i=>i.spec)

// *
// const b=filtersTotal;
// b.forEach(el=>{
// 	el['Фото']=el['Фото'].join(';')
// 	delete el.urlUk;
// 	delete el.urlRu;
// 	delete el.id;
// 	delete el.spec;

// })
// await saveToJson('./', 'total.json', b)
