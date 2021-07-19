---
title: 使用 Teleport 當作 Bastion Host 的心得
date: 2021-07-20 00:08:20
categories: ["程式", "雲端"]
tags: ["中篇","K8S"]
description: des
---

## 什麼是堡壘機 Bastion Host

通常我們會把內部的服務像是 Databases 或應用程式放在 Private Subnets，這些機器不能直接由對外 Public IP 存取，而是藉由 Load Balancers (ALB, ELB) 將流量導向內部的機器，這樣可以保護我們的服務不受的外部攻擊，只讓真正需要對外的連線能夠被存取。如下圖所示（通常 Applications 和 Databases 不會放在同一個 Subnet)：

{% image what-is-bastion.jpg %}

不過我們偶爾還是需要直接 SSH 進去 Private Subnets 的機器中進行部署或診斷，這時候就需要額外的「跳板」讓我們連進機器了，這台機器就稱為 Bastion Host 或 Jump Server。他主要的工作就是控管權限以及對連線做 Logging，讓我們知道哪些資料進出我們的網路。

我們可以直接利用一台 Linux 主機上的 SSH Server 當作 Jump server，指令如下：

```bash
ssh -J jump-server private-host
```

不過如此一來我們必須自己控管每個使用者的 Public Key 以及權限，[Teleport](https://goteleport.com/) 提供我們更豐富的功能。

## Teleport

Teleport 主要提供四種功能：

- Server Access - 和 SSH jump host 很像，我們可以透過 Teleport SSH 進到內部機器。
- Kubernetes Access - 我們可以透過 Teleport 連進到 Kubernetes 內部的服務。
- Applicatoins Access -  讓我們可以快速存取內部 HTTP 服務，這部分我們比較少用到，所以不在此篇文章詳述。
- Database Access - 讓我們可以直接由 Teleport 連進到內部 Database。

首先，我們必須先安裝 Bastion Host，安裝的方式非常簡單，按照官網指示即可：

[Installing Teleport | Teleport Docs (goteleport.com)](https://goteleport.com/docs/installation/)

{% info "如果您打算真正使用 Teleport， 請在正式部署前查看 <a href='https://goteleport.com/docs/production'>Teleport Production Guide</a>，裡面有非常詳細的教學。" %}

值得注意的是我們必須在所有的機器上都安裝相同的套件，並利用 [Role](https://goteleport.com/docs/cli-docs/#teleport) 來切換機器的角色，Bastion host 必須為 Proxy 角色，在測試環境中，我們可以把所有 Role 部署在同一個機器上，利用逗號分開即可，例如: `--roles=proxy,node,auth`。

### Server Access

SSH 應該是我們最常使用的功能了，加入 Node 的方式和 K8S 運作方式很像，先和 Teleport 請求 Join Token，之後就可以利用 Token 來加入群集，我們就可以使用 Teleport CLI 或 Web UI 來連線到機器了。

[Server Access Getting Started Guide | Teleport Docs (goteleport.com)](https://goteleport.com/docs/server-access/getting-started/)

{% image teleport-server-list.png %}

我們可以直接利用 UI 上的 Connect 或是 CLI 來連線：

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

{% image session-recording.gif %}