module.exports = {
  provider: 'Fontdeck.com',
  outputLocation:  'data/dist/fonts.json',
  fontList: {
    baseURL: 'http://fontdeck.com/typefaces/all/{n}?order=oldest',
    batchSize: 10,
    cacheLocation: 'data/src/font-list.json'
  },
  fontData: {
    batchSize: 10,
    cacheLocation: 'data/src/',
    urlPrefix: 'http://fontdeck.com'
  },
  smear: {
    delay: 7000,
    skew: 30
  }
};
