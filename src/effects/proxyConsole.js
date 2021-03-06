/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* @flow */

type ConsoleProxyCallback = (message: any) => void;
const permanentRegister = function proxyConsole(
  type: any,
  callback: ConsoleProxyCallback
) {
  if (typeof console !== 'undefined') {
    const orig = console[type];
    if (typeof orig === 'function') {
      console[type] = function __stack_frame_overlay_proxy_console__(...args) {
        let err;
        if (args.length === 1 && args[0] instanceof Error) {
          err = args[0];
        } else {
          err = new Error(args);
        }
        try {
          callback.call(null, err);
        } catch (err) {
          // Warnings must never crash. Rethrow with a clean stack.
          setTimeout(function() {
            throw err;
          });
        }
        return orig.apply(this, args);
      };
    }
  }
};

export { permanentRegister };
