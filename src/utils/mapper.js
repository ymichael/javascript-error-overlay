/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* @flow */
import StackFrame from './stack-frame';
import { cachedFetch as fetch, cachedGetSourceMap as getSourceMap } from './cachedHelpers';
import { getLinesAround } from './getLinesAround';
import { settle } from 'settle-promise';

/**
 * Enhances a set of <code>StackFrame</code>s with their original positions and code (when available).
 * @param {StackFrame[]} frames A set of <code>StackFrame</code>s which contain (generated) code positions.
 * @param {number} [contextLines=3] The number of lines to provide before and after the line specified in the <code>StackFrame</code>.
 */
async function map(
  frames: StackFrame[],
  contextLines: number = 3,
  skipSourceMap: boolean = false,
): Promise<StackFrame[]> {
  const cache: any = {};
  const files: string[] = [];
  frames.forEach(frame => {
    const { fileName } = frame;
    if (fileName == null || fileName == window.location.href) {
      return;
    }
    if (files.indexOf(fileName) !== -1) {
      return;
    }
    files.push(fileName);
  });
  await settle(
    files.map(async fileName => {
      const fileSource = await fetch(fileName).then(r => r.text());
      const map = skipSourceMap ? null : await getSourceMap(fileName, fileSource);
      cache[fileName] = { fileSource, map };
    })
  );
  return frames.map(frame => {
    const { functionName, fileName, lineNumber, columnNumber } = frame;
    let { map, fileSource } = cache[fileName] || {};
    const scriptCode = fileSource ?
      getLinesAround(lineNumber, contextLines, fileSource) : null;
    if (map == null || lineNumber == null) {
      return new StackFrame(
        functionName,
        fileName,
        lineNumber,
        columnNumber,
        scriptCode,
      );
    }
    const { source, line, column } = map.getOriginalPosition(
      lineNumber,
      columnNumber
    );
    const originalSource = source == null ? [] : map.getSource(source);
    return new StackFrame(
      functionName,
      fileName,
      lineNumber,
      columnNumber,
      scriptCode,
      functionName,
      source,
      line,
      column,
      getLinesAround(line, contextLines, originalSource)
    );
  });
}

export { map };
export default map;
