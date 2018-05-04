/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* @flow */
import type { StackFrame } from './stack-frame';
import { parse } from './parser';
import { map } from './mapper';

function getStackFramesFast(error: Error): Promise<StackFrame[] | null> {
  return Promise.resolve(parse(error));
}

function getStackFrames(
  error: Error,
  contextSize: number = 3,
  skipSourceMap: boolean = false,
): Promise<StackFrame[] | null> {
  return getStackFramesFast(error)
    .then(bareFrames => {
      return map(bareFrames, contextSize, skipSourceMap);
    })
    .then(enhancedFrames => {
      return enhancedFrames.filter(
        ({ functionName }) =>
          functionName == null ||
          functionName.indexOf('__stack_frame_overlay_proxy_console__') === -1
      );
  });
}

export default getStackFrames;
export { getStackFrames, getStackFramesFast };
