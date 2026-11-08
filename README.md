# Greens Delight Hub

我想要做一個銷售蔬食商品的網頁，其中一個商品就是紅毛苔，包括中藥口味。薑香口味。原味．並且有三種大包250克。中包150克。小包90克的重量，要讓顧客填資料
而且要製作一個包含能夠串接行銷數據的後台（Meta google），並且能夠串街Line通知的後台管理系統，先給示範資料再讓我後續逐步串接

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f8a3a8e6-02f3-463c-8eba-eee04eee3260).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## 官網流量分析（GA4）

在 GA4 為官網建立網站資料串流，將公開的 `G-…` 評估 ID 設為正式建置環境變數 `VITE_GA4_MEASUREMENT_ID`，重新建置並發布。未設定有效 ID 時，網站不會載入 Google tag。訪客可從頁尾更改分析偏好。

GA4 可用下列事件建立購物漏斗：

1. `view_item`：商品標題進入畫面，每項商品每次進入商店計一次。
2. `add_to_cart`：商品加入購物袋，附品項、規格、數量及金額。
3. `begin_checkout`：前往結帳或開始提交有效購物袋。
4. `order_submitted`：訂單已寫入資料庫並等待確認。可在 GA4 標記為關鍵事件。金額為折後商品金額，不含未確認的運費，也不代表實收營業額。

建議用同一期間的 GA4 漏斗人數計算各階段比率。比較紅毛苔商品層級時，請以相同品項篩選瀏覽及加入購物袋兩步。發布後可用 GA4 即時報表確認事件；初次設定不會補收先前未追蹤的資料。若另外開啟 GA4 加強型評估，建議關閉自動表單互動，使用上述明確定義的購物事件。
