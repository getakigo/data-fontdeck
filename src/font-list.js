var Q = require('q');
var _ = require('lodash');
var cheerio = require('cheerio');
var request = Q.denodeify(require('request'));
var utils = require('./utils/common');
var config = require('./config');

var listOfFonts = [];
var batchIterations = 0;

/*
 *  requestBatch
 *
 */
var requestBatch = function(deferred) {
  var startPage = batchIterations * config.fontList.batchSize + 1;
  var endPage = startPage + config.fontList.batchSize;

  deferred.notify({ type: 'start-batch', iteration: batchIterations+1, start: startPage, end: endPage-1 });
  var timer = +new Date();

  var requestPromises = _.range(startPage, endPage).map(function(page) {
    return request(config.fontList.baseURL.replace('{n}', page));
  });

  Q.all(requestPromises).done(function(requestResponses) {
    var endOfPages = false;

    requestResponses.forEach(function(requestResponse) {
      var response = requestResponse[0];
      var body = requestResponse[1];

      if (response.statusCode !== 200) {
        return deferred.reject(new Error('Unknown status code', response.statusCode));
      }

      var newFonts = getFontsFromPage(body);
      listOfFonts = listOfFonts.concat(newFonts);
      if (newFonts.length === 0) {
        endOfPages = true;
      }
    });

    deferred.notify({ type: 'end-batch', duration: ((+new Date() - timer) / 1000) });

    if (endOfPages) {
      return deferred.resolve(listOfFonts);
    }

    batchIterations++;

    var smear = utils.getInconsistentSmear();
    deferred.notify({ type: 'delay-batch', smear: (smear / 1000) });
    setTimeout(function() {
      requestBatch(deferred);
    }, smear);
  });
};

/*
 *  getFontsFromPage
 *
 */
var getFontsFromPage = function(body) {
  var $ = cheerio.load(body);
  var fontItems = $('.font-item');
  var listOfFonts = [];

  fontItems.each(function() {
    var fontLink = $(this).find('.font-name a').first();
    var fontName = fontLink.html();

    if (_.isNull(fontName)) {
      return;
    }

    listOfFonts.push({
      name: fontName,
      url: fontLink.attr('href')
    });
  });

  return listOfFonts;
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
