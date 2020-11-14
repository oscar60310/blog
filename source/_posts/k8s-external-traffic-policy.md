---
title: Kubernetes 上的 ExternalTrafficPolicy
date: 2020-11-12 23:11:21
tags: ["K8S", "短篇"]
categories: ["程式","雲端"]
description: "在 Kubernetes 中 Pod 接收到的流量來源 IP 通常會是內部 (Node) IP，若想保留原始的來源位址的話必需修改 Service ，這篇文章粗略的介紹 kube proxy 如何處理流量以及說明 ExternalTrafficPolicy 的不同模式"
---

# 前言

最近公司改用 [Nginx ingress controller](https://kubernetes.github.io/ingress-nginx/) 配合一個 L4 Load Balancer 來處理進站流量，取代過去使用 [Application Gateway](https://azure.microsoft.com/en-us/services/application-gateway/)，在部屬時發現官方預設在 Service 上設定 ExternalTrafficPolicy = Local ([Ingress-nginx Azure deploy.yaml](https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.41.2/deploy/static/provider/cloud/deploy.yaml))，[AKS 文件](https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.41.2/deploy/static/provider/cloud/deploy.yaml)上也提到如果想保留客戶端來源 IP 的話，必須要這樣設定。

經果一番探索後，發現和 Kube-proxy 如何處理進進站流量有關，也算是解答了我對 Service 實作的問題，這篇文章來記錄一下研究成果 XD

# Kube Proxy

[kube-proxy](https://kubernetes.io/docs/concepts/overview/components/#kube-proxy) 運行在每一個 Node 上，負責實作 Service，依照不同的 Mode 有不同的行為：

在 mode 為 iptables 設定下，Kube Proxy 會 Watch 並修改 Node 上的 iptables 來達到封包轉發的目的，也就是應為他只負責西改設定，實際上是由 Linux Core 來處理封包的關係，效能比 userspace mode 好上許多。

## Cluster IP

在 Service type = ClusterIP 時，例如：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: test
spec:
  selector:
    app: test
  type: ClusterIP
  ports:
    - protocol: TCP
      port: 8080
      targetPort: 8080
```

{% image cluster-ip-svc.png %}

kube-proxy 會建立像這樣的 iptables：

```bash
KUBE-SVC-IOIC7CRUMQYLZ32S  tcp  --  0.0.0.0/0            10.109.69.11         /* default/test: cluster IP */ tcp dpt:8080

Chain KUBE-SVC-IOIC7CRUMQYLZ32S (1 references)
target     prot opt source               destination         
KUBE-SEP-DZ6OGOAFZ2YMFV35  all  --  0.0.0.0/0            0.0.0.0/0            /* default/test: */ statistic mode random probability 0.50000000000
KUBE-SEP-PHU2ZXK3DXEO46Q2  all  --  0.0.0.0/0            0.0.0.0/0            /* default/test: */

Chain KUBE-SEP-DZ6OGOAFZ2YMFV35 (1 references)
target     prot opt source               destination         
KUBE-MARK-MASQ  all  --  10.244.1.2           0.0.0.0/0            /* default/test: */
DNAT       tcp  --  0.0.0.0/0            0.0.0.0/0            /* default/test: */ tcp to:10.244.1.2:8080

Chain KUBE-SEP-PHU2ZXK3DXEO46Q2 (1 references)
target     prot opt source               destination         
KUBE-MARK-MASQ  all  --  10.244.2.2           0.0.0.0/0            /* default/test: */
DNAT       tcp  --  0.0.0.0/0            0.0.0.0/0            /* default/test: */ tcp to:10.244.2.2:8080
```

當我們從 Cluster 內部向 Service (10.109.69.11:8080) 發送資料時，會進入 KUBE-SVC-IOIC7CRUMQYLZ32S Chain 接著有 50% 機率進 KUBE-SEP-DZ6OGOAFZ2YMFV35 和 KUBE-SEP-PHU2ZXK3DXEO46Q2 (假設後端有兩個 Pod) ，最後經由 DNAT 進入到真正的 Pod IP。

這種狀況如果不自己打自己的話就不會被標記為需要 SNAT，Application 端看到的就會是原始的 Pod IP，這種情況簡單很多。

## 由外部 NodePort 進入

這裡我們討論兩種模式，分別是 ExternalTrafficPolicy 為 Cluster (預設) 和 Local。

假設我們有 3 個 Node (Node1, Node2, Node3) 和兩個 Pod (Pod1, Pod2)，Pod1 跑在 Node1、Pod2 跑在 Node2。

### ExternalTrafficPolicy = Cluster

```yaml
apiVersion: v1
kind: Service
metadata:
  name: test
spec:
  selector:
    app: test
  type: NodePort
  externalTrafficPolicy: Cluster
  ports:
    - protocol: TCP
      port: 8080
      targetPort: 8080
      nodePort: 30000
```

{% image node-port-cluster.png %}

這時候我們可以從所有的 Node 上 Port 30000 和 Pod 溝通，就算 Pod 不是跑在該 Node 上也沒問題，我們先來看看 iptables：

```bash
Chain KUBE-SERVICES (2 references)
target     prot opt source               destination
KUBE-NODEPORTS  all  --  0.0.0.0/0            0.0.0.0/0            /* kubernetes service nodeports; NOTE: this must be the last rule in this chain */ ADDRTYPE match dst-type LOCAL

Chain KUBE-NODEPORTS (1 references)
target     prot opt source               destination         
KUBE-MARK-MASQ  tcp  --  0.0.0.0/0            0.0.0.0/0            /* default/test: */ tcp dpt:30000
KUBE-SVC-IOIC7CRUMQYLZ32S  tcp  --  0.0.0.0/0            0.0.0.0/0            /* default/test: */ tcp dpt:30000

Chain KUBE-SVC-IOIC7CRUMQYLZ32S (2 references)
target     prot opt source               destination         
KUBE-SEP-BO7YT2KMVIOH6WRF  all  --  0.0.0.0/0            0.0.0.0/0            /* default/test: */ statistic mode random probability 0.50000000000
KUBE-SEP-QDGUX4VYGOYVANTA  all  --  0.0.0.0/0            0.0.0.0/0            /* default/test: */

Chain KUBE-SEP-BO7YT2KMVIOH6WRF (1 references)
target     prot opt source               destination         
KUBE-MARK-MASQ  all  --  10.244.2.5           0.0.0.0/0            /* default/test: */
DNAT       tcp  --  0.0.0.0/0            0.0.0.0/0            /* default/test: */ tcp to:10.244.2.5:8080

Chain KUBE-SEP-QDGUX4VYGOYVANTA (1 references)
target     prot opt source               destination         
KUBE-MARK-MASQ  all  --  10.244.2.6           0.0.0.0/0            /* default/test: */
DNAT       tcp  --  0.0.0.0/0            0.0.0.0/0            /* default/test: */ tcp to:10.244.2.6:8080
```

前半段和 ClusterIP 很像，只不過多了一層 KUBE-NODEPORTS Chain，一樣做後會經由 DNAT 到 Pod。

在 KUBE-NODEPORTS 中多了一個 KUBE-MARK-MASQ：

```bash
Chain KUBE-MARK-MASQ (15 references)
target     prot opt source               destination         
MARK       all  --  0.0.0.0/0            0.0.0.0/0            MARK or 0x4000
```

最後在 POSTROUTING 階段，有 MARK 的會經由 MASQUERADE 模組修改來源 IP：

```bash
Chain POSTROUTING (policy ACCEPT)
target     prot opt source               destination         
KUBE-POSTROUTING  all  --  0.0.0.0/0            0.0.0.0/0            /* kubernetes postrouting rules */

Chain KUBE-POSTROUTING (1 references)
target     prot opt source               destination         
MASQUERADE  all  --  0.0.0.0/0            0.0.0.0/0            /* kubernetes service traffic requiring SNAT */ mark match 0x4000/0x4000 random-fully
```

也就是因為最後這個階段修改了 Source IP，Application 端看到的會是 Node IP，後面說明位什麼需要 SNAT。

這個模式以圖解的方式大概會長這樣：

{% image node-port-cluster.svg "NodePort with ExternalTrafficPolicy = cluster" full%}

### ExternalTrafficPolicy = Local

```yaml
apiVersion: v1
kind: Service
metadata:
  name: test
spec:
  selector:
    app: test
  type: NodePort
  externalTrafficPolicy: Local
  ports:
    - protocol: TCP
      port: 8080
      targetPort: 8080
      nodePort: 30000
```

{% image node-port-local.png %}

這時候我們只能從 Node1 和 Node2 的 Port 30000 存取到 Pod，Node3 因為沒有 Pod 跑在上面，所以無法連線到 Pod。

我們先來看看 Node1 (有 Pod) 的 iptables，差異只有在 KUBE-NODEPORTS Chain 之後：

```bash
Chain KUBE-NODEPORTS (1 references)
target     prot opt source               destination         
KUBE-MARK-MASQ  tcp  --  127.0.0.0/8          0.0.0.0/0            /* default/test: */ tcp dpt:30000
KUBE-XLB-IOIC7CRUMQYLZ32S  tcp  --  0.0.0.0/0            0.0.0.0/0            /* default/test: */ tcp dpt:30000

Chain KUBE-XLB-IOIC7CRUMQYLZ32S (1 references)
target     prot opt source               destination         
KUBE-SVC-IOIC7CRUMQYLZ32S  all  --  10.244.0.0/16        0.0.0.0/0            /* Redirect pods trying to reach external loadbalancer VIP to clusterIP */
KUBE-MARK-MASQ  all  --  0.0.0.0/0            0.0.0.0/0            /* masquerade LOCAL traffic for default/test: LB IP */ ADDRTYPE match src-type LOCAL
KUBE-SVC-IOIC7CRUMQYLZ32S  all  --  0.0.0.0/0            0.0.0.0/0            /* route LOCAL traffic for default/test: LB IP to service chain */ ADDRTYPE match src-type LOCAL
KUBE-SEP-SXLTLNYANJJ3YTT4  all  --  0.0.0.0/0            0.0.0.0/0            /* Balancing rule 0 for default/test: */

Chain KUBE-SVC-IOIC7CRUMQYLZ32S (3 references)
target     prot opt source               destination         
KUBE-SEP-TMQSCQKS6IHHXYVK  all  --  0.0.0.0/0            0.0.0.0/0            /* default/test: */ statistic mode random probability 0.50000000000
KUBE-SEP-SXLTLNYANJJ3YTT4  all  --  0.0.0.0/0            0.0.0.0/0            /* default/test: */

Chain KUBE-SEP-SXLTLNYANJJ3YTT4 (2 references)
target     prot opt source               destination         
KUBE-MARK-MASQ  all  --  10.244.2.8           0.0.0.0/0            /* default/test: */
DNAT       tcp  --  0.0.0.0/0            0.0.0.0/0            /* default/test: */ tcp to:10.244.2.8:8080

Chain KUBE-SEP-TMQSCQKS6IHHXYVK (1 references)
target     prot opt source               destination         
KUBE-MARK-MASQ  all  --  10.244.1.10          0.0.0.0/0            /* default/test: */
DNAT       tcp  --  0.0.0.0/0            0.0.0.0/0            /* default/test: */ tcp to:10.244.1.10:8080
```

當由 Node1 外部 30000 Port 進入時，會經過 KUBE-NODEPORTS -> KUBE-XLB-IOIC7CRUMQYLZ32S -> KUBE-SEP-SXLTLNYANJJ3YTT4 直接到 Pod IP，此時只有一個 Pod，另一個 Pod 因為跑在 Node2 的關係所以經由 Node1 是存取不到的。

此時不會被 MARK，也就不會有 SNAT 發生，Application 端看到的就會是原始的 IP 了，這也就是為甚麼當想保留 Client 端 IP 時必須要設定為 Local 的關係。

{% info "當從 Node1 內部打 Port 30000 時，會照正常的流程走，如同 Policy = Cluster 一樣" %}

在 Node3 中的 iptables 則會把外部 Port 30000 的所有封包丟棄，因為沒有 Pod 跑在該 Node，內部一樣不受影響。

```bash
Chain KUBE-XLB-IOIC7CRUMQYLZ32S (1 references)
target     prot opt source               destination         
KUBE-SVC-IOIC7CRUMQYLZ32S  all  --  10.244.0.0/16        0.0.0.0/0            /* Redirect pods trying to reach external loadbalancer VIP to clusterIP */
KUBE-MARK-MASQ  all  --  0.0.0.0/0            0.0.0.0/0            /* masquerade LOCAL traffic for default/test: LB IP */ ADDRTYPE match src-type LOCAL
KUBE-SVC-IOIC7CRUMQYLZ32S  all  --  0.0.0.0/0            0.0.0.0/0            /* route LOCAL traffic for default/test: LB IP to service chain */ ADDRTYPE match src-type LOCAL
KUBE-MARK-DROP  all  --  0.0.0.0/0            0.0.0.0/0            /* default/test: has no local endpoints */
```

這個模式以圖解的方式大概會長這樣：

{% image node-port-local.svg "NodePort with ExternalTrafficPolicy = local" full%}

# References

- [Kubernetes - Using Source IP](https://kubernetes.io/docs/tutorials/services/source-ip/)
- [A Deep Dive into Kubernetes External Traffic Policies](https://www.asykim.com/blog/deep-dive-into-kubernetes-external-traffic-policies)
- [kubernetes的Kube-proxy的iptables转发规则](https://blog.csdn.net/qq_36183935/article/details/90734847)
- [GKE - Network overview](https://cloud.google.com/kubernetes-engine/docs/concepts/network-overview?authuser=0)

