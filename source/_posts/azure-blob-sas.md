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

## 使用 Account key 來產生 SAS
這邊使用 [Javascript SDK](https://www.npmjs.com/package/@azure/storage-blob) 來示範產生 SAS，Account KEY 可以在 Storage Account 下找到：

{% image azure-account-key.png "Azure portal account key" %}

```typescript
import {
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
  BlobSASPermissions,
} from "@azure/storage-blob";

const params = generateBlobSASQueryParameters(
  {
    containerName: "<container name>",
    blobName: "<blob path>",
    // read
    permissions: BlobSASPermissions.parse("r"),
    // expire in one minute
    expiresOn: new Date(Date.now().valueOf() + 60000),
  },
  new StorageSharedKeyCredential("<account name>", "<account key>")
);
```

這種方法雖然方便，但必須要把 Account key 傳入程式，也不能有近一步的權限控制，像是只能產出讀取權限的 SAS。Azure 提供了(也建議使用)另外一種方法來產生 SAS：

## 使用 User delegation key 來產生 SAS
使用這個方法需要多一個步驟：取得 User delegation key，您的程式必須要有下列權限

```
Microsoft.Storage/storageAccounts/blobServices/generateUserDelegationKey
```

簡單的流程如下，
- 取得 Credential (可以藉由 [App registrations](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app) 或其他方式綁定權限)
- 取得 User delegation key
- 簽署 SAS

```typescript
import { DefaultAzureCredential } from "@azure/identity";
import {
  BlobServiceClient,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";

// Load default credential
const credential = new DefaultAzureCredential();
const blobServiceClient = new BlobServiceClient(
  `https://<account name>.blob.core.windows.net`,
  credential
);
const userDelegationKey = await blobServiceClient.getUserDelegationKey(
  new Date(),
  new Date(Date.now().valueOf() + 60000)
);

const params = generateBlobSASQueryParameters(
  {
    containerName: "<container name>",
    blobName: "<blob path>",
    // read
    permissions: BlobSASPermissions.parse("r"),
    // expire in one minute
    expiresOn: new Date(Date.now().valueOf() + 60000),
  },
  userDelegationKey,
  "<account name>"
);
```

使用這種方式就不需要把 Account Key 傳入了，比較安全也比較有彈性。

這邊文章就簡單地錄到這邊了，實際上我打算 assign role 到 scale set 上，這樣連 app secret 也不需要煩惱。我接觸 Azure storage 其實沒很久，有任何錯誤還麻煩指教😃。

# References
- [Microsoft Azure - Grant limited access to Azure Storage resources using shared access signatures (SAS)](https://docs.microsoft.com/en-us/azure/storage/common/storage-sas-overview)
- [Microsoft Azure - Get User Delegation Key](https://docs.microsoft.com/en-us/rest/api/storageservices/get-user-delegation-key)
