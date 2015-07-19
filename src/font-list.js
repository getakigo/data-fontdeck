var Q = require('q');
var _ = require('lodash');
var cheerio = require('cheerio');
var request = Q.denodeify(require('request'));
var utils = require('./common/utils');
var config = require('./config');

var listOfFonts = [];
var batchIteration = 0;

/*
 *  requestBatch
 *
 */
var requestBatch = function(deferred) {
  var startPage = batchIteration * config.fontList.batchSize + 1;
  var endPage = startPage + config.fontList.batchSize;
  batchIteration++;

  deferred.notify({ type: 'start-batch', iteration: batchIteration, start: startPage, end: endPage-1 });
  var timer = +new Date();

  var requestPromises = _.range(startPage, endPage).map(function(page) {
    return utils.makeRequest(config.fontList.baseURL.replace('{n}', page), getDataFromPage);
  });

  Q.all(requestPromises).done(function(requestResponses) {
    listOfFonts = listOfFonts.concat(_.flatten(requestResponses));
    deferred.notify({ type: 'end-batch', duration: ((+new Date() - timer) / 1000) });

    if (requestResponses[requestResponses.length-1].length === 0) {
      return deferred.resolve(listOfFonts);
    }

    var smear = utils.getInconsistentSmear();
    deferred.notify({ type: 'delay-batch', smear: (smear / 1000) });
    setTimeout(function() {
      requestBatch(deferred);
    }, smear);
  });
};

/*
 *  getDataFromPage
 *
 */
var getDataFromPage = function(response, body) {
  var deferred = Q.defer();
  var $ = cheerio.load(body);

  var fontItems = $('.font-item');
  var fontsOnPage = [];

  fontItems.each(function() {
    var fontLink = $(this).find('.font-name a').first();
    var fontName = fontLink.text();

    if (_.isEmpty(fontName)) {
      return;
    }

    fontsOnPage.push({
      name: fontName,
      url: fontLink.attr('href')
    });
  });

  deferred.resolve(fontsOnPage);

  return deferred.promise;
};

// ---

module.exports = {
  retrieve: function() {
    var deferred = Q.defer();

    _.defer(function() {
      requestBatch(deferred);
    });

    return deferred.promise;
  }
};
