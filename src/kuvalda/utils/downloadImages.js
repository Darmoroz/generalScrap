import chalk from 'chalk';
import axios from 'axios';
import fs from 'fs';
import { saveToJson } from '../../commonUtils/saveToJson.js';
import { delay } from '../../commonUtils/delay.js';


export async function downloadImages(productsObj) {
  const categoryName = productsObj.category;
  const products = productsObj.products;
  const totalResultNew = [];
  console.log('total products', products.length);
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const imagesUrls = product.images;
    console.log('product->', i, 'total images->', imagesUrls.length);
    const newImageUrls = [];
    const newImageUrls1 = [];

    const folderNameCategory = `./data/img/${categoryName}`;
    const folderName = `${folderNameCategory}/${product.proizvoditel.toLowerCase()}`;

    if (!fs.existsSync(folderNameCategory)) {
      fs.mkdirSync(folderNameCategory);
    }
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }
    for (let j = 0; j < imagesUrls.length; j++) {
      const imageUrl = imagesUrls[j];
      try {
        const response = await axios({
          method: 'get',
          url: imageUrl,
          responseType: 'stream',
        });
        const responseCopy = await axios({
          method: 'get',
          url: imageUrl,
          responseType: 'stream',
        });
        const fileName = imageUrl
          .replace('https://www.kuvalda.ru/data/file_resize/product/', '')
          .replaceAll('/', '-');

        newImageUrls.push(`${folderName}/${fileName}`);
        newImageUrls1.push(`./data/img/${fileName}`);
        const writer = fs.createWriteStream(`${folderName}/${fileName}`);
        const writer1 = fs.createWriteStream(`./data/img/${fileName}`);
        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });
        responseCopy.data.pipe(writer1);
        await new Promise((resolve, reject) => {
          writer1.on('finish', resolve);
          writer1.on('error', reject);
        });

        // console.log(`${fileName} завантажено успішно.`);
      } catch (error) {
        console.error(`Помилка завантаження ${imageUrl}:`, error.message);
        console.log('downloadImages', chalk.red(error));
      }
    }
    totalResultNew.push({
      ...product,
      imageUrls: newImageUrls.join(','),
      imageUrls_1: newImageUrls1.join(','),
    });
    await saveToJson('./data/', `${categoryName}.json`, {
      category: categoryName,
      products: totalResultNew,
    });
    await delay(1000);
  }
}
