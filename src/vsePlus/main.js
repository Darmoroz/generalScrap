import axios from 'axios';
import fs from 'fs';
import { JSDOM } from 'jsdom';
import excel from 'excel4node';

import { saveToJson } from '../commonUtils/saveToJson.js';
import { parseJSONFile } from '../commonUtils/parseJSONFile.js';
import { normalizeStr } from '../commonUtils/normalizeStr.js';
import { delay } from '../commonUtils/delay.js';
import { saveImg } from '../commonUtils/saveImg.js';
import {
  BASE_URL_RU,
  BASE_URL_UA,
  CATEGORIES,
  FILES_CAT,
  PRODUCT,
  ADD_IMG,
  ATTRIBUTES_KEYS_UA,
  ATTRIBUTES_KEYS_RU,
  UA_TO_RU_ATTR,
  ATTRIBUTE,
} from './initData.js';

import { getFilesPath } from './utils/getFilesPath.js';
import { CustomSet } from './utils/customSet.js';
import { convertToCsvFull } from './utils/convertToCsvFull.js';
import { getUniqObjByKey } from './utils/getUniqObjByKey.js';
import { parse } from 'path';

// *
const startCatIdx = 0;

const startPage = 1;
const PER_PAGE = 24;
const MAX_RETRIES = 5;
const jsonFilesDir = 'data/products';
const mainUrls = [BASE_URL_UA, BASE_URL_RU];
// const mainUrls = [BASE_URL_UA];

const startId = 24778;
const jsonToExcelDir = 'data/sheetsXlsx';
// const resultsXlsxFile='productsCatTelPlanshTexaks.xlsx'
const resultsXlsxFile = 'productsАccessoriesTexaks.xlsx';
const categoriesIdJson = 'data/categoriesId';
const attrJson = 'data/attributesId';
const attrGroupJson = 'data/attributesGroupId';

for (let idxMainUrl = 0; idxMainUrl < mainUrls.length; idxMainUrl++) {
  const mainUrl = mainUrls[idxMainUrl];

  for (let idx = startCatIdx; idx < CATEGORIES.length; idx++) {
    // for (let idx = startCatIdx; idx < 8; idx++) {
    const categoryUrl = CATEGORIES[idx];
    const category = mainUrl.includes('/ua')
      ? FILES_CAT[(idx + 1) * 2 - 1]
      : FILES_CAT[(idx + 1) * 2 - 2];
    let page = startPage;
    const lang = mainUrl.includes('/ua') ? 'ua' : 'ru';
    let fileName = null;
    if (typeof categoryUrl === 'function') {
      fileName = categoryUrl(1).replace('search/p-1?q=', '');
    } else {
      fileName = categoryUrl.replace(/\//g, '-').replace(/[<>:"\/\\|?*]/g, '_');
    }
    const jsonFileName = `${jsonFilesDir}/${fileName}-${lang}`;
    // await getFirstPartOfData(page, mainUrl, categoryUrl, category, jsonFileName);
  }
}

// await getScondPartOfData(jsonFilesDir);
// await createExcelFileFromJson(jsonFilesDir);

async function getFirstPartOfData(page, baseUrl, categoryUrl, category, resultsFileName) {
  console.log(resultsFileName);

  const results = [];
  let lastPage = null;
  while (page) {
    let pageLink = null;
    if (typeof categoryUrl === 'function') {
      pageLink = `${baseUrl}/${categoryUrl(page)}`;
    } else {
      pageLink = `${baseUrl}/product/${categoryUrl}/p-${page}`;
    }
    console.log(
      `PAGE-> ${page} (${baseUrl.includes('/ua') ? 'ua' : 'ru'} ${
        typeof categoryUrl === 'function' ? categoryUrl(page) : categoryUrl
      })`
    );
    try {
      const { data } = await axios.get(pageLink);
      const { document } = new JSDOM(data).window;
      if (page === startPage) {
        const lastPageEl = document.querySelector('.paginator .paginator__page:last-child a');
        lastPage = lastPageEl ? Number(lastPageEl.textContent) : 1;
      }
      const products = [
        ...document.querySelectorAll('.list-cards-product .card-product__content'),
      ].map(el => {
        const url = el.querySelector('a.card-product__img-box').href;
        const sku = el.querySelector('.card-product__art').textContent.replace(/Код: /g, '');
        const price = el.querySelector('.product-price__current strong')?.textContent;
        const prevImgEl = el.querySelector('img.card-product__img');
        const prevImg = baseUrl + prevImgEl.src;
        const link = baseUrl + url;
        const title = prevImgEl.alt;
        const spec = [...el.querySelectorAll('.product-features .product-features__text')].reduce(
          (acc, cur) => {
            const key = cur.title;
            const value = cur?.textContent;
            acc[key] = acc[key] ? [...acc[key], value] : (acc[key] = [value]);

            return acc;
          },
          {}
        );
        Object.keys(spec).forEach(key => {
          spec[key] = spec[key].join(', ');
        });
        // const note=el.querySelector('.card-product__text_note')?.textContent
        return { link, category, sku, title, price, prevImg, ...spec };
      });
      if (products.length !== PER_PAGE) {
        if (page === lastPage) {
          results.push(...products);
          console.log('total items', results.length - 1);
          break;
        }
        continue;
      }
      results.push(...products);
      console.log('total items', results.length - 1);
      page++;
      if (page > lastPage) {
        break;
      }
    } catch (error) {
      console.log('request error', error.message);
    }
  }
  try {
    await saveToJson('./', resultsFileName.replace(), results);
  } catch (error) {
    console.log(error);
    console.log('error save resultJson FirstPart');
  }
}

async function getScondPartOfData(dirPath) {
  const filesPath = await getFilesPath(dirPath);
  for (let idx = 0; idx < filesPath.length; idx++) {
    // for (let idx = 0; idx < 1; idx++) {
    const filePath = filesPath[idx];
    const products = await parseJSONFile(filePath.replace(/.json/g, ''));
    let idxProd = 0;
    while (idxProd < products.length) {
      // while (idxProd < 3) {
      const product = products[idxProd];
      const { link, sku, price, error, userPrice } = product;
      // if (!error) {
      //   idxProd++
      //   continue
      // }
      // if (userPrice) {
      //   idxProd++
      //   continue
      // }
      let retries = 0;
      while (retries < MAX_RETRIES) {
        try {
          const { data } = await axios.get(link);
          const { document } = new JSDOM(data).window;
          const infoProduct = [...document.querySelectorAll('script[type="application/ld+json"]')]
            .map(i => JSON.parse(i.textContent))
            .find(i => i['@type'] === 'Product');
          product.brand = infoProduct?.brand?.name;

          const imgs = infoProduct?.image;
          if (Array.isArray(imgs)) {
            product.imgs = imgs.join(';');
          } else {
            product.imgs = imgs;
          }
          product.description = normalizeStr(
            document.querySelector('.product__block.text-base>p')?.textContent
          );
          const prodSpec = infoProduct.description?.split('. ');
          prodSpec.forEach(it => {
            const splitIt = it.split(': ');
            const key = splitIt?.[0];
            const value = it.replace(`${key}:`, '').trim();
            if (!product[key]) {
              product[key] = value;
            } else {
              const productKeySplit = product[key].split(', ');
              productKeySplit.push(value);
              const uniqValue = [...new Set(productKeySplit)].join(', ');
              product[key] = uniqValue;
            }
          });
          product.userSKU = `1${sku}`;
          product.userPrice = Math.ceil(price - price * 0.05);
          retries = MAX_RETRIES;
          const splitFilePath = filePath.split('\\');
          const filesLang = splitFilePath[splitFilePath.length - 1];
          console.log(`Success: ${idxProd}/${products.length - 1} ${filesLang}`);
        } catch (error) {
          console.log(error);
          console.log(`Request error at file ${idx} and product's  index ${idxProd}`);
          retries++;
          if (retries === MAX_RETRIES) {
            product['error'] = true;
            console.log(
              `Failed after ${MAX_RETRIES} retries for file ${idx} and product's index ${idxProd}`
            );
          }
        }
      }
      idxProd++;
    }
    try {
      await saveToJson('', filePath.replace(/.json/g, ''), products);
    } catch (error) {
      console.log('error save resultJson SecondPart');
    }
  }
}

async function createExcelFileFromJson(dirPath) {
  const filesPath = await getFilesPath(dirPath);
  for (let idx = 0; idx < filesPath.length; idx++) {
    const filePath = filesPath[idx];
    const products = await parseJSONFile(filePath.replace(/.json/g, ''));
    products.forEach(it => {
      delete it.link;
      delete it.description;
      delete it['Примечание'];
      delete it['Примітка'];
    });
    const splitFilePath = filePath.replace(/.json/g, '').split('\\');
    const wb = new excel.Workbook();
    const workSheetName = splitFilePath[splitFilePath.length - 1].slice(-32).replace(/-/g, '');
    const ws = wb.addWorksheet(workSheetName);

    const keysUniq = new Set();
    products.forEach(it => {
      Object.keys(it).forEach(key => keysUniq.add(key));
    });
    const headers = [...keysUniq];
    headers.forEach((key, colIndex) => {
      ws.cell(1, colIndex + 1).string(key);
    });
    products.forEach((item, rowIndex) => {
      headers.forEach((key, colIndex) => {
        const value = item[key];
        if (typeof value === 'number') {
          ws.cell(rowIndex + 2, colIndex + 1).number(value);
        } else if (typeof value === 'string') {
          ws.cell(rowIndex + 2, colIndex + 1).string(value);
        } else {
          ws.cell(rowIndex + 2, colIndex + 1).string(String(value !== undefined ? value : ''));
        }
      });
    });
    wb.write(filePath.replace(/json|data/g, 'xlsx'));
    console.log('Excel file has been created');
  }
}

async function fixFoo(dirPath) {
  const filesPathAll = await getFilesPath(dirPath);
  for (let idx = 0; idx < filesPathAll.length; idx++) {
    // for (let idx = 0; idx < 1; idx++) {
    const filePath = filesPathAll[idx];
    try {
      const products = await parseJSONFile(filePath.replace(/.json/g, ''));
      const uniqKeys = getUniqKeysFromArrOfObj(products);

      for (let idxProd = 0; idxProd < products.length; idxProd++) {
        // for (let idxProd = 0; idxProd < 2; idxProd++) {
        const product = products[idxProd];
        const prodKeys = Object.keys(product);
        const keysToAdd = uniqKeys.filter(key => !prodKeys.includes(key));
        keysToAdd.forEach(addKey => {
          product[addKey] = '';
        });
      }
      const splitFilePath = filePath.split('\\');
      const resultFileName = splitFilePath[splitFilePath.length - 1];
      try {
        await saveToJson('', resultFileName.replace(/.json/g, ''), products);
      } catch (error) {
        console.log('error save resultJson SecondPart');
      }
    } catch (err) {
      console.log('error parse json file', err);
    }
  }
}
// fixFoo(jsonFilesDir);

async function getImgsFix(dirPath) {
  const filesPath = await getFilesPath(dirPath);
  const imagesAbsFilesDone = await getFilesPath('../../data/vseplus/images/tel_plan/');
  const imagesName = imagesAbsFilesDone.map(it => {
    const split = it.split('\\');
    return split[split.length - 1];
  });
  console.log('total done imgs', imagesName.length);
  let imgIdx = 0;
  const folderImgs = 'imgs/';
  if (!fs.existsSync(folderImgs)) {
    fs.mkdirSync(folderImgs);
  }
  const downloadImgError = [];

  const totalImgsArr = [];

  for (let idx = 0; idx < filesPath.length; idx++) {
    const filePath = filesPath[idx];
    const products = await parseJSONFile(filePath.replace(/.json/g, ''));
    for (let idxProd = 0; idxProd < products.length; idxProd++) {
      const product = products[idxProd];
      const imgsArr = product.imgs.split(';');
      const modifyImgsArr = [];
      for (let idxImgs = 0; idxImgs < imgsArr.length; idxImgs++) {
        const imgLink = imgsArr[idxImgs];
        if (!imgLink) {
          const updateImgPath = 'catalog/products/prod_no_image.jpg';
          modifyImgsArr.push(updateImgPath);
          continue;
        }
        const imgLinkSplit = imgLink.split('/');
        const imgName = imgLinkSplit[imgLinkSplit.length - 1];
        const isImgDone = imagesName.find(img => img.includes(imgName));
        if (isImgDone) {
          const updatePath = `catalog/products/${isImgDone}`;
          modifyImgsArr.push(updatePath);
          continue;
        }
        const downloadImgName = `img_${imgIdx}_${imgName}`;
        const updateDownloadImgName = `catalog/products/${downloadImgName}`;
        const imgPath = folderImgs + downloadImgName;
        try {
          await saveImg(imgLink, imgPath);
          modifyImgsArr.push(updateDownloadImgName);
          imgIdx++;
        } catch (error) {
          console.log('download img error');
          downloadImgError.push(imgLink);
          continue;
        }
      }
      product.imgCatalog = modifyImgsArr;
      totalImgsArr.push(...imgsArr);
      console.log('done idx->', idxProd);
    }
    await saveToJson('', filePath.replace(/.json/g, ''), products);

    console.log('total uniq img', [...new Set(totalImgsArr)].length);
    console.log('total imgs', totalImgsArr.length);
    await saveToJson('', 'errorLink', downloadImgError);
  }
}
// getImgsFix(jsonFilesDir);

async function getUniqElements(dirPath) {
  const filesPath = await getFilesPath(dirPath);
  const fileRu = filesPath.filter(file => file.includes('_ru.'));
  const fileUa = filesPath.filter(file => file.includes('_ua.'));
  const dataRu = await parseJSONFile(fileRu[0]?.replace(/.json/g, ''));
  const dataUa = await parseJSONFile(fileUa[0]?.replace(/.json/g, ''));
  //! порівння двох масивів обєктів за ключем userSKU по довжині
  const dataRuUniq = getUniqObjByKey(dataRu, 'userSKU');
  const dataUaUniq = getUniqObjByKey(dataUa, 'userSKU');
  const uniqSkuUa = dataUaUniq.map(i => i.userSKU);
  const dataRuInterSection = dataRuUniq.filter(it => uniqSkuUa.includes(it.userSKU));
  console.log(uniqSkuUa.length);
  console.log(dataRuInterSection.length);
  //! порівняння двох масивів між собою. Пошук едементів, що не співпали.
  const ruUniq = new CustomSet(dataRu.map(el => el.userSKU));
  const uaUniq = new CustomSet(dataUa.map(el => el.userSKU));
  console.log('ru', ruUniq.size);
  console.log('ua', uaUniq.size);
  console.log(ruUniq.difference(uaUniq));
  console.log(uaUniq.difference(ruUniq));
}
// getUniqElements(jsonFilesDir);

async function getImages(dirPath) {
  const filesPath = await getFilesPath(dirPath);
  const imgsFilesFull = await getFilesPath('images');
  const imgsFiles = imgsFilesFull.map(it => {
    const split = it.split('\\');
    return split[split.length - 1];
  });
  const fileUa = filesPath.filter(file => file.includes('ua'));
  const dataUa = await parseJSONFile(fileUa[0].replace(/.json/g, ''));
  const folderImgs = 'images/';
  if (!fs.existsSync(folderImgs)) {
    fs.mkdirSync(folderImgs);
  }
  const imgsDone = new Map();
  let imgDoneIdx = 35545;
  for (let idx = 0; idx < dataUa.length; idx++) {
    // for (let idx = 0; idx < 10; idx++) {
    const it = dataUa[idx];
    const images = it.imgs.split(';');
    const newImgs = [];
    let idxImgs = 0;
    while (idxImgs < images.length) {
      const imgLink = images[idxImgs];
      if (!imgLink) {
        idxImgs++;
        continue;
      }
      if (imgsDone.has(imgLink)) {
        const imgCatalog = imgsDone.get(imgLink);
        newImgs.push(imgCatalog);
        idxImgs++;
        continue;
      }
      const imgLinkSplit = imgLink.split('/');
      const fileName = `img_${imgDoneIdx}_${imgLinkSplit[imgLinkSplit.length - 1]}`;
      const imgCatalog = `catalog/products/${fileName}`;
      const path = folderImgs + fileName;
      if (!imgsFiles.includes(fileName)) {
        try {
          await saveImg(imgLink, path);
          imgsDone.set(imgLink, imgCatalog);
          newImgs.push(imgCatalog);
          imgDoneIdx++;
          idxImgs++;
        } catch (error) {
          console.log(error);
        }
      } else {
        imgsDone.set(imgLink, imgCatalog);
        newImgs.push(imgCatalog);
        imgDoneIdx++;
        idxImgs++;
      }
    }

    it.imgCatalog = newImgs;
    console.log('items done:', idx + 1);
  }
  console.log('total imgs', imgDoneIdx);
  try {
    await saveToJson('./', 'abra', dataUa);
  } catch (error) {
    console.log('error save resultJson getImages');
  }
}
// getImages(jsonFilesDir);

async function createImportFullFiles(dirPath, startId, categoriesJson, attrJson, attrGroupJson) {
  const filesPath = await getFilesPath(dirPath);
  const categoriesId = await parseJSONFile(categoriesJson);
  const attributesId = await parseJSONFile(attrJson);
  const attributesGroupId = await parseJSONFile(attrGroupJson);

  const fileRu = filesPath.find(file => file.includes('_ru'));
  const fileUa = filesPath.find(file => file.includes('_ua'));

  const dataRu = await parseJSONFile(fileRu?.replace(/.json/g, ''));
  const dataUa = await parseJSONFile(fileUa?.replace(/.json/g, ''));
  let id = startId;
  const products = [];
  const additionalImages = [];
  const productAttributes = [];
  for (let idx = 0; idx < dataUa.length; idx++) {
    // for (let idx = 0; idx < 1; idx++) {
    const it = dataUa[idx];
    const { userSKU, category } = it;
    const finedRu = dataRu.find(it => it.userSKU === userSKU);
    if (!finedRu) {
      console.log(userSKU);
    }
    it.ruInfo = finedRu;
    it.id = id;
    id++;
    const categoryArr = [];
    const categorySplit = category.split('>');
    const parentId = categoriesId.find(it => it['name(uk-ua)'] === categorySplit[0])?.category_id;
    categoryArr.push(parentId);
    if (categorySplit.length > 1) {
      for (let idxSubCat = 1; idxSubCat < categorySplit.length; idxSubCat++) {
        const el = categorySplit[idxSubCat];
        const catId = categoriesId.find(
          it => it['name(uk-ua)'] === el && it.parent_id === categoryArr[idxSubCat - 1]
        )?.category_id;
        categoryArr.push(catId);
      }
      it.catId = categoryArr.join(',');
    } else {
      it.catId = 'error';
    }
    const imgsCinvertToArr = it?.imgCatalog?.split(';');
    //*створюємо дані для листа Excel Products
    const product = { ...PRODUCT };
    product.product_id = it.id;
    product['name(ru-ru)'] = it.ruInfo?.title;
    product['name(uk-ua)'] = it?.title;
    product['meta_title(ru-ru)'] = it.ruInfo?.title;
    product['meta_title(uk-ua)'] = it?.title;
    product.categories = it.catId;
    product.sku = it.userSKU;
    // product.quantity = it['Наявність'] === 'Так' ? 50 : 0;
    product.quantity = it['Наявність на складі'] === 'Так' ? 50 : 0;
    product.model = it.userSKU;
    product.manufacturer = it['Виробник'];
    // product.manufacturer = it.brand;
    product.image_name = imgsCinvertToArr[0]
      ? imgsCinvertToArr[0]
      : 'catalog/products/prod_no_image.jpg';
    product.price = it.ruInfo?.userPrice;
    products.push(product);

    //*створюємо дані для листа Excel AdditionalImages
    if (imgsCinvertToArr.length > 1) {
      const [, ...addImgs] = imgsCinvertToArr;
      addImgs.forEach(imgLink => {
        const addImg = { ...ADD_IMG };
        addImg.product_id = it.id;
        addImg.image = imgLink;
        additionalImages.push(addImg);
      });
    }

    //*створюємо дані для листа Excel ProductAttributes
    const attrUa = ATTRIBUTES_KEYS_UA.reduce((acc, curr) => {
      if (it[curr]) {
        acc[curr] = it[curr];
      }
      return acc;
    }, {});
    const attrRu = ATTRIBUTES_KEYS_RU.reduce((acc, curr) => {
      if (it.ruInfo[curr]) {
        acc[curr] = it.ruInfo[curr];
      }
      return acc;
    }, {});
    const attrKeys = Object.keys(attrUa);
    attrKeys.forEach(key => {
      const attrElement = attributesId.find(el => el['name(uk-ua)'] === key);
      const attrGroupId = attrElement.attribute_group_id;
      const attrGroupName = attributesGroupId.find(it => it.attribute_group_id === attrGroupId);
      const valueUa = attrUa[key];
      const valueRu = attrRu[UA_TO_RU_ATTR[key]];
      const attribute = { ...ATTRIBUTE };
      attribute.product_id = it.id;
      attribute.attribute_group = attrGroupName['name(uk-ua)'];
      attribute.attribute = key;
      attribute['text(ru-ru)'] = valueRu;
      attribute['text(uk-ua)'] = valueUa;
      // attribute.attrId = attrElement.attribute_id;
      productAttributes.push(attribute);
    });

    // console.log(`done ${idx + 1} of ${dataUa.length}`);
  }
  try {
    await saveToJson('./data/sheetsXlsx/', 'Products', products);
  } catch (error) {
    console.log('error save Products');
  }
  try {
    await saveToJson('./data/sheetsXlsx/', 'AdditionalImages', additionalImages);
  } catch (error) {
    console.log('error save AdditionalImages');
  }
  try {
    await saveToJson('./data/sheetsXlsx/', 'ProductAttributes', productAttributes);
  } catch (error) {
    console.log('error save AdditionalImages');
  }
}
const startTime = new Date();
console.log(`Функція запущена: ${startTime.toLocaleString()}`);

//  await createImportFullFiles(jsonFilesDir, startId, categoriesIdJson, attrJson, attrGroupJson);

async function createExcelManySheetsFromJsonFiles(dirPath, resultsXlsxName) {
  const filesPath = await getFilesPath(dirPath);
  const wb = new excel.Workbook();
  for (let idx = 0; idx < filesPath.length; idx++) {
    const filePath = filesPath[idx];
    const products = await parseJSONFile(filePath.replace(/.json/g, ''));
    const splitFilePath = filePath.replace(/.json/g, '').split('\\');
    const workSheetName = splitFilePath[splitFilePath.length - 1];
    const ws = wb.addWorksheet(workSheetName);
    ws.row(1).freeze();

    const keysUniq = new Set();
    products.forEach(it => {
      Object.keys(it).forEach(key => keysUniq.add(key));
    });
    const headers = [...keysUniq];
    headers.forEach((key, colIndex) => {
      ws.cell(1, colIndex + 1).string(key);
    });
    products.forEach((item, rowIndex) => {
      headers.forEach((key, colIndex) => {
        const value = item[key];
        if (typeof value === 'number') {
          ws.cell(rowIndex + 2, colIndex + 1).number(value);
        } else if (typeof value === 'string') {
          ws.cell(rowIndex + 2, colIndex + 1).string(value);
        } else {
          ws.cell(rowIndex + 2, colIndex + 1).string(String(value !== undefined ? value : ''));
        }
      });
    });
  }
  wb.write(resultsXlsxName);
  console.log(resultsXlsxName, 'file has been created');
}

// await createExcelManySheetsFromJsonFiles(jsonToExcelDir, resultsXlsxFile);

setTimeout(() => {
  const endTime = new Date();
  console.log(`Функція завершена: ${endTime.toLocaleString()}`);
  const timeDifference = (endTime - startTime) / 1000;
  console.log(`Час виконання: ${timeDifference} секунд`);
}, 0);

function getUniqKeysFromArrOfObj(arr) {
  const keys = new Set();
  arr.forEach(obj => {
    const objKeys = Object.keys(obj);
    objKeys.forEach(key => {
      if (!keys.has(key)) {
        keys.add(key);
      }
    });
  });
  return [...keys];
}

async function tempFix(dirPath) {
}
await tempFix(jsonFilesDir);

function readTxtFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject('Файл не знайдено або сталася помилка: ' + err);
      } else {
        resolve(data);
      }
    });
  });
}
