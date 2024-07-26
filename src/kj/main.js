import axios from 'axios';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

import { parseJSONFile } from '../commonUtils/parseJSONFile.js';
import { getFilesPath } from '../commonUtils/getFilesPath.js';
import { saveToJson } from '../commonUtils/saveToJson.js';
import { saveImg } from '../commonUtils/saveImg.js';
import { getUniqObjByKey } from '../commonUtils/getUniqObjByKey.js';
import { COMMON, SPECIFIC } from './initData.js';

const initFileName = 'workData/kjData';
const pdfDirectoryRel = 'workData/pdf/';
const jsonDirectoryRel = 'workData/json/';

async function getItemInfo(initFile) {
  const results = [];
  try {
    const items = await parseJSONFile(initFile);
    let idx = 0;
    while (idx < items.length) {
      // while (idx < 1) {
      const item = items[idx];
      const link = item.link;
      const { data } = await axios.get(link);
      const { document } = new JSDOM(data).window;
      const title = document.querySelector('h1')?.textContent.trim();
      const desc =
        'Ensure Uninterrupted Power: With the KJ Power Diesel Generator, We Are Ready for Any Moment, Any Situation!\nMany industries that rely on electrical sources require an uninterrupted power supply. This is where the KJ Power Diesel Generator comes into play, standing out as a high-quality product designed to ensure optimal performance in case of any sudden power outage.';
      const weigth = document
        .querySelector('.row.gy-4>div:last-child hr + div')
        ?.textContent.trim();
      const specTech = [...document.querySelectorAll('#pills-technical tbody tr')]
        .filter(it => it.classList.length === 0)
        .reduce((acc, curr) => {
          const allTr = [...curr.querySelectorAll('td')].map(it => it.textContent.trim());
          const spec = { title: allTr[0], unit: allTr[1], values: allTr[2] };
          acc.push(spec);
          return acc;
        }, []);
      const desc1 = [...document.querySelectorAll('#pills-optional tbody td')]
        .map(it => `- ${it?.textContent}`)
        .join('\n');
      const optionalDesc = `Optional Specifications\n${desc1}`;
      const images = ['https://www.kj.com.tr/assets/img/product-demo.png'];
      const dimensionImgs = [...document.querySelectorAll('#pills-dimensions tbody img')].map(
        it => it.src
      );
      images.push(...dimensionImgs);
      const pdfDataSheetLink = [...document.querySelectorAll('#pills-documents hr +div>a')].filter(
        it => it?.textContent.trim() === 'English'
      )?.[0]?.href;
      specTech.push({ title: 'Weigth', unit: '(kg)', values: weigth?.replace(' kg', '') });
      results.push({ ...item, title, optionalDesc, pdfDataSheetLink, images, specTech });
      idx++;
      console.log('idx', idx, 'of', items.length);
      console.log(link);
    }
    await saveToJson('', initFile, results);
  } catch (error) {
    console.log(error);
  }
}

// getItemInfo(initFileName);

async function getPdfFilies(initJson) {
  const items = await parseJSONFile(initJson);
  const folderName = 'workData/pdf/';
  let errorCount = 0;
  let totalPdfs = 0;
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName);
  }
  for (let idx = 0; idx < items.length; idx++) {
    // for (let idx = 0; idx < 1; idx++) {
    const item = items[idx];
    const { pdfDataSheetLink, name } = item;
    const pdfFileName = `${name}.pdf`;
    const filePath = folderName + pdfFileName;
    try {
      await saveImg(pdfDataSheetLink, filePath);
      totalPdfs++;
    } catch (error) {
      errorCount++;
    }
    console.log(idx);
  }
  console.log('errorCount', errorCount);
  console.log('totalImgs', totalPdfs);
  console.log(items.length);
}
// getPdfFilies(initFileName);

async function parsePdfFiles(pdfDirRel, jsonDataFileRel, jsonDirRel) {
  const files = await getFilesPath(pdfDirRel);
  const products = await parseJSONFile(jsonDataFileRel);
  let idxFiles = 0;
  while (idxFiles < files.length) {
    const filePathAbs = files[idxFiles];
    const baseName = path.basename(filePathAbs, '.pdf');
    try {
      const textArr = await parsePDF(filePathAbs);
      const results = [];
      const stroke = [];
      textArr.forEach(el => {
        stroke.push(el);
        const { hasEOL } = el;
        if (hasEOL) {
          results.push([...stroke]);
          stroke.length = 0;
        }
      });
      console.log(results.length);
      try {
        await saveToJson(jsonDirRel, baseName, results);
      } catch (error) {
        console.log('save error');
      }
      idxFiles++;
    } catch (error) {
      console.log('Error parsing PDF:', idxFiles, baseName);
    }
  }
}

async function parsePDF(pdfPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const pdfDocument = await getDocument({ data }).promise;

  let fullText = '';
  const pageNum = 5;

  const page = await pdfDocument.getPage(pageNum);
  const textContent = await page.getTextContent();
  const pageText = textContent.items.map(item => item.str).join('-');
  fullText += pageText + '\n';

  return textContent.items;
}
// await parsePdfFiles(pdfDirectoryRel, initFileName, jsonDirectoryRel);

async function getContentFromPdfFiles(jsonDirRel) {
  const files = await getFilesPath(jsonDirRel);

  let idxFiles = 0;
  while (idxFiles < files.length) {
    const filePathAbs = files[idxFiles];
    const baseName = path.basename(filePathAbs, '.json');
    try {
      const strokes = await parseJSONFile(filePathAbs.replace('.json', ''));
      const results = [];
      //     const stroke = [];
      strokes.forEach(stroke => {
        let str = '';
        stroke.forEach(el => {
          str += el.str;
        });
        if (
          str !== 'DIESEL GENERATOR SET' &&
          str !== 'ENGINE SPECIFICATIONS ALTERNATOR SPECIFICATIONS' &&
          str !== 'GENSET CONTROLLER' &&
          str !== '' &&
          str !== '5 kj.com.tr ENERGY | EFFICIENCY | EXPERTISE'
        ) {
          if (str === 'Optimized') {
            const lastElIdx = results.length - 1;
            results[lastElIdx] += `; ${str}`;
          } else {
            if (str.includes('|')) {
              str = str.split('|')[0].trim();
            }
            if (str.includes('@ 75% Load (l/h)') || str.includes('@ 50% Load (l/h)')) {
              str = `Fuel Consumption ${str}`;
            }
            if (str === 'Model D-500 MK3') {
              str = 'Model Controller D-500 MK3';
            }
            results.push(str);
          }
        }
      });

      try {
        await saveToJson('temp/', baseName, results);
      } catch (error) {
        console.log('save error');
      }
      idxFiles++;
    } catch (error) {
      console.log('Error parsing JSON:', idxFiles, baseName, error);
    }
  }
}

// getContentFromPdfFiles(jsonDirectoryRel);

async function convertSpecToObj(jsonDirRel, jsonProductsFileRel) {
  const files = await getFilesPath(jsonDirRel);
  const products = await parseJSONFile(jsonProductsFileRel);
  let idxFiles = 0;
  const results = [];
  while (idxFiles < files.length) {
    // while (idxFiles < 1) {
    const filePathAbs = files[idxFiles];
    const baseName = path.basename(filePathAbs, '.json');
    const specs = [];
    const prodSpecs = await parseJSONFile(filePathAbs.replace('.json', ''));
    prodSpecs.forEach((item, idx) => {
      if (idx === 0) {
        return;
      }
      const spec = parseSpecLine(item, idx);
      specs.push(spec);
    });
    const finedProd = products.find(it => it.name === baseName);
    const { desc, specTech } = finedProd;
    finedProd.desc = `Ensure Uninterrupted Power: With the KJ Power Diesel Generator, We Are Ready for Any Moment, Any Situation!\nMany industries that rely on electrical sources require an uninterrupted power supply. This is where the KJ Power Diesel Generator comes into play, standing out as a high-quality product designed to ensure optimal performance in case of any sudden power outage.\n${desc}`;
    const uniqSpec = getUniqObjByKey([...specTech, ...specs], 'key').filter(
      it => it.key !== 'Model' && it.key !== 'Steady State Voltage Regulation (Max)'
    );
    finedProd.specTech = uniqSpec;
    results.push(finedProd);
    idxFiles++;
  }
  console.log(results.length);
  try {
    await saveToJson('temp/', 'total', results);
  } catch (error) {
    console.log('save error');
  }
}

// convertSpecToObj(jsonDirectoryRel, initFileName);

function parseSpecLine(line, idx) {
  let key = null;
  let unit = null;
  let values = null;
  if (line.includes('Model Engine')) {
    key = 'Model Engine';
    unit = '';
    values = line.replace('Model Engine', '').trim();
  }
  if (line.includes('Speed (rpm)')) {
    key = 'Speed';
    unit = '(rpm)';
    values = line.replace('Speed (rpm)', '').trim();
  }
  if (line.includes('Prime Power, net')) {
    key = 'Prime Power, net';
    unit = '(kWm)';
    values = line.replace('Prime Power, net (kWm)', '').trim();
  }
  if (line.includes('Standby Power, net')) {
    key = 'Standby Power, net';
    unit = '(kWm)';
    values = line.replace('Standby Power, net (kWm)', '').trim();
  }
  if (line.includes('Cycle')) {
    key = 'Cycle';
    unit = '';
    values = line.replace('Cycle', '').trim();
  }
  if (line.includes('Emission Standard')) {
    key = 'Emission Standard';
    unit = '';
    values = line.replace('Emission Standard', '').trim();
  }
  if (line.includes('Injection System')) {
    key = 'Injection System';
    unit = '';
    values = line.replace('Injection System', '').trim();
  }
  if (line.includes('Governor')) {
    key = 'Governor';
    unit = '';
    values = line.replace('Governor', '').trim();
  }
  if (line.includes('Intake Air Aspiration & Configuration')) {
    key = 'Intake Air Aspiration & Configuration';
    unit = '';
    values = line.replace('Intake Air Aspiration & Configuration', '').trim();
  }
  if (line.includes('Number Of Cylinder')) {
    key = 'Number Of Cylinder';
    unit = '';
    values = line.replace('Number Of Cylinder', '').trim();
  }
  if (line.includes('Bore x Stroke')) {
    key = 'Bore x Stroke';
    unit = '';
    values = line.replace('Bore x Stroke (mm)', '').trim();
  }
  if (line.includes('Displacement')) {
    key = 'Displacement';
    unit = '(l)';
    values = line.replace('Displacement (l)', '').trim();
  }
  if (line.includes('Fuel Consumption @ 100% Load')) {
    key = 'Fuel Consumption @ 100% Load';
    unit = '(l/h)';
    values = line.replace('Fuel Consumption @ 100% Load (l/h)', '').trim();
  }
  if (line.includes('Fuel Consumption @ 75% Load')) {
    key = 'Fuel Consumption @ 75% Load';
    unit = '(l/h)';
    values = line.replace('Fuel Consumption @ 75% Load (l/h)', '').trim();
  }
  if (line.includes('Fuel Consumption @ 50% Load')) {
    key = 'Fuel Consumption @ 50% Load';
    unit = '(l/h)';
    values = line.replace('Fuel Consumption @ 50% Load (l/h)', '').trim();
  }
  if (line.includes('Starting System')) {
    key = 'Starting System';
    unit = '(VDC)';
    values = line.replace('Starting System (VDC)', '').trim();
  }
  if (line.includes('Cooling System')) {
    key = 'Cooling System';
    unit = '';
    values = line.replace('Cooling System', '').trim();
  }
  if (line.includes('Coolant Capacity')) {
    key = 'Coolant Capacity';
    unit = '(l)';
    values = line.replace('Coolant Capacity (l)', '').trim();
  }
  if (line.includes('Lube Oil Capacity')) {
    key = 'Lube Oil Capacity';
    unit = '(l)';
    values = line.replace('Lube Oil Capacity (l)', '').trim();
  }
  if (line.includes('Prime Power (kVA)')) {
    key = 'Prime Power';
    unit = '(kVA)';
    values = line.replace('Prime Power (kVA)', '').trim();
  }
  if (line.includes('Standby Power (kVA)')) {
    key = 'Standby Power';
    unit = '(kVA)';
    values = line.replace('Standby Power (kVA)', '').trim();
  }
  if (line.includes('Poles')) {
    key = 'Poles';
    unit = '';
    values = line.replace('Poles', '').trim();
  }
  if (line.includes('Number Of Phase')) {
    key = 'Number Of Phase';
    unit = '';
    values = line.replace('Number Of Phase', '').trim();
  }
  if (line.includes('Number Of Bearing')) {
    key = 'Number Of Bearing';
    unit = '';
    values = line.replace('Number Of Bearing', '').trim();
  }
  if (line.includes('Insulation Class')) {
    key = 'Insulation Class';
    unit = '';
    values = line.replace('Insulation Class', '').trim();
  }
  if (line.includes('Number Of Wires')) {
    key = 'Number Of Wires';
    unit = '';
    values = line.replace('Number Of Wires', '').trim();
  }
  if (line.includes('Winding Pitch')) {
    key = 'Winding Pitch';
    unit = '';
    values = line.replace('Winding Pitch', '').trim();
  }
  if (line.includes('Protection Class')) {
    key = 'Protection Class';
    unit = '';
    values = line.replace('Protection Class', '').trim();
  }
  if (line.includes('Cooling') && idx === 29) {
    key = 'Cooling';
    unit = '';
    values = line.replace('Cooling', '').trim();
  }
  if (line.includes('Voltage Regulator')) {
    key = 'Voltage Regulator';
    unit = '';
    values = line.replace('Voltage Regulator', '').trim();
  }
  if (line.includes('Steady State Voltage Regulation')) {
    key = 'Steady State Voltage Regulation';
    unit = '(%)';
    values = line.replace('Steady State Voltage Regulation (%)', '').trim();
  }
  if (line.includes('THD (No Load)')) {
    key = 'THD (No Load)';
    unit = '(%)';
    values = line.replace('THD (No Load) (%)', '').trim();
  }
  if (line.includes('THD (Linear Load)')) {
    key = 'THD (Linear Load)';
    unit = '(%)';
    values = line.replace('THD (Linear Load) (%)', '').trim();
  }
  if (line.includes('Excitation')) {
    key = 'Excitation';
    unit = '';
    values = line.replace('Excitation', '').trim();
  }
  if (line.includes('Controller') && idx === 35) {
    key = 'Controller';
    unit = '';
    values = line.replace('Controller', '').trim();
  }
  if (line.includes('Model Controller')) {
    key = 'Model Controller';
    unit = '';
    values = line.replace('Model Controller', '').trim();
  }

  return { key, unit, values };
}

async function createImportFiles(jsonDataFile) {
  const items = await parseJSONFile(jsonDataFile);
  let idxItems = 0;
  const commonResults = [];
  const specificResults = [];
   while (idxItems<items.length) {
  // while (idxItems < 1) {
    const item = items[idxItems];
    const { name, title, brand, link, desc, images, specTech } = item;
    const commonProd = { ...COMMON };
    const specificProd = { ...SPECIFIC };
    commonProd['Артикул'] = name;
    commonProd['Родительский артикул'] = name;
    commonProd['Артикул модели'] = name;
    specificProd['Артикул'] = name;
    commonProd['Название модификации (UA)'] = title;
    commonProd['Название модификации (RU)'] = title.replace('Дизельний', 'Дизельный');
    commonProd['Название (UA)'] = title;
    commonProd['Название (RU)'] = title.replace('Дизельний', 'Дизельный');
    specificProd['Название(UA)'] = title;
    specificProd['Название(RU)'] = title.replace('Дизельний', 'Дизельный');
    commonProd['Бренд'] = brand;
    commonProd['Раздел'] = 'Генератор дизельний промисловий';
    commonProd['Цена'] = 1000000;
    commonProd['Фото'] = images.join(';');
    const splitLink = link.split('/');
    const lastElSplitLink = splitLink[splitLink.length - 1];
    commonProd['Алиас'] = lastElSplitLink;
    commonProd['Ссылка'] = `http://shop337134.horoshop.ua/${lastElSplitLink}`;
    commonProd['Описание товара (UA)'] = desc;
    commonProd['Описание товара (RU)'] =
      'Обеспечьте бесперебойное электропитание: с дизельным генератором KJ Power мы готовы к любому моменту и любой ситуации!\nМногие отрасли, использующие электрические источники, требуют бесперебойного электропитания. Именно здесь в игру вступает дизельный генератор KJ Power, выделяющийся как высококачественный продукт, предназначенный для обеспечения оптимальной производительности в случае внезапного отключения электроэнергии.\nСтандартные функции\n- Антивибрационные прокладки\n- Радиатор, установленный на генераторной установке n- Зарядное устройство аккумулятора\n- Генератор переменного тока\n- Модуль управления Datakom D-500 MK3\n- Встроенный топливный бак до 1250 кВА\n- Масло и охлаждающая жидкость\n- Воздушные, масляные и топливные фильтры\n- Группа аккумуляторов и Кабели\n- Водонагреватель кожуха двигателя\n- Стартер\n- Кнопка аварийной остановки\n- Глушитель выхлопных газов промышленного типа\n- Руководство по эксплуатации и техническому обслуживанию\nДополнительные характеристики\n- 3P или 4P Автоматический выключатель защиты генератора\n- 3P или 4-контактная панель автоматической перекачки\n- Водоотделитель\n- Подогреватель масла\n- Нагреватель обмотки генератора\n- Датчики температуры генератора (RTD)\n- Амперметр зарядного тока\n- Автоматический выключатель аккумуляторной батареи\n- Система возбуждения PMG \n- Панель управления с аналоговыми датчиками\n- Установленные или отдельно разработанные системы синхронизации\n- Внешние топливные баки\n- Топливный бак с двойными стенками под основанием или внешнего типа\n- Автоматический насос для перекачки топлива\n- Электрический или ручной масляный бак Дренажный насос\n- Электрические или ручные воздухозаборные и вытяжные жалюзи\n- Нагреватель воздухозаборника\n- Дистанционная система охлаждения\n- Различные варианты напряжения и/или частоты\n- Звукопоглощающий навес модульного типа\n- Звукопоглощающий кожух контейнерного типа Навес';
    const splitDesc = desc.split('\n');
    commonProd['Короткое описание (UA)'] = splitDesc[0];
    commonProd['Короткое описание (RU)'] =
      'Обеспечьте бесперебойное электропитание: с дизельным генератором KJ Power мы готовы к любому моменту и любой ситуации!';

      function findElInArrOfObjs(key) {
        const findObj=specTech.find(el=>el.key===key)
        if (findObj) {
          return findObj.values
        }
        return null
      }
      const primePower=findElInArrOfObjs('Power Prime')
      const standbyPower=findElInArrOfObjs('Power Standby')
      const numOfPhase=findElInArrOfObjs('Number Of Phase')
      const manufactureEngine=findElInArrOfObjs('Brand')
      const modelEngine=findElInArrOfObjs('Model Engine')
      const speedShaft=findElInArrOfObjs('Speed')
      const numOfCylinder=findElInArrOfObjs('Number Of Cylinder')
      const volumeLubeOils=findElInArrOfObjs('Lube Oil Capacity')
      const coolingSystem=findElInArrOfObjs('Cooling System')
      const volumeCoolant=findElInArrOfObjs('Coolant Capacity')
      const outputVoltage=findElInArrOfObjs('Output Voltage')
      const frequency=findElInArrOfObjs('Frequency')
      const fuelConsum100=findElInArrOfObjs('Fuel Consumption @ 100% Load')
      const fuelConsum75=findElInArrOfObjs('Fuel Consumption @ 75% Load')
      const fuelConsum50=findElInArrOfObjs('Fuel Consumption @ 50% Load')
      const controllerBrand=findElInArrOfObjs('Controller')
      const controllerModel=findElInArrOfObjs('Model Controller')
      const weigth=findElInArrOfObjs('Weigth')
    specificProd['Основна потужність (kVa/kW)(UA)']=primePower;
    specificProd['Основна потужність (kVa/kW)(RU)']=primePower;
    specificProd['Резервна потужність (kVa/kW)(UA)']=standbyPower;
    specificProd['Резервна потужність (kVa/kW)(RU)']=standbyPower;
    specificProd['Кількість фаз']=numOfPhase;
    specificProd['Виробник двигуна(UA)']=manufactureEngine;
    specificProd['Виробник двигуна(RU)']=manufactureEngine;
    specificProd['Модель двигуна']=modelEngine;
    specificProd['Частота обертання колінчастого валу (rpm)(UA)']=speedShaft;
    specificProd['Частота обертання колінчастого валу (rpm)(RU)']=speedShaft;
    specificProd['Кількість циліндрів']=numOfCylinder;
    specificProd['Обʼєм системи змащення (l)']=volumeLubeOils;
    specificProd['Система охолодження']=coolingSystem;
    specificProd['Обʼєм охолоджуючої рідини (l)']=volumeCoolant;
    specificProd['Напруга (V)']=outputVoltage;
    specificProd['Частота струму (Hz)']=frequency;
    const amperage=(+primePower.split('/')[0].replace(',','.').trim() * 1000) / (Math.sqrt(3)* +outputVoltage.split('/')[0])
    specificProd['Сила струму (A)']=Math.round(amperage);
    specificProd['Витрата палива при 100% навантаженні (l/h)']=fuelConsum100;
    specificProd['Витрата палива при 75% навантаженні (l/h)']=fuelConsum75;
    specificProd['Витрата палива при 50% навантаженні (l/h)']=fuelConsum50;
    specificProd['Контроллер(UA)']=`${controllerBrand} ${controllerModel}`;
    specificProd['Контроллер(RU)']=`${controllerBrand} ${controllerModel}`;
    specificProd['Вага з захисним кожухом (kg)']=weigth;
console.log(specificProd)
    commonResults.push(commonProd);
    specificResults.push(specificProd);
    idxItems++;
  }
  await saveToJson('','commonKj', commonResults)
  await saveToJson('', 'specificKj', specificResults)
}

createImportFiles(initFileName);


async function temp(initJson) {
  const items = await parseJSONFile(initJson);
  items.forEach(it => {});
  // await saveToJson('', initJson, items);
}
// temp(initFileName)

