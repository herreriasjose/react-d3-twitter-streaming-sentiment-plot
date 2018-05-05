
// A simple parser of feelings in texts.
// Check the project: https://www.npmjs.com/package/Sentimental

const analyze = require('Sentimental').analyze;
const logger = require('./logger');
const level = process.env.LOG_LEVEL || 'debug';

// Notice that we could use a number of procedures to improve the sentiment analysis. But that was not the purpose of this application.

function parse(text) {
    return analyze(text).score;
};


module.exports.parse = parse;