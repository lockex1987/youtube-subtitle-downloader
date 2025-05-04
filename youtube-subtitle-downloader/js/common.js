/**
 * Lấy giá trị tham số từ URL.
 * @param {String} param Tên tham số
 * @return {String} Giá trị tham số
 */
export const getParameter = param => {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get(param)
}


/**
 * Save text file (by JS).
 * @param {String} text Nội dung của văn bản cần lưu
 * @param {String} fileName Tên file
 */
export const saveTextAsFile = (text, fileName) => {
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
export const unescapeHTML = inputText => {
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