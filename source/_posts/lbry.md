---
title: "LBRY 基本介紹"
date: 2020-12-30 19:39:20
tags: ["短篇", "加密貨幣"]
categories: ["雜談"]
---

我最近看到 [好和弦在談論 LBRY](https://youtu.be/62zoHP6p1Lc)，覺得是個很有趣的想法，於是稍微研究了一下官方的 Spec，整理一篇文章來談談 LBRY 的技術內容。

## 甚麼是 LBRY

{% image lbry-icon.svg "LBRY，圖片來自官網" full %}

現在如果我們想上傳一部影片，YouTube 一定是大家的首選，Google 利用大家的資訊，提供廣告商精準的投放平台，讓使用者們可以免費的觀看影片，[分潤](https://support.google.com/youtube/answer/72857?hl=zh-Hant)機制也讓還沒有能力獨立談到業配的 YouTuber 們能有基本的收入。不過隨著 YouTube 越來越大，壟斷的爭議也越來越多，創作者們為了有更多的觸擊率，開始製作 YouTube 喜歡的影片，平台開始「審查」影片內容來決定創作者們能否取得收益。

大家開始注意到把所有資訊集中在同一個地方的風險，我們不應該過度相信一家公司，或許我們可以把影片分散放在世界各地，這麼一來就沒有人或公司可以「審核」我們的內容了，於是 LBRY 就誕生了，簡單來說，LBRY 是一個協議，規定一個去中心化資訊交換協定：我要怎麼上傳內容、要怎麼找到內容、要怎麼下載內容等等等，這裡指的內容可能是影片、書籍、圖片等等數位資料。

看到這裡大家可以會覺得很熟悉，這不就是 [BitTorrent](https://en.wikipedia.org/wiki/BitTorrent) 嗎？</br>沒錯，LBRY 想要構建 P2P + BlockChain 的世界，利用區塊鍊來補足 BT 缺陷。

## 生態系

LBRY 所構想的生態系大致可以由三個層面組成：Blockchain (區塊鍊)、Data Network (資料交換)、Applications (應用)。

### Blockchain

在 BitTorrent 的世界裡，我們將檔案分割傳給其他人後，會得到種子 (.*torrent*)，我們得把這個種子傳給其他人，或是利用 BT 搜尋引擎將種子散播出去，裡面紀錄了這些檔案的資訊，其他人利用這些資訊就可以下載檔案。

在 LBRY 中，這部分被區塊鍊所取代，我們上傳影片後，將影片的資訊寫入區塊鍊中，包刮影片名稱、描述、長度、作者等等，以及最重要的影片 Hash，大家可以藉由這個 Hash 向 Data Network 下載資料 (P2P)，這麼一來，我們不會因為搜尋引擎、論壇倒閉而失去種子資訊。

一個完整的影片資訊 (claim) 如下：

```json
{
	address: "bCtBkaxRkyYmDaWHrsXiZ1NaUtptxvzUfF",
    amount: "0.01",
    is_channel_signature_valid: true,
    value: {
      description: "🎉新的 podcast 節目「好檸檬 NiceLemon」....",
      languages: [
        "es"
      ],
      license: "Copyrighted (contact publisher)",
      release_time: "1602928826",
      source: {
        hash: "6bdb49d045d1b3948b46651bb27d9244b2b9e4f1c929f89af33b27158ad4d10b6d89306f74ff183cb4cffefc4386ae96",
        media_type: "video/mp4",
        name: "feat-aiko.mp4",
        sd_hash: "e27f080636c455f8b8f307cdde80049162f294c65c0a50699a0d08b2148aa1a9626f94a2b27b2aae7cd7856847a640eb",
        size: "64950543"
      },
      stream_type: "video",
      thumbnail: {
        url: "https://thumbnails.lbry.com/kw77b7mM0cU"
      },
      title: "好和弦教你如何「拉丁風」～ [feat. 蛋餅好朋友 Aiko]",
      video: {
        duration: 505,
        height: 1080,
        width: 1920
      }
    }
}
```





在發布影片資訊實，我們可以選擇使用 [Channel](https://lbry.tech/spec#channels) 來簽名，Channel 代表著一個身分，所以在 LBRY 中影片的上傳人是可以被驗證的。(想到在 Fxxx 中，不管什麼檔名的影片全部都是 A 片 😅)

LBRY 也提到平台抽成的問題，目前大部分的平台都會向創作者抽取 30% 左右的費用，所以 LBRY 也在區塊鍊中實作了付費功能，你可以將你的內容設定為付費觀看，這麼一來大家想看影片就比需先付費給你，而且不經由任何平台，只需要付礦工手續費就好。因為儲存在大家電腦中的資料其實是加密的，所以就算我有你的影片區塊，沒有付費獲得金鑰也沒有辦法看，不過要如何避免解密後被再次使用我就不清楚了。







## References

- [LBRY.com](https://lbry.com/)
- [LBRY Overview](https://lbry.tech/overview)