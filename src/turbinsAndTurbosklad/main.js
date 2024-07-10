import { saveToJson } from '../commonUtils/saveToJson.js';
import { parseJSONFile } from '../commonUtils/parseJSONFile.js';

// import { concatDataJsonFiles } from '../commonUtils/concatDataJsonFiles.js';

const filePathJson = 'data/turboSklad';
const brand = 'turboSklad';

const CAT_KEYS = {
  Актуатор: 'Клапан(актуатор) турбіни',
  Геометрия: 'Сопловий апарат(геометрія) турбіни',
  Сопловий: 'Сопловий апарат(геометрія) турбіни',
  Картридж: 'Картридж турбіни',
  Корпус: 'Корпус турбокомпресора',
  Сервопривід: 'Електронний актуатор турбіни(сервопривід)',
  Турбина: 'Турбокомпресор',
  Турбіна: 'Турбокомпресор',
  'novye-turbiny': 'Турбокомпресор',
  'kartridzhi-srednyaya': 'Картридж турбіни',
  'vakuumnye-aktuatory': 'Клапан(актуатор) турбіни',
  'geometriya-turbiny': 'Сопловий апарат(геометрія) турбіни',
};

const CAT_KEYS_2 = {
  Турбокомпресор: 'Нові турбіни',
  'Картридж турбіни': 'Картриджі',
  'Сопловий апарат(геометрія) турбіни': 'Геометрії',
  'Клапан(актуатор) турбіни': 'Актуатори',
  'Електронний актуатор турбіни(сервопривід)': 'Електронні актуатори',
  'Корпус турбокомпресора': 'Корпус турбіни',
};

async function filterData(filePathJson, brand) {
  try {
    const items = await parseJSONFile(filePathJson);
    const resultsCommon = [];
    const resultsApplicab = [];
    // items.forEach(el => {
    //   const {
    //     sku,
    //     quantity = 30,
    //     imgSmall,
    //     price,
    //     links,
    //     nameItem,
    //     type,
    //     oe,
    //     cross,
    //     applicability,
    //   } = el;
    //   const imgSmallSplit = imgSmall.split(';');
    //   const image = imgSmallSplit[0];
    //   let additional_images = null;
    //   if (imgSmallSplit.length > 1) {
    //     additional_images = imgSmallSplit.slice(1).join('|');
    //   }
    //   const manufacturer = brand;
    //   const link = links;
    //   const seo_keyword_uk = null;
    //   const name_uk = nameItem.trim();
    //   const description_uk = `OE-КОДИ\n${oe.replace(/\n/g, ', ')}\nКРОС-КОДИ\n${cross.replace(
    //     /\n/g,
    //     ', '
    //   )}`;
    //   const meta_title_uk = name_uk;
    //   const meta_description_uk = `Купити ${name_uk}`;
    //   const meta_keyword_uk = null;
    //   const meta_h1_uk = null;
    //   const product_attribute =
    //     'Загальні:Країна реєстрації виробника:Китай|Загальні:Тип продукту:Аналог|Загальні:Стан товару:Новий';

    //   const key = type.split(' ')[0];

    //   const product_category = CAT_KEYS[key];

    //   // applicability.forEach(brandItem=>{
    //   // 	const {models, brand}=brandItem;

    //   // })
    //   const item = {
    //     link,
    //     sku,
    //     quantity,
    //     image,
    //     additional_images,
    //     price,
    //     manufacturer,
    //     seo_keyword_uk,
    //     name_uk,
    //     description_uk,
    //     meta_title_uk,
    //     meta_description_uk,
    //     meta_keyword_uk,
    //     meta_h1_uk,
    //     product_attribute,
    //     product_category,
    //   };
    //   resultsCommon.push(item);
    //   resultsApplicab.push({ sku, applicability });
    // });
    const itemsArr = Object.entries(items);
    itemsArr.forEach(itemsByCat => {
      const [key, items] = itemsByCat;
      items.forEach(it => {
        const { urlUk, sku, nameUk, price, desc, pics, applicability } = it;
        const link = urlUk;
        const quantity = 30;
        const image = pics;
        const additional_images = null;
        const manufacturer = it['Производитель'];
        const seo_keyword_uk = null;
        const name_uk = nameUk;
        const description_uk = desc;
        const meta_title_uk = name_uk;
        const meta_description_uk = `Купити ${name_uk}`;
        const meta_keyword_uk = null;
        const meta_h1_uk = null;
        const product_attribute =
          'Загальні:Країна реєстрації виробника:Китай|Загальні:Тип продукту:Аналог|Загальні:Стан товару:Новий';
        const product_category = CAT_KEYS[key];

        const item = {
          link,
          sku,
          quantity,
          image,
          additional_images,
          price,
          manufacturer,
          seo_keyword_uk,
          name_uk,
          description_uk,
          meta_title_uk,
          meta_description_uk,
          meta_keyword_uk,
          meta_h1_uk,
          product_attribute,
          product_category,
        };
        resultsCommon.push(item);
        resultsApplicab.push({ sku, applicability });
      });
    });
    await saveToJson('', `${brand}CommonForCsv`, resultsCommon);
    await saveToJson('', `${brand}ApplicabForCsv`, resultsApplicab);
  } catch (error) {
    console.error('Error in filterData:', error);
  }
}

// filterData(filePathJson, brand);

// concatDataJsonFiles('common', 'common')
// concatDataJsonFiles('applicab', 'applicab')
async function fix(filePath) {
  const items = await parseJSONFile(filePath);

  items.forEach(it => {
    const cat=it.product_category
    const brand=it.manufacturer
    it.product_category=`${it.product_category}|${it.product_category}>${CAT_KEYS_2[cat]} ${brand}`
  });

  // items.forEach(it => {
  //   const nameRu = it.name_uk
  //     .replace(/турбіни/, 'турбины')
  //     .replace(/електронний/, 'электронный')
  //     .replace('Сопловий апарат (геометрія)', 'Сопловой аппарат (геометрия)')
  //     .replace('Електронний', 'Электронный')
  //     .replace('сервопривід', 'сервопривод')
  //     .replace('Турбіна', 'Турбина')
  //     .replace('Турбокомпресор', 'Турбокомпрессор')
  //     .replace('керування', 'управления')
  //     .replace('турбіною', 'турбиной')
  //     .replace('Геометрія', 'Геометрия');
  //   it.name_ru = nameRu;
  //   it.meta_title_ru=nameRu;
  //   it.meta_h1_ru = null;
  //   it.meta_description_ru=`Купить ${nameRu}`;
  //   const desc_ru=it.description_uk.replace('КОДИ', 'КОДЫ').replace('КРОС-КОДИ','КРОСС-КОДЫ').replace('Застосовність','Применимость').replace('Застосовується в турбінах','Применяется в турбинах').replace('АВТОМОБІЛЬ','АВТОМОБИЛЬ').replace('ОРИГІНАЛЬНИЙ НОМЕР ТУРБІНИ','ОРИГИНАЛЬНЫЙ НОМЕР ТУРБИНЫ').replace('ЗАВОДСЬКИЙ НОМЕР ТУРБІНИ','ЗАВОДСКОЙ НОМЕР ТУРБИНЫ').replaceAll('турбіни', 'турбины')
  //   it.description_ru = desc_ru;
  // });

  // items.forEach((item, idx) => {
  //   const { sku, applicability } = item;
  //   applicability.forEach(brand => {
  //     const { models } = brand;
  //     models.forEach(model => {
  //       const { years } = model;
  //       if (!Array.isArray(years)) {
  //         model.years = [years];
  //       }
  //     });
  //   });
  // });

  await saveToJson('', filePath, items);
}
const file = 'common';
fix(file);
