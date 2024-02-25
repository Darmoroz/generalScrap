import fs from 'fs';
import chalk from 'chalk';

// constName,
export async function saveToJs(path, fileName, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(
      `${path}${fileName}.js`,
      `export const ${fileName} = ${JSON.stringify(data, null, 4)};`,
      // `${JSON.stringify(data, null, 4)};`,
      err => {
        if (err) {
          return reject(err);
        }
        console.log(`File was saved successfully: ${chalk.green(`${path}${fileName}.js`)}`);
        resolve();
      }
    );
  });
}
