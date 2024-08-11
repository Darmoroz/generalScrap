export function convertToCsvFull(inArr) {
  const uniqKeysTotal = new Set();

  inArr.forEach(el => {
    el.imgCatalog = el.imgCatalog.join(';');
    const keys = Object.keys(el);
    keys.forEach(key => {
      if (!uniqKeysTotal.has(key)) {
        uniqKeysTotal.add(key);
      }
    });
  });
  const header = [...uniqKeysTotal].join(',');

  inArr.forEach(el => {
    [...uniqKeysTotal].forEach(key => {
      if (!(key in el)) {
        el[key] = '';
      }
    });
  });
  const rows = inArr.map(obj => [...uniqKeysTotal].map(key => `"${obj[key]}"`).join(','));

  return `\uFEFF${header}\n${rows.join('\n')}`;
}
