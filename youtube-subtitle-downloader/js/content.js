const src = chrome.runtime.getURL('js/youtube-subtitle-downloader.js')

/**
 * @param {String} src
 */
const loadJsFile = src => {
    const scriptTag = document.createElement('script')
    scriptTag.src = src
    scriptTag.type = 'module'
    document.head.appendChild(scriptTag)
}

loadJsFile(src)