module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  moduleNameMapper: { '\\.css$': '<rootDir>/test/style-mock.js', '^@/(.*)$': '<rootDir>/src/$1' },
  clearMocks: true,
};
