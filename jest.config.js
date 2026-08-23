module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '\\.wav$': '<rootDir>/__mocks__/wavStub.js',
  },
};
