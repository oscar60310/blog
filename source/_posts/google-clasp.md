---
title: 使用 Clasp 開發 Apps Script
date: 2020-08-28 21:20:15
tags: ["短篇","非技術","入門","Apps Script"]
categories: ["程式","工具"]
description: qaq
geo: google-clasp-qaqaa
---

# Apps Script
以前會寫少少的 [Apps Script](https://developers.google.com/apps-script/) 來協助操作 Google Sheet 或其他 Google 服務，就是直接從 Google Sheet 裡面的指令碼編輯器直接進到 Script 編輯畫面。

{% image script-editor.png %}

比如說利用 [doPost()](https://developers.google.com/apps-script/guides/web) 來當作 Webhook 塞資料進到表格中之類的簡單功能。

不過這個東西真的不是很好寫，因為是使用 [Rhino](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Rhino) 的關係，只能寫 ES5 語法，沒有 Class、沒有 Arrow Function ... 😂

而且必須使用線上 IDE 的關係，也沒有辦法做版控 ...

# Clasp

還好現在 Apps Script 已經支援 [V8 Runtime](https://developers.google.com/apps-script/guides/v8-runtime) 了，Google 也推出了 [Clasp](https://github.com/google/clasp) 讓你可以在本地開發。他主要有幾個功能：

- 本地開發：用自己習慣的 IDE，好好地做版控，多人一起開發。
- 支援資料夾：原本使用顯上編輯器是沒有階層的，全部的檔案都只能灑在一起，Clasp 會協助我們把結構化的檔案放到 Apps Script。
- 支援 Typescript：除了可以使用新語法，連 Typescript 也支援，實際上會使用 [ts2gas](https://github.com/grant/ts2gas) 將我們的程式轉為 Apps Script 後上傳。

## 安裝與使用
直接使用 npm 安裝

```bash
npm install -g @google/clasp
```

安裝完成後，操作起來就像 Git 一樣

使用現有專案

```bash
clasp clone "https://script.google.com/d/xxxxxx/edit"
```

上傳


```bash
clasp push
```

其他操作像是遠端偵錯等等的功能就麻煩參考官方文件了。

## .claspignore
就如同 gitignore 一樣，clasp 也可以設定那些檔案不要上傳到 Apps Script，因為預設會把所有上傳的檔案都跑過，所以不必要的檔案就不要上傳了，在 ignore file 可以這樣設定：

```txt
**/**
!src/**
!appsscript.json
```

除了 src 底下的檔案和專案設定檔，其他的一律略過，這樣就簡單多啦。

# 結果
當我們 push 回 Apps Script 時，會上傳編譯後的檔案，資料夾也會被換成檔名前墜，不過我們再也不需要維護 Apps Script 的程式了。😁

{% image script-result.png 編譯後的部分程式 %}

# References
- [Github - clasp](https://github.com/google/clasp)
- [Google apps script document](https://developers.google.com/apps-script)