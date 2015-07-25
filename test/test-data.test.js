"use strict";
require('./setup/environment');

// Mocking setup

var fontDataPageFixture = require('./fixtures/font-data-page');
var fontSearchResultFixture = require('./fixtures/font-search-result');

var fontListObjectFixture = require('./fixtures/font-list').slice(0, 2);
var fontDataObjectFixture = require('./fixtures/font-data');
var config = require('../config/fontdeck');

var mockedConfig = _.merge({}, config, {
  fontData: { batchSize: 5 },
  smear: { delay: 0 }
});

var requestStub = function(url, callback) {
  var index = env.stubs.request.callCount;
  var path = url.replace(config.fontData.baseURL, '');
  var response = {
    statusCode: 200,
    req: { path }
  };
  var body = '';

  if (url.includes('typeface/')) {
    let fontSlug = path.replace('/typeface/', '')
    let fontName = fontSlug.charAt(0).toUpperCase() + fontSlug.slice(1);
    body = fontDataPageFixture.generate(index, fontName, fontSlug);
  }

  if (url.includes('quicksearch_xhr?q=')) {
    let query = path.replace('/quicksearch_xhr?q=', '')
    body = fontSearchResultFixture.generate(index, `/typeface/${query.toLowerCase()}`, query);
  }

  _.defer(() => callback(null, response, body));
};

// Test

describe('Font Data Generation Integration Test', function() {
  beforeEach(function() {
    env.stubs.request = sinon.spy(requestStub);

    proxyquire(`${rootPath}/common/utils`, _.extend({
      request: env.stubs.request
    }, utilsStubs));

    env.fontData = proxyquire(`${rootPath}/font-data`, {
      '../../config/fontdeck': mockedConfig
    });
  });

  it('should make requests and parse response to create font data', function(done) {
    env.fontData.retrieve(fontListObjectFixture).done(function(fontObjects) {
      expect(env.stubs.request).to.have.callCount(6);
      fontObjects = _.map(fontObjects, (fontObject) => {
        delete fontObject.generatedAt;
        return _.extend({}, fontObject);
      });
      expect(fontObjects).to.deep.equal(fontDataObjectFixture);
      done();
    });
  });
});
