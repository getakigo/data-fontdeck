import _ from 'lodash';

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

const fontWeightsMapping = _.reduce(fontWeights, (mapping, weight) => {
  mapping[weight.replace('-', '').toLowerCase()] = weight;
  return mapping;
}, {});

export default {
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


    if (!fontWeights.includes(normalisedName)) {
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
  }
};
