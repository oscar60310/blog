---
title: 中繼憑證設定遺失問題
date: 2021-05-04 23:07:05
categories: ["程式", "雲端"]
tags: ["短篇"]
description: 簡單解釋中繼憑證以及未正確設定時會發生的問題。
geo: chain-missing
---

### 甚麼是中繼憑證

一般來說，證書頒發機構 (certificate authority, CA) 不會用真正的根憑證 (Root Certificate) 來簽發給使用者的憑證，畢竟終端使用者這麼多，放在線上每天簽屬風險太大。相對的，CA 會使用根憑證先簽發一張憑證，再用這張憑證來簽發給大家的憑證，這張憑證就稱為「中繼憑證」(或中間憑證，Intermediate Certificate)。

比如說著名的 Let's Encrypt，目前 (2021 五月) 使用的根憑證是 DST Root CA X3，用來簽發的憑證則是 R3：

{% image let-encrypt-certs.png "Let's Encrypt 憑證，圖片來自 https://letsencrypt.org/certificates/ " %}

使用他們簽出來憑證的網站路徑會長得像這樣：

{% image lets-encrypt-path.png %}

在我們申請憑證通過驗證後，機構會給我們憑證 (certificate.crt)，通常也會附上 CA Bundle File (ca_bundle.crt)，ca_bundle.crt 包含根憑證和中繼憑證，而 certificate.crt 會包含伺服器憑證和中繼憑證。

使用 openssl 檢查會發現只有 certificate.crt 是不夠的，必須配合 CA Bundle File。

```bash
$ openssl verify ca_bundle.pem
ca_bundle.pem: OK
$ openssl verify certificate.pem
CN = <your host>
error 20 at 0 depth lookup: unable to get local issuer certificate
error certificate.pem: verification failed
$ openssl verify -CAfile ca_bundle.crt certificate.crt
certificate.crt: OK
```

不同的伺服器需要不同的設定來完整 Cert Chain，以 Nginx 來說，他要求我們把 ca bundle 和 certificate 合併到一個檔案：

```bash
$ cat certificate.crt bundle.crt > chained.crt
```

http://nginx.org/en/docs/http/configuring_https_servers.html#chains

把合併好的檔案放到伺服器上就沒問題了。

### 中繼憑證未設定時會發生什麼

https://incomplete-chain.badssl.com/

這是一個中繼憑證未設定完整的網站 (只放 certificate.crt)，大家應該會發現大部分瀏覽器可以正常開啟，但使用 curl 等指令時就會得到錯誤。

```bash
curl https://incomplete-chain.badssl.com/
curl: (60) SSL certificate problem: unable to get local issuer certificate
More details here: https://curl.haxx.se/docs/sslcerts.html

curl failed to verify the legitimacy of the server and therefore could not
establish a secure connection to it. To learn more about this situation and
how to fix it, please visit the web page mentioned above.
```

這是因為主流瀏覽器像是 Chrome 會自動下載中繼憑證 ([AIA](https://tools.ietf.org/html/rfc3280#section-4.2.2.1) Fetching)，而 curl 不會，這也是很多人會忽略中繼憑證設定的原因，憑證放好，瀏覽器打開發現沒問題，就收工了 😂

### 線上檢查

我們可以利用 [What's My Chain Cert?](https://whatsmychaincert.com/?incomplete-chain.badssl.com) 來協助檢查伺服器設定，只需要輸入主機 Host，就可以知道有沒有正確設定，如果不正確還可以直接下載正確的設定來用 (不過我建議還是自己去 CA 官網找比較保險)。

### References

- https://whatsmychaincert.com/?incomplete-chain.badssl.com
- https://github.com/chromium/badssl.com
- https://medium.com/@superseb/get-your-certificate-chain-right-4b117a9c0fce
- https://help.zerossl.com/hc/en-us/articles/360058295894-Installing-SSL-Certificate-on-NGINX
