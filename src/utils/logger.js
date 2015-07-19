var _ = require('lodash');
var startTime;

module.exports = {
  start: function(startMessage) {
    startTime = new Date();
    if (!_.isUndefined(startMessage)) {
      this.out(startMessage);
    }
    this.out('Start time: ' + startTime);
    this.out('---------------------------------------------------\n');
  },

  finish: function(finishMessage) {
    var endTime = new Date();
    this.out('---------------------------------------------------');
    this.out('End time: ' + endTime);
    this.out('Duration: ' + (endTime - startTime) / 1000 + ' seconds');
    if (!_.isUndefined(finishMessage)) {
      this.out(finishMessage);
    }
    startTime = undefined;
  },

  out: console.log,

  spacer: function() {
    this.out('\n');
  },

  batchStart: function(notification) {
    this.out('Requesting batch ' + notification.iteration + ' [' + notification.start + ' - ' + notification.end + '] ...');
  },

  batchEnd: function(notification) {
    this.out('Completed after ' + notification.duration + ' seconds\n');
  },

  batchDelay: function(notification) {
    this.out('Delaying next batch by ' + notification.smear + ' seconds\n');
  },

  cacheWritten: function(location) {
    this.out('Output cached to ' + location);
  }
}
