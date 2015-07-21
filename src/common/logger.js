import _ from 'lodash';

let startTime;

export default {
  start(startMessage) {
    startTime = new Date();
    if (!_.isUndefined(startMessage)) {
      this.out(startMessage);
    }
    this.out(`Start time: ${startTime}`);
    this.out('---------------------------------------------------\n');
  },

  finish(finishMessage) {
    const endTime = new Date();
    this.out('---------------------------------------------------');
    this.out(`End time: ${endTime}`);
    this.out(`Duration: ${(endTime - startTime) / 1000} seconds`);
    if (!_.isUndefined(finishMessage)) {
      this.out(finishMessage);
    }
    startTime = undefined;
  },

  out: console.log,

  spacer() {
    this.out('\n');
  },

  batchStart({ iteration, start, end, pending }) {
    const request = `Requesting batch ${iteration}`;
    const range = ` [${start} - ${end}] ...`;
    let remaining = '';

    if (!_.isUndefined(pending)) {
      remaining = ` (${pending} left)`;
    }

    this.out(`${request}${remaining}${range}`);
  },

  batchEnd({ duration }) {
    this.out(`Completed after ${duration} seconds\n`);
  },

  batchDelay({ smear }) {
    this.out(`Delaying next batch by ${smear} seconds\n`);
  },

  cacheWritten(location) {
    this.out(`Output cached to ${location}`);
  }
};
