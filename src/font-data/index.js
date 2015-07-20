import Q from 'q';
import _ from 'lodash';
import cheerio from 'cheerio';
import css from 'css';
import requestLib from 'request';
import utils from '../common/utils';
import config from '../config';

let request = Q.denodeify(requestLib);
let allFontData = [];
let batchIterations = 0;

/*
 *  requestBatch
 *
 */
let requestBatch = (deferred, fontList) => {
  let { batchSize, baseURL } = config.fontData;
  let start = batchIterations * batchSize + 1;
  let fontsToPopulate = fontList.splice(0, batchSize);
  batchIterations++;

  deferred.notify({
    type: 'start-batch',
    iteration: batchIterations,
    start: start,
    end: start + batchSize - 1,
    pending: Math.ceil(fontList.length / batchSize)
  });
  let timer = +new Date();

  let requestPromises = fontsToPopulate.map((font) => utils.makeRequest(baseURL + font.url, getDataFromPage));

  Q.all(requestPromises).done((requestResponses) => {
    requestResponses.forEach((fontData) => {
      deferred.notify({ type: 'font-data', value: fontData });
    });

    allFontData = allFontData.concat(_.flatten(requestResponses));
    deferred.notify({ type: 'end-batch', duration: ((+new Date() - timer) / 1000) });

    if (fontList.length === 0) {
      return deferred.resolve(_.sortBy(allFontData, 'name'));
    }

    let smear = utils.getInconsistentSmear();
    deferred.notify({ type: 'delay-batch', smear: (smear / 1000) });
    setTimeout(() => requestBatch(deferred, fontList), smear);
  });
};

/*
 *  getDataFromPage
 *
 */
let getDataFromPage = ({ req: { path } }, body) => {
  let deferred = Q.defer();
  let $ = cheerio.load(body);

  let fontData = utils.getFontDataPlaceholder();
  fontData.name = utils.textFor($('.content .typeface h1').first());
  fontData.slug = path.split('/')[2];
  fontData.url = config.fontData.baseURL + path;
  fontData.language.push('latin');
  fontData.fontdeck = utils.getFontProviderPlaceholder();
  fontData.fontdeck.slug = fontData.slug;

  let metaData = getFontMetaData($);
  fontData.language = fontData.language.concat(metaData.language);
  delete metaData.language;
  _.assign(fontData, metaData);

  let fontRules = getFontStyleData($);
  fontRules.forEach(({ selectors, declarations }) => {
    let fontItem = $(selectors[0]).parents('.font-item');
    let fontVariationData = getFontVariationData(fontItem, fontData, declarations);
    fontData.variations.push(fontVariationData);
  });

  fontData.variations = _.sortByAll(fontData.variations, [
    ({ name }) => utils.fontWeightPriority(name),
    ({ css }) => utils.fontStylePriority(css['font-style'])
  ]);

  Q.all([getFontUse(fontData.variations[0]), getFontDeckId(fontData)])
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
 *  getFontStyleData
 *
 */
let getFontStyleData = ($) => {
  let fontStyleData = utils.textFor($('head style').last());
  let { stylesheet: { rules } } = css.parse(fontStyleData);

  return _.filter(rules, (rule) => rule.type === 'rule');
};

/*
 *  getFontMetaData
 *
 */
let getFontMetaData = ($) => {
  let metaData = { language: [] };
  let metaTable = $('.meta tr');

  metaTable.each(function() {
    let metaProperty = utils.textFor($(this).find('th').first()).toLowerCase();
    let languageClassification = false;

    let metaValue = _.reduce($(this).find('td a'), (list, link) => {
      let value = utils.textFor($(link));
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

let getFontVariationData = (fontItem, fontData, cssDeclarations) => {
    let fontLink = fontItem.find('.font-name a').first();
    let fontSlugs = fontLink.attr('href').split('/');
    let licenseLink = fontItem.find('.add-to-website-link').first();
    let fontDeckId = licenseLink.attr('href').split('/')[2]
    let price = fontItem.find('.font-price strong').first();

    let fontVariationData = utils.getFontVariationDataPlaceholder();
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

let getFontVariationCssData = (declarations) => {
  let cssData = {};

  declarations.forEach((declaration) => {
    if (declaration.type !== 'declaration') {
      return;
    }

    let { property, value } = utils.normaliseCssDeclaration(declaration);
    cssData[property] = value;
  });

  return cssData;
};

/*
 *  getFontDeckId
 *
 */
let getFontDeckId = ({ name, url }) => {
  let { baseURL, additionalSources } = config.fontData;
  let requestUrl = baseURL + additionalSources.search.replace('{name}', name.replace(/\s+/g, '+'));
  return utils.makeRequest(requestUrl, (response, body) => {
    let { results: { typeface } } = JSON.parse(body);
    let matchingResult = _.find(typeface, (result) => (result.url === url.replace(baseURL, '')));
    return matchingResult.id;
  });
};

/*
 *  getFontUse
 *
 */
let getFontUse = ({ url }) => {
  return utils.makeRequest(url, (response, body) => {
    let $ = cheerio.load(body);
    return $('#show-smaller').length === 0 ? 'body' : 'heading';
  });
};

// ---

module.exports = {
  retrieve(fontList) {
    let deferred = Q.defer();
    _.defer(() => requestBatch(deferred, fontList));
    return deferred.promise;
  }
};
