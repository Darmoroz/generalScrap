import chalk from 'chalk';
import { getUrlsToProductsByCategory } from './getUrlsToProductsByCategory.js';
import { saveToJs } from '../../commonUtils/saveToJs.js';

export async function getUrlsToProductsByCategories(categories) {
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const categoryName = category.match(/\d+[-](.*?)(?=\/)/)?.[1];
    console.log(categoryName);
    try {
      const productsByCategory = await getUrlsToProductsByCategory(category);
      const result = { category: categoryName, products: productsByCategory };
      await saveToJs('./data/', `category${i + 1}`, result);
    } catch (error) {
      console.log('ByCategories', chalk.red(error));
    }
  }
}
