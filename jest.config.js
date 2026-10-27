module.exports = {
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/tests/setup/env.js'],
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  testTimeout: 30000, // las pruebas de integración hablan con una BD real (Atlas puede tardar)
  clearMocks: true,
  collectCoverageFrom: ['src/**/*.js', '!src/server.js'],
  coverageReporters: ['text', 'text-summary', 'lcov'],
  coverageThreshold: {
    './src/services/': { statements: 70, branches: 70, functions: 70, lines: 70 },
  },
};
