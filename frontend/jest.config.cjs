// jest.config.js
module.exports = {
  // 테스트 환경을 브라우저와 유사한 jsdom으로 설정
  testEnvironment: 'jsdom',

  // 각 테스트 파일이 실행되기 전에 실행할 스크립트 파일 지정
  setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.js'],

  // CSS, SASS 등의 파일을 만났을 때 에러가 나지 않도록 모의(mock) 처리
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },

  // .js, .jsx 파일을 babel-jest를 사용해 변환하도록 설정
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
};
