import fs from 'fs';
import chalk from 'chalk';

export async function saveToJson(path, name, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(`${path}${name}`, JSON.stringify(data, null, 4), err => {
      if (err) {
        return reject(err);
      }
      console.log(`File was saved successfully: ${chalk.green(path + name)}`);
      resolve();
    });
  });
}

