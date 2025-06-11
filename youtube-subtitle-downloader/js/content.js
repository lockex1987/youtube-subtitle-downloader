// ID của vùng chứa
const CONTAINER_ID = 'captionDownloadContainer'

// Vị trí để thêm thông báo
let insertPosition


let currentUrl = ''


/**
 * Lấy giá trị tham số từ URL.
 * @param {String} param Tên tham số
 * @return {String} Giá trị tham số
 */
const getParameter = param => {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get(param)
}


/**
 * Save text file (by JS).
 * @param {String} text Nội dung của văn bản cần lưu
 * @param {String} fileName Tên file
 */
const saveTextAsFile = (text, fileName) => {
    const textFileAsBlob = new Blob([text], { type: 'text/plain' })
    const hrefLink = window.URL.createObjectURL(textFileAsBlob)

    const downloadLink = document.createElement('a')
    downloadLink.download = fileName
    downloadLink.textContent = 'Download file'
    downloadLink.href = hrefLink
    downloadLink.style.display = 'none'
    downloadLink.addEventListener('click', evt => {
        document.body.removeChild(evt.target)
    })
    document.body.appendChild(downloadLink)
    downloadLink.click()
}


/**
 * Return original form (unescaped) of escaped characters.
 * Có trường hợp xâu là &amp;quot; do đó cần thay thế &amp; trước
 * @param {String} inputText Xâu đầu vào
 * @return {String}
 */
const unescapeHTML = inputText => {
    const ESCAPE_SEQ = [
        /&amp;/g,
        /&quot;/g,
        /&lt;/g,
        /&gt;/g,
        /&#39;/g
    ]
    const UNESCAPE_SEQ = [
        '&',
        '"',
        '<',
        '>',
        '\''
    ]
    for (let i = 0; i < ESCAPE_SEQ.length; i++) {
        inputText = inputText.replace(ESCAPE_SEQ[i], UNESCAPE_SEQ[i])
    }
    return inputText
}


/**
 * Convert from YouTube closed caption format to srt format.
 * @param {String} xml Mã XML
 * @return {String}
 */
const convertFromTimedToSrtFormat = xml => {
    // Ví dụ 1 dòng dữ liệu:
    //   <text start="9720" dur="2680">Lately, I&#39;ve been, I&#39;ve been thinking</p>
    // Đầu tiên là thời gian bắt đầu
    // Tiếp theo là độ dài
    // Tiếp theo là xâu nội dung
    let content = ''
    let count = 1

    let trustedXml
    if (window.trustedTypes && window.trustedTypes.createPolicy) {
        console.log('trustedTypes')
        const trustedPolicy = window.trustedTypes.createPolicy('my-extension-policy', {
            createHTML: s => s
        })
        trustedXml = trustedPolicy.createHTML(xml)
    } else {
        trustedXml = xml
    }

    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(trustedXml, 'text/xml')
    const arr = [...xmlDoc.getElementsByTagName('text')]
    arr.forEach(text => {
        const startTime = parseFloat(text.getAttribute('start'))
        const duration = parseFloat(text.getAttribute('dur'))
        // Sửa dụng text.nodeValue sẽ ra null
        // Phải sử dụng text.textContent hoặc text.childNodes[0].nodeValue
        // Sử dụng text.textContent sẽ tự thay thế các ký tự như &quot;,
        // sử dụng text.childNodes[0].nodeValue thì không
        // const orginalText = text.textContent
        const orginalText = (text.childNodes && text.childNodes.length) ? text.childNodes[0].nodeValue : ''

        const endTime = startTime + duration
        const normalizedText = orginalText
            .replace(/\\n/g, '\n')
            .replace(/\\"/g, '"')
            .trim()

        if (normalizedText) {
            content += count + '\n'
        + formatTime(startTime) + ' --> ' + formatTime(endTime) + '\n'
        + normalizedText + '\n\n'
            count++
        }
    })
    return unescapeHTML(content)
}


/**
 * Format the time (that is in second) to the hh:mm:ss,SSS.
 * @param {Float} timeInSec Thời gian theo giây
 * @return {String}
 */
const formatTime = timeInSec => {
    const SSS = Math.floor(timeInSec * 1000) % 1000
    timeInSec = Math.floor(timeInSec)
    const hh = Math.floor(timeInSec / 3600)
    const mm = Math.floor((timeInSec - hh * 3600) / 60)
    const ss = timeInSec - hh * 3600 - mm * 60
    return (
        fillZero(hh, 2) + ':'
      + fillZero(mm, 2) + ':'
      + fillZero(ss, 2) + ','
      + fillZero(SSS, 3)
    )
}


/**
 * Fill the zero (0) to the left (padding)
 * @param {Integer} num
 * @param {Integer} len
 * @return {String}
 */
const fillZero = (num, len) => {
    let result = '' + num
    for (let i = result.length; i < len; i++) {
        result = '0' + result
    }
    return result
}


/**
 * Download file phụ đề.
 * @param {Object} track Đối tượng phụ đề
 */
const downloadCaptionFile = track => {
    const url = track.baseUrl

    chrome.runtime.sendMessage({ action: 'getPot' }, async response => {
        const pot = response.pot
        const fullUrl = url + '&fromExt=true&c=WEB&pot=' + pot
        const xml = await fetch(pot ? fullUrl : url).then(resp => resp.text())
        const content = convertFromTimedToSrtFormat(xml)
        const fileName = document.title.replace(/ - YouTube/gi, '') + '.' + track.languageCode + '.srt'
        saveTextAsFile(content, fileName)
    })
}


/**
 * Hiển thị danh sách phụ đề mà video có.
 * @param {Array} captionTracks Danh sách phụ đề
 */
const buildGui = captionTracks => {
    removeIfAlreadyExists()

    const container = createOutterContainer('Subtitle: ')
    captionTracks.forEach(track => {
        const link = createDownloadLink(track)
        container.appendChild(link)
    })

    addToCurrentPage(container)
}


/**
 * Thêm giao diện vào trang hiện tại.
 * @param {HTMLDivElement} container Node chứa hiển thị
 */
const addToCurrentPage = container => {
    insertPosition.parentNode.insertBefore(container, insertPosition)
}


/**
 * Only 'view video' page can contain subtitle links.
 * We should only handle 'view video' page, not 'search' page, 'setting' page,...
 * TODO: Đang phải chạy theo giao diện của YouTube, nên để ở Popup để không bị phụ thuộc.
 * @return {Boolean}
 */
const canInsert = () => {
    const selectorList = [
    // New GUI in Firefox 103
        '#bottom-row',

        // Old GUI
        '#meta #meta-contents #container #top-row'
    ]

    // Chúng ta tìm đến vị trí ở trên tên của Channel
    for (const selector of selectorList) {
        insertPosition = document.querySelector(selector)
        if (insertPosition) {
            // insertPosition.style.border = '1rem solid #000'
            return true
        }
    }

    return false
}


/**
 * Create the outter container
 * @param {String} text Xâu nhãn hiển thị
 * @return {HTMLDivElement}
 */
const createOutterContainer = text => {
    const container = document.createElement('div')
    container.setAttribute('id', CONTAINER_ID)
    container.style.padding = '10px 5px 10px 0'
    container.style.margin = '10px 0'
    container.style.color = 'blue'
    container.style.fontSize = '15px'
    container.style.lineHeight = 1.5
    container.textContent = text
    return container
}


/**
 * Tạo link download.
 * @param {Object} track Đối tượng phụ đề
 * @return {HTMLLinkElement}
 */
const createDownloadLink = track => {
    const link = document.createElement('a')
    // Không dùng thuộc tính track.languageCode vì nó dạng mã
    // Thuộc tính track.name.simpleText hiển thị luôn (auto-generated)
    // Ngoài ra có thể kiểm tra theo thuộc tính track.kind là asr
    link.textContent = track.name.simpleText
    link.href = 'javascript:;'
    link.title = 'Please click to download'

    // CSS
    link.style.marginLeft = '10px'
    link.style.cursor = 'pointer'
    link.style.color = 'red'
    link.style.textDecoration = 'underline'
    link.style.background = 'transparent'
    link.style.border = 'none'
    link.style.fontSize = '15px'

    // Click thì download
    link.addEventListener('click', () => {
        downloadCaptionFile(track)
    })
    return link
}


/**
 * Check if the container already exists (show we don't have to process again).
 */
const removeIfAlreadyExists = () => {
    const container = document.getElementById(CONTAINER_ID)
    if (container != null) {
        container.parentNode.removeChild(container)
    }
}


/**
 * Notify that there is no subtitle.
 */
const notifyNotFound = () => {
    removeIfAlreadyExists()
    const container = createOutterContainer('No subtitle')
    addToCurrentPage(container)
}


/**
 * Hàm này sẽ được gọi định kỳ.
 * Kiểm tra xem URL có thay đổi không.
 */
const checkSubtitle = () => {
    const newUrl = location.href
    if (currentUrl != newUrl) {
        const videoId = extractVideoId()
        if (videoId) {
            // Nếu là địa chỉ có video
            if (canInsert()) {
                // Nếu có thể thêm
                currentUrl = newUrl
                getSubtitleList(videoId)
            } else {
                console.log('Cannot insert (yet)')
            }
        } else {
            // Nếu là địa chỉ mà không phải là xem, không có video thì dừng luôn
            currentUrl = newUrl
        }
    }

    // Gọi định kỳ tiếp
    setTimeout(checkSubtitle, 500)
}


const init = () => {
    setTimeout(checkSubtitle, 0)
}


/**
 * @return {String}
 */
const extractVideoId = () => {
    return getParameter('v')
}


// Nếu sử dụng uBlock thì bị lỗi SyntaxError: JSON.parse: unexpected character at line 1 column 1 of the JSON data
const getAjaxText = url => {
    return new Promise((resolve, reject) => {
        const req = new XMLHttpRequest()
        req.addEventListener('load', () => {
            resolve(req.responseText)
        })
        req.open('GET', url)
        req.send()
    })
}


/**
 * @param {String} videoId Video ID
 */
const getSubtitleList = async videoId => {
    const url = 'https://www.youtube.com/watch?v=' + videoId
    // const html = await fetch(url).then(resp => resp.text())
    const html = await getAjaxText(url)
    const regex = /\{"captionTracks":(\[.*?\]),/g
    const arr = regex.exec(html)
    if (arr == null) {
        notifyNotFound()
    } else {
        const match = arr[1]
        const captionTracks = JSON.parse(match)
        buildGui(captionTracks)
    }
}


init()