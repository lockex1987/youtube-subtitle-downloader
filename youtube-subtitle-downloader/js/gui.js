/**
 * Create a download link under the header.
 */
import { saveTextAsFile } from './common.js'
import { convertFromTimedToSrtFormat } from './timed-to-srt-converter.js'


// ID của vùng chứa
const CONTAINER_ID = 'captionDownloadContainer'

// Vị trí để thêm thông báo
let insertPosition


/**
 * Download file phụ đề.
 * @param {Object} track Đối tượng phụ đề
 */
const downloadCaptionFile = async track => {
    const url = track.baseUrl
    const xml = await fetch(url).then(resp => resp.text())
    const content = convertFromTimedToSrtFormat(xml)
    const fileName = document.title.replace(/ - YouTube/gi, '') + '.' + track.languageCode + '.srt'
    saveTextAsFile(content, fileName)
}


/**
 * Hiển thị danh sách phụ đề mà video có.
 * @param {Array} captionTracks Danh sách phụ đề
 */
export const buildGui = captionTracks => {
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
export const canInsert = () => {
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
export const notifyNotFound = () => {
    removeIfAlreadyExists()
    const container = createOutterContainer('No subtitle')
    addToCurrentPage(container)
}