import axios from 'axios';
import fs from 'fs';

export async function saveImg(url, path) {
  try {
    const response = await axios({ method: 'get', url, responseType: 'stream' });
    const writer = fs.createWriteStream(path);
    response.data.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    throw new Error();
  }
}