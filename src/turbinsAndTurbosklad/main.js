import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import { saveToJson } from '../commonUtils/saveToJson.js';
import { parseJSONFile } from '../commonUtils/parseJSONFile.js';
import { PRODUCT } from './initData.js';

// import { concatDataJsonFiles } from '../commonUtils/concatDataJsonFiles.js';

const inTurbofile = 'turboWithCentr';
const inChrafile = 'chraWithCentr';

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
const qnty = [
  {
    sku: 'G00038C',
    qnt: 1,
  },
  {
    sku: 'G00045C',
    qnt: 1,
  },
  {
    sku: 'G00048C',
    qnt: 1,
  },
  {
    sku: 'G00053C',
    qnt: 3,
  },
  {
    sku: 'G00054C',
    qnt: 4,
  },
  {
    sku: 'G00069C',
    qnt: 3,
  },
  {
    sku: 'G00084C',
    qnt: 1,
  },
  {
    sku: 'G00102C',
    qnt: 2,
  },
  {
    sku: 'G00119C',
    qnt: 1,
  },
  {
    sku: 'G00125C',
    qnt: 1,
  },
  {
    sku: 'G00130C',
    qnt: 2,
  },
  {
    sku: 'G00165C',
    qnt: 1,
  },
  {
    sku: 'G00271C',
    qnt: 4,
  },
  {
    sku: 'G00300C',
    qnt: 1,
  },
  {
    sku: 'G00307C',
    qnt: 1,
  },
  {
    sku: 'G00408C',
    qnt: 1,
  },
  {
    sku: 'G00428C',
    qnt: 1,
  },
  {
    sku: 'G00431C',
    qnt: 2,
  },
  {
    sku: 'G00434C',
    qnt: 2,
  },
  {
    sku: 'G00471C',
    qnt: 2,
  },
  {
    sku: 'K00046C',
    qnt: 1,
  },
  {
    sku: 'K00089C',
    qnt: 2,
  },
  {
    sku: 'K00098C',
    qnt: 1,
  },
  {
    sku: 'K00152C',
    qnt: 1,
  },
  {
    sku: 'K00154C',
    qnt: 1,
  },
  {
    sku: 'K00155C',
    qnt: 3,
  },
  {
    sku: 'K00218C',
    qnt: 1,
  },
  {
    sku: 'K00313C',
    qnt: 1,
  },
  {
    sku: 'K00362C',
    qnt: 1,
  },
  {
    sku: 'K00401C',
    qnt: 1,
  },
  {
    sku: 'K00510C',
    qnt: 2,
  },
  {
    sku: 'K00512C',
    qnt: 4,
  },
  {
    sku: 'K00557C',
    qnt: 7,
  },
  {
    sku: 'K00681C',
    qnt: 1,
  },
  {
    sku: 'M00230C',
    qnt: 2,
  },
  {
    sku: 'M00263C',
    qnt: 1,
  },
  {
    sku: 'V00040T',
    qnt: 3,
  },
  {
    sku: 'V00152T',
    qnt: 1,
  },
];

async function filterData(filePathJson) {
  const resultsCommon = [];
  const resultsApplicab = [];
  try {
    const itemsFull = await parseJSONFile(filePathJson);
    const dataImgs = await parseJSONFile('dataImgs');
    const items = itemsFull.filter(it => it.centrInfo);
    items.forEach(item => {
      const { sku, centrInfo, brand, category, weight, lenght, wide, high, applicabInfo } = item;
      const { linkUa, price } = centrInfo;
      const link = linkUa;
      const manufacturer = brand;
      const product_category =
        category === 'Картриджі'
          ? 'Картридж турбіни|Картридж турбіни>Картриджі PrimeTurbo'
          : 'Турбокомпресор|Турбокомпресор>Нові турбіни PrimeTurbo';
      const nameUkFirstPart = category === 'Картриджі' ? 'Картридж турбіни' : 'Турбіна';
      const nameRuFirstPart = category === 'Картриджі' ? 'Картридж турбины' : 'Турбина';
      const nameSecondPart = getFirstThreeValues(centrInfo['Автомобіль']);
      const name_uk = nameUkFirstPart + ' ' + nameSecondPart;
      const name_ru = nameRuFirstPart + ' ' + nameSecondPart;
      const description_uk = `Новий картридж турбіни ${sku}  італійського виробника Prime Turbo.<br><br>Встановлюється на автомобілі:<br>${
        centrInfo['Автомобіль']
      }<br><br>Відповідність по номеру виробника:<br>${centrInfo[
        'Заводський номер турбіни'
      ].replace(/\n/g, ' ')}<br><br>Відповідність оригінальним номерам:<br>${
        centrInfo['Оригінальний номер турбіни']?.replace(/\n/g, ' ') || ''
      }<br><br>Картридж новий та збалансований заводом виробника. Виробник пройшов міжнародну та європейську сертифікацію ISO 9001, CE, ISO/TS 16949. Також бренд Prime Turbo є частиною TecAlliance та представлений у всесвітньо відомому TecDoc Catalogue.`;
      const description_ru = `Новый картридж турбины ${sku} итальянского производителя Prime Turbo.<br><br>Устанавливается на автомобили:<br>${
        centrInfo['Автомобіль']
      }<br><br>Соответствие по номеру производителя:<br>${centrInfo[
        'Заводський номер турбіни'
      ].replace(/\n/g, ' ')}<br><br>Соответствие оригинальным номерам:<br>${
        centrInfo['Оригінальний номер турбіни']?.replace(/\n/g, ' ') || ''
      }<br><br>Картридж новый и сбалансированный заводом производителя. Производитель прошел международную и европейскую сертификацию ISO 9001, CE, ISO/TS 16949. Также бренд Prime Turbo является частью TecAlliance и представлен во всемирно известном TecDoc Catalogue.`;
      const product_attribute = `Загальні:Країна реєстрації виробника:Італія|Загальні:Стан товару:Новий|Загальні:Вага (кг):${weight}|Загальні:Довжина (м):${lenght}|Загальні:Ширина (м):${wide}|Загальні:Висота:${high}`;
      const isQuantity = qnty.find(it => it.sku === sku);
      const quantity = isQuantity ? isQuantity.qnt : 0;
      const imgsLinks = dataImgs[sku] ?? [];
      const image =
        imgsLinks.length === 0 ? 'catalog/products/jrone/small/noimage.png' : imgsLinks[0];
      const additional_images = imgsLinks.length > 1 ? imgsLinks.join('|') : null;
      const itemImport = {
        link,
        sku,
        quantity,
        image,
        additional_images,
        price: +price + 500,
        manufacturer,
        name_uk,
        name_ru,
        description_uk,
        description_ru,
        meta_title_uk: name_uk,
        meta_title_ru: name_ru,
        meta_description_uk: 'Купити ' + name_uk,
        meta_description_ru: 'Купить ' + name_ru,
        product_attribute,
        product_category,
      };
      resultsCommon.push(itemImport);
      const applicInfo = applicabInfo.map(el => ({
        sku,
        brand: el.brandTitle,
        model: el.modelTitle,
        years: el.year,
      }));

      resultsApplicab.push(...applicInfo);
    });

    await saveToJson('', `charCommonForCsv`, resultsCommon);
    await saveToJson('', `charApplicabForCsv`, resultsApplicab);
  } catch (error) {
    console.error('Error in filterData:', error);
  }
}

// filterData(inTurbofile);
// filterData(inChrafile);

// concatDataJsonFiles('common', 'common')
// concatDataJsonFiles('applicab', 'applicab')

async function fix(filePath) {
  const items = await parseJSONFile(filePath);

  for (let idxItems = 0; idxItems < items.length; idxItems++) {
    const item = items[idxItems];
    const { applicabInfo } = item;

    item.applicabInfo = getUniqObjByKey(applicabInfo, 'id');
  }

  //!ітерація по даних
  /*
  for (let idxBrands = 0; idxBrands < brandsInfo.length; idxBrands++) {
    // for (let idxBrands = 0; idxBrands < 3; idxBrands++) {
    const brandObj = brandsInfo[idxBrands];
    const { brandValue,brandTitle, modelsInfo } = brandObj;
    for (let idxModel = 0; idxModel < modelsInfo.length; idxModel++) {
      // for (let idxModel = 0; idxModel < 4; idxModel++) {
      const modelObj = modelsInfo[idxModel];
      const { applicabFull,modelTitle } = modelObj;
      for (let idxApl = 0; idxApl < applicabFull.length; idxApl++) {
        const turbinInfo = applicabFull[idxApl];
      }
    }
  }
  */

  // await saveToJson('', filePath, items);
  // await saveToJson('', 'tempApl', items);
}
// const fixFilePath = 'brandsInfo';
// fix(fixFilePath);
// await fix(inTurbofile);
// await fix(inChrafile);

async function createImportPromJSON(itemsFilepath) {
  const results = [];
  const itemsFull = await parseJSONFile(itemsFilepath);
  const itemsTurbobanda = await parseJSONFile('primeturboCommonForCsv');
  console.log(itemsTurbobanda.length);
  const items = itemsFull.filter(it => it.centrInfo);
  items.forEach(itCentrTurbo => {
    const { sku, category, weight, lenght, wide, high, applicabInfo } = itCentrTurbo;
    const itTurbobanda = itemsTurbobanda.find(it => it.sku === sku);
    if (!itTurbobanda) {
      console.log('abra');
    }
    const {
      name_ru,
      name_uk,
      description_ru,
      description_uk,
      price,
      image,
      additional_images,
      quantity,
    } = itTurbobanda;
    const addImgs = additional_images
      ? additional_images.split('|').map(el => `https://turbobanda.com.ua/${el}`)
      : [];
    const imgsFull = [`https://turbobanda.com.ua/${image}`, ...addImgs];
    const aplicabBrands = [...new Set(applicabInfo.map(el => el.brandTitle))].join(' | ');
    const aplicabModels = [...new Set(applicabInfo.map(el => el.modelTitle))].join(' | ');
    const aplicabYears = [
      ...new Set(
        applicabInfo.reduce((acc, elt) => {
          const el=elt.year
          if (el?.includes('+')) {
            const startYear=parseInt(el)
             acc.push(...generateYearsArray(startYear,2024))
          }
          if (el?.includes('-')) {
            const elSplit=el.split('-')
            if (elSplit.length===2){
              const startYear=elSplit[0].trim()
              const lastYear=elSplit[1].trim()
              acc.push(...generateYearsArray(startYear,lastYear))
            }
            if (elSplit.length) {
              acc.push(elSplit[0].trim())
            }
          }
          if (!el?.includes('-') && !el?.includes('+')) {
            acc.push(el)
          }
          return acc;
        },[])
      ),
    ].join(' | ');
    const prod = { ...PRODUCT };
    prod['Код_товара'] = sku;
    prod['Название_позиции'] = name_ru;
    prod['Название_позиции_укр'] = name_uk;
    prod['Описание'] = description_ru;
    prod['Описание_укр'] = description_uk;
    prod['Цена'] = price;
    prod['Ссылка_изображения'] = imgsFull.join(', ');
    prod['Количество'] = quantity;
    prod['Производитель'] = 'PrimeTurbo';
    prod['Страна_производитель'] = 'Италия';
    prod["Номер_группы"]= category==='Картриджі'? 123322575 : ''
    prod['Адрес_подраздела'] = 'https://prom.ua/ua/Avtomobilnye-turbiny-turbokompressory';
    prod['Вес,кг'] = weight;
    prod['Ширина,см'] = wide;
    prod['Высота,см'] = high;
    prod['Длина,см'] = lenght;
    prod['Название_Характеристики'] = 'Состояние';
    prod['Измерение_Характеристики'] = '';
    prod['Значение_Характеристики'] = 'Новое';
    prod['Название_Характеристики1'] = 'Совместимость с маркой';
    prod['Измерение_Характеристики1'] = '';
    prod['Значение_Характеристики1'] = aplicabBrands;
    prod['Название_Характеристики2'] = 'Совместимость с моделью';
    prod['Измерение_Характеристики2'] = '';
    prod['Значение_Характеристики2'] = aplicabModels;
    prod['Название_Характеристики3'] = 'Год выпуска автомобиля';
    prod['Измерение_Характеристики3'] = '';
    prod['Значение_Характеристики3'] = aplicabYears;
    results.push(prod)
  });
  console.log('end');
  await saveToJson('', 'charProm', results);
}
// await createImportPromJSON(inTurbofile);
await createImportPromJSON(inChrafile);
async function createImportPromXlsx() {}

//!utils
function generateYearsArray(startYear, endYear) {
  if (!endYear) {
    return[startYear]
  }
  const yearsArray = [];
  for (let year = startYear; year <= endYear; year++) {
      yearsArray.push(year);
  }
  return yearsArray;
}

function getUniqObjByKey(array, key) {
  const seen = new Set();
  return array.filter(item => {
    const keyValue = item[key];
    if (!seen.has(keyValue)) {
      seen.add(keyValue);
      return true;
    }
    return false;
  });
}

function replaceAndLowercase(inputString) {
  return inputString
    .replace(/[-.,\s]/g, '')
    .toLowerCase()
    .trim();
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
  const { document } = new JSDOM(data).window;
  return document;
}
function getSubstringAfterKeyword(input, keyword) {
  const keywordIndex = input.indexOf(keyword);
  if (keywordIndex === -1) {
    return null;
  }
  return input.substring(keywordIndex + keyword.length).trim();
}

function getSubstringBetween(input, startKeyword, endKeyword) {
  const startIndex = input.indexOf(startKeyword);
  if (startIndex === -1) {
    return null;
  }

  const endIndex = input.indexOf(endKeyword, startIndex + startKeyword.length);
  if (endIndex === -1) {
    return null;
  }

  return input.substring(startIndex + startKeyword.length, endIndex).trim();
}

function getFirstThreeValues(input) {
  let values = input.split(',').map(value => value.trim());
  if (values.length <= 3) {
    return input;
  }
  return values.slice(0, 3).join(', ');
}

function getFilesFromDirectory(directoryPath) {
  let filesList = [];

  function readDirectory(directory) {
    const items = fs.readdirSync(directory);
    items.forEach(item => {
      const fullPath = path.join(directory, item);
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        readDirectory(fullPath);
      } else {
        filesList.push(fullPath);
      }
    });
  }

  readDirectory(directoryPath);
  return filesList;
}
function splitString(input) {
  const firstPart = input.slice(0, 7).trim();
  const secondPart = input.slice(7).trim();
  return [firstPart, secondPart];
}

async function renameFiles(directoryPath) {
  const files = fs.readdirSync(directoryPath);
  const arrOfImgs = [];
  files.forEach(file => {
    const oldPath = path.join(directoryPath, file);
    const splitfilename = splitString(file);
    arrOfImgs.push(splitfilename);
    const newPath = path.join(
      directoryPath,
      splitfilename
        .reduce((acc, curr, idx) => {
          if (idx === 0) {
            acc += curr;
          } else {
            if (curr.length === 4) {
              acc += curr;
            } else {
              acc += `_${curr}`;
            }
          }
          return acc;
        }, '')
        .toLowerCase()
    );
    fs.renameSync(oldPath, newPath);
  });
  const dataOfImgs = arrOfImgs.reduce((acc, curr) => {
    const [sku, extFile] = curr;
    const fileName = extFile.length === 4 ? sku + extFile : sku + '_' + extFile;
    const fullFilename = `catalog/products/primeturbo/turbo/${fileName.toLowerCase()}`;
    if (!acc[sku]) {
      acc[sku] = [fullFilename];
    } else {
      acc[sku].push(fullFilename);
    }
    return acc;
  }, {});
  await saveToJson('', 'dataImgsTurbo', dataOfImgs);
}

// renameFiles('turbo');
