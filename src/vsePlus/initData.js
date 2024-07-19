export const BASE_URL_RU = 'https://vseplus.com';
export const BASE_URL_UA = 'https://vseplus.com/ua';

export const CATEGORIES = [
  'mobilnye-telefony/7-displei',
  'planshety/127-displei',
  'mobilnye-telefony/104-sensornye-stekla',
  'planshety/125-sensornye-stekla',
  'planshety/215-steklo-k-korpusu',
  'mobilnye-telefony/24-akkumulyatory',
  'planshety/128-akkumulyatory',
  'radiodetali-mikroshemy/597-akkumulatory-universalnye',
  function (x) {
    return `search/p-${x}?q=скло`;
  },
  'mobilnye-telefony/79-platy',
  'planshety/126-platy',
  'mobilnye-telefony/17-shleyfy',
  'planshety/123-shleyfy',
  'mobilnye-telefony/346-derzateli-sim-karty',
  'planshety/347-derzateli-sim-karty',
  'mobilnye-telefony/92-razemy-na-zaryadku',
  'planshety/149-razemy-na-zaryadku',
  'mobilnye-telefony/21-kamery',
  'planshety/152-kamery',
  function (x) {
    return `search/p-${x}?q=Задня+кришка`;
  },
  function (x) {
    return `search/p-${x}?q=скло+на+камеру`;
  },
  'mobilnye-telefony/94-knopki-regulirovki-gromkosti',
  'planshety/153-knopki-kamery-i-menyu',
  'mobilnye-telefony/96-zvonki',
  'planshety/135-zvonki', // 135 та 177 в одному файлі
  'planshety/177-zvonki-dinamiki',
  'mobilnye-telefony/18-korpusy/f-p76_15366',
  'planshety/130-korpusy',
  'mobilnye-telefony/18-korpusy/f-p76_15370', // 15370 та  15369 в одному файлі
  'mobilnye-telefony/18-korpusy/f-p76_15369',
  'planshety/174-ramki',
  'mobilnye-telefony/4-antenny', //4 та 89 в одному файлі
  'mobilnye-telefony/89-bolty',
  'planshety/151-antenny', //151 та 176 в одному файлі
  'planshety/176-bolty'
];

export const FILES_CAT = [
  'Запчасти для телефонов>Дисплеи',
  'Запчастини для телефонів>Дисплеї',
  'Запчасти для планшетов>Дисплеи',
  'Запчастини для планшетів>Дисплеї',
  'Запчасти для телефонов>Сенсорное стекло',
  'Запчастини для телефонів>Сенсорне скло',
  'Запчасти для планшетов>Сенсорное стекло',
  'Запчастини для планшетів>Сенсорне скло',
  'Запчасти для планшетов>Корпусное стекло дисплея',
  'Запчастини для планшетів>Корпусне скло дисплея',
  'Запчасти для телефонов>Аккумуляторы',
  'Запчастини для телефонів>Акумулятори',
  'Запчасти для планшетов>Аккумуляторы',
  'Запчастини для планшетів>Акумулятори',
  'Запчасти для планшетов>Универсальные аккумуляторы',
  'Запчастини для планшетів>Універсальні акумулятори',
  'Запчасти для телефонов>Корпусное стекло дисплея',
  'Запчастини для телефонів>Корпусне скло дисплея',
  'Запчасти для телефонов>Нижние платы',
  'Запчастини для телефонів>Нижні плати',
  'Запчасти для планшетов>Нижние платы',
  'Запчастини для планшетів>Нижні плати',
  'Запчасти для телефонов>Шлейфы',
  'Запчастини для телефонів>Шлейфи',
  'Запчасти для планшетов>Шлейфы',
  'Запчастини для планшетів>Шлейфи',
  'Запчасти для телефонов>Слот SIM',
  'Запчастини для телефонів>Слот SIM',
  'Запчасти для планшетов>Слот SIM',
  'Запчастини для планшетів>Слот SIM',
  'Запчасти для телефонов>Разьемы',
  'Запчастини для телефонів>Розʼєми',
  'Запчасти для планшетов>Разьемы',
  'Запчастини для планшетів>Розʼєми',
  'Запчасти для телефонов>Камеры',
  'Запчастини для телефонів>Камери',
  'Запчасти для планшетов>Камеры',
  'Запчастини для планшетів>Камери',
  'Запчасти для телефонов>Задние крышки',
  'Запчастини для телефонів>Задні кришки',
  'Запчасти для телефонов>Стекло камеры',
  'Запчастини для телефонів>Скло камери',
  'Запчасти для телефонов>Кнопки',
  'Запчастини для телефонів>Кнопки',
  'Запчасти для планшетов>Кнопки',
  'Запчастини для планшетів>Кнопки',
  'Запчасти для телефонов>Динамики и микрофоны',
  'Запчастини для телефонів>Динаміки і мікрофони',
  'Запчасти для планшетов>Динамики и микрофоны',
  'Запчастини для планшетів>Динаміки і мікрофони',
  'Запчасти для планшетов>Динамики и микрофоны',
  'Запчастини для планшетів>Динаміки і мікрофони',
  'Запчасти для телефонов>Корпуса',
  'Запчастини для телефонів>Корпуси',
  'Запчасти для планшетов>Корпуса',
  'Запчастини для планшетів>Корпуси',
  'Запчасти для телефонов>Рамки',
  'Запчастини для телефонів>Рамки',
  'Запчасти для телефонов>Рамки',
  'Запчастини для телефонів>Рамки',
  'Запчасти для планшетов>Рамки',
  'Запчастини для планшетів>Рамки',
  'Запчасти для телефонов>Другие детали',
  'Запчастини для телефонів>Інші деталі',
  'Запчасти для телефонов>Другие детали',
  'Запчастини для телефонів>Інші деталі',
  'Запчасти для планшетов>Другие детали',
  'Запчастини для планшетів>Інші деталі',
  'Запчасти для планшетов>Другие детали',
  'Запчастини для планшетів>Інші деталі',
];
