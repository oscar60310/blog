---
layout: post
title: "智慧體重計破壞筆記"
date: 2018-05-10 18:20:00 +0800
categories: javascript IoT
---

這是我簡單紀錄去年體重計壯烈犧牲的過程，利用樹莓派接收智慧體重計發送的藍芽訊號，達到不用手機也能把數據上傳到雲端的~~無用~~功能。

## 改造體重計(物理)

2017 年底剛好有每天記錄體重的需求，又不想要每次量完都得開電腦手動紀錄，所以就把腦動到體重計上了，如果能把量測到的數值傳到[樹莓派](https://www.raspberrypi.org/products/raspberry-pi-3-model-b-plus/)上，再利用 wifi 訊號傳到 Google Fit 上，應該能大幅增加每天記錄體重的成功機率 !

![1_Connect_Directly](/images/blogs/smart-scale/1_Connect_Directly.svg)

火速到電子材料行買了 [HX-711](https://www.mouser.com/ds/2/813/hx711_english-1022875.pdf) 感測模組，體重計上有四個 Load Cell ，只要把他們組成一組[惠斯同電橋](https://en.wikipedia.org/wiki/Wheatstone_bridge)，再把輸出訊號給壓力模組，最後利用樹莓派接收轉好的數位訊號就大功告成了，就和這[這個網站](https://learn.sparkfun.com/tutorials/getting-started-with-load-cells)寫的一樣簡單:)

![2_HX711_AND_BIRDGE](/images/blogs/smart-scale/2_HX711_AND_BIRDGE.svg)

我俐落的剪斷 Load Cell 的電線，然後組成惠 ...

![3_BROKEN_SCALE](/images/blogs/smart-scale/3_BROKEN_SCALE.png)

**沒有**，花了兩小時後，我把整組電路連著體重計一起放到櫃子裡收藏了。剛好遇到雙十一電商們推出的特惠活動，一台有藍芽功能的智慧體重計就這樣神奇的出現在我的桌上 XD

<div class='info' style='box-shadow: -5px 0px #009688;padding-left: 10px;'>
舊的不去，新的不來
</div>

## 雲麥好輕

還是乖乖用軟體的方式解決吧...

<div class='info' style='box-shadow: -5px 0px #ff9800;padding-left: 10px;margin-bottom: 20px'>
先說會挑這款體重計只是因為剛好有藍芽功能符合需求而已，沒有要工商，也沒有要詆毀這個產品的意思 ^_^
</div>

新入手的是「雲麥好輕 mini2」這台體脂計，優惠過後 500 塊台幣有找，可以在 Google Play 上下載專用的應用程式，連線上產品就可以使用了，有個小缺點就是他沒有記憶功能，所以每次量體重的時候都得開著 APP，還有程式一打開就要求的權限 ... 怪不能評分會如此悽慘 XD

![4_YUNMAI_APP_SNAPSHOT](/images/blogs/smart-scale/4_YUNMAI_APP_SNAPSHOT.png)

## 查看藍芽訊息

在開始寫程式前，我們得想想如何解析體重計傳送的藍芽訊號，透過 [nRF Connect for Mobile](https://play.google.com/store/apps/details?id=no.nordicsemi.android.mcp&hl=zh_TW) 這款應用程式連接上 BLE 裝置，先來看看到底有什麼資料會傳出來。連線上體重計後，顯示面板上的藍芽指示燈也成功亮起，這時候就可以來看看傳送的資料啦。

<div style="width: 100%;overflow-x:auto;margin-bottom:10px;text-align:center">
<iframe width="350" height="300" src="https://www.youtube-nocookie.com/embed/1u8iratFeBM?rel=0&amp;controls=0&amp;showinfo=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
</div>
影片中畫面和顯示有些微的時間差，但還是可以看出當重量變化時，後 4 個 byte 會不斷的變化。例如當重量是 5.5 時收到的值是

```
0D-1F-0B-01-5A-F4-6F-BF-[02-28]-41
```

影片中可以看到第八個 byte 值隨著時間每秒往上加，所以我猜這個和時間有關，第九和十個 byte 就有趣了，把它換成十進位的話是 `552`，除上 100 就是螢幕上顯示的體重 !

當重量穩定後，體重計會測量體脂和其他訊息，這時候傳送出來的訊息就變多了，下面這段影片顯示穩定後的資料。

<div style="width: 100%;overflow-x:auto;margin-bottom:10px;text-align:center">

<iframe width="350" height="300" src="https://www.youtube-nocookie.com/embed/a4uKwkjseZc?rel=0&amp;controls=0&amp;showinfo=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
</div>

重量穩定在 5.3 時的訊息是

```
0D-1F-12-02-00-5A-F4-6F-B6-00-00-00-00-[02-12]-00-00-00-00-6E
```

可以看到 14 和 15 位 `0212` 轉十進位是 `530`，體重的訊息在這邊，後面接的零是因為我不是真人站在上面，所以沒有體脂之類的訊息

<div class='info' style='box-shadow: -5px 0px #009688;padding-left: 10px;'>
    至於訊息中的其他資訊因為不會顯示在體重計螢幕上，可能得開 APP 來比對，這部分得靠其他大神了
</div>

## 使用 NodeJs 連接

知道 Service UID 和內容代表的意思後，就是寫程式連接的時候啦，只要能和 BLE 裝置通訊的語言都可以，這次我用 node js 搭配 [noble](https://github.com/noble/noble) 這個模組，它可以讓我們很簡單的處理通訊的問題。

首先開啟藍芽搜索設備，當發現體重計時(利用 uuid 判斷)，發送連接要求。

```javascript
// 當找到目標藍芽設備時，停止掃描，並發送連線要求
noble.on("discover", peripheral => {
  if (peripheral.uuid === yunId) {
    noble.stopScanning();
    peripheral.on("connect", onDeviceConnected);
    peripheral.on("servicesDiscover", onServicesDiscover);
    device = peripheral;
    peripheral.connect();
  }
});
// 當設備狀態轉為 poweredOn 時，開始掃描週邊的藍芽設備
noble.on("stateChange", state => {
  if (state === "poweredOn") {
    noble.startScanning();
  }
});
```

當連接上裝置後，這時候體重計上藍芽連線指示燈應該會亮起，尋找目標 Service 以及 Characteristics。

```javascript
// 找特定 service
function onDeviceConnected(event) {
  device.discoverServices(["ffe0"]);
}
// 找 characteristics
function onServicesDiscover(service) {
  service[0].once("characteristicsDiscover", onCharFound);
  service[0].discoverCharacteristics();
}
```

找到 characteristics 後，我們得訂閱之後裝置才接收的到更新，最後就是處理接收到的資料。
資料處理分兩部份，短資料代表重量還不穩定，長資料代表量測完成，這時我們就可以把資料儲存起來。

```javascript
// 訂閱
function onCharFound(chara) {
  chara[0].on("read", onReceiveData);
  chara[0].notify(true);
}
// 收到資料
function onReceiveData(data, notify) {
  // 短資料
  if (data.length === 11) {
    done = false;
    const weight = (data[8] * 256 + data[9]) * 0.01;
    // 處理尚未穩定的重量
  } else if (data.length === 20 && !done) {
    done = true;
    const weight = (data[13] * 256 + data[14]) * 0.01;
    // 處理量測完成的重量
  }
}
```

結合到 ionic 應用程式後，放到樹梅派上，和體重計通訊的部分就完成了，結果如下面的影片，上方式應用程式中的畫面，下方為體重機螢幕

<div style="width: 100%;overflow-x:auto;margin-bottom:10px;text-align:center">
<iframe width="430" height="315" src="https://www.youtube-nocookie.com/embed/36ocp1pQ10w?rel=0&amp;controls=0&amp;showinfo=0" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
</div>

<div class='info' style='box-shadow: -5px 0px #009688;padding-left: 10px;'>
    當樹梅派上的按鈕被按下後，我們才會去連接體重計，並在量測完後馬上斷開連線
</div>

## 上傳資料

[Google Fit API](https://developers.google.com/fit/) 可以讓我們上傳體重資訊，並在 Google FIT 中和運動時間等等其他數據一同檢視，這部分只要參考官方文件，應該就能順利新增資料。

## 後計

搞這些東西多花的時間，應該夠我手動紀錄體重好幾年了吧 XD
在 Github 上有個開源 APP 叫做 [OpenScale](https://github.com/oliexdev/openScale)，他支援很多藍芽體重計，朋友們也可以試試看直接使用。

## Credit

本篇部落格中的圖片來自下列網站

- [Smalllikeart from Flaticon](https://www.flaticon.com/authors/smalllikeart)
- [Smashicons from Flaticon](https://www.flaticon.com/authors/smashicons)
- [Monkik from Flationc](https://www.flaticon.com/authors/monkik)
