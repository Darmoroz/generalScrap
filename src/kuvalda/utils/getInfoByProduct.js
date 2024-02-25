import axios from 'axios';
import { JSDOM } from 'jsdom';
import { slugify } from 'transliteration';
import { normalizeStr } from '../../commonUtils/normalizeStr.js';

export async function getInfoByProduct(url) {
  try {
    const { data } = await axios.get(url);
    const { document } = new JSDOM(data).window;

    const type = 'simple';

    const nameEl = document.querySelector('h1.page-header__title');
    const name = nameEl ? normalizeStr(nameEl.textContent) : null;

    const priceEl = document.querySelector('.product-buy__price-value');
    const price = priceEl ? priceEl.textContent.replaceAll(' ', '') : null;

    const categoryElArr = [...document.querySelectorAll('.breadcrumbs__list a')]
      .map(i => normalizeStr(i?.textContent))
      .filter(i => i !== 'Главная' && i !== 'Каталог');
    const categories =
      categoryElArr.length > 0
        ? categoryElArr?.reduce((acc, curr, idx, arr) => {
            if (idx === arr.length - 1) {
              acc += curr;
            } else {
              acc += curr + '>';
            }
            return acc;
          }, '')
        : null;

    const descriptionEl = document.querySelector('.product-specs__text p');
    const description = descriptionEl ? normalizeStr(descriptionEl.textContent) : null;

    const imagesEl = [...document.querySelectorAll('.product-gallery__slider button img')];
    const images = imagesEl.length > 0 ? imagesEl.map(image => image.src) : null;

    const techAtributeElArr = [
      ...document.querySelectorAll('.product-specs__characteristics-item'),
    ];
    const pkgAtributeElArr = [...document.querySelectorAll('.product-specs__package-item')];

    const techAtrObj =
      techAtributeElArr.length > 0
        ? techAtributeElArr.reduce((acc, curr) => {
            const key = slugify(normalizeStr(curr.querySelector(':first-child')?.textContent), {
              lowercase: true,
              separator: '_',
            });
            const value = normalizeStr(curr.querySelector(':last-child')?.textContent);
            acc[key] = value;
            return acc;
          }, {})
        : null;

    const pkgAtrObj =
      pkgAtributeElArr.length > 0
        ? pkgAtributeElArr.reduce((acc, curr) => {
            const key = slugify(
              normalizeStr(curr.querySelector('.product-specs__package-label')?.textContent),
              { lowercase: true, separator: '_' }
            );
            const value = normalizeStr(
              curr.querySelector('.product-specs__package-value')?.textContent
            );
            acc[`pkg_${key}`] = value;
            return acc;
          }, {})
        : null;

    return { type, name, price, categories, description, images, ...techAtrObj, ...pkgAtrObj, url };
  } catch (error) {
    console.log('ByProduct', chalk.red(error));
  }
}
