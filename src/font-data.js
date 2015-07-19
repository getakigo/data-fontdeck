var Q = require('q');
var _ = require('lodash');
var cheerio = require('cheerio');
var css = require('css');
var request = Q.denodeify(require('request'));
var utils = require('./common/utils');
var config = require('./config');

var allFontData = [];
var batchIterations = 0;

/*
 *  requestBatch
 *
 */
var requestBatch = function(deferred, fontList) {
  var start = batchIterations * config.fontData.batchSize + 1;
  var fontsToPopulate = fontList.splice(0, config.fontData.batchSize)
  batchIterations++;

  deferred.notify({ type: 'start-batch', iteration: batchIterations, start: start, end: start + config.fontData.batchSize - 1 });
  var timer = +new Date();

  var requestPromises = fontsToPopulate.map(function(font) {
    return utils.makeRequest(config.fontData.baseURL + font.url, getDataFromPage);
  });

  Q.all(requestPromises).done(function(requestResponses) {
    requestResponses.forEach(function(fontData) {
      deferred.notify({ type: 'font-data', value: fontData });
    });

    allFontData = allFontData.concat(_.flatten(requestResponses));
    deferred.notify({ type: 'end-batch', duration: ((+new Date() - timer) / 1000) });

    if (fontList.length === 0) {
      return deferred.resolve(_.sortBy(allFontData, 'name'));
    }

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
var getDataFromPage = function(response, body) {
  var deferred = Q.defer();
  var $ = cheerio.load(body);

  var fontData = utils.getFontDataPlaceholder();
  fontData.name = utils.textFor($('.content .typeface h1').first());
  fontData.slug = response.req.path.split('/')[2];
  fontData.url = config.fontData.baseURL + response.req.path;
  fontData.language.push('latin');
  fontData.fontdeck = utils.getFontProviderPlaceholder();
  fontData.fontdeck.slug = fontData.slug;

  var metaData = getFontMetaData($);
  fontData.language = fontData.language.concat(metaData.language);
  delete metaData.language;
  _.assign(fontData, metaData);

  var fontRules = getFontStyleData($);
  fontRules.forEach(function(fontRule) {
    var fontItem = $(fontRule.selectors[0]).parents('.font-item');
    var fontVariationData = getFontVariationData(fontItem, fontData, fontRule.declarations);
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

  Q.all([getFontUse(fontData.variations[0]), getFontDeckId(fontData)])
  .done(function(requestResponses) {
    fontData.use = requestResponses[0];
    fontData.fontdeck.id = requestResponses[1];
    fontData.generatedAt = +new Date();

    // Remove null values
    fontData = _.pick(fontData, function(value) {
      return !_.isNull(value);
    });

    deferred.resolve(fontData);
  });

  return deferred.promise;
};

/*
 *  getFontStyleData
 *
 */
var getFontStyleData = function($) {
  var fontStyleData = utils.textFor($('head style').last());
  var styleObj = css.parse(fontStyleData);

  return _.filter(styleObj.stylesheet.rules, function(rule) {
    return rule.type === 'rule';
  });
};

/*
 *  getFontMetaData
 *
 */
var getFontMetaData = function($) {
  var metaData = {
    language: []
  };

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
        metaData.language.push(value.toLowerCase());
      } else {
        list.push(value);
      }
      return list;
    }, []);
    metaData[metaProperty] = metaValue;
  });

  if (_.isArray(metaData.foundry)) {
    metaData.foundry = metaData.foundry[0];
  }

  if (_.isArray(metaData.superfamily)) {
    metaData.superfamily = metaData.superfamily[0];
  }

  return metaData;
};

var getFontVariationData = function(fontItem, fontData, cssDeclarations) {
    var fontLink = fontItem.find('.font-name a').first();
    var fontSlugs = fontLink.attr('href').split('/');
    var licenseLink = fontItem.find('.add-to-website-link').first();
    var fontDeckId = licenseLink.attr('href').split('/')[2]
    var price = fontItem.find('.font-price strong').first();

    var fontVariationData = utils.getFontVariationDataPlaceholder();
    fontVariationData.name = utils.normaliseVariationName(utils.textFor(fontLink).replace(new RegExp(fontData.name + '\\s+'), ''));
    fontVariationData.url = config.fontData.baseURL + fontLink.attr('href');
    fontVariationData.css = getFontVariationCssData(cssDeclarations);
    fontVariationData.description = fontVariationData.css['font-style'][0] + fontVariationData.css['font-weight'][0];

    fontVariationData.fontdeck = utils.getFontProviderPlaceholder();
    fontVariationData.fontdeck.id = fontDeckId;
    fontVariationData.fontdeck.slug = fontSlugs[3];
    fontVariationData.fontdeck.price = utils.textFor(price);

    return fontVariationData;
};

var getFontVariationCssData = function(declarations) {
  var cssData = {};

  declarations.forEach(function(declaration) {
    if (declaration.type !== 'declaration') return;

    var normalisedDeclaration = utils.normaliseCssDeclaration(declaration);
    cssData[normalisedDeclaration.property] = normalisedDeclaration.value;
  });

  return cssData;
};

/*
 *  getFontDeckId
 *
 */
var getFontDeckId = function(fontData) {
  var url = config.fontData.baseURL + config.fontData.additionalSources.search.replace('{name}', fontData.name.replace(/\s+/g, '+'));
  return utils.makeRequest(url, function(response, body) {
    var searchResults = JSON.parse(body);
    var matchingResult = _.find(searchResults.results.typeface, function(result) {
      return result.url === fontData.url.replace(config.fontData.baseURL, '');
    });
    return matchingResult.id;
  });
};

/*
 *  getFontUse
 *
 */
var getFontUse = function(variation) {
  return utils.makeRequest(variation.url, function(response, body) {
    var $ = cheerio.load(body);
    return $('#show-smaller').length === 0 ? 'body' : 'heading';
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
