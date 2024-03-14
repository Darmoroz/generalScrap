import { normalizeStr } from '../../commonUtils/normalizeStr.js';

export function extractTitle(inputStr) {
  const indexOfParenthesis = inputStr.indexOf('(');

  const resultSubstring =
    indexOfParenthesis !== -1 ? inputStr.substring(0, indexOfParenthesis) : inputStr;

  return normalizeStr(resultSubstring.replace('Addon', ''));
}

export function getPositionByText(arr) {
  let featuresPosition = null;
  let installPosition = null;
  let screenPosition = null;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]?.textContent === 'Features:') {
      featuresPosition = i;
    }
    if (arr[i]?.textContent === 'Screenshots:') {
      screenPosition = i;
    }
    if (arr[i]?.textContent === 'How to install:') {
      installPosition = i;
    }
  }
  if (featuresPosition === null) {
    featuresPosition = screenPosition;
  }
  return [featuresPosition, installPosition];
}

export function getHowToUse(arr, id) {
  const result = [];
  let imgCount = 1;
  let item = {};
  for (let idx = 0; idx < arr.length; idx++) {
    const htmlEl = arr[idx];

    if (htmlEl.nodeName === 'H3' || htmlEl.nodeName === 'H4') {
      item.description = normalizeStr(htmlEl?.textContent);
      result.push(item);
      item = {};
      continue;
    }

    if (htmlEl.firstChild?.nodeName === 'IMG') {
      item.image = `images/instructions/id${id}_${imgCount}_instr.jpg`;
      item.imageSrc = htmlEl.firstChild.dataset.src;
      imgCount++;
      result.push(item);
      item = {};
      continue;
    } else {
      if (isStrongPresent(htmlEl)) {
        item.description = normalizeStr(htmlEl?.textContent);
        continue;
      } else {
        item.instruction = normalizeStr(htmlEl?.textContent);
        const nextEl = arr[idx + 1];
        if (nextEl?.firstChild?.nodeName === 'IMG') {
          item.image = `images/instructions/id${id}_${imgCount}instr.jpg`;
          item.imageSrc = nextEl.firstChild.dataset.src;
          imgCount++;
          result.push(item);
          item = {};
          idx += 1;
          continue;
        } else {
          result.push(item);
          item = {};
          continue;
        }
      }
    }
  }
  return result;
}

function isStrongPresent(element) {
  if (element.nodeName === 'STRONG') {
    return true;
  }
  for (let i = 0; i < element.children.length; i++) {
    if (isStrongPresent(element.children[i])) {
      return true;
    }
  }
  return false;
}
