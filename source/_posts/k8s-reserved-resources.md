---
title: Kubernetes reserved resources
date: 2020-08-22 21:20:22
tags: ["K8S", "Azure", "AWS", "短篇"]
categories: ["程式","雲端"]
description: ""
---

在 Kubernetes 上執行 Pod 的時候，我們可以指定 [Resource Request/Limit](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) 來告訴 K8S 我們的程式需要多少的資源來運行，K8S 會自動幫我們安排到有符合條件的節點上，像下面這樣：

```yaml
resources:
  requests:
    memory: "64Mi"
    cpu: "250m"
  limits:
    memory: "128Mi"
    cpu: "500m"
```

一個節點的資源量是固定的，稱為 Node Capacity，例如在 AWS 上開 t3.medium 等級的 Node，就會有差不多 4GB 的記憶體可以使用。但在機器上其實還會有一些不受群集控制的程式在運作 (例如 OS 程式、Kubernetes 本人等等)，這時候如果還是按照 Capacity 區分配的話，就可能會發生問題，所以 K8S 提供了 Node Allocatable 這個功能。

# Node Allocatable 

我們可以使用 `kubectl describe node` 來查看 Node 的 Capacity 和 Allocatable

```yaml
Capacity:
  cpu:                8
  ephemeral-storage:  9765628Ki
  hugepages-1Gi:      0
  hugepages-2Mi:      0
  memory:             32930000Ki
  pods:               110
Allocatable:
  cpu:                8
  ephemeral-storage:  9000002750
  hugepages-1Gi:      0
  hugepages-2Mi:      0
  memory:             32827600Ki
  pods:               110
```

大約有 100 MB 的記憶體被保留起來，這個雲端服務中例如 AKS / EKS  會更大，在文章末會說明，我們先來看看 Allocatable 是怎麼計算出來的。

```txt
	  Node Capacity
---------------------------
|     kube-reserved       |
|-------------------------|
|     system-reserved     |
|-------------------------|
|    eviction-threshold   |
|-------------------------|
|                         |
|      allocatable        |
|   (available for pods)  |
|                         |
|                         |
---------------------------
```

這個來自官網的圖示可以發現 Allocatable 其實是 Capacity 扣除 reserved resource 和 eviction threshold 出來的，我們來一一介紹他們。

## Kube/System Reserved

這兩個著值代表的是預留給 Kubernetes 和 OS 程式的資源，可以使用 `--kube-reserved` 和 `--system-reserved` 來複寫，通常 system reserved 不會變動，kube reserved 則會根據 Node 上可以跑的 Pod 數量來決定。

在 Azure (AKS) 上，kube reserved memory 是根據 Node capacity 來決定的，計算方式如下：

- 25% of the first 4 GB of memory
- 20% of the next 4 GB of memory (up to 8 GB)
- 10% of the next 8 GB of memory (up to 16 GB)
- 6% of the next 112 GB of memory (up to 128 GB)
- 2% of any memory above 128 GB

例如 7 GB 的機器就會有 (0.25 x 4) + (0.20 x 3) = 1.6 GB 的資源被保留，可以參考[官方文件](https://docs.microsoft.com/en-us/azure/aks/concepts-clusters-workloads#resource-reservations)。

在 AWS (EKS) 上，則是根據 Max Pod 來決定

```sh
memory_to_reserve=$((11 * $max_num_pods + 255))
```

例如 t3.medium 可以跑 17 個 pod，就會有 17 * 11 + 255 = 442 MB 的資源被保留，可以參考 EKS AMI Image 的 [bootstrap script](https://github.com/awslabs/amazon-eks-ami/blob/v20200723/files/bootstrap.sh#L167)。

# References
- [Kubernetes document - Reserve Compute Resources for System Daemons](https://kubernetes.io/docs/tasks/administer-cluster/reserve-compute-resources/)

