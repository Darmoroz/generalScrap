export const BASE_URL_RU = 'https://vseplus.com';
export const BASE_URL_UA = 'https://vseplus.com/ua';

export const CATEGORIES = [];

export const FILES_CAT = [

];

export const PRODUCT = {
  product_id: null,
  'name(ru-ru)': null,
  'name(uk-ua)': null,
  categories: null,
  sku: null,
  upc: '',
  ean: '',
  jan: '',
  isbn: '',
  mpn: '',
  location: '',
  quantity: null,
  model: null,
  manufacturer: null,
  image_name: null,
  shipping: 'yes',
  price: null,
  points: 0,
  date_added: '2024-07-25 19:07:12',
  date_modified: '2024-07-25 19:07:12',
  date_available: '2024-07-25 19:07:12',
  weight: 0,
  weight_unit: '',
  length: 0,
  width: 0,
  height: 0,
  length_unit: '',
  status: true,
  tax_class_id: 9,
  'description(ru-ru)': '',
  'description(uk-ua)': '',
  'meta_title(ru-ru)': null,
  'meta_title(uk-ua)': null,
  'meta_description(ru-ru)': '',
  'meta_description(uk-ua)': '',
  'meta_keywords(ru-ru)': '',
  'meta_keywords(uk-ua)': '',
  stock_status_id: 1,
  store_ids: 0,
  layout: '',
  related_ids: '',
  'tags(ru-ru)': '',
  'tags(uk-ua)': '',
  sort_order: 0,
  subtract: true,
  minimum: 1,
};

export const ADD_IMG = {
  product_id: null,
  image: null,
  sort_order: 0,
};

export const ATTRIBUTE = {
  product_id: null,
  attribute_group: null,
  attribute: null,
  'text(ru-ru)': null,
  'text(uk-ua)': null,
};

export const ATTRIBUTES_KEYS_UA = [
  'Колір',
  'Сумісні моделі',
  'Маркування',
  'Ємність',
  'Розмір',
  'Тип',
  'Комплектація',
  'Клас якості',
  'Тип матриці',
  'Бренд',
];
export const ATTRIBUTES_KEYS_RU = [
  'Цвет',
  'Совместимые модели',
  'Маркировка',
  'Емкость',
  'Размер',
  'Тип',
  'Комплектация',
  'Класс качества',
  'Тип матрицы',
  'Бренд',
];


export const UA_TO_RU_ATTR = {
  Колір: 'Цвет',
 Матеріал: 'Материал',
  Напруга: 'Напряжение',
  Гніздо: 'Разъем',
  Довжина: 'Длина',
  'Сумісні моделі': 'Совместимые модели',
  Маркування: 'Маркировка',
  Ємність: 'Емкость',
  Розмір: 'Размер',
  Тип: 'Тип',
  'Бренд пристрою': 'Бренд устройства',
  Комплектація: 'Комплектация',
  'Клас якості': 'Класс качества',
  'Тип матриці': 'Тип матрицы',
};
