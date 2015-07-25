var page = require('./page');

module.exports = {
  generate(id, fontName, fontSlug) {
    return page.replace(/\$\{fontName\}/g, fontName)
               .replace(/\$\{fontSlug\}/g, fontSlug);
  }
};
