import chalk from 'chalk';
import { saveToJs } from '../../commonUtils/saveToJs.js';
import { getInfoByProduct } from './getInfoByProduct.js';

export async function getInfoProductsByCategories(categories) {
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i].category;
    const products = categories[i].products;
    console.log(category);
    const productsFullInfo = [];
    for (let j = 0; j < products.length; j++) {
      const url = products[j];
      try {
        const productInfo = await getInfoByProduct(url);
        productsFullInfo.push(productInfo);
        await saveToJs('./data/', `${category}`, { category, products: productsFullInfo });
        console.log('product->', j, '\\', products.length);
      } catch (error) {
        console.log('InfoByProducts', chalk.red(error));
      }
    }
  }
}
