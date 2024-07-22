import axios from 'axios';
import fs from 'fs';

import { parseJSONFile } from '../commonUtils/parseJSONFile.js';
import { saveToJson } from '../commonUtils/saveToJson.js';
import { delay } from '../commonUtils/delay.js';

const ROOT_LINK = 'https://exist.ua/api/v1/unicat/';
const BRAND_API_LINK = 'car-manufacture';
const MODEL_API_LINK = 'car-model-name';
const TYPE_MODEL_API_LINK = 'car-universal';
const MODIFICATION_API_LINK = 'car-modification';

const oilsPathExist = 'existData/oilsExist';
const filtersPathExist = 'existData/filtersExist';
const oilsPathOlyva = 'olyvaData/oilsFined';
const filtersPathOlyva = 'olyvaData/filtersFined';

// const oilsExist = await parseJSONFile(oilsPathExist);
// const filtersExist = await parseJSONFile(filtersPathExist);

const oilsOlyva = await parseJSONFile(oilsPathOlyva);
//* const filtersOlyva = await parseJSONFile(filtersPathOlyva);

// const oilsResults = [];
// const filtersResults = [];
// oilsOlyva.forEach(it => {
//   const { sku } = it;
//   const isFined = oilsExist.find(el => el.sku === sku);
//   if (isFined) {
//     oilsResults.push({ ...it, linkExist: isFined.link, idExist: isFined.id });
//     // oilsResults.push({...it})
//   }
// });
// filtersOlyva.forEach(it => {
//   const { sku } = it;
//   const isFined = filtersExist.find(el => el.sku === sku);
//   if (isFined) {
//     filtersResults.push({ ...it, linkExist: isFined.link, idExist: isFined.id });
//     // filtersResults.push({...it})
//   }
// });
// console.log('oilsFined', oilsResults.length);
// await saveToJson('', 'oilsFined', oilsResults);
// console.log('filtersFined', filtersResults.length);
// await saveToJson('', 'filtersFined', filtersResults);

// for (let idxOils = 0; idxOils < oilsOlyva.length; idxOils++) {
// for (let idxOils = 18; idxOils < 20; idxOils++) {
for (let idxOils = 22; idxOils < 22; idxOils++) {
  const apllicabResults = [];
  const item = oilsOlyva[idxOils];
  const { sku, idExist } = item;
  const itemName = sku.replace(/[\s-]/g, '_');
  const itemFolder = `./data/${itemName}/`;
  if (!fs.existsSync(itemFolder)) {
    fs.mkdirSync(itemFolder);
  }
  console.log('SKU', sku);
  const prodId = `product_id=${idExist}`;
  const queryBrand = prodId;
  const brandLink = `${ROOT_LINK}${BRAND_API_LINK}/?${queryBrand}`;
  const {
    data: { data },
  } = await axios.get(brandLink);
  apllicabResults.push(...data);
  for (let idxBrand = 0; idxBrand < apllicabResults.length; idxBrand++) {
    // for (let idxBrand = 0; idxBrand < 1; idxBrand++) {
    const brand = apllicabResults[idxBrand];
    const queryModel = `${queryBrand}&manufacture=${brand.slug}`;
    const modelLink = `${ROOT_LINK}${MODEL_API_LINK}/?${queryModel}`;
    const {
      data: {
        data: { model_list },
      },
    } = await axios.get(modelLink);
    brand.models = model_list;
    for (let idxModels = 0; idxModels < model_list.length; idxModels++) {
      // for (let idxModels = 0; idxModels < 1; idxModels++) {
      const model = model_list[idxModels];
      const queryType = `${queryModel}&slug=${model.slug}`;
      const typeLink = `${ROOT_LINK}${TYPE_MODEL_API_LINK}/?${queryType}`;
      const {
        data: {
          data: { model_type_list },
        },
      } = await axios.get(typeLink);
      model.model_type_list = model_type_list;
      console.log(
        `${brand.slug.toUpperCase()}->${+idxBrand}/${+apllicabResults.length}; ${model.slug.toUpperCase()}->${+idxModels}/${+model_list.length}; type amount ${+model_type_list.length}`
      );
      for (let idxType = 0; idxType < model_type_list.length; idxType++) {
        // for (let idxType = 0; idxType < 1; idxType++) {
        const modelType = model_type_list[idxType];
        const queryModification = `${queryModel}&model_type=${modelType.slug}`;
        const modificationLink = `${ROOT_LINK}${MODIFICATION_API_LINK}/?${queryModification}`;
        try {
          const {
            data: { data },
          } = await axios.get(modificationLink);
          modelType.modification_list = data.modification_list;
          if (
            idxType === 5 ||
            idxType === 12 ||
            idxType === 24 ||
            idxType === 48 ||
            idxType === 72 ||
            idxType === 96
          ) {
            await delay(5000);
          }
          await saveToJson(itemFolder, `${data.manufacture.slug}_${data.model_type.slug}`, data);
        } catch (error) {
          console.log(error.message);
        }
      }
    }
  }
  try {
    await saveToJson('./apllicabData/', itemName, apllicabResults);
  } catch (error) {
    console.log(`apllicabData save JSON error`);
  }
}
