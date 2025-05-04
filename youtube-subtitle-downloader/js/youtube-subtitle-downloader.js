import { getParameter } from './common.js'
import { buildGui, notifyNotFound, canInsert } from './gui.js'

let currentUrl = ''


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