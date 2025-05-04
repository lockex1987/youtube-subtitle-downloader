## Tiện ích download subtitle từ YouTube

Screenshot:

![img](images/screenshot%2020190927.png)

Subtitle ở YouTube gọi là Closed Caption.

### Release notes

| Version | Thời gian  | Mô tả                                                        |
| :-----: | :--------: | :----------------------------------------------------------- |
|  0.0.1  | 23/05/2016 | First runable.                                               |
|  0.0.2  | 24/05/2016 | Fix Mozilla review.                                          |
|  0.0.3  | 25/05/2016 | Fix download error (videoId variable is null, langName is required, unescape URL). Change "all_frames" config in manitest.json to false (we don't have to check every frame). Change logo. Change download link to button. |
|  0.0.4  | 07/06/2016 | Change the protocols of used URLs from HTTP into HTTPS to fix error "Blocked loading mixed active content" on Firefox 45. |
|  1.0.0  | 12/03/2017 | Fix CORS error on Firefox 52.                                |
|  1.1.0  | 16/05/2017 | Change how to detect new video (use interval timer). Support new YouTube design. |
|  1.1.1  | 09/08/2018 | Fix bug on new YouTube design.                               |
|  1.2.1  | 27/09/2019 | Tương thích với cả Chrome. Bỏ thuộc tính `applications`: `"applications": {  "gecko": {    "id": "youtube-subtitle-downloader@mozilla.org",    "strict_min_version": "45.0"  }},`Những chỗ nào dùng `browser` thì chuyển thành `chrome`. Fix bug không download được trên phiên bản Firefox mới (do hàm `saveTextAsFile`). Dùng cho Chrome. Refactor code, bỏ hỗ trợ giao diện cũ, fix lỗi không hiển thị vì có nhiều phần tử `#meta`. |
|  2.0.0  | 19/03/2021 | Fix lỗi escape `&quot;` Sử dụng ES6 import module Sử dụng XML parser thay cho biểu thức chính quy ESLint các file JS |
|  2.1.0  | 31/07/2021 | Không sử dụng dynamic import vì bị lỗi trên Firefox 88 (Firefox 90 vẫn chạy được) |
|  3.0.0  | 14/11/2021 | YouTube hạn chế việc gọi API. Parse HTML source code.        |
|  3.1.0  | 14/04/2022 | Cập nhật Manifest V3.                                        |
|  3.2.0  | 20/08/2022 | Return to old Manifest V2 in Firefox. Update YouTube's GUI in Firefox 103. |
|  3.3.0  | 03/01/2023 | Hỗ trợ auto-generated. Manifest version 3 (khi submit lên Firefox vẫn phải version 2). |
|  3.4.0  | 21/02/2023 | Fix bug trong trường hợp thẻ XML text không có nội dung. Refactor lại code. |
|  3.4.1  | 19/09/2023 | Fix bug JSON.parse khi gọi fetch nếu sử dụng uBlock Origin.  |
|  3.4.2  | 16/10/2024 | Fix bug "TrustedHTML"                                        |
|  3.4.3  | 22/03/2025 | Use manifest version 3 (Chrome no longer supports version 2) |

### Tham khảo

https://google2srt.sourceforge.io/en/

https://github.com/ytdl-org/youtube-dl

https://github.com/kyamashiro/youtube-subtitle-download-helper

[Link Firefox](https://addons.mozilla.org/en-US/firefox/addon/youtube-subtitle-downloader/)

[~~Link Chrome (đã bị Google gỡ)~~](https://chrome.google.com/webstore/detail/youtube-subtitle-download/falajjjalaffofcbkhgdemihkpllibom)

[Firefox dashboard](https://addons.mozilla.org/en-US/developers/addons)

[Chrome dashboard](https://chrome.google.com/webstore/developer/dashboard)