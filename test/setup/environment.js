"use strict";

var fs = require('fs');
var chai = require('chai');
var proxyquire = require('proxyquire');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var _ = require('lodash');

var env = {};
env.sb = sinon.sandbox.create();
env.stubs = sinon.sandbox.create();
env.stubs.writeFile = sinon.spy((filePath, data, callback) => _.defer(callback));
env.stubs.dirname = sinon.spy((filePath) => filePath);
env.stubs.mkdirp = sinon.spy((filePath, callback) => _.defer(callback));

var utilsStubs = {
  fs: { writeFile: env.stubs.writeFile },
  path: { dirname: env.stubs.dirname },
  mkdirp: env.stubs.mkdirp
};

chai.use(sinonChai);

require.extensions['.txt'] = function (module, filename) {
  module.exports = fs.readFileSync(filename, 'utf8');
};

afterEach(function() {
  env.stubs.reset();
  env.sb.reset();
  env.sb.restore();
});

// Expose globals
global.expect = chai.expect;
global.proxyquire = proxyquire;
global.utilsStubs = utilsStubs;
global.sinon = sinon;
global._ = _;
global.env = env;
global.root = '../../src'

