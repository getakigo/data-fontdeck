import fs from 'fs';
import path from 'path';
import Q from 'q';
import _ from 'lodash';
import requestLib from 'request';
import mkdirpLib from 'mkdirp';

const request = Q.denodeify(requestLib);
const mkdirp = Q.denodeify(mkdirpLib);
const writeFile = Q.denodeify(fs.writeFile);

const fontStyles = [
  'normal',
  'italic',
  'oblique'
];

const fontWeights = [
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

const fontWeightsMapping = {};

_.assign(fontWeightsMapping, _.reduce(fontWeights, (mapping, weight) => {
  mapping[weight.replace('-', '').toLowerCase()] = weight;
  return mapping;
}, {}));

export default {
  getInconsistentSmear({ skew, delay }) {
    const percentageChange = Math.random() * skew / 100;
    const additiveOrSubtractive = Math.random() < 0.5 ? -1 : 1;
    const smear = delay + delay * percentageChange * additiveOrSubtractive;
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
      const value = declaration.value.split(',')[0];
      declaration.value = value.replace(/['"]/g, '');
    }

    return declaration;
  },

  normaliseVariationName(variationName) {
    const containsItalic = variationName.toLowerCase().indexOf('italic');
    const containsOblique = variationName.toLowerCase().indexOf('oblique');
    let normalisedName = variationName.replace(/italic/i, '').replace(/oblique/i, '').trim();

    if (containsItalic === 0 || containsOblique === 0) {
      return 'Regular ' + variationName;
    }


    if (fontWeights.indexOf(normalisedName) === -1) {
      normalisedName = fontWeightsMapping[normalisedName.replace(/\s+/g, '').toLowerCase()];
    }

    if (_.isUndefined(normalisedName)) {
      return variationName;
    }

    if (containsItalic > 0) {
      normalisedName += ' Italic';
    }

    if (containsOblique > 0) {
      normalisedName += ' Oblique';
    }

    return normalisedName;
  },

  fontStylePriority(fontStyle) {
    let index = fontStyles.indexOf(fontStyle);
    if (index < 0) {
      index = fontStyles.length;
    }
    return index + 1;
  },

  fontWeightPriority(variationName) {
    const variationWeight = variationName.replace(/italic/i, '').replace(/oblique/i, '').trim();
    let index = fontWeights.indexOf(variationWeight);
    if (index < 0) {
      index = fontWeights.length;
    }
    return index + 1;
  },

  textFor(element) {
    return element.text().trim();
  },

  makeRequest(url, action) {
    const deferred = Q.defer();

    request(url).done(([ response, body ]) => {
      if (response.statusCode !== 200) {
        return deferred.reject(new Error('Unknown status code', response.statusCode));
      }

      Q.when(action(response, body)).done(deferred.resolve);
    });

    return deferred.promise;
  },

  writeJSON(filePath, data) {
    const deferred = Q.defer();
    const directory = path.dirname(filePath);

    mkdirp(directory).then(() => {
      return writeFile(filePath, JSON.stringify(data, null, 4));
    }).done(deferred.resolve);

    return deferred.promise;
  }
};
