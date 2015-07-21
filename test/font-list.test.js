"use strict";

require('./setup/environment');

var _ = require('lodash');

var fontListPageFixture = require('./fixtures/font-list-page');
var fontListObjectFixture = require('./fixtures/font-list');

var mockedConfig = _.extend({}, require('../config/fontdeck'));
mockedConfig.fontList.batchSize = 2;
mockedConfig.fontData.batchSize = 5;
mockedConfig.smear.delay = 0;

var requestStub = function(url, callback) {
  var index = env.stubs.request.callCount;
  var response = { statusCode: 200 };
  var body = '';

  if (url.includes('typefaces/all/')) {
    body = fontListPageFixture.generate(index);
  }
  callback(null, response, body);
};

env.stubs.writeFile = sinon.spy((filePath, data, callback) => callback());
env.stubs.dirname = sinon.spy((filePath) => filePath);
env.stubs.mkdirp = sinon.spy((filePath, callback) => callback());
env.stubs.request = sinon.spy(requestStub);

var utils = proxyquire(`${root}/common/utils`, {
  fs: { writeFile: env.stubs.writeFile },
  path: { dirname: env.stubs.dirname },
  request: env.stubs.request,
  mkdirp: env.stubs.mkdirp
});

var fontList = proxyquire(`${root}/font-list`, {
  '../../config/fontdeck': mockedConfig
});

describe('Date Retrieval Integration Test', function() {
  it('should make font list requests to create a font list', function(done) {
    fontList.retrieve().done(function(fontList) {
      expect(env.stubs.request).to.have.callCount(10);
      expect(fontList).to.deep.equal(fontListObjectFixture);
      done();
    });
  });
});
