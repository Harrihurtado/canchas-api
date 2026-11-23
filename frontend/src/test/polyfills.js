// jsdom no trae TextEncoder/TextDecoder y React Router 7 los necesita
const { TextEncoder, TextDecoder } = require('node:util');

Object.assign(globalThis, { TextEncoder, TextDecoder });
