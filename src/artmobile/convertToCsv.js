export function convertToCSV(inArr) {
  const uniqKeysTotal = [];

  inArr.forEach(el => {
    const keys = Object.keys(el);
    keys.forEach(key => {
      const isInclude = uniqKeysTotal.includes(key);
      if (!isInclude) {
        uniqKeysTotal.push(key);
      }
    });
  });
  const header = uniqKeysTotal.join(',');
  
  inArr.forEach(el => {
    uniqKeysTotal.forEach(key => {
      if (!(key in el)) {
        el[key] = '';
      }
    });
  });
  const rows = inArr.map(obj =>
    Object.values(obj)
      .map(value => `"${value}"`)
      .join(',')
  );

  return `\uFEFF${header}\n${rows.join('\n')}`;
}
