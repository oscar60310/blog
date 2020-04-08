---
title: VS Code 起始中斷點問題
date: 2020-04-07 23:53:27
tags: ["問題","已解決","短篇"]
categories: ["程式"]
description: 使用 Typescript 配合 VS Code 的 debugger 時，時常會自動停在程式的第一行，這篇文章解釋了一個可能的原因和解決方法。
---
# 問題

使用 Typescript 配合 VS Code 的 debugger 開發很方便，配合上 [ts-node](https://github.com/TypeStrong/ts-node) 的 register 就可以在 typescript 順暢的使用中斷點功能了。

不過最近在開發的時候好幾的專案都有同樣的問題，就是每次執行的時候總會在第一行自動停止，必須手動按下繼續，像下圖這樣；

{% image break-at-1st.png %}

沒有下任何中斷點的情況下會自動暫停，而且是在專案變大之後才會發生，這是我的 launch config

```json
   {
      "name": "Node Inspector",
      "type": "node",
      "request": "launch",
      "args": ["${workspaceRoot}/src/index.ts"],
      "runtimeArgs": ["-r", "ts-node/register"],
      "cwd": "${workspaceRoot}",
      "protocol": "inspector",
      "internalConsoleOptions": "openOnSessionStart",
      "env": {
        "NODE_ENV": "development"
      },
      "outputCapture": "std",
      "console": "integratedTerminal",
    }
```

# 解決方案

VS code 在啟動 node 程式時，其實是開啟 node 的 inspect 模式然後向他連線，為了避免我們的程式在 debug client (也就是 vs code) 連線之前就開始跑了，預設會加上 `--inspect-brk	` 這個選項，這會讓我們的程式停在第一行。

通常 vs code 在 attach nodejs 後，會自動讓程式繼續跑，不過如果你的 node 開得特別慢，比如說我的案例是因為需要經過 ts-node，跑起來基本上都需要超過 10 秒，這時 vs code 就沒辦法自動繼續執行了。

解決方法也很簡單，你可以自己開啟 node debug server 且不要加上 brk 選項，或者在 launch.json 中，把 `timeout` 的值拉高，這樣就沒問題了。


# 參考資料
- [Node 官網 - debugger getting start](https://nodejs.org/en/docs/guides/debugging-getting-started/)
- [VS Code - nodejs debugging](https://code.visualstudio.com/docs/nodejs/nodejs-debugging)
- [VS Code Issue - Ghost breakpoints being hit on debug start](https://github.com/Microsoft/vscode/issues/49222)
