const div = document.createElement('div')
div.style.position = "absolute"
div.style.top = "0px"
div.style.left = "0px"
div.style.backgroundColor = "red"
div.style.zIndex = "100"
document.body.appendChild(div)

var chat

function waitForElement(query) {
  return new Promise((res) => {
    function wait() {
      const element = document.querySelector(query)
      if (element) {
        res(element);
      } else {
        requestAnimationFrame(wait);
      }
    };
    wait();
  })
};

function onInactive(callback) {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      callback()
    }
  }, false);
}

async function main() {
  const el = await waitForElement('[data-tooltip = "Chat with everyone"]')
  onInactive(() => setup(el));
}

async function setup(btn) {
  const chatBar = await getChatBar(btn)
  if (!chat) {
    chat = openWindow()
    setupChatBar(chat, chatBar)
  } else {
    chat.focus()
  }
  observeMutations(chatBar, chat)
  setupChat()
}

async function getChatBar(btn){
  let chatBar = document.getElementsByClassName("z38b6 CnDs7d hPqowe")[0]

  if (!chatBar) {
    btn.click()
    await waitForElement('.z38b6.CnDs7d.hPqowe')
    chatBar = document.getElementsByClassName("z38b6 CnDs7d hPqowe")[0]
  }
  return chatBar
}

async function observeMutations(chatBar, chat){
  let toggle = false

  function callback(mutationsList) {
    toggle = !toggle
    if (toggle) return

    for(const mutation of mutationsList) {
      for (const node of mutation.addedNodes) {
        if (node.dataset.updated === "true") return
        chat.postMessage(node.outerHTML, "*");
        node.dataset.updated = "true"
      }
    }
  }

  let observer = new MutationObserver(callback);
  observer.observe(chatBar, {childList: true, subtree: true});
}

function setupChatBar(chat, chatBar){
  for (const node of chatBar.childNodes) {
    chat.postMessage(node.outerHTML, "*");
  }
}

function openWindow() {
  const src = chrome.runtime.getURL('src/popup/popup.html');

  return window.open(
    src,
    "Chat",
    "toolbar=0, location=0, status=0, menubar=0, width=400, height=350, scrollbar=1"
  );
}

async function setupChat() {
  const src = chrome.runtime.getURL('');
  const input = await waitForElement('[name="chatTextInput"]')
  const btn = await waitForElement('[data-tooltip = "Send message"]')

  window.addEventListener("message", (e) => {
    if (e.origin + '/' === src) {
      input.value = e.data
      btn.ariaDisabled = null
      btn.click()
    }
  }, false);
}

window.onload = main