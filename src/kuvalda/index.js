import chalk from 'chalk';

import { category1 } from './data/category1.js';
import { category2 } from './data/category2.js';
import { category3 } from './data/category3.js';
import { category4 } from './data/category4.js';
import { category5 } from './data/category5.js';
import { category6 } from './data/category6.js';
import { benzGenerator } from './data/benzinovye-generatory.js';

import { getInfoProductsByCategories } from './utils/getInfoProductsByCategories.js';
import { downloadImages } from './utils/downloadImages.js';

// import { CATEGORYS } from './constans.js';
// import { getUrlsToProductsByCategories } from './utils/getUrlsToProductsByCategories.js';

// , category2, category3, category4, category5, category6
async function main() {
  const categories = [category1];
  try {
    // await getUrlsToProductsByCategories(CATEGORYS);
    // await getInfoProductsByCategories(categories);
    await downloadImages(benzGenerator);
  } catch (error) {
    console.log('main', chalk.red(error));
  }
}

await main();
