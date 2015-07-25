"use strict";
require('./setup/environment');

// Mocking setup

var fontListPageFixture = require('./fixtures/font-list-page');
var fontListObjectFixture = require('./fixtures/font-list');
var config = require('../config/fontdeck');

var mockedConfig = _.merge({}, config, {
  fontList: { batchSize: 2 },
  smear: { delay: 0 }
});

var requestStub = function(url, callback) {
  var index = env.stubs.request.callCount;
  var response = { statusCode: 200 };
  var body = '';

  if (url.includes('typefaces/all/')) {
    body = fontListPageFixture.generate(index);
  }

  _.defer(() => callback(null, response, body));
};

// Test

describe('Font List Generation Integration Test', function() {
  beforeEach(function() {
    env.stubs.request = sinon.spy(requestStub);

    proxyquire(`${env.rootPath}/common/utils/io`, _.extend({
      request: env.stubs.request
    }, env.ioStubs));

    env.fontList = proxyquire(`${env.rootPath}/font-list`, {
      '../../config/fontdeck': mockedConfig
    });
  });

  it('should make requests and parse response to create a font list', function(done) {
    env.fontList.retrieve().done(function(fontList) {
      expect(env.stubs.request).to.have.callCount(10);
      expect(fontList).to.deep.equal(fontListObjectFixture);
      done();
    });
  });
});
