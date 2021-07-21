---
title: Bastion Host - Teleport 介紹
date: 2021-07-20 00:08:20
categories: ["程式", "雲端"]
tags: ["中篇","K8S","工具"]
description: 最近公司內部使用 Teleport 作為 Bastion Host，使用起來非常方便，寫篇文章簡單介紹一下它。
image: og-cover.png
---

## 什麼是堡壘機 Bastion Host

通常我們會把內部的服務像是 Databases 或應用程式放在 Private Subnets，這些機器不能直接由 Public IP 存取，而是藉由 Load Balancers (ALB, ELB) 將流量導向內部的機器，這樣可以保護我們的服務不受外部攻擊，只讓真正需要對外的服務能夠被存取。如下圖所示（通常 Applications 和 Databases 不會放在同一個 Subnet)：

{% image what-is-bastion.jpg %}

不過我們偶爾還是需要 SSH 進去 Private Subnets 中的機器進行部署或診斷，這時候就需要額外的「跳板」讓我們連進機器了，這台機器就稱為 Bastion Host 或 Jump Server。他主要的工作就是控管權限以及對連線做 Logging，讓我們知道哪些資料進出我們的網路。

我們可以直接利用一台 Linux 主機上的 SSH Server 當作 Jump server，指令如下：

```bash
ssh -J jump-server private-host
```

不過如此一來我們必須自己控管每個使用者的 Public Key 以及權限，[Teleport](https://goteleport.com/) 提供我們更豐富的功能。

## Teleport

Teleport 主要提供四種功能：

- Server Access - 和 SSH jump host 很像，我們可以透過 Teleport SSH 進到內部機器。
- Kubernetes Access - 我們可以透過 Teleport 存取 Kubernetes API 以及群集內的服務。
- Applicatoin Access -  讓我們可以快速存取內部 HTTP 服務，這部分我們比較少用到，所以不在此篇文章詳述。
- Database Access - 讓我們可以直接由 Teleport 連進到內部 Database。

首先，我們必須先安裝 Bastion Host，安裝的方式非常簡單，按照官網指示即可：

[Installing Teleport](https://goteleport.com/docs/installation/)

{% info "如果您打算在生產環境使用 Teleport， 請在正式部署前查看 <a href='https://goteleport.com/docs/production'>Teleport Production Guide</a>，裡面有非常詳細的教學。" %}

值得注意的是我們必須在所有的機器上都安裝相同的套件，並利用 [Role](https://goteleport.com/docs/cli-docs/#teleport) 來切換機器的角色，Bastion host 必須為 Proxy 角色，在測試環境中，我們可以把所有 Role 部署在同一個機器上，利用逗號分開即可，例如: `--roles=proxy,node,auth`。

### Server Access

SSH 應該是我們最常使用的功能了，加入 Node 的方式和 K8S 運作方式很像，先和 Teleport 請求 Join Token，之後利用 Token 來加入群集，我們就可以使用 Teleport CLI 或 Web UI 來連線到機器了。

[Server Access Getting Started Guide](https://goteleport.com/docs/server-access/getting-started/)

{% image teleport-server-list.png %}

我們可以直接利用 UI 上的 Connect 按鈕或是 CLI 來連線：

```bash
tsh ssh ubuntu@bastion
```

也可以使用 OpenSSH 設定 Jump server 來連線 [Using Teleport with OpenSSH](https://goteleport.com/docs/server-access/guides/openssh/)。

#### 權限控制

在 Teleport 中，我們可以使用 Labels 來做權限控制，Teleport 支援 [RBAC](https://goteleport.com/docs/access-controls/introduction/)，我們可以控制群組內的成員，也可以設定哪些 Labels 的機器可以被存取。

比如說 intern 只能存取 env =  develop 的機器：

```yaml
kind: role
version: v3
metadata:
  name: intern
spec:
  allow:
    node_labels:
      env: develop
  deny: {}
```

#### Auditing

除了基本的哪些使用者連線到機器，Teleport 還提供了很棒的功能 [Session recording](https://goteleport.com/docs/architecture/nodes/#session-recording)，他能完整的錄下所有的 I/O，並可以直接在 UI 上回放：

{% image session-recording.gif "Session recording" %}

#### SSH Tunnel

雖然使用 SSH 完全沒有問題，但如果要使用 SSH Tunnel 連進 Databases 的話，可能會遇到 Key signing algorithm 不支援的問題，Teleport 只支援 SHA 格式，如果使用不支援 openssh SHA key type 的客戶端就會出問題，比如說 Dbeaver 使用的 [JSch](http://www.jcraft.com/jsch/)。

### Kubernetes Access

我們公司內部有多個 Kubernetes Clusters，對應到不同的還境，以往需要先 SSH 進去機器或把 Kubernetes API forward 出來才可以使用 Kubectl 等工具進行部署，Teleport 提供我們統一的介面來操作多個群集，只需要使用 CLI 登入到指定的群集後，Teleport 會自動更新 Kubeconfig，讓我們可以直接使用 Kubectl 等工具：

```bash
tsh kube login cluster-name
kubectl get pods
```

和 Server Access 一樣，Kubernetes Access 也支援權限控制，當我們向 Teleport 發出 Kubernetes API 要求時，使用的是 Teleport 自行產生的認證，認證成功後 Teleport 才會 Forward requests 到 Cluster 中。

{% image teleport-k8s-access.svg "圖片來自 https://goteleport.com/docs/kubernetes-access/controls/" %}

在 Kubernetes 安裝 Teleport 的方式比較特別，我們需要在群集中建立 [Teleport Agent](https://github.com/gravitational/teleport/tree/master/examples/chart/teleport-kube-agent) ，由 Agent 主動連線到 Proxy server (Basetion)，當我們發送 Kubernetes API 請求後，再由 Agent 替我們執行。安裝 Agent 的方式很簡單，Teleport 提供 Helm Charts 讓我們可以直接使用：

```bash
helm install teleport-kube-agent . \
  --create-namespace \
  --namespace ${TELEPORT_NAMESPACE?} \
  --set roles=kube \
  --set proxyAddr=${PROXY_ENDPOINT?} \
  --set kubeClusterName=${KUBERNETES_CLUSTER_NAME?}
```

如果您實在不想要額外安裝東西在環境中，您也可以將 Kube Config 寫入 Bastion config 中，但必須確保 Bastion 可以連線到目標機器的 Kubernetes API server，請參考 [Kubernetes Access from standalone Teleport](https://goteleport.com/docs/kubernetes-access/guides/standalone-teleport/)。

### Database Access

Database Access 的運作方式和 Kubernetes Access 類似，我們先使用 Teleport 提供的驗證方式連到 Teleport，再由他幫我們轉發要求並套用權限到目標資料庫中，目前支援 PostgreSQL 以及 MySQL。如果您使用雲端服務資料庫的話（例如 AWS RDS），只需要設定好 IAM 並給予 Teleport 適當的 Credential 即可，請參考 [Database Access with PostgreSQL on AWS](https://goteleport.com/docs/database-access/guides/postgres-aws/)。

如果是 Self-Hosted 的資料庫，我們必須要把驗證方式改為 [Certificate Authentication](https://www.postgresql.org/docs/12/auth-cert.html)，Teleport 並不能直接使用 User/Pass 來登入，這點會稍微麻煩一些。

另外，如果您使用 GUI 工具連線到資料庫而不是用 psql, mysql 這類預設的 CLI 工具的話，需要參考 [Database Access GUI Clients](https://goteleport.com/docs/database-access/guides/gui-clients/) 來設定，因為 Teleport 產生的 Private key 是動態的，我們發現很多工具在使用上會有些麻煩。



## 結語

Teleport 目前已經是一套蠻穩定的系統，所以要用在生產環境應該是沒有什麼問題，可以利用 SSO 登入並設定權限實在是很吸引人的功能，實測上 Server Access (SSH) 和 Kubernetes Access 都沒遇到什麼問題，但如果需要利用 Teleport 存取資料庫的話可能需要再研究或是等 Teleport 更成熟再考慮。 



預覽圖 Photo by **[Syed Hasan Mehdi](https://www.pexels.com/@syed-hasan-mehdi-270838?utm_content=attributionCopyText&utm_medium=referral&utm_source=pexels)** from **[Pexels](https://www.pexels.com/photo/derawar-fort-at-sunset-815880/?utm_content=attributionCopyText&utm_medium=referral&utm_source=pexels)**



