/* @flow */

import { getSourceMap } from './getSourceMap';

const _fetchCache = {};
const _splitLinesCache = {};
const _getSourceMapCache = {};

function cachedFetch(url) {
  if (!_fetchCache[url]) {
    _fetchCache[url] = fetch(url);
  }
  return _fetchCache[url].then(r => r.clone());
};

function cachedSplitLines(lines) {
  if (!_splitLinesCache[lines]) {
    _splitLinesCache[lines] = lines.split('\n');
  }
  return _splitLinesCache[lines];
};

function cachedGetSourceMap(fileUri, fileContents) {
  if (!_getSourceMapCache[fileUri]) {
    _getSourceMapCache[fileUri] = getSourceMap(fileUri, fileContents);
  }
  return _getSourceMapCache[fileUri];
};

export { cachedFetch, cachedSplitLines, cachedGetSourceMap };