let lastPot

chrome.webRequest.onBeforeRequest.addListener(
    details => {
        if (details.type === 'xmlhttprequest' || details.type === 'fetch') {
            const url = new URL(details.url)
            const pot = url.searchParams.get('pot')
            const fromExt = url.searchParams.get('fromExt')
            if (!fromExt) {
                lastPot = pot
            }
        }
    },
    {
        urls: ["https://www.youtube.com/api/timedtext?*"]
    }
)

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getPot') {
        sendResponse({ pot: lastPot })
        return true
    }
})