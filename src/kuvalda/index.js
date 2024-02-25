import chalk from 'chalk';
import { categoty1 } from './data/category1.js';
import { categoty2 } from './data/category2.js';
import { categoty3 } from './data/category3.js';
import { categoty4 } from './data/category4.js';
import { categoty5 } from './data/category5.js';
import { categoty6 } from './data/category6.js';

// import { CATEGORYS } from './constans.js';
// import { getUrlsToProductsByCategories } from './utils/getUrlsToProductsByCategories.js';

async function main() {
  const categories = [categoty1, categoty2, categoty3, categoty4, categoty5, categoty6];
  try {
    // await getUrlsToProductsByCategories(CATEGORYS);
    await getInfoProductsByCategories(categories);
  } catch (error) {
    console.log('main', chalk.red(error));
  }
}

await main();
