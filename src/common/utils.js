var fs = require('fs');
var path = require('path');
var Q = require('q');
var _ = require('lodash');

var request = Q.denodeify(require('request'));
var mkdirp = Q.denodeify(require('mkdirp'));
var writeFile = Q.denodeify(fs.writeFile);

var config = require('../config');

var fontStyles = [
  'normal',
  'italic',
  'oblique'
];

var fontWeights = [
  'Hairline',
  'Extra-thin',
  'Thin',
  'Ultra-light',
  'Extra-light',
  'Light',
  'Book',
  'Regular',
  'Medium',
  'Semi-bold',
  'Bold',
  'Extra-bold',
  'Heavy',
  'Black',
  'Extra-black',
  'Ultra-black'
];

var fontWeightsMapping = {};

_.assign(fontWeightsMapping, _.reduce(fontWeights, function(mapping, weight) {
  mapping[weight.replace('-', '').toLowerCase()] = weight;
  return mapping;
}, {}));

module.exports = {
  getInconsistentSmear: function() {
    var percentageChange = Math.random() * config.smear.skew / 100;
    var additiveOrSubtractive = Math.random() < 0.5 ? -1 : 1;
    var smear = config.smear.delay + (config.smear.delay * percentageChange * additiveOrSubtractive);
    return parseInt(smear, 10);
  },

  getFontDataPlaceholder: function() {
    return {
      name: null,
      url: null,
      slug: null,
      superfamily: null,
      use: null,
      classification: [],
      foundry: null,
      designer: null,
      opentype: null,
      language: [],
      tags: [],
      variations: []
    };
  },

  getFontVariationDataPlaceholder: function() {
    return {
      name: null,
      description: null,
      url: null,
      css: {}
    };
  },

  getFontProviderPlaceholder: function() {
    return {
      id: null,
      slug: null
    };
  },

  normaliseCssDeclaration: function(declaration) {
    if (declaration.property === 'font-weight') {
      if (declaration.value === 'normal') {
        declaration.value = '400';
      }
      if (declaration.value === 'bold') {
        declaration.value = '700';
      }
    }

    if (declaration.property === 'font-family') {
      var value = declaration.value.split(',')[0];
      declaration.value = value.replace(/['"]/g, '');
    }

    return declaration;
  },

  normaliseVariationName: function(variationName) {
    var containsItalic = variationName.toLowerCase().indexOf('italic');
    var containsOblique = variationName.toLowerCase().indexOf('oblique');

    if (containsItalic === 0 || containsOblique === 0) {
      return 'Regular ' + variationName;
    }

    var normalisedVariationName = variationName.replace(/italic/i, '').replace(/oblique/i, '').trim();

    if (fontWeights.indexOf(normalisedVariationName) === -1) {
      normalisedVariationName = fontWeightsMapping[normalisedVariationName.replace(/\s+/g, '').toLowerCase()];
    }

    if (_.isUndefined(normalisedVariationName)) {
      throw new Error("Unsupported variation: " + variationName);
    }

    if (containsItalic > 0) normalisedVariationName += ' Italic';
    if (containsOblique > 0) normalisedVariationName += ' Oblique';

    return normalisedVariationName;
  },

  fontStylePriority: function(fontStyle) {
    var index = fontStyles.indexOf(fontStyle);
    if (index < 0) {
      throw new Error("Unsupported font style: " + fontStyle);
    }
    return index+1;
  },

  fontWeightPriority: function(variationName) {
    var variationWeight = variationName.replace(/italic/i, '').replace(/oblique/i, '').trim();
    var index = fontWeights.indexOf(variationWeight);
    if (index < 0) {
      throw new Error("Unsupported font weight: " + variationWeight);
    }
    return index+1;
  },

  textFor: function(element) {
    return element.text().trim();
  },

  makeRequest: function(url, action) {
    var deferred = Q.defer();

    request(url).done(function(requestResponse) {
      var response = requestResponse[0];
      var body = requestResponse[1];

      if (response.statusCode !== 200) {
        return deferred.reject(new Error('Unknown status code', response.statusCode));
      }

      deferred.resolve(action(response, body));
    });

    return deferred.promise;
  },

  writeJSON: function(filePath, data) {
    var deferred = Q.defer();
    var directory = path.dirname(filePath);

    mkdirp(directory).then(function() {
      return writeFile(filePath, JSON.stringify(data, null, 4));
    }).done(deferred.resolve);

    return deferred.promise;
  }
}
