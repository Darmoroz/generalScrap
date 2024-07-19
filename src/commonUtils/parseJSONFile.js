import fs from 'fs';

export async function parseJSONFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(`${filePath}.json`, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      try {
        const jsonData = JSON.parse(data);
        resolve(jsonData);
      } catch (err) {
        reject(err);
      }
    });
  });
}
