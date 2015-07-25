var result = require('./result');

module.exports = {
  generate(id, path, query) {
    return result.replace(/\$\{id\}/g, id)
                 .replace(/\$\{path\}/g, path)
                 .replace(/\$\{query\}/g, query);
  }
};
