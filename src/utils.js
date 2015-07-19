var _ = require('lodash');
var config = require('./config');

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

_.assign(fontWeightsMapping, _.reduce(fontWeights, function(mapping, variation) {
  mapping[variation.replace('-', '').toLowerCase()] = variation;
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
      classification: [],
      foundry: null,
      designer: null,
      opentype: null,
      superfamily: null,
      language: [],
      use: null,
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
  }
}
