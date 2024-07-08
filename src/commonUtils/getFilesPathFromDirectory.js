import fs from 'fs/promises';
import path from 'path';

export async function getFilesPathFromDirectory(dir) {
  const absDirectoryPath = path.resolve(dir);
  try {
    const files = await fs.readdir(absDirectoryPath);
    return files.map(file => path.resolve(absDirectoryPath, file));
  } catch (err) {
    console.error('Error reading directory:', err);
  }
}
