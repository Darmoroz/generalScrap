import chalk from 'chalk';
import axios from 'axios';
import fs from 'fs';
import { saveToJson } from '../../commonUtils/saveToJson.js';
import { delay } from '../../commonUtils/delay.js';

const fileName = 'benzgen.json';

export async function downloadImages(products) {
  const totalResultNew = [];
  console.log('total products', products.length);
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    const imagesUrls = product.images;
    console.log('product->', i, 'total images->', imagesUrls.length);
    const newImageUrls = [];
    const newImageUrls1 = [];

    const folderName = `./data/img/benzGen/${product.proizvoditel.toLowerCase()}`;
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
    await saveToJson('./data/', fileName, totalResultNew);
    await delay(1000);
  }
}
