"use strict";

var fs = require('fs');
var path = require('path');
var chai = require('chai');
var proxyquire = require('proxyquire');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var _ = require('lodash');

var rootPath = '../../src';
var env = {};
env.sb = sinon.sandbox.create();
env.stubs = sinon.sandbox.create();
env.stubs.writeFile = sinon.spy((filePath, data, callback) => _.defer(callback));
env.stubs.dirname = sinon.spy((filePath) => filePath);
env.stubs.mkdirp = sinon.spy((filePath, callback) => _.defer(callback));

var ioStubs = {
  fs: { writeFile: env.stubs.writeFile },
  path: { dirname: env.stubs.dirname },
  mkdirp: env.stubs.mkdirp
};

chai.use(sinonChai);

require.extensions['.txt'] = function (module, filename) {
  module.exports = fs.readFileSync(filename, 'utf8');
};

// ---

beforeEach(function() {
  env.proxiedPaths = [];
  env.rootPath = rootPath;
  env.ioStubs = ioStubs;
});

afterEach(function() {
  env.stubs.reset();
  env.sb.reset();
  env.sb.restore();
  env.proxiedPaths.forEach(function(proxiedPath) {
    delete require.cache[proxiedPath];
    delete require.cache[`${path.dirname(proxiedPath)}/index.js`];
  });
});

// Expose globals
global.expect = chai.expect;
global.sinon = sinon;
global._ = _;
global.env = env;
global.proxyquire = (filePath, stub) => {
  var absolutePath = path.resolve(filePath.replace(rootPath, 'src/'));
  env.proxiedPaths.push(`${absolutePath}.js`);
  return proxyquire(filePath, stub);
};
