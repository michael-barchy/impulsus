const fs = require('node:fs');
const path = require('path');

const controllersDir = path.join('..', '..', 'controllers');
if (!fs.existsSync(controllersDir)) {
    fs.mkdirSync(controllersDir);
}
fs.copyFileSync('jsconfig.json', path.join(controllersDir, 'jsconfig.json'));
fs.copyFileSync('types.js', path.join(controllersDir, 'types.js'));
