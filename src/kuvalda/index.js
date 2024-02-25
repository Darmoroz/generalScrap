import chalk from 'chalk';

import { category1 } from './data/category1.js';
import { category2 } from './data/category2.js';
import { category3 } from './data/category3.js';
import { category4 } from './data/category4.js';
import { category5 } from './data/category5.js';
import { category6 } from './data/category6.js';
import { getInfoProductsByCategories } from './utils/getInfoProductsByCategories.js';

import { benzGenerator } from './data/benzinovye-generatory.js';
import { sadovyeTraktory } from './data/sadovye-traktory.js';
import { kultivatory } from './data/kultivatory.js';
import { motobloki } from './data/motobloki.js';
import { skarifikatory } from './data/skarifikatory.js';
import { transheekopateli } from './data/transheekopateli.js';
import { downloadImages } from './utils/downloadImages.js';

const dataCategoryImg = transheekopateli;

// import { CATEGORYS } from './constans.js';
// import { getUrlsToProductsByCategories } from './utils/getUrlsToProductsByCategories.js';

async function main() {
  // , category2, category3, category4, category5, category6
  const categories = [category6];
  try {
    // await getUrlsToProductsByCategories(CATEGORYS);
    // await getInfoProductsByCategories(categories);

    await downloadImages(dataCategoryImg);
  } catch (error) {
    console.log('main', chalk.red(error));
  }
}

await main();
