import fs from 'fs';
import path from 'path';
import Q from 'q';
import requestLib from 'request';
import mkdirpLib from 'mkdirp';

const request = Q.denodeify(requestLib);
const mkdirp = Q.denodeify(mkdirpLib);
const writeFile = Q.denodeify(fs.writeFile);

export default {

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
  },

  getInconsistentSmear({ skew, delay }) {
    const percentageChange = Math.random() * skew / 100;
    const additiveOrSubtractive = Math.random() < 0.5 ? -1 : 1;
    const smear = delay + delay * percentageChange * additiveOrSubtractive;
    return parseInt(smear, 10);
  }
};
