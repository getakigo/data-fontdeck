var Q = require('q');
var config = require('./src/config');
var logger = require('./src/common/logger');
var utils = require('./src/common/utils');
var fontList = require('./src/font-list');
var fontData = require('./src/font-data');

/*
 *  retrieveFontList
 *
 */
var retrieveFontList = function() {
  var deferred = Q.defer();
  logger.start('Retriving list of fonts from ' + config.provider);

  fontList.retrieve()
  .progress(function(notification) {
    switch (notification.type) {
      case 'start-batch':
        logger.batchStart(notification);
        break;
      case 'end-batch':
        logger.batchEnd(notification);
        break;
      case 'delay-batch':
        logger.batchDelay(notification);
        break;
    }
  })
  .done(function(listOfFonts) {
    logger.finish('Found ' + listOfFonts.length + ' fonts in total');
    utils.writeJSON(config.fontList.cacheLocation, listOfFonts).done(function() {
      logger.cacheWritten(config.fontList.cacheLocation);
      deferred.resolve(listOfFonts);
    });
  });

  return deferred.promise;
};

/*
 *  retrieveFontData
 *
 */
var retrieveFontData = function(fonts) {
  var deferred = Q.defer();
  logger.start('Retriving font data for ' + config.provider);

  fontData.retrieve(fonts)
  .progress(function(notification) {
    switch (notification.type) {
      case 'start-batch':
        logger.batchStart(notification);
        break;
      case 'end-batch':
        logger.batchEnd(notification);
        break;
      case 'delay-batch':
        logger.batchDelay(notification);
        break;
      case 'font-data':
        var cacheDirectory = config.fontData.cacheLocation + notification.value.name.toLowerCase()[0];
        var cacheLocation = cacheDirectory + '/' + notification.value.slug + '.json';
        utils.writeJSON(cacheLocation, notification.value).done(function() {
          logger.cacheWritten(cacheLocation);
        });
        break;
    }
  })
  .done(function(fontData) {
    logger.finish();
    deferred.resolve(fontData);
  });

  return deferred.promise;
};

// ---

(function() {
  retrieveFontList().then(function(fonts) {
    logger.spacer();
    return retrieveFontData(fonts);
  }).done(function(fontData) {
    logger.out('Data generation complete, outputting final file...');
    utils.writeJSON(config.outputLocation, fontData).done(function() {
      logger.out('Data saved to ' + config.outputLocation);
    });
  });
})();
