console.log('[catan connect for japanese] Service Worker started');

const diceToJapanese = {
  '1': 'いち',
  '2': 'に',
  '3': 'さん',
  '4': 'よん',
  '5': 'ご',
  '6': 'ろく',
  '7': 'なな',
  '8': 'はち',
  '9': 'きゅう',
  '10': 'じゅう',
  '11': 'じゅういち',
  '12': 'じゅうに'
};

/**
 * ログメッセージを解析して、特定のイベントに応じた音声を再生する
 * @param message
 * @returns
 */
function processLog(message) {
  // 準備完了
  if (message.includes('Playing Audio') && message.includes('PREP')) {
    // TODO
    return;
  }

  // 盗賊の行動開始
  if (message.includes('Playing Audio') && message.includes('ROBBER_ACTIVE')) {
    // TODO
    return;
  }

  // DICE_x (数字を日本語で出す)
  if (message.includes('Playing Audio') && message.includes('DICE_')) {
    const match = message.match(/DICE_(\d+)/);
    if (match && match[1]) {
      const diceNumber = match[1];
      console.log('[processLog] Detected DICE_' + diceNumber + ' - requesting Japanese speech');
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'SPEAK_TEXT', text: diceToJapanese[diceNumber] || diceNumber});
      });
    }
    return;
  }

  // SIDE_0 (狼の鳴き声)
  if (message.includes('Playing Audio') && message.includes('SIDE_0')) {
    console.log('[processLog] Detected SIDE_0 - requesting wolf sound');
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'PLAY_SOUND', soundType: 'wolf'});
    });
    return;
  }

  // SIDE_1 (ニワトリの鳴き声)
  if (message.includes('Playing Audio') && message.includes('SIDE_1')) {
    console.log('[processLog] Detected SIDE_1 - requesting chicken sound');
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {type: 'PLAY_SOUND', soundType: 'chicken'});
    });
    return;
  }
}

/**
 * content scriptからのメッセージを受け取るリスナー
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[onMessage listener] Received message from content script:', request);
  if (request.type === 'LOG_DETECTED') {
    console.log('[onMessage listener] Processing log...');
    processLog(request.message);
    sendResponse({status: 'received'});
  }
  return true;
});
