/**
 * Unityのロギング関数をフックして、ログをキャプチャするコード
 */
(function() {
  'use strict';

  window.catanLogBuffer = [];

  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalInfo = console.info;
  const originalDebug = console.debug;

  // Unityが使う内部ロギング関数をフック
  const captureLog = (message) => {
    if (!message) return;

    const logStr = String(message);
    window.catanLogBuffer.push(logStr);

    // window.postMessageでcontent scriptに送信
    window.postMessage({
      type: 'CATAN_LOG',
      message: logStr
    }, '*');
  };

  // console メソッドをオーバーライド
  console.log = function(...args) {
    const message = args.join(' ');
    captureLog(message);
    originalLog.apply(console, args);
  };

  console.warn = function(...args) {
    const message = args.join(' ');
    captureLog(message);
    originalWarn.apply(console, args);
  };

  console.error = function(...args) {
    const message = args.join(' ');
    captureLog(message);
    originalError.apply(console, args);
  };

  console.info = function(...args) {
    const message = args.join(' ');
    captureLog(message);
    originalInfo.apply(console, args);
  };

  console.debug = function(...args) {
    const message = args.join(' ');
    captureLog(message);
    originalDebug.apply(console, args);
  };

  window.addEventListener('error', function(event) {
    const message = `ERROR: ${event.message} at ${event.filename}:${event.lineno}`;
    captureLog(message);
  });

  console.log('[catan connect for japanese] Log capture initialized');
})();
