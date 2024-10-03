import axios from 'axios';
import { JSDOM } from 'jsdom';

import { connect } from 'puppeteer-real-browser';
import { delay } from './commonUtils/delay.js';
import { saveToJson } from './commonUtils/saveToJson.js';
import { parseJSONFile } from './commonUtils/parseJSONFile.js';
import { colorNames } from 'chalk';

// const resultsFileName = 'actuator_jrone_sl';
const resultsFileName = 'actuator_sl';
const lastPage = 10;
const startLinkCat = 'aktuator-turbini_2610';
const brandId = '12229';

async function getInfo() {
  const products = await parseJSONFile('notFined');
  const results = [];
  try {
    const { browser } = await connect({
      headless: false,
      timeout: 30000,
      connectOption: {
        defaultViewport: {
          width: 1280,
          height: 1080,
        },
      },
    });
    const page = await browser.newPage();
    await page.goto('https://master.shop');
    await delay(4000);
    const btnLogin = await page.$('button[data-modal="loginAccount"');
    if (btnLogin) {
      await btnLogin.click();
      await delay(1000);
    }
    await focusAndType(page, 'input[name="login"]', '0971150815');
    await delay(2000);
    await focusAndType(page, 'input[name="password"]', '0971150815');
    await delay(1000);
    await page.keyboard.press('Enter');
    await delay(4000);
    // for (let idx = 1; idx < lastPage; idx++) {
    //   if (idx >= 10 && idx <= 19) {
    //     continue;
    //   }
    //   const linkUrl = `https://master.shop/${startLinkCat}?filters=car:all;trade_mark:${brandId}&page=${idx}`;
    //   console.log(linkUrl);
    //   await page.goto(linkUrl);
    //   await delay(4000);
    //   const prods = await page.evaluate(cat => {
    //     const category = cat;
    //     const items = [
    //       ...document.querySelectorAll('.product_tile_wrap>.tile_item_wrap>.tile_element'),
    //     ].map(el => {
    //       const link = el.querySelector('.tile_cart_img .tile_link').href;
    //       const prewImg = el.querySelector('.lazy').src;
    //       const title = el.querySelector('.lazy').title.trim();
    //       const sku = el.querySelector('span.article').textContent.trim();
    //       const brand = el
    //         .querySelector('span.tile_shop_name')
    //         .textContent.replace(/[(,)]/g, '')
    //         .trim();
    //       const titleSplit = el
    //         .querySelector('.tile_title .tile_link')
    //         .innerText.split('\n')
    //         .filter(it => it !== '');
    //       const titleShort = titleSplit[0];

    //       const aplicab = titleSplit.length > 1 ? titleSplit.slice(1).join(';') : '';
    //       const availability = el
    //         .querySelector('.tile_availability>span:first-child')
    //         ?.textContent?.trim();
    //       const price = el
    //         .querySelector('.new_price')
    //         ?.textContent?.replace(/[ грн,' ']/g, '')
    //         ?.trim();
    //       const qty = el.querySelector('.quantity_good_row')?.textContent?.trim();
    //       return {
    //         link,
    //         sku,
    //         prewImg,
    //         title,
    //         brand,
    //         titleShort,
    //         aplicab,
    //         availability,
    //         price,
    //         qty,
    //         category,
    //       };
    //     });
    //     return items;
    //   }, resultsFileName);
    //   results.push(...prods);
    //   await saveToJson('', resultsFileName, results);
    //   await delay(2000);
    // }
    for (let idx = 0; idx < products.length; idx++) {
      // for (let idx = 0; idx < 2; idx++) {
      const prod = products[idx];
      const linkUrl = prod.link;
      await page.goto(linkUrl);
      await delay(4000);
      const detInfo = await page.evaluate(() => {
        const oeCodes = [];
        const crossCodes = [];
        const codesElemets = [...document.querySelectorAll('div.oe_kodes')];
        for (let idxCodes = 0; idxCodes < codesElemets.length; idxCodes++) {
          const codeEl = codesElemets[idxCodes];
          const prevElTitle = codeEl.previousElementSibling.textContent;
          const codes = [...codeEl.querySelectorAll('span')].map(i => i.textContent);
          if (prevElTitle.includes('OE')) {
            oeCodes.push(...codes);
          }
          if (prevElTitle.includes('КРОС')) {
            crossCodes.push(...codes);
          }
        }
        const price = document
          .querySelector('.js_price_html .main_price span')
          ?.textContent.replace(/грн|\s/g, '');
        return { price, oe: oeCodes, cross: crossCodes };
      });
      products[idx] = {
        ...prod,
        ...detInfo,
      };
      console.log(idx);
      await delay(2000);
    }
    await browser.close();
  } catch (error) {
    console.log(error);
  }
  await saveToJson('', 'fined', products);
}

async function focusAndType(page, selector, text) {
  try {
    await page.focus(selector);
    await page.type(selector, text, { delay: 200 });
    return;
  } catch (error) {
    console.log(`Attempt ${attempt + 1} failed: ${error}`);
    await delay(3000);
  }
  throw new Error(`Failed to focus and type in ${selector}`);
}
// await getInfo();

const inFile = './mastershop/turbinsMastershop';
const inFileFull = './mastershopFull';

async function getDetailsInfo() {
  const items = await parseJSONFile(inFile);
  let counter = 0;
  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx];
    const { link } = item;
    try {
      const { data } = await axios.get(link);
      const { document } = new JSDOM(data).window;
      const oeCodes = [];
      const crossCodes = [];
      const codesElemets = [...document.querySelectorAll('div.oe_kodes')];
      for (let idxCodes = 0; idxCodes < codesElemets.length; idxCodes++) {
        const codeEl = codesElemets[idxCodes];
        const prevElTitle = codeEl.previousElementSibling.textContent;
        const codes = [...codeEl.querySelectorAll('span')].map(i => i.textContent);
        if (prevElTitle.includes('OE')) {
          oeCodes.push(...codes);
        }
        if (prevElTitle.includes('КРОС')) {
          crossCodes.push(...codes);
        }
      }
      item.oe = oeCodes;
      item.cross = crossCodes;
      console.log(idx);
      counter++;
    } catch (error) {
      console.log(error);
    }
  }
  console.log(counter);
  await saveToJson('', 'abraTurbo', items);
}

// await getDetailsInfo();

async function findItems() {
  const mastershop = await parseJSONFile('./mastershop/turbinsMastershop');
  const itemsPrimeturbo = await parseJSONFile('turboPrimeturbo');
  itemsPrimeturbo.forEach(it => {
    const { analogCodes } = it;
    const sl = [];
    const jrone = [];
    analogCodes.forEach(code => {
      const findInfo = mastershop.filter(it => it.oe.includes(code) || it.cross.includes(code));
      if (findInfo.length > 0) {
        findInfo.forEach(el => {
          const brand = el.brand;
          const sku = el.sku;
          const price = el.price || 'not price';
          const qty = el.qty || 0;
          const availability = el.availability;
          const info = { sku, price, qty, availability };
          if (brand === 'Jrone') {
            jrone.push(info);
          } else {
            sl.push(info);
          }
        });
      }
    });
    if (sl.length > 0) {
      it.sl = getUniqObjByKey(sl, 'sku');
    }
    if (jrone.length > 0) {
      it.jrone = getUniqObjByKey(jrone, 'sku');
    }
  });
  console.log(itemsPrimeturbo.length);
  await saveToJson('', 'tempturbo', itemsPrimeturbo);
}

// await findItems();

async function temp() {
  const items = await parseJSONFile('chraPrimeturbo');
  console.log(items.length);

  for (let idx = 0; idx < items.length; idx++) {
    // for (let idx = 0; idx < 2; idx++) {
    const item = items[idx];
    const codesAnalog = item.analogCodes;
    const sl = [];
    const jrone = [];
    const lastyIdx = codesAnalog.length > 7 ? 7 : codesAnalog.length;
    for (let idxAnalog = 0; idxAnalog < lastyIdx; idxAnalog++) {
      // for (let idxAnalog = 0; idxAnalog < 1; idxAnalog++) {
      const code = codesAnalog[idxAnalog];
      try {
        const { data } = await axios.get(
          `https://master.shop/search?query=${code}&filters=nom_cat:10`
        );

        const { document } = new JSDOM(data).window;
        const itemsDonor = [
          ...document.querySelectorAll('.product_tile_wrap>.tile_item_wrap>.tile_element'),
        ]
          .map(el => {
            const brand = el
              .querySelector('span.tile_shop_name')
              .textContent.replace(/[(,)]/g, '')
              .trim();
            if (brand.toLowerCase() !== 'jrone' && brand.toLowerCase() !== 'slturbo') {
              return '';
            }
            const sku = el.querySelector('span.article').textContent.trim();
            const link = el.querySelector('.tile_cart_img .tile_link').href;
            const availability = el
              .querySelector('.tile_availability>span:first-child')
              ?.textContent?.trim();
            const qty = el.querySelector('.quantity_good_row')?.textContent?.trim() || 0;
            return { link, sku, brand, availability, qty };
          })
          .filter(el => el !== '');
        itemsDonor.forEach(it => {
          const brand = it.brand;
          if (brand === 'Jrone') {
            jrone.push(it);
          } else {
            sl.push(it);
          }
        });
        await delay(1000);
      } catch (error) {
        console.log('request error', error);
      }
    }
    if (sl.length > 0) {
      item.sl = getUniqObjByKey(sl, 'sku');
    }
    if (jrone.length > 0) {
      item.jrone = getUniqObjByKey(jrone, 'sku');
    }
    console.log(idx);
    await delay(3000);
  }
  await saveToJson('', 'charTe', items);
}
// await temp();

async function temp2() {
  const notFined = [];
  const masterShop = await parseJSONFile('./mastershop/charMastershop');
  const primeTurbo = await parseJSONFile('chraPrimeturbo');
  primeTurbo.forEach(item => {
    const { jrone, sl, sku } = item;
    if (jrone) {
      jrone.forEach(el => {
        const isFined = masterShop.find(it => it.link === el.link);
        if (isFined) {
          const { price, qty, availability } = isFined;
          el.price = price || 'not price';
          el.qty = qty || 0;
          el.availability = availability || 'not avail';
        } else {
          el.price = el.qty == 0 ? 0 : 'ABRA';
        }
        delete el.brand;
      });
    }
    if (sl) {
      sl.forEach(el => {
        const isFined = masterShop.find(it => it.link === el.link);
        if (isFined) {
          const { price, qty, availability } = isFined;
          el.price = price || 'not price';
          el.qty = qty || 0;
          el.availability = availability || 'not avail';
        } else {
          el.price = el.qty == 0 ? 0 : 'ABRA';
        }
        delete el.brand;
      });
    }
  });
  console.log(notFined.length);
  // await saveToJson('', 'notFined', notFined);
  await saveToJson('', 'charPrime', primeTurbo);
}
// await temp2();

async function temp3() {
  const results = [];
  // const items = await parseJSONFile('turboPrimeturbo');
  const items = await parseJSONFile('chraPrimeturbo');
  for (let idx = 0; idx < items.length; idx++) {
    // for (let idx = 0; idx < 2; idx++) {
    const item = items[idx];
    const { sl, jrone, ee, sku, analogCodes,price } = item;
    const maxLength = Math.max(sl?.length ?? 0, jrone?.length ?? 0, ee?.length ?? 0);
    if (maxLength === 0) {
      results.push({
        sku,
        analogCodes,
        price,
        'jrone.sku': '',
        'jrone.availability': '',
        'jrone.qty': '',
        'jrone.price': '',
        'sl.sku': '',
        'sl.availability': '',
        'sl.qty': '',
        'sl.price': '',
        'ee.sku': '',
        'ee.qty': '',
        'ee.price': '',
      });
    }
    for (let i = 0; i < maxLength; i++) {
      const slIt = sl?.[i] || {
        sku: '',
        availability: '',
        qty: '',
        price: '',
      };
      const jrIt = jrone?.[i] || {
        sku: '',
        availability: '',
        qty: '',
        price: '',
      };
      const eeIt = ee?.[i] || { sku: '', qty: '', price: '' };
      const obj = {
        sku,
        analogCodes,price,
        'jrone.sku': jrIt.sku,
        'jrone.availability': jrIt.availability,
        'jrone.qty': jrIt.qty,
        'jrone.price': jrIt.price,
        'sl.sku': slIt.sku,
        'sl.availability': slIt.availability,
        'sl.qty': slIt.qty,
        'sl.price': slIt.price,
        'ee.sku': eeIt.sku,
        'ee.qty': eeIt.qty,
        'ee.price': eeIt.price,
      };
      results.push(obj);
    }
  }
  // await saveToJson('', 'turboPrime', results);
  await saveToJson('', 'chraPrime', results);
}
await temp3();

function getUniqObjByKey(array, key) {
  const seen = new Set();
  return array.filter(item => {
    const keyValue = item[key];
    if (!seen.has(keyValue)) {
      seen.add(keyValue);
      return true;
    }
    return false;
  });
}

const CATEGORY_ID = 8;
async function getTurboGroup() {
  const products = await parseJSONFile('chraPrimeturbo');
  console.log(products.length);
  // for (let idx = 0; idx < products.length; idx++) {
  for (let idx = 368; idx < products.length; idx++) {
    // for (let idx = 0; idx < 3; idx++) {
    const product = products[idx];
    const { analogCodes } = product;
    const ee = [];
    const lastyIdx = analogCodes.length > 7 ? 7 : analogCodes.length;
    let idxAnalog = 0;
    while (idxAnalog < lastyIdx) {
      const code = analogCodes[idxAnalog];
      try {
        const {
          data: {
            payload: { categories },
          },
        } = await axios.get(`https://api.turbogroup.com.ua/api/v1/search/full?search=${code}`, {
          headers: {
            accept: 'application/json, text/plain, */*',
            'accept-language': 'ru',
            authorization: 'Bearer 17469|IqAMqo6p2CuIcx0YCc6g8bQq7Cz6TloBqiqS5VGm',
            'cache-control': 'no-cache',
            pragma: 'no-cache',
            priority: 'u=1, i',
            'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'x-xsrf-token':
              'eyJpdiI6InpiMVczU0xWNTJsTnRSTzJiSDF5T0E9PSIsInZhbHVlIjoiNzJGYUlTTDRTRGxrU1NwaitjbEI2OSt1QXAxakpiNHJ0NXNzZGIxTTJ3bHB0akFEZm1JMTVjdXUvcE9Zb0tYdXQ4SmJHZ0lDUnBJSkRqVlNjMVR1aDRSYXFscVNIdWRkVWZ5T1pLbGphRFZSRTVHUXg1R1drby9BaTJNU0NvaWIiLCJtYWMiOiJhNmUyZDE1ZmU0MjVhNjllZGMzMzQ1OTkyNTM0OWRjZjU5YTdhYzYzMWQ1ZGRhOTViYzMyYjk4MGM1ODU3MjI2IiwidGFnIjoiIn0=',
            cookie:
              'XSRF-TOKEN=eyJpdiI6InpiMVczU0xWNTJsTnRSTzJiSDF5T0E9PSIsInZhbHVlIjoiNzJGYUlTTDRTRGxrU1NwaitjbEI2OSt1QXAxakpiNHJ0NXNzZGIxTTJ3bHB0akFEZm1JMTVjdXUvcE9Zb0tYdXQ4SmJHZ0lDUnBJSkRqVlNjMVR1aDRSYXFscVNIdWRkVWZ5T1pLbGphRFZSRTVHUXg1R1drby9BaTJNU0NvaWIiLCJtYWMiOiJhNmUyZDE1ZmU0MjVhNjllZGMzMzQ1OTkyNTM0OWRjZjU5YTdhYzYzMWQ1ZGRhOTViYzMyYjk4MGM1ODU3MjI2IiwidGFnIjoiIn0%3D; turbogroup_session=eyJpdiI6InRlME9EVGNhM1pHQk5RRGdubXltcHc9PSIsInZhbHVlIjoiSlMyTGozVXJEUHc5SWtFV3NwMVZISTRFaGd0OWhHQVRTdEhyRkdkdldhb0NVMGkya2RaZUtKWFI0Mk5NUVhwV3NGYnYwUEpEK3E1UFZ3YW42TFVGZEcwZ2dWbW9pb3AyT2drTndNUkhBcENmaEh2eklSOXgxblVzQkt2bGxNbGYiLCJtYWMiOiI5NjA1ZDg0ZDUyMGVlNzlkNjYyNDgwNGI2ZGMzNWI3YmIyMTdhM2Y2N2Y2NDc3NmMzNTI5MDgzOTFkOGNhN2IyIiwidGFnIjoiIn0%3D',
            Referer: 'https://turbogroup.com.ua/',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
          },
          body: null,
          method: 'GET',
        });
        const categoryFiltered = categories.find(el => el.category_id == CATEGORY_ID)?.products;
        if (categoryFiltered) {
          const productsFiltered = categoryFiltered.filter(
            el => el.manufacturer?.toLowerCase()?.trim() === 'e&e' && el.product_type_id === 1
          );
          if (productsFiltered.length > 0) {
            productsFiltered.forEach(it => {
              const link = `https://turbogroup.com.ua/product/${it.slug}?search=${code}`;
              const sku = it.name;
              const price = it.price ?? '';
              const qty = it.amount.total_amount;
              const obj = { link, sku, qty, price };
              ee.push(obj);
            });
          }
        }
        await delay(3000);
        idxAnalog++;
      } catch (error) {
        console.log('code request ERROR', error);
      }
    }
    const uniqItems = getUniqObjByKey(ee, 'sku');
    if (uniqItems.length > 0) {
      products[idx].ee = uniqItems;
    }
    await delay(4000);
    console.log(idx);
    await saveToJson('', 'charEE_', products);
    if ((idx + 1) % 10 === 0) {
      await delay(12000);
    }
  }
}

// await getTurboGroup();

async function tem() {
  const prods = await parseJSONFile('turboPrimeturbo');
  // const prods = await parseJSONFile('chraPrimeturbo');
  const jrInfo = await parseJSONFile('jrone');
  prods.forEach(el => {
    const { jrone} = el;
    if (jrone) {
      jrone.forEach(it=>{
        const{ sku, qty, price}=it
        const isFined=jrInfo.find(e=>e.sku===sku)
        if (isFined) {
          const normalizeQty=Number(String(qty).replace(/>/g,''))
          const normalizePrice=Number(price)
          const normalizeQtyJr=Number(isFined.qty)
          const normalizePriceJr=Number(isFined.price)
          it.qty=normalizeQty + normalizeQtyJr
          it.price= normalizePrice>normalizePriceJr||normalizePrice===0 ? normalizePriceJr : normalizePrice
        }
      })
    }
  });
  await saveToJson('','more3', prods)
}

// await tem();


// await tem2();

async function tem2() {
  let counter=0
  const prods = await parseJSONFile('chraPrimeturbo');
  const prodsPrice = await parseJSONFile('prime');
  // const prods = await parseJSONFile('chraPrimeturbo');
  prods.forEach(el => {
    const { sku} = el;
    const isFined=prodsPrice.find(el=>el.sku.trim()===sku)
    if (isFined) {
      if (isFined.price!=='-') {
        el.price=+isFined.price.toFixed(2)
      } else {
        
        el.price='-'
      }
      counter++
    }
  });
  console.log(counter)
  await saveToJson('','char', prods)
}

