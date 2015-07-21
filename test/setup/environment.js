"use strict";

var fs = require('fs');
var chai = require('chai');
var proxyquire = require('proxyquire');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

var env = {};
env.stubs = sinon.sandbox.create();
env.sb = sinon.sandbox.create();

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
global.sinon = sinon;
global.env = env;
global.root = '../../src'

