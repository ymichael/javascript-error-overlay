/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { getSourceMap } from '../utils/getSourceMap';
import fs from 'fs';
import { resolve } from 'path';

test('finds an external source map', async () => {
  const file = fs
    .readFileSync(resolve(__dirname, '../../fixtures/bundle.mjs'))
    .toString('utf8');
  fetch.mockResponseOnce(
    fs
      .readFileSync(resolve(__dirname, '../../fixtures/bundle.mjs.map'))
      .toString('utf8')
  );

  const sm = await getSourceMap('/', file);
  expect(sm.getOriginalPosition(26122, 21)).toEqual({
    line: 7,
    column: 0,
    source: 'webpack:///packages/react-scripts/template/src/App.js',
  });
});

test('finds an external source map a page relative path', async () => {
  const file = fs
    .readFileSync(resolve(__dirname, '../../fixtures/bundle2.mjs'))
  fetch.mockResponseOnce(
    fs
      .readFileSync(resolve(__dirname, '../../fixtures/bundle.mjs.map'))
      .toString('utf8')
  );
  const sm = await getSourceMap('/', file);
  expect(fetch.mock.calls.length).toEqual(1);
  expect(fetch.mock.calls[0][0]).toEqual('/static/js/bundle2.js.map');
});

test('find an inline source map', async () => {
  const sourceName = 'test.js';

  const file = fs
    .readFileSync(resolve(__dirname, '../../fixtures/inline.mjs'))
    .toString('utf8');
  const fileO = fs
    .readFileSync(resolve(__dirname, '../../fixtures/inline.es6.mjs'))
    .toString('utf8');

  const sm = await getSourceMap('/', file);
  expect(sm.getSources()).toEqual([sourceName]);
  expect(sm.getSource(sourceName)).toBe(fileO);
  expect(sm.getGeneratedPosition(sourceName, 5, 10)).toEqual({
    line: 10,
    column: 8,
  });
});

test('error on a source map with unsupported encoding', async () => {
  expect.assertions(2);

  const file = fs
    .readFileSync(resolve(__dirname, '../../fixtures/junk-inline.mjs'))
    .toString('utf8');
  try {
    await getSourceMap('/', file);
  } catch (e) {
    expect(e instanceof Error).toBe(true);
    expect(e.message).toBe(
      'Sorry, non-base64 inline source-map encoding is not supported.'
    );
  }
});
