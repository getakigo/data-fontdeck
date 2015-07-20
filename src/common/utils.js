import fs from 'fs';
import path from 'path';
import Q from 'q';
import _ from 'lodash';
import requestLib from 'request';
import mkdirpLib from 'mkdirp';
import config from '../config';

let request = Q.denodeify(requestLib);
let mkdirp = Q.denodeify(mkdirpLib);
let writeFile = Q.denodeify(fs.writeFile);

let fontStyles = [
  'normal',
  'italic',
  'oblique'
];

let fontWeights = [
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

let fontWeightsMapping = {};

_.assign(fontWeightsMapping, _.reduce(fontWeights, (mapping, weight) => {
  mapping[weight.replace('-', '').toLowerCase()] = weight;
  return mapping;
}, {}));

export default {
  getInconsistentSmear() {
    let { skew, delay } = config.smear;
    let percentageChange = Math.random() * skew / 100;
    let additiveOrSubtractive = Math.random() < 0.5 ? -1 : 1;
    let smear = delay + (delay * percentageChange * additiveOrSubtractive);
    return parseInt(smear, 10);
  },

  getFontDataPlaceholder() {
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

  getFontVariationDataPlaceholder() {
    return {
      name: null,
      description: null,
      url: null,
      css: {}
    };
  },

  getFontProviderPlaceholder() {
    return {
      id: null,
      slug: null
    };
  },

  normaliseCssDeclaration(declaration) {
    if (declaration.property === 'font-weight') {
      if (declaration.value === 'normal') {
        declaration.value = '400';
      }
      if (declaration.value === 'bold') {
        declaration.value = '700';
      }
    }

    if (declaration.property === 'font-family') {
      let value = declaration.value.split(',')[0];
      declaration.value = value.replace(/['"]/g, '');
    }

    return declaration;
  },

  normaliseVariationName(variationName) {
    let containsItalic = variationName.toLowerCase().indexOf('italic');
    let containsOblique = variationName.toLowerCase().indexOf('oblique');

    if (containsItalic === 0 || containsOblique === 0) {
      return 'Regular ' + variationName;
    }

    let normalisedVariationName = variationName.replace(/italic/i, '').replace(/oblique/i, '').trim();

    if (fontWeights.indexOf(normalisedVariationName) === -1) {
      normalisedVariationName = fontWeightsMapping[normalisedVariationName.replace(/\s+/g, '').toLowerCase()];
    }

    if (_.isUndefined(normalisedVariationName)) {
      return variationName;
    }

    if (containsItalic > 0) normalisedVariationName += ' Italic';
    if (containsOblique > 0) normalisedVariationName += ' Oblique';

    return normalisedVariationName;
  },

  fontStylePriority(fontStyle) {
    let index = fontStyles.indexOf(fontStyle);
    if (index < 0) {
      index = fontStyles.length;
    }
    return index+1;
  },

  fontWeightPriority(variationName) {
    let variationWeight = variationName.replace(/italic/i, '').replace(/oblique/i, '').trim();
    let index = fontWeights.indexOf(variationWeight);
    if (index < 0) {
      index = fontWeights.length;
    }
    return index+1;
  },

  textFor(element) {
    return element.text().trim();
  },

  makeRequest(url, action) {
    let deferred = Q.defer();

    request(url).done(([ response, body ]) => {
      if (response.statusCode !== 200) {
        return deferred.reject(new Error('Unknown status code', response.statusCode));
      }

      Q.when(action(response, body)).done(deferred.resolve);
    });

    return deferred.promise;
  },

  writeJSON(filePath, data) {
    let deferred = Q.defer();
    let directory = path.dirname(filePath);

    mkdirp(directory).then(() => {
      return writeFile(filePath, JSON.stringify(data, null, 4));
    }).done(deferred.resolve);

    return deferred.promise;
  }
}
