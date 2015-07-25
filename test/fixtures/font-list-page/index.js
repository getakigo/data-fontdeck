var page = require('./page');
var itemList = require('./item-list');
var emptyList = require('./empty-list');

var populatedFontList = (id) => {
    return itemList.replace(/\$\{id\}/g, id);
};

module.exports = {
  generate(id) {
    var fontList = id < 10 ? populatedFontList(id) : emptyList;
    return page.replace(/\$\{fontList\}/g, fontList);
  }
};
