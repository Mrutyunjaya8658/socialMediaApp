import dataURIParser from 'datauri/parser.js';

import path from 'path';

const parser = new dataURIParser();

const getDatauri = (file) => {
    const extName = path.extname(file.originalname).toString();
    return parser.format(extName , file.buffer).content;
}

export default getDatauri;