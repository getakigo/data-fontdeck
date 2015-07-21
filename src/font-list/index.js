import Q from 'q';
import _ from 'lodash';
import cheerio from 'cheerio';
import utils from '../common/utils';
import config from '../../config/fontdeck';

let listOfFonts = [];
let batchIteration = 0;

/*
 *  getDataFromPage
 *
 */
const getDataFromPage = (response, body) => {
  const deferred = Q.defer();
  const $ = cheerio.load(body);

  const fontItems = $('.font-item');
  const fontsOnPage = [];

  fontItems.each(function() {
    const fontLink = $(this).find('.font-name a').first();
    const fontName = fontLink.text();

    if (_.isEmpty(fontName)) {
      return;
    }

    fontsOnPage.push({
      name: fontName,
      url: fontLink.attr('href')
    });
  });

  deferred.resolve(fontsOnPage);

  return deferred.promise;
};

/*
 *  requestBatch
 *
 */
const requestBatch = (deferred) => {
  const startPage = batchIteration * config.fontList.batchSize + 1;
  const endPage = startPage + config.fontList.batchSize;
  batchIteration++;

  deferred.notify({
    type: 'start-batch',
    iteration: batchIteration,
    start: startPage,
    end: endPage - 1
  });
  const timer = +new Date();

  const requestPromises = _.range(startPage, endPage).map((page) => {
    return utils.makeRequest(config.fontList.baseURL.replace('{n}', page), getDataFromPage);
  });

  Q.all(requestPromises).done((requestResponses) => {
    listOfFonts = listOfFonts.concat(_.flatten(requestResponses));
    deferred.notify({ type: 'end-batch', duration: (+new Date() - timer) / 1000 });

    if (requestResponses[requestResponses.length - 1].length === 0) {
      return deferred.resolve(listOfFonts);
    }

    const smear = utils.getInconsistentSmear(config.smear);
    deferred.notify({ type: 'delay-batch', smear: smear / 1000 });
    setTimeout(() => requestBatch(deferred), smear);
  });
};

// ---

export default {
  retrieve() {
    const deferred = Q.defer();
    _.defer(() => requestBatch(deferred));
    return deferred.promise;
  }
};
