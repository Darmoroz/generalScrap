import { JSDOM } from 'jsdom';
import { normalizeStr } from '../../commonUtils/normalizeStr.js';

export function getDetailInfoItem(data) {
  const { document } = new JSDOM(data).window;

  const nameCitySpecEl = document.querySelector('.seller-detail h1');
  const [name, city, spec] = nameCitySpecEl
    ? nameCitySpecEl.textContent.split('\n').filter(i => i !== '')
    : ['', '', ''];

  const receptionEl = document.querySelector('div.seller-address__title');
  const [reception, address] = receptionEl ? receptionEl.textContent.split('\n\n\n') : ['', ''];

  const viberEl = document.querySelector('a.soc-link-viber');
  const whatsupEl = document.querySelector('a.soc-link-fb .fa-whatsapp');
  // const telegramEl = document.querySelector('a.hdnlnk.soc-listing.soc-link-fb .fa-telegram');

  let phoneNumber = null;
  let telegramNick = null;
  if (viberEl) {
    phoneNumber = viberEl.href.replace('viber://chat?number=', '');
  } else {
    if (whatsupEl) {
      phoneNumber = whatsupEl.parentElement.href.replace('https://wa.me/', '+');
    }
  }
  // if (telegramEl) {
  //   telegramNick = telegramEl.parentElement.href.replace('?utm_source=barb.ua', '');
  // }

  return {
    name: normalizeStr(name),
    city: normalizeStr(city).replace(/[()]/g, ''),
    spec: normalizeStr(spec),
    reception: normalizeStr(reception),
    address: normalizeStr(address),
    phoneNumber,
    // telegram: normalizeStr(telegramNick),
  };
}
