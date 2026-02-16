/**
 * injected.jsをページに注入して、Unityのロギング関数をフックする
 */
(function() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected.js');
  script.onload = function() {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);
})();

/**
 * 特定のイベントをキャプチャして、バックグラウンドスクリプトに送信する
 */
window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  if (event.data.type !== 'CATAN_LOG') return;

  const logMessage = event.data.message;

  try {
    chrome.runtime.sendMessage(
      {
        type: 'LOG_DETECTED',
        message: logMessage,
        timestamp: event.data.timestamp || Date.now()
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error('[catan connect for japanese] Message send error:', chrome.runtime.lastError);
        }
      }
    );
  } catch (error) {
    console.error('[catan connect for japanese] Message send exception:', error);
  }
}, false);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'PLAY_SOUND':
      playSound(request.soundType);
      sendResponse({status: 'playing'});
      break;
    case 'SPEAK_TEXT':
      speakJapanese(request.text);
      sendResponse({status: 'speaking'});
      break;
    default:
  }
  return true;
});

function playSound(soundType) {
  const soundUrl = chrome.runtime.getURL(`sounds/${soundType}.mp3`);
  const audio = new Audio(soundUrl);
  audio.volume = 1.0;
  audio.play().catch(err => console.error('[catan connect for japanese] Sound play error:', err));
}

function speakJapanese(text) {
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
    console.log('[catan connect for japanese] Speaking Japanese:', text);
  } catch (error) {
    console.error('[catan connect for japanese] Speech error:', error);
  }
}
