---
title: 使用 Azure user delegation SAS 來簽署 Blob 權限
date: 2020-04-19 23:38:21
categories: ["程式", "雲端"]
tags: ["短篇","Azure","Blob"]
description: 最近在把原本使用 AWS S3 的服務轉往 Azure storage，需要實作類似 S3 中 Presigned URL 的功能，順便寫點筆記紀錄一下，這篇文章我會使用微軟建議的 User delegation SAS 來增加安全性。
---
最近在把原本使用 AWS S3 的服務轉往 Azure storage，需要實作類似 S3 中 [Presigned URL](https://docs.aws.amazon.com/AmazonS3/latest/dev/ShareObjectPreSignedURL.html) 的功能，順便寫點筆記紀錄一下。

# Presigned URL
在 AWS S3 中有個稱為 [Presigned URL](https://docs.aws.amazon.com/AmazonS3/latest/dev/ShareObjectPreSignedURL.html) 的功能，簡單來說你可以產生一個專用的網址給 Client 端，裡面限定權限和使用期限之類的訊息，Client 端拿到這個網址後就可以直接對資源發出請求，例如下載/上傳檔案之類的事情。你可以完全管理權限，流量又不必經由伺服器再到客戶端，在處理大檔案的時候非常實用。

# Azure SAS
在 [Azure Blob storage](https://docs.microsoft.com/en-us/azure/storage/blobs/) (類似 S3 的服務)中也有類似的功能，稱為 shared access signatures (SAS)，我們可以快速的由 Azure portal 中產生 SAS Token：

{% image azure-portal-gen-sas.png "由 Azure portal 產生 SAS Token" %}

## SAS 分類
在 Azure 中，SAS 有這三種分類：
- **User delegation SAS** - 由 [Azure Active Directory](https://azure.microsoft.com/zh-tw/services/active-directory) 來產生 (只支援 Blob)。
- **Service SAS** - 由 Account Key 產生，可以套用到 Storage 服務 (Blob, Queue ...) 之一。
- **Account SAS** - 由 Account Key 產生，可以產生比 Service SAS 更多的權限，例如 Read service properties 之類的。

# References
- [Microsoft Azure - Grant limited access to Azure Storage resources using shared access signatures (SAS)](https://docs.microsoft.com/en-us/azure/storage/common/storage-sas-overview)
- [Microsoft Azure - Get User Delegation Key](https://docs.microsoft.com/en-us/rest/api/storageservices/get-user-delegation-key)