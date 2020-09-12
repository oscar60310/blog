---
title: Jaxx 錢包被盜
date: 2020-09-13 00:22:03
tags: ["短篇","加密貨幣"]
categories: ["雜談"]
description: "這幾個禮拜托 YFI 的福，幣圈又開始熱絡了起來，不過在使用錢包時需要注意是不是釣魚網站或 APP，這篇文章來分享一個活生生的慘案。"
---

這幾個禮拜托 YFI 的福，幣圈又開始熱絡了起來，身邊的朋友也開始加入市場，這篇文章分享一個發生在身邊的慘案，最後的結果是錢包裡面所有的錢全部被轉走。
如果您的錢包已經遭遇不測，請不用往下看了，這篇文章沒有提供處理方法，請節哀😥。

# Jaxx

{% image jaxx-download-page.png "Jaxx Liberty 網站，圖片來自 Jaxx 官網。" %}

[Jaxx Liberty](https://jaxx.io/) 是由 [Decentral](https://decentral.ca/) 這家加拿大公司所開發的手機熱錢包，可以在手機上管理超過 90 種貨幣。

他們並不會儲存我們的私鑰到伺服器，所有的私鑰都掌握在一串 12 個單字的助記詞(使用 [BIP39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)) 中，誰得到這個字串就能存取錢包，像這個樣子:
```txt
bridge rival rail offer until vehicle tool nose finger eager control bulb
```

# 假冒的 APP
Jaxx 本身是沒甚麼問題的，不過 Google Play 卻上架了假冒 Jaxx 的應用程式:

{% image fake-jaxx.png "假冒的應用程式，圖片來自 Google Play" %}

Logo 和介面都一樣，開發商為 Jaxx Inc (Decentral 才是對的)，還有個五星好評呢。

剩下的事情應該就不用多說了，APP 請你輸入助記詞，顯示網路問題，然後 .... 就沒有了，錢包裡的東西也沒有了。

至於為什麼 Google 會讓這種東西存在? 我想過幾天這個 APP 就會被下架了，然後又會有新的上來，買個開發者帳戶而以沒多少錢 XD

Reddit 上兩個月前就發生過了，現在已經被下架
https://www.reddit.com/r/jaxx/search/?q=fake&restrict_sr=1&type=link

{% image reddit.png "Reddit 搜尋結果，圖片來自 Reddit web 截圖" %}

基本上這種事情和 Jaxx 沒有關係，自然他們也不用負責，官網上建議的解決方案是 ... 到當地政府去報案 
🚓

希望您不是發生事故後才看到這篇文章。

# Reference
- [Jaxx official website](https://jaxx.io/)
- [Reddit r/jaxx](https://www.reddit.com/r/jaxx/)