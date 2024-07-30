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
import { getUniqObjByKey } from './utils/getUniqObjByKey.js';

// *
const startCatIdx = 28;

const startPage = 1;
const PER_PAGE = 24;
const MAX_RETRIES = 5;
const jsonFilesDir = 'data/products';
const mainUrls = [BASE_URL_UA, BASE_URL_RU];

const startId = 101;
const jsonToExcelDir = 'data/sheetsXlsx';
// const resultsXlsxFile='productsCatTelPlanshTexaks.xlsx'
const resultsXlsxFile='productsАccessoriesTexaks.xlsx'
const categoriesIdJson = 'data/categoriesId';
const attrJson = 'data/attributesId';
const attrGroupJson = 'data/attributesGroupId';

for (let idxMainUrl = 0; idxMainUrl < mainUrls.length; idxMainUrl++) {
  const mainUrl = mainUrls[idxMainUrl];

  for (let idx = startCatIdx; idx < CATEGORIES.length; idx++) {
    // for (let idx = startCatIdx; idx < 1; idx++) {
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

await getScondPartOfData(jsonFilesDir);
await createExcelFileFromJson(jsonFilesDir);

async function getFirstPartOfData(page, baseUrl, categoryUrl, category, resultsFileName) {
  console.log(resultsFileName)

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
      const { link, sku, price,error,userPrice } = product;
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
  const filesPath = filesPathAll.filter(file => file.includes('.ua'));
  console.log(filesPath.length);
  const results = [];
  for (let idx = 0; idx < filesPath.length; idx++) {
    const filePath = filesPath[idx];
    try {
      const data = await parseJSONFile(filePath.replace(/.json/g, ''));
      results.push(...data);
    } catch (err) {
      console.log('error parse json file', err);
    }
    // const noteProducts=products.filter(it=>it.note).map(({link, sku, note})=>({link, sku, note}));

    // products.forEach(it => {
    //   const { imgs } = it;
    //   if (Array.isArray(imgs)) {
    //     it.imgs = imgs.join(';');
    //   } else {
    //     it.imgs = imgs;
    //   }
    // });
    // try {
    //   await saveToJson('', filePath.replace(/.json/g, ''), products);
    // } catch (error) {
    //   console.log('error save resultJson SecondPart');
    // }
  }
  try {
    await saveToJson('', 'vsePlus_ua', results);
  } catch (error) {
    console.log('error save resultJson SecondPart');
  }
  console.log(results.length);
}

async function getUniqKeys(dirPath) {
  const filesPath = await getFilesPath(dirPath);
  for (let idx = 0; idx < filesPath.length; idx++) {
    const filePath = filesPath[idx];
    const products = await parseJSONFile(filePath.replace(/.json/g, ''));
    const keysUniq = new Set();
    products.forEach(it => {
      Object.keys(it).forEach(key => keysUniq.add(key));
    });
    console.log(filePath);
    console.log(keysUniq);
  }
}

// fixFoo(jsonFilesDir);
// getUniqKeys(jsonFilesDir);

async function getUniqElements(dirPath) {
  const filesPath = await getFilesPath(dirPath);
  // const uniqSku= await parseJSONFile('intersectionSku')

  const fileRu = filesPath.filter(file => file.includes('ru'));
  const fileUa = filesPath.filter(file => file.includes('ua'));
  const dataRu = await parseJSONFile(fileRu[0].replace(/.json/g, ''));
  const dataUa = await parseJSONFile(fileUa[0].replace(/.json/g, ''));

  // const findIdx=dataRu.findIndex(el=>el.sku==209390)
  // dataRu.forEach((el,idx)=>{
  //   if (idx<findIdx) {
  //     el["Тип"]="Для смарт-часов"
  //   } else {
  //     el["Тип"]="Для фитнесбраслетов"
      
  //   }
  // })
  // dataUa.forEach((el,idx)=>{
  //   if (idx<findIdx) {
  //     el["Тип"]="Для смарт-годинників"
  //   } else {
  //     el["Тип"]="Для фітнесбраслетів"
      
  //   }
  // })

//   const dataRuUniq= getUniqObjByKey(dataRu, 'sku')
//   const dataUaUniq = getUniqObjByKey(dataUa, 'sku')
// console.log(dataRuUniq.length)
// console.log(dataUaUniq.length)
// await saveToJson('', fileRu, dataRu)
// await saveToJson('', fileUa, dataUa)

  // const dataRuInterSection=dataRuUniq.filter(it=>uniqSku.includes(it.sku))
  // const dataUaInterSection=dataUaUniq.filter(it=>uniqSku.includes(it.sku))

  // const ruUniq = new CustomSet(dataRu.map(el => el.sku));
  // const uaUniq = new CustomSet(dataUa.map(el => el.sku));
  // console.log('ru', ruUniq.size);
  // console.log('ua', uaUniq.size);
  // console.log(ruUniq.difference(uaUniq))
  // console.log(uaUniq.difference(ruUniq))
  // await saveToJson('', 'vsePlus_ru',dataRuInterSection)
  // await saveToJson('', 'vsePlus_ua', dataUaInterSection)
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
  let imgDoneIdx = 0;
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
//? getImages(jsonFilesDir);

async function createImportFullFiles(dirPath, startId, categoriesJson, attrJson, attrGroupJson) {
  const filesPath = await getFilesPath(dirPath);
  const categoriesId = await parseJSONFile(categoriesJson);
  const attributesId = await parseJSONFile(attrJson);
  const attributesGroupId = await parseJSONFile(attrGroupJson);
  console.log();
  const fileRu = filesPath.filter(file => file.includes('ru'));
  const fileUa = filesPath.filter(file => file.includes('ua'));
  const dataRu = await parseJSONFile(fileRu[0].replace(/.json/g, ''));
  const dataUa = await parseJSONFile(fileUa[0].replace(/.json/g, ''));
  let id = startId;
  const products = [];
  const additionalImages = [];
  const productAttributes = [];
  for (let idx = 0; idx < dataUa.length; idx++) {
    // for (let idx = 0; idx < 1; idx++) {
    const it = dataUa[idx];
    const { sku, category } = it;
    const finedRu = dataRu.find(it => it.sku === sku);
    it.ruInfo = finedRu;
    it.id = id;
    id++;
    const categorySplit = category.split('>');
    const parentId = categoriesId.find(it => it.name_ua === categorySplit[0])?.category_id;
    if (categorySplit.length > 1) {
      const catId = categoriesId.find(
        it => it.name_ua === categorySplit[1] && it.parent_id === parentId
      )?.category_id;
      it.catId = `${parentId},${catId}`;
    } else {
      it.catId = `${parentId},${catId}`;
      it.catError = 'true';
    }

    //*створюємо дані для листа Excel Products
    const product = { ...PRODUCT };
    product.product_id = it.id;
    product['name(ru-ru)'] = it.ruInfo?.title;
    product['name(uk-ua)'] = it?.title;
    product['meta_title(ru-ru)'] = it.ruInfo?.title;
    product['meta_title(uk-ua)'] = it?.title;
    product.categories = it.catId;
    product.sku = sku;
    product.quantity = it['Наявність'] === 'В наявності' ? 50 : 0;
    product.model = sku;
    product.manufacturer = it['Виробник'];
    product.image_name = it?.imgCatalog[0];
    product.price = it?.userPrice;
    products.push(product);

    //*створюємо дані для листа Excel AdditionalImages
    if (it.imgCatalog.length > 1) {
      const [, ...addImgs] = it.imgCatalog;
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
//* await createImportFullFiles(jsonFilesDir, startId, categoriesIdJson, attrJson, attrGroupJson);

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

//* await createExcelManySheetsFromJsonFiles(jsonToExcelDir, resultsXlsxFile);
