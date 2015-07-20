import Q from 'q';
import _ from 'lodash';
import cheerio from 'cheerio';
import utils from '../common/utils';
import config from '../../config/fontdeck';

let listOfFonts = [];
let batchIteration = 0;

/*
 *  requestBatch
 *
 */
let requestBatch = (deferred) => {
  let startPage = batchIteration * config.fontList.batchSize + 1;
  let endPage = startPage + config.fontList.batchSize;
  batchIteration++;

  deferred.notify({ type: 'start-batch', iteration: batchIteration, start: startPage, end: endPage - 1 });
  let timer = +new Date();

  let requestPromises = _.range(startPage, endPage).map((page) => {
    return utils.makeRequest(config.fontList.baseURL.replace('{n}', page), getDataFromPage);
  });

  Q.all(requestPromises).done((requestResponses) => {
    listOfFonts = listOfFonts.concat(_.flatten(requestResponses));
    deferred.notify({ type: 'end-batch', duration: ((+new Date() - timer) / 1000) });

    if (requestResponses[requestResponses.length-1].length === 0) {
      return deferred.resolve(listOfFonts);
    }

    let smear = utils.getInconsistentSmear(config.smear);
    deferred.notify({ type: 'delay-batch', smear: (smear / 1000) });
    setTimeout(() => requestBatch(deferred), smear);
  });
};

/*
 *  getDataFromPage
 *
 */
let getDataFromPage = (response, body) => {
  let deferred = Q.defer();
  let $ = cheerio.load(body);

  let fontItems = $('.font-item');
  let fontsOnPage = [];

  fontItems.each(function() {
    let fontLink = $(this).find('.font-name a').first();
    let fontName = fontLink.text();

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

// ---

export default {
  retrieve() {
    let deferred = Q.defer();
    _.defer(() => requestBatch(deferred));
    return deferred.promise;
  }
};
