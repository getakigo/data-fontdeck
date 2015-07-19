var Q = require('q');
var _ = require('lodash');
var cheerio = require('cheerio');
var css = require('css');

var request = Q.denodeify(require('request'));
var utils = require('./utils');
var config = require('./config');

var allFontData = [];
var batchIterations = 0;

/*
 *  requestBatch
 *
 */
var requestBatch = function(deferred, fontList) {
  var start = batchIterations * config.fontData.batchSize + 1;
  var end = start + config.fontData.batchSize;
  var fontsToPopulate = fontList.splice(0, config.fontData.batchSize)

  if (fontsToPopulate.length === 0) {
    return deferred.resolve(allFontData);
  }

  deferred.notify({ type: 'start-batch', iteration: batchIterations+1, start: start, end: end-1 });
  var timer = +new Date();

  var requestPromises = fontsToPopulate.map(function(font) {
    return request(config.fontData.urlPrefix + font.url);
  });

  Q.all(requestPromises).done(function(requestResponses) {
    requestResponses.forEach(function(requestResponse) {
      var response = requestResponse[0];
      var body = requestResponse[1];

      if (response.statusCode !== 200) {
        return deferred.reject(new Error('Unknown status code', response.statusCode));
      }

      var fontData = getDataFromPage(body, response.req.path);
      deferred.notify({ type: 'font-data', value: fontData });
      allFontData.push(fontData);
    });

    deferred.notify({ type: 'end-batch', duration: ((+new Date() - timer) / 1000) });
    batchIterations++;

    var smear = utils.getInconsistentSmear();
    deferred.notify({ type: 'delay-batch', smear: (smear / 1000) });
    setTimeout(function() {
      requestBatch(deferred, fontList);
    }, smear);
  });
};

/*
 *  getDataFromPage
 *
 */
var getDataFromPage = function(body, path) {
  $ = cheerio.load(body);

  var fontData = utils.getFontDataPlaceholder();
  fontData.name = utils.textFor($('.content .typeface h1').first());
  fontData.url = path;
  fontData.language.push('latin');

  var metaTable = $('.meta tr');
  metaTable.each(function() {
    var metaProperty = utils.textFor($(this).find('th').first()).toLowerCase();
    var languageClassification = false;
    var metaValue = _.reduce($(this).find('td a'), function(list, link) {
      var value = utils.textFor($(link));
      if (metaProperty === 'classification' && value === 'Non-Latin') {
        languageClassification = true;
      } else if (languageClassification) {
        languageClassification = false;
        fontData.language.push(value.toLowerCase());
      } else {
        list.push(value);
      }
      return list;
    }, []);
    fontData[metaProperty] = metaValue;
  });

  var fontRules = getFontStyleDataFromPage(body);
  fontRules.forEach(function(fontRule) {
    var fontItem = $(fontRule.selectors[0]).parents('.font-item');
    var fontLink = fontItem.find('.font-name a').first();
    var licenseLink = fontItem.find('.add-to-website-link').first();
    var price = fontItem.find('.font-price strong').first();

    var fontSlugs = fontLink.attr('href').split('/');
    var fontDeckId = licenseLink.attr('href').split('/')[2]

    var fontVariationData = utils.getFontVariationDataPlaceholder();
    fontVariationData.name = utils.normaliseVariationName(utils.textFor(fontLink).replace(new RegExp(fontData.name + '\\s+'), ''));
    fontVariationData.url = fontLink.attr('href');
    fontVariationData.fontdeck = {
      id: fontDeckId,
      price: utils.textFor(price),
      slug: fontSlugs[3]
    };

    fontRule.declarations.forEach(function(declaration) {
      if (declaration.type !== 'declaration') return;

      var normalisedDeclaration = utils.normaliseCssDeclaration(declaration);
      fontVariationData.css[normalisedDeclaration.property] = normalisedDeclaration.value;
    });

    fontVariationData.description = fontVariationData.css['font-style'][0] + fontVariationData.css['font-weight'][0];

    fontData.slug = fontSlugs[2];
    fontData.variations.push(fontVariationData);
  });

  // Sort variations
  fontData.variations = _.sortByAll(fontData.variations, [
    function(variation) {
      return utils.fontWeightPriority(variation.name);
    },
    function(variation) {
      return utils.fontStylePriority(variation.css['font-style']);
    }
  ]);

  // Remove null values
  fontData = _.pick(fontData, function(value) {
    return !_.isNull(value);
  });

  fontData.generatedAt = +new Date();

  return fontData;
};

/*
 *  getFontStyleDataFromPage
 *
 */
var getFontStyleDataFromPage = function(body) {
  $ = cheerio.load(body);
  var fontStyleData = utils.textFor($('head style').last());
  var styleObj = css.parse(fontStyleData);

  return _.filter(styleObj.stylesheet.rules, function(rule) {
    return rule.type === 'rule';
  });
};

// ---

module.exports = {
  retrieve: function(fontList) {
    var deferred = Q.defer();

    _.defer(function() {
      requestBatch(deferred, fontList);
    });

    return deferred.promise;
  }
};
