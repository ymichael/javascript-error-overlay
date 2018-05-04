/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* @flow */
import {
  register as registerError,
  unregister as unregisterError,
} from './effects/unhandledError';
import {
  register as registerPromise,
  unregister as unregisterPromise,
} from './effects/unhandledRejection';
import {
  register as registerStackTraceLimit,
  unregister as unregisterStackTraceLimit,
} from './effects/stackTraceLimit';
import {
  permanentRegister as permanentRegisterConsole,
} from './effects/proxyConsole';
import {
  getStackFrames,
  getStackFramesFast,
}from './utils/getStackFrames';

import type { StackFrame } from './utils/stack-frame';

const CONTEXT_SIZE: number = 3;

export type ErrorRecord = {|
  error: Error,
  unhandledRejection: boolean,
  contextSize: number,
  stackFrames: StackFrame[],
|};

export function listenToRuntimeErrors(
  crash: ErrorRecord => void,
  filename: string = '/static/js/bundle.js'
) {
  function crashWithFrames(error: Error, unhandledRejection = false) {
    const _crashInner = function(stackFrames) {
      if (stackFrames == null) {
        return;
      }
      crash({
        error,
        unhandledRejection,
        contextSize: CONTEXT_SIZE,
        stackFrames,
      });
    };
    getStackFramesFast(error)
      .then(_crashInner)
      .then(() => {
        return getStackFrames(error, CONTEXT_SIZE, true /* skipSourceMap */)
      })
      .then(_crashInner)
      .then(() => {
        return getStackFrames(error, CONTEXT_SIZE, false /* skipSourceMap */)
      })
      .then(_crashInner)
      .catch(e => {
        console.log('Could not get the stack frames of error:', e);
      });
  }
  registerError(window, error => crashWithFrames(error, false));
  registerPromise(window, error => crashWithFrames(error, true));
  registerStackTraceLimit();
  permanentRegisterConsole('error', (...args) => {
    if (args.length === 1 && args[0] instanceof Error) {
      crashWithFrames(args[0], false);
      return;
    }
    // TODO: Unhandled console.error.
    console.warn('TODO: Unhandled console.error');
  });

  return function stopListening() {
    unregisterStackTraceLimit();
    unregisterPromise(window);
    unregisterError(window);
  };
}
