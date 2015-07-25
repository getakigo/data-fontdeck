import Q from 'q';
import _ from 'lodash';
import cheerio from 'cheerio';
import cssParser from 'css';
import { dom, placeholders, styles, io } from '../common/utils';
import config from '../../config/fontdeck';

let allFontData = [];
let batchIterations = 0;

/*
 *  getFontMetaData
 *
 */
const getFontMetaData = ($) => {
  const metaData = { language: [] };
  const metaTable = $('.meta tr');

  metaTable.each(function() {
    const metaProperty = dom.textFor($(this).find('th').first()).toLowerCase();
    let languageClassification = false;

    const metaValue = _.reduce($(this).find('td a'), (list, link) => {
      const value = dom.textFor($(link));
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

const getFontVariationCssData = (declarations) => {
  const cssData = {};

  declarations.forEach((declaration) => {
    if (declaration.type !== 'declaration') {
      return;
    }

    const { property, value } = styles.normaliseCssDeclaration(declaration);
    cssData[property] = value;
  });

  return cssData;
};

/*
 *  getFontStyleData
 *
 */
const getFontStyleData = ($) => {
  const fontStyleData = dom.textFor($('head style').last());
  const { stylesheet: { rules } } = cssParser.parse(fontStyleData);

  return _.filter(rules, (rule) => rule.type === 'rule');
};

const getFontVariationData = (fontItem, fontData, cssDeclarations) => {
  const fontLink = fontItem.find('.font-name a').first();
  const fontSlugs = fontLink.attr('href').split('/');
  const licenseLink = fontItem.find('.add-to-website-link').first();
  const fontDeckId = licenseLink.attr('href').split('/')[2];
  const price = fontItem.find('.font-price strong').first();

  const fontVariationData = placeholders.getFontVariationDataPlaceholder();
  fontVariationData.name = styles.normaliseVariationName(dom.textFor(fontLink)
                                .replace(new RegExp(fontData.name + '\\s+'), ''));
  fontVariationData.url = config.fontData.baseURL + fontLink.attr('href');
  fontVariationData.css = getFontVariationCssData(cssDeclarations);
  const { 'font-style': [ fontStyle ], 'font-weight': [ fontWeight ] } = fontVariationData.css;
  fontVariationData.description = `${fontStyle}${fontWeight}`;

  fontVariationData.fontdeck = placeholders.getFontProviderPlaceholder();
  fontVariationData.fontdeck.id = fontDeckId;
  fontVariationData.fontdeck.slug = fontSlugs[3];
  fontVariationData.fontdeck.price = dom.textFor(price);

  return fontVariationData;
};

/*
 *  getFontUse
 *
 */
const getFontUse = ({ url }) => {
  return io.makeRequest(url, (response, body) => {
    const $ = cheerio.load(body);
    return $('#show-smaller').length === 0 ? 'body' : 'heading';
  });
};

/*
 *  getFontDeckId
 *
 */
const getFontDeckId = ({ name, url }) => {
  const { baseURL, additionalSources: { search } } = config.fontData;
  let fontName = name;
  if (name.length < 3) {
    fontName = `${name}__`.slice(0, 3);
  }
  const requestUrl = baseURL + search.replace('{name}', fontName.replace(/\s+/g, '+'));
  return io.makeRequest(requestUrl, (response, body) => {
    const { results: { typeface } } = JSON.parse(body);
    const matchingResult = _.find(typeface, (result) => result.url === url.replace(baseURL, ''));
    return matchingResult.id;
  });
};

/*
 *  getDataFromPage
 *
 */
const getDataFromPage = ({ req: { path } }, body) => {
  const deferred = Q.defer();
  const $ = cheerio.load(body);

  let fontData = placeholders.getFontDataPlaceholder();
  fontData.name = dom.textFor($('.content .typeface h1').first());
  fontData.slug = path.split('/')[2];
  fontData.url = config.fontData.baseURL + path;
  fontData.language.push('latin');
  fontData.fontdeck = placeholders.getFontProviderPlaceholder();
  fontData.fontdeck.slug = fontData.slug;

  const metaData = getFontMetaData($);
  fontData.language = fontData.language.concat(metaData.language);
  delete metaData.language;
  _.assign(fontData, metaData);

  const fontRules = getFontStyleData($);
  fontRules.forEach(({ selectors, declarations }) => {
    const fontItem = $(selectors[0]).parents('.font-item');
    const fontVariationData = getFontVariationData(fontItem, fontData, declarations);
    fontData.variations.push(fontVariationData);
  });

  fontData.variations = _.sortByAll(fontData.variations, [
    ({ name }) => styles.fontWeightPriority(name),
    ({ css }) => styles.fontStylePriority(css['font-style'])
  ]);

  Q.all([ getFontUse(fontData.variations[0]), getFontDeckId(fontData) ])
  .done((requestResponses) => {
    fontData.use = requestResponses[0];
    fontData.fontdeck.id = requestResponses[1];
    fontData.generatedAt = +new Date();

    fontData = _.pick(fontData, (value) => !_.isNull(value));

    deferred.resolve(fontData);
  });

  return deferred.promise;
};

/*
 *  requestBatch
 *
 */
const requestBatch = (deferred, fontList) => {
  const { batchSize, baseURL } = config.fontData;
  const startCount = batchIterations * batchSize + 1;
  const fontsToPopulate = fontList.splice(0, batchSize);
  const timer = +new Date();
  batchIterations++;

  deferred.notify({
    type: 'start-batch',
    iteration: batchIterations,
    start: startCount,
    end: startCount + batchSize - 1,
    pending: Math.ceil(fontList.length / batchSize)
  });

  const requestPromises = fontsToPopulate.map((font) => {
    return io.makeRequest(baseURL + font.url, getDataFromPage);
  });

  Q.all(requestPromises).done((requestResponses) => {
    requestResponses.forEach((fontData) => {
      deferred.notify({ type: 'font-data', value: fontData });
    });

    allFontData = allFontData.concat(_.flatten(requestResponses));
    deferred.notify({ type: 'end-batch', duration: (+new Date() - timer) / 1000 });

    if (fontList.length === 0) {
      return deferred.resolve(_.sortBy(allFontData, 'name'));
    }

    const smear = io.getInconsistentSmear(config.smear);
    deferred.notify({ type: 'delay-batch', smear: smear / 1000 });
    setTimeout(() => requestBatch(deferred, fontList), smear);
  });
};

// ---

export default {
  retrieve(fontList) {
    const deferred = Q.defer();
    _.defer(() => requestBatch(deferred, fontList));
    return deferred.promise;
  }
};
