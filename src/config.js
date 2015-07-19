module.exports = {
  provider: 'Fontdeck.com',
  outputLocation:  'data/dist/fonts.json',
  fontList: {
    baseURL: 'http://fontdeck.com/typefaces/all/{n}?order=oldest',
    batchSize: 10,
    cacheLocation: 'data/src/font-list.json'
  },
  fontData: {
    batchSize: 5,
    cacheLocation: 'data/src/',
    baseURL: 'http://fontdeck.com',
    additionalSources: {
      search: '/quicksearch_xhr?q={name}'
    }
  },
  smear: {
    delay: 7000,
    skew: 30
  }
};
