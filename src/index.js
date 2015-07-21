import Q from 'q';
import config from '../config/fontdeck';
import logger from './common/logger';
import utils from './common/utils';
import fontList from './font-list';
import fontData from './font-data';

/*
 *  retrieveFontList
 *
 */
const retrieveFontList = () => {
  const deferred = Q.defer();
  logger.start(`Retriving list of fonts from ${config.provider}`);

  fontList.retrieve()
  .progress((notification) => {
    switch (notification.type) {
      case 'start-batch':
        logger.batchStart(notification);
        break;
      case 'end-batch':
        logger.batchEnd(notification);
        break;
      case 'delay-batch':
        logger.batchDelay(notification);
        break;
      default:
        break;
    }
  })
  .done((listOfFonts) => {
    logger.finish(`Found ${listOfFonts.length} fonts in total`);
    utils.writeJSON(config.fontList.cacheLocation, listOfFonts).done(() => {
      logger.cacheWritten(config.fontList.cacheLocation);
      deferred.resolve(listOfFonts);
    });
  });

  return deferred.promise;
};

/*
 *  retrieveFontData
 *
 */
const retrieveFontData = (fonts) => {
  const deferred = Q.defer();
  logger.start(`Retriving font data for ${config.provider}`);

  fontData.retrieve(fonts)
  .progress((notification) => {
    const { type, value } = notification;
    switch (type) {
      case 'start-batch':
        logger.batchStart(notification);
        break;
      case 'end-batch':
        logger.batchEnd(notification);
        break;
      case 'delay-batch':
        logger.batchDelay(notification);
        break;
      case 'font-data':
        const cacheDirectory = config.fontData.cacheLocation + value.name.toLowerCase()[0];
        const cacheLocation = `${cacheDirectory}/${value.slug}.json`;
        utils.writeJSON(cacheLocation, value).done(() => {
          //logger.cacheWritten(cacheLocation);
        });
        break;
      default:
        break;
    }
  })
  .done((data) => {
    logger.finish();
    deferred.resolve(data);
  });

  return deferred.promise;
};

// ---

export default {
  run() {
    retrieveFontList().then((fonts) => {
      logger.spacer();
      return retrieveFontData(fonts);
    }).done((data) => {
      logger.out('Data generation complete, outputting final file...');
      utils.writeJSON(config.outputLocation, data).done(() => {
        logger.out(`Data saved to ${config.outputLocation}`);
      });
    });
  }
};
