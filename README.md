# ILOVEBOBA 🧋

**ILOVEBOBA** 是一個充滿儀式感的珍奶紀錄應用。它不只是紀錄你喝了什麼，更將每一杯手搖飲的回憶轉化為精美的「拍立得」與「消費收據」，讓數據變得溫暖且具備收藏價值。

![Version](https://img.shields.io/badge/version-7.7-blue.svg) ![Status](https://img.shields.io/badge/status-active-success.svg)

## ✨ 精選特色

*   **📸 回憶拍立得牆 (Memory Wall)**
    *   採用 **Masonry 瀑布流佈局**，優雅展示每一張珍奶照片。
    *   每張照片都帶有擬真的 **Washi Tape (紙膠帶)** 效果，隨機顏色與角度，還原手帳拼貼感。
    *   照片經過 Cloudinary 智慧裁切，確保重點清晰。

*   **🔄 3D 翻轉互動 (Flip Interaction)**
    *   點擊任一張拍立得，卡片會以 3D 方式流暢翻轉。
    *   **背面：擬真收據 (Receipt)**。這不是一張靜態圖片，而是一個可以 **捲動** 的長條明細。

*   **🧾 沉浸式收據體驗 (Physical Paper Scroll)**
    *   **擬真捲動**：收據內容可以在固定的視窗內捲動，就像在看一張長長的明細表。
    *   **無邊界視感**：頂部與底部設有 **漸層遮罩 (Gradient Overlays)**，模擬收據從機器中列印出來或延伸至視線之外的效果。
    *   **紙張質感**：擁有鋸齒邊緣 (Sawtooth edge) 與噪點紋理 (Noise texture)。

*   **🏆 成就與統計**
    *   即時統計喝過的飲料總數、總花費。
    *   「最近喝的一杯」即時展示。

## 🛠️ 技術架構

這是一個 **Single File Application (單一檔案應用)**，主要邏輯都封裝在 `iloveboba.html` 中，方便部署與分享。

*   **Frontend (前端)**:
    *   **React 18** (透過 CDN 引入): 處理 UI 組件與狀態管理。
    *   **Tailwind CSS** (透過 CDN 引入): 處理所有樣式與響應式設計。
    *   **Lucide React**: 提供精美的圖標。
*   **Backend (後端)**:
    *   **Google Apps Script (GAS)**: 作為 API Server，處理數據讀寫。
    *   **Google Sheets**: 作為無伺服器資料庫 (Database)。
*   **Media (媒體服務)**:
    *   **Cloudinary**: 負責圖片的託管、優化與即時裁切 (Transformations)。

## 🚀 版本紀錄 (Latest)

### v7.7 (Current)
*   **🐛 修復成就照片顯示問題**: 修正「嘗百草」、「飲料成癮」、「獨吞大師」等成就缺少時間戳記，導致無法正確連結照片的 Bug。
*   **🛡️ 容錯機制 (Fallback Logic)**: 新增舊資料救援機制，自動透過「使用者+成就名稱」連結遺失 ID 的照片，救回消失的回憶。

### v7.6
*   **🎯 可擴展收據邏輯**: 實作 `receiptLogic` 系統 (SNAPSHOT/DUO/HISTORY)，根據成就類型動態生成不同收據內容。
*   **🖱️ 收據存根可點擊**: 沒有照片的歷史紀錄也能開啟 Lightbox，自動翻轉顯示收據。
*   **🖥️ 桌面版 UI 放大**: Modal 寬度增加至 `max-w-2xl`，收據存根高度提升為 180px。
*   **🐛 修復**: 解決 Lightbox 在缺少 timestamp 時崩潰的問題。

### v7.5
*   **✨ 視覺優化**: 收據捲動視窗改用 **Fixed Gradient Overlays**，解決了邊緣模糊與小白點的問題。
*   **↕️ 透明留白**: 收據頂端與底端加入留白，營造更好的閱讀呼吸感。

### v7.0 - v7.4
*   引入 **Receiptify** 風格設計。
*   重構 Lightbox 為 **動態高度 (Dynamic Height)** 支援。
*   修復圖片上傳與數據同步問題。

## 📦 如何使用

1.  直接瀏覽器打開 `iloveboba.html` 即可預覽。
2.  需確保網路連線正常以加載 React 與 Tailwind 資源。
3.  點擊右上角 `+` 按鈕可新增新的珍奶回憶（需連接後端 API）。

---
*Made with ❤️ and lots of Sugar.*
