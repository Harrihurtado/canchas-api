module.exports = {
  testEnvironment: '<rootDir>/support/entorno.js', // marca la prueba que falla para tomar captura
  testMatch: ['<rootDir>/tests/**/*.e2e.test.js'],
  setupFilesAfterEnv: ['<rootDir>/support/capturas.js'],
  testTimeout: 60000, // un navegador real es más lento que jsdom
  maxWorkers: 1,
  verbose: true,
};
