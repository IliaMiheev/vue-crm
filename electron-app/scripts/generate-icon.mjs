import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import toIco from 'to-ico';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const pngPath = path.join(root, 'src', 'it-logo-min.png');
const icoPath = path.join(root, 'src', 'icon.ico');

const png = fs.readFileSync(pngPath);
const ico = await toIco([png]);
fs.writeFileSync(icoPath, ico);
console.log('Generated', path.relative(root, icoPath));
