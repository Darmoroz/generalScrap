import { normalizeStr } from '../../commonUtils/normalizeStr';

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
  } catch (error) {
    console.log('ByProduct', chalk.red(error));
  }
}
