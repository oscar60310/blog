---
title: Kubernetes cluster autoscaler 介紹
date: 2020-04-26 22:41:29
categories: ["程式","雲端"] 
tags: ["K8S", "CA", "Azure", "AWS", "長篇"]
description: "在一般的開發我們很少會處理到群集的伸縮，整個產品中可能就會研究一次，所以我稱這次工作上難得處理到 K8S Cluster autoscaler，趕快記錄下來，也和大家分享。"
---
# 甚麼是 Cluster Autoscaler (CA)
Cluster Autoscaler (以下簡稱 CA) 是 Kubernetes 官方出的一個工具，讓你的 Cluster 依照需求伸縮，簡單來說就是幫你開/關雲端上的機器。通常會配合上 [Horizontal Pod Autoscaler](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/) (以下簡稱 HPA) 一起使用，當 Pod 記憶體/CPU 或其他指標達到一定標準後，擴展 Pod，當沒有足夠的機器 (Node) 來執行 Pod 時，CA 就會幫你擴展機器。相反的需求下降時，HPA 降低 Pod 數量，CA 也會關閉不需要的機器，如此一來就可以節省成本又可以達到同樣的運算能力。

## HPA

## 擴展原理

CA 其實就是個由 Go 寫成的程式，一樣需要自己部屬在群集中，通常會使用 deployment 並盡可能確保這個程式順上運行，有些雲端方案會將 CA 內建在其中，像是 AKS。

CA 會在兩個時候嘗試調整群集大小：

- 有 Pod 因為資源不足的關係沒辦法執行。
- 有 Node 使用量不足而且上面跑的 Pod 是可以被移動到其他地方的。

當需要放大群集時，他調整機器需求量，讓雲端供應商安排機器，當需要關閉機器時，讓 K8S 驅逐在機器上的 Pod，好讓機器可以安心地關閉，讓我們來看看到底是如何做到的吧！

### Scale Up

每隔 10 秒 (這個時間可以由 `--scan-interval` flag 來調整) ，CA 會去群集看看 Pod 們的狀態，每當 K8S 沒有辦法將 Pod 順利安排執行環境的時候，會將其狀態設定為 `schedulable = false`，CA 就是在找有沒有這樣的 Pod 存在。

{% image ca-scale-up.svg "Scale up 示意圖" full %}

找到以後 CA 會看看自己的 Node Group (相同機器的組合，我們可以設定想要的數量和設定，雲端負責準備好這些機器，像是 AWS 中的 Auto scale group，Azure 中的 VMSS)，看有沒有可以放大而且放大以後這個 Pod 可以跑在上面的 (有沒有滿足資源要求、Node Selector) ，有的話就調整 Node Group 大小，並等待機器啟動且加入群集，等 15 分鐘 (這就需要看雲端而定了，通常 3 到 5 分鐘就可以準備完成)，讓 K8S 重新安排這個 Pod 執行。 

### Scale Down

在沒有 scale up 的需求後，CA 會檢查有沒有機會 scale down。當一個 Node 的使用量低於 50% 時 ( CPU 和 Memory )，而且上面的 Pod 們可以被移出，有其他地方適合執行，而且沒有禁止驅逐，這個 Node 就會被 CA 視為沒有用的 Node，10 分鐘後 CA 會開始把 Node 關閉。

CA 關閉 Node 的方式也很有趣，他會把 Pod 驅逐到別的 Node 上，並在 Node 上加上 [Taint](https://kubernetes.io/docs/concepts/configuration/taint-and-toleration/#taint-based-evictions)，防止 K8S 再把 Pod 排回去。驅逐 Pod 後刪除 Node 的方式就因雲端平台而異了，這部分屬於 [Node Controller](https://kubernetes.io/docs/concepts/architecture/cloud-controller/#node-controller) 的工作。

{% image ca-scale-down.svg "Scale down 示意圖" full %}

CA 會視情況決定關閉機器的順序以及數量，他會防止同一個時間驅逐過多的 Pod 造成系統不穩定，所以通常會是一台一台關閉，等待系統穩定後再接著判定 Scale Down 條件。

# 與雲端整合

## AWS

## Azure

# 其他技巧
## Node template

## ConfigMap

## Auto Discovery



# Reference
- [Github - Cluster Autoscaler](https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler)