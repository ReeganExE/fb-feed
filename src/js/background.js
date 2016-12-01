var basePage = 'index.html',
    homePage = chrome.runtime.getURL(basePage);

function focusTab() {
    chrome.tabs.create({ url: basePage });
}

chrome.browserAction.onClicked.addListener(function (tab) {
    focusTab();
});