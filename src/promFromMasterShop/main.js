import axios from 'axios';
import { JSDOM } from 'jsdom';
import { saveToJson } from '../commonUtils/saveToJson.js';
import { parseJSONFile } from '../commonUtils/parseJSONFile.js';

const startUrl = 'https://master.shop/ru/radialyniy-gidropidshipnik-vtulka-turbini_63?page=';
const resultsFilename = 'vtulkaTurbinFull';
const filterdResultsFilename = 'vtulkaTurbin';
const lastPage = 21;

// await main(startUrl, resultsFilename);
// await filterItems(resultsFilename, filterdResultsFilename);

// await getFullItemsInfo('itemsFull');
await normalizeItemsToXlsx('itemsFull');

async function main(startUrl, resultsFileName) {
  const results = [];
  for (let pageIdx = 1; pageIdx < lastPage + 1; pageIdx++) {
    const url = startUrl + pageIdx;
    const requstData = await getPageData(url);
    const window = convertHtmlToDom(requstData);
    const { document } = window;
    const products = [...document.querySelectorAll('.js__good_tile_global .tile_element')];
    const productsInfo = products.map(it => {
      const linkImgEl = it.querySelector('.tile_cart_img a');
      const ruLink = linkImgEl.href || null;
      const uaLink = ruLink.replace('/ru', '') || null;
      const thumbImg = linkImgEl.querySelector('img').dataset?.src || null;
      const atrticleEl = it.querySelector('.tile_article');
      const sku = atrticleEl.querySelector('.article')?.textContent?.trim() || null;
      const skuShop = atrticleEl.querySelector('.tile_shop_name')?.textContent?.trim() || null;
      const name =
        it
          .querySelector('.tile_title a')
          ?.innerHTML.replace(' <p class="row_type_style"></p>', '')
          ?.trim() || null;
      const availability =
        it.querySelector('.tile_availability .good')?.textContent?.trim() || null;
      const quantity = it.querySelector('.quantity_good_row')?.textContent?.trim() || null;
      const condition = it.querySelector('.product_condition')?.textContent?.trim() || null;
      const price =
        +it.querySelector('.tile_price')?.textContent?.replace('грн', '')?.trim() || null;
      return {
        ruLink,
        uaLink,
        thumbImg,
        sku,
        skuShop,
        name,
        availability,
        quantity,
        condition,
        price,
      };
    });
    results.push(...productsInfo);
    console.log(pageIdx);
  }
  await saveToJson('', resultsFileName, results);
}

async function getPageData(url, headers = {}) {
  try {
    const { data } = await axios.get(url, headers);
    return data;
  } catch (error) {
    console.log('request faild');
  }
}

function convertHtmlToDom(data) {
  const { window } = new JSDOM(data).window;
  return window;
}

async function filterItems(initDataFilePath, resultsFilename) {
  const items = await parseJSONFile(initDataFilePath);

  const filterItems = items.filter(
    it => it.price !== null && it.price < 281 && !it.thumbImg.includes('noimage_market_goods.png')
  );
  console.log(filterItems.length);
  await saveToJson('', resultsFilename, filterItems);
}

async function getFullItemsInfo(initDataFilePath) {
  const items = await parseJSONFile(initDataFilePath);
  const results = [];
  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx];
    const { ruLink, uaLink } = item;
    try {
      const requstDataRu = await getPageData(ruLink);
      const windowRu = convertHtmlToDom(requstDataRu);
      const { document } = windowRu.window;
      const titleRu =
        document.querySelector('h1 .good_page_name')?.textContent?.replace(/[\n]/g, '')?.trim() ||
        '';
      const aplicabCar =
        document.querySelector('h1 .car_applicability')?.innerHTML?.replace(/[\n]/g, '')?.trim() ||
        '';
      const imglinks = [
        ...document.querySelectorAll(
          '.good_page_slider_big .good_page_slider_item a.js__good_lightGallery'
        ),
      ].map(i => i.dataset.src);
      const spec = [...document.querySelectorAll('.char_list>li')].reduce((acc, curr) => {
        const key = curr.querySelector('.char_name')?.textContent?.trim() || 'noKey';
        const value = curr.querySelector('.char_value')?.textContent?.trim() || '';
        acc[key] = value;
        return acc;
      }, {});

      const oeCodes = [];
      const crossCodes = [];

      const codesElemets = [...document.querySelectorAll('div.oe_kodes')];
      for (let idxCodes = 0; idxCodes < codesElemets.length; idxCodes++) {
        const codeEl = codesElemets[idxCodes];
        const prevElTitle = codeEl?.previousElementSibling?.textContent;
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
        const brand = applicEl.querySelector('span')?.textContent;
        const models = [...applicEl.querySelectorAll('.applicability_item_two')].map(i => {
          const model = i.querySelector('span')?.textContent;
          const years = [...i.querySelectorAll('.applicability_item_there span')].map(
            i => i?.textContent
          );
          return { model, years };
        });
        applicability.push({ brand, models });
      }
      results.push({
        ...item,
        titleRu,
        aplicabCar,
        imglinks,
        spec,
        oeCodes,
        crossCodes,
        applicability,
      });
      console.log(idx);
    } catch (error) {
      console.log('axios error');
      continue;
    }
  }

  await saveToJson('', initDataFilePath, results);
}

async function normalizeItemsToXlsx(initDataFilePath) {
  const items = await parseJSONFile(initDataFilePath);
  const results = [];
  items.forEach(it => {
    const { sku, titleRu, titleUa, oeCodes, crossCodes, price, imglinks, skuShop, applicability,spec } =
      it;
    const product = {
      Код_товара: '',
      Название_позиции: '',
      Название_позиции_укр: '',
      Поисковые_запросы: '',
      Поисковые_запросы_укр: '',
      Описание: '',
      Описание_укр: '',
      Тип_товара: 'r',
      Цена: '',
      Валюта: 'UAH',
      Единица_измерения: 'шт.',
      Минимальный_объем_заказа: '',
      Оптовая_цена: '',
      Минимальный_заказ_опт: '',
      Ссылка_изображения: '',
      Наличие: '+',
      Количество: 10,
      Скидка: '',
      Производитель: '',
      Страна_производитель: '',
      Номер_группы: '',
      Адрес_подраздела: '',
      Способ_упаковки: '',
      Способ_упаковки_укр: '',
      Идентификатор_товара: '',
      Уникальный_идентификатор: '',
      Идентификатор_подраздела: '',
      Идентификатор_группы: '',
      ID_группы_разновидностей: '',
      Личные_заметки: '',
      'Срок действия скидки от': '',
      'Срок действия скидки до': '',
      'Цена от': '-',
      Ярлык: '',
      HTML_заголовок: '',
      HTML_заголовок_укр: '',
      HTML_описание: '',
      HTML_описание_укр: '',
      HTML_ключевые_слова: '',
      HTML_ключевые_слова_укр: '',
      'Вес,кг': '',
      'Ширина,см': '',
      'Высота,см': '',
      'Длина,см': '',
      Где_находится_товар: '',
      'Код_маркировки_(GTIN)': '',
      'Номер_устройства_(MPN)': '',
      Название_Характеристики: '',
      Измерение_Характеристики: '',
      Значение_Характеристики: '',
    };
    const oeCodesStr = oeCodes?.length > 0 ? oeCodes.join('; ') : null;
    const crossCodesStr = crossCodes?.length > 0 ? crossCodes.join('; ') : null;

    const aplicabDescRu =
      applicability?.length > 1
        ? applicability.reduce((acc, curr) => {
					const {brand, models}=curr
					acc+=`${brand}\nМодель: ${models.map(it=>it.model).join(', ')}`
            return acc;
          }, 'Применяемость в авто:\n')
        : '';
    const aplicabDescUa =
      applicability?.length > 1
        ? applicability.reduce((acc, curr) => {
					const {brand, models}=curr
					acc+=`${brand}\nМодель: ${models.map(it=>it.model).join(', ')}\n`
            return acc;
          }, 'Застосовність в авто\n')
        : '';

    const descRu = `${oeCodesStr ? `OE-КОДЫ\n${oeCodesStr}` : ''}\n${
      crossCodesStr ? `КРОСС-КОДЫ\n${crossCodesStr}` : ''
    }\n${aplicabDescRu}`;
    const descUa = `${oeCodesStr ? `OE-КОДИ\n${oeCodesStr}` : ''}\n${
      crossCodesStr ? `КРОСС-КОДИ\n${crossCodesStr}` : ''
    }\n${aplicabDescUa}`;
    const images = imglinks.join(', ');

    product['Код_товара'] = sku;
    product['Название_позиции'] = titleRu;
    product['Название_позиции_укр'] = titleUa;
    product['Описание'] = descRu;
    product['Описание_укр'] = descUa;
    product['Цена'] = price;
    product['Ссылка_изображения'] = images;
    product['Производитель'] = skuShop.replace(/[()]/g, '');
		Object.entries(spec).forEach((sp,idx)=>{
			const key=sp[0]
			const value=sp[1]
			if (key.includes('(mm.)')) {
				product[`Название_Характеристики_${idx}`]=key.replace('(mm.)', '').trim()
				product[`Измерение_Характеристики_${idx}`]='мм'
				
			} else {
				product[`Название_Характеристики_${idx}`]=key
				product[`Измерение_Характеристики_${idx}`]=''
			}
			product[`Значение_Характеристики_${idx}`]=value

		})

		results.push(product)
  });
	await saveToJson('', 'importProm',results)
}
