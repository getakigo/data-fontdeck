var fs = require('fs');
var Q = require('q');
var mkdirp = Q.denodeify(require('mkdirp'));
var writeFile = Q.denodeify(fs.writeFile);
var config = require('./src/config');

var fontList = require('./src/font-list');
var fontData = require('./src/font-data');

/*
 *  retrieveFontList
 *
 */
var retrieveFontList = function() {
  var deferred = Q.defer();

  var startTime = new Date();
  console.log('Retriving list of fonts from ' + config.provider);
  console.log('Start time: ' + startTime);
  console.log('---------------------------------------------------\n');

  fontList.retrieve()
  .progress(function(notification) {
    switch (notification.type) {
      case 'start-batch':
        console.log('Requesting batch ' + notification.iteration + ' [' + notification.start + ' - ' + notification.end + '] ...');
        break;
      case 'end-batch':
        console.log('Completed after ' + notification.duration + ' seconds\n');
        break;
      case 'delay-batch':
        console.log('Delaying next batch by ' + notification.smear + ' seconds\n');
        break;
    }
  })
  .done(function(listOfFonts) {
    var endTime = new Date();
    console.log('---------------------------------------------------');
    console.log('End time: ' + endTime);
    console.log('Duration: ' + (endTime - startTime) / 1000 + ' seconds')
    console.log('Found ' + listOfFonts.length + ' fonts in total');
    writeFile(config.fontList.cacheLocation, JSON.stringify(listOfFonts, null, 4)).done(function() {
      console.log('Output cached to ' + config.fontList.cacheLocation);
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

  var startTime = new Date();
  console.log('Retriving font data for ' + config.provider);
  console.log('Start time: ' + startTime);
  console.log('---------------------------------------------------\n');

  fontData.retrieve(fonts)
  .progress(function(notification) {
    switch (notification.type) {
      case 'start-batch':
        console.log('Requesting batch ' + notification.iteration + ' [' + notification.start + ' - ' + notification.end + '] ...');
        break;
      case 'end-batch':
        console.log('Completed after ' + notification.duration + ' seconds\n');
        break;
      case 'delay-batch':
        console.log('Delaying next batch by ' + notification.smear + ' seconds\n');
        break;
      case 'font-data':
        var cacheDirectory = config.fontData.cacheLocation + notification.value.name.toLowerCase()[0];
        var cacheLocation = cacheDirectory + '/' + notification.value.slug + '.json';

        mkdirp(cacheDirectory)
        .then(function() {
          return writeFile(cacheLocation, JSON.stringify(notification.value, null, 4));
        })
        .done(function() {
          console.log('Output cached to ' + cacheLocation);
        });
        break;
    }
  })
  .done(function(fontData) {
    var endTime = new Date();
    console.log('---------------------------------------------------');
    console.log('End time: ' + endTime);
    console.log('Duration: ' + (endTime - startTime) / 1000 + ' seconds')
    deferred.resolve(fontData);
  });

  return deferred.promise;
};

// ---

(function() {
  retrieveFontList().then(function(fonts) {
    console.log('\n');
    return retrieveFontData(fonts);
  }).done(function(fontData) {
    console.log('Data generation complete, outputting final file...');
    writeFile(config.fontList.outputLocation, JSON.stringify(fontData, null, 4)).done(function() {
      console.log('Data saved to ' + config.fontList.outputLocation);
    });
  });
})();
