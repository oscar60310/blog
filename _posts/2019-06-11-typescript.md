---
layout: post
title: "Typescript Overview"
date: 2019-01-11 18:00:00 +0800
categories: typescript
---

我第一個使用的前端框架是 [Angular](https://angular.io/)，自然也接觸了 [Typescript](https://www.typescriptlang.org/docs/home.html)，當時並不太能體會它的好處，只覺得增加了些學習門檻罷了。後來發現習慣以後，再也沒有辦法回到原本的 JS 了 ...，就算換了框架、使用 Node，都還是以 TS 為主，這篇文章來回顧看看他到底為甚麼這麼令人著迷，以及開發上會增加的負擔。

## Typescript 是甚麼

> TypeScript is a typed superset of Javascript that complies to plain JavaScript

這是[官網](https://www.typescriptlang.org/)上的簡介，TS 其實就是 JS 的超集，JS 有的所有語法在 TS 中都可以使用，也就是說現在找一個 JS 檔案改副檔名就可以直接編譯的過 (當然這樣做其實沒什麼意義) 。除了原本的語法外，TS 又加了其他的功能，最重要的也就是型別 (Types) 定義了。

![1560181756606](/images/blogs/typescript/1560181756606.png)

### 由 JavaScript 開始，也以 JavaScript 結束

TS 使用 JS 中同樣的語法，你不用從頭來過，這也意味著所有過去以 JS 開發的函式庫都可以直接使用，只需要學習增加的功能就好。使用 TS 開發過後，必須要經過**編譯**回到原生 JS 後才可以使用，任何能跑 JS 的地方，都可以跑使用 TS 來開發的程式。

![1560181996204](/images/blogs/typescript/1560181996204.png)

### 為甚麼我們需要「型別」?

### Why we need TYPES ?

```javascript
let money = 10;

function giveMeMore(count) {
  money = money + count;
  console.log("Awesome, now I have $" + money);
}

giveMeMore(10); // Awesome, now I have $20
giveMeMore(10); // Awesome, now I have $30

giveMeMore("10"); // Awesome, now I have $3010

giveMeMore(10); // Awesome, now I have $301010
```

How to prevent it? Just simply check the type :) `JSDoc`

```javascript
function giveMeMore(count) {
  if (typeof count !== "number") {
    throw new Error("Go away...");
  }
  money = money + count;
  console.log("Awesome, now I have $" + money);
}
```

**And** add test case

```javascript
it("should throw except when input type is not number", function() {
  // some assert
});
```

why not just define required type at beginning

![1555262497214](assets/1555262497214.png)

### Why we need TypeScript

Browser can do more things than before,so we start moving some business logic to front end, but the difficulty of JS program maintaining is a big problem.

JS 給了很大的彈性 (相對於強行別語言，需要先思考架構 )，使我們可以快速開發，但隨著各種框架出現，它可能不再適合使用在需要長期維護的大型前端專案上

## Getting Started

### Compile

TS 的副檔名會改為 `.ts` ，我們必須將它轉回 .js 檔案

#### 使用 TSC

官方預設的編譯器，在沒有使用 Webpack 的時候會這麼做 (像是 Node JS 環境 )

安裝

```shell
npm install -g typescript
```

編譯

```shell
tsc helloworld.ts
```

#### 使用 Loader

通常前端開發會使用 Webpack ，這時候就可以使用 [ts-loader](https://github.com/TypeStrong/ts-loader) 來轉換檔案

```javascript
module: {
  rules: [
    // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
    { test: /\.tsx?$/, loader: "ts-loader" }
  ];
}
```

### [基本型別](https://www.typescriptlang.org/docs/handbook/basic-types.html)

現有的 JS 檔案把檔名都改為 TS 後，應該就可編譯過了 (Superset -> JS 可以寫的東西，在 TS 中一定沒問題)，我們先從 TS 中的基本型別開始加入

#### Any

所有的型別，和不定型別是一樣的意思，此時 TS 不會檢查 -> 除了這個，否則型別定了之後是改不了的

```js
let a: any;
a = "1";
a = 1;
```

#### Boolean / String / Number

```js
let a: boolean;
a = true; // ok
a = 1; // error

let b: number;
b = 3; // ok
b = 3.33; // ok
```

#### Array

必須要先說好，陣列裡面會有啥

```js
let a: number[];
a = [1, 2, 3, 4]; // ok
a = [1, "2"]; // error

let b: any[];
b = [1, "2"]; // ok
```

### 定義型別

#### 宣告時定義

```js
let a: number;
```

若有初始值，可以省略，TS 會自動判斷

```js
let a = 1;
```

#### Function

這是原本的 function

```js
function add(x, y) {
  return x + y;
}

const add = (x, y) => x + y;
```

在 TS 中，必須清楚的定義每個輸入參數的類型，輸出類型會自動按照 return 語句來判斷

```typescript
function add(x: number, y: number): number {
  return x + y;
}

const add = (x: number, y: number): number => x + y;
```

### Interface

實際上我們會遇到很多非基本型別的物件，像這個例子

```js
let tsBook = {
  title: "Typescript 101",
  sellout: false,
  price: 100
};
function buy(target) {
  // ...
}
buy(tsBook);
```

在 TS 中，也可以對這種物件進行檢查，但 TS 只在意物件的形狀 (shape)，屬於 **duck typing**

並非像強行別語言，利用 Class 的繼承來判斷

```typescript
let tsBook = {
  title: "Typescript 101",
  sellout: false,
  price: 100
};
interface Book {
  title: string;
  sellout: boolean;
  price: number;
}
function buy(target: Book) {
  // ...
}
buy(tsBook);
```

上面的例子，只要你有 title , sellout 和 price 三個屬性並且型別符合，就能通過檢查

```typescript
// error -> missing price
let tsBook1 = {
  title: "Typescript 101",
  sellout: false
};

// error -> type error
let tsBook2 = {
  title: "Typescript 101",
  sellout: "NO",
  price: 100
};

// ok -> allow move properties
let tsBook3 = {
  title: "Typescript 101",
  sellout: false,
  price: 100,
  description: "bla bla bla"
};
```

TS 允許有多出來的資料，但建議使用 optional properties 來定好型別

```typescript
interface Book {
  title: string;
  sellout: boolean;
  price: number;
  description?: string;
}
```

### Class

以往的 JS 是沒有 Class 這個概念的，但我們可以使用 function 以及 properties 傳遞的方式達到類似繼承的功能，TS 加入了 Class，讓以前寫強行別語言的人，能比較舒服的使用 OO 設計開發。([真的嗎](https://github.com/getify/You-Dont-Know-JS/blob/master/this%20%26%20object%20prototypes/ch4.md))

在 ES6 中，加入了 Class 的語法糖，這已經不是 TS 獨有的功能

```typescript
class Book {
  title: string;
  constructor(title: string) {
    this.title = title;
  }
  read() {
    console.log(this.title);
  }
}

const book1 = new Book("Typescript 101");
book1.read();
```

特別的是，如同 C# 等語言，Class 中 this 中的變數必須要使先宣告

```typescript
class Book {
  constructor(title: string) {
    // error
    this.title = title;
  }
}
```

有了清楚的型別宣告，IDE 能告訴你所有可用的屬性，不必在回去爬 class 內的東西了

![1555348804398](assets/1555348804398.png)

#### Private, Public, Protect

我們終於可以在前端也有強制的存取限制了

在過去，我們可能會有些共同的默契來定義私有屬性

```javascript
class Book {
  constructor(title: string) {
    this._title = title;
  }
}
```

現在，再也不用啦

```typescript
class Book {
  private title: string;
  constructor(title: string) {
    this.title = title;
  }
  read() {
    console.log(this.title);
  }
}

const book1 = new Book("Typescript 101");
// Error: Property 'title' is private and only accessible within class 'Book'.
book1.title;
```

TS 預設是 Public，上面的程式可以用 _Parameter properties_ 來簡化

```typescript
class Book {
  constructor(private title: string) {}
  read() {
    console.log(this.title);
  }
}
```

#### 繼承

有了 Class ，很多物件導向的設計模式就可以實現，比如說繼承

```typescript
class Animal {
  move(distanceInMeters: number = 0) {
    console.log(`Animal moved ${distanceInMeters}m.`);
  }
}

class Dog extends Animal {
  bark() {
    console.log("Woof! Woof!");
  }
}

const dog = new Dog();
dog.bark();
dog.move(10);
dog.bark();
```

和 ES Class 語法糖不一樣的是，TS 可以很清楚的知道，那些屬性是繼承而來的，那些屬性是本身的

Move

![1555349669705](assets/1555349669705.png)

Bark

![1555349724530](assets/1555349724530.png)

#### 抽象類別

```typescript
abstract class Department {
  constructor(public name: string) {}
  printName(): void {
    console.log("Department name: " + this.name);
  }
  abstract printMeeting(): void;
}

class AccountingDepartment extends Department {
  constructor() {
    super("Accounting and Auditing");
  }
  // 一定要實作
  printMeeting(): void {
    console.log("The Accounting Department meets each Monday at 10am.");
  }
}
```

這篇只是要推大家進坑，基本介紹就到這邊啦

## 案例展示

### [API 回應型別定義](https://stackblitz.com/edit/api-response-type?file=index.ts)

前端對 API 溝通時，可以先把後端會產生的回應定義型別

- 前後同時開發時，也正好先把格式講清楚
- 當接到已經完成的後端時(例如第三方服務)，可以利用 [線上工具](http://www.jsontots.com/) 快速產生模型
  若有缺欄位也會自動變為 optional

```typescript
import "./style.css";
import axios from "axios";
import { ApiResponse } from "./model";

async function getBooksData(): Promise<void> {
  const apiResponse = await axios.get<ApiResponse>(
    "https://bookshelf.goodideas-studio.com/api"
  );
  // 我們不必再反覆的查詢文件來看回傳的內容到底是什麼
  if (apiResponse.status === 200) {
    const data = apiResponse.data;

    // Write to document
    data.list.slice(0, 10).forEach(book => document.write(book.name + "<br>"));
  }
}

getBooksData();
```

### Union Type

在 JS 中，我們可以隨意的改變變數的型別，這雖然會衍生些問題，但也是語言的精神

在 TS 中，除了使用 **any** 忽略檢查外，也可以使用 Union Type

```typescript
let a: string;
a = "3";
// error
a = 3;
```

假設我們要建立一個 Function ，當她收到 Blob 物件時，把他轉為 Object Url 輸出，原本就是 Url 格式(string)時，原封不動的輸出

```typescript
function blobToUrl(blob: Blob): string {
  // transform blob to url string
  return "";
}

function createUrl(data: Blob | string): string {
  if (typeof data === "string") {
    // TS 會知道 data 現在為 string
    return data;
  }
  // TS 會知道 data 現在絕對是 Blob
  return blobToUrl(data);
}
```

### 模組定義檔案 (Declaration files)

TS 最後編譯成原始的 JS 檔案，此時所有的型別宣告和其他資訊都會消失，如果是要給其他人使用的模組(例如上傳到 NPM)，要怎麼樣保留這些資訊呢

我們需要定義檔案來還原資訊，用 TS 寫的專案在編譯的過程就可以自動產生這個檔案，至於 JS 寫的專案則會由作者或社群手動補充

例如 [Axios](https://github.com/axios/axios) 雖然是由 JS 寫成的，但專案內就有 [index.d.ts](https://github.com/axios/axios/blob/master/index.d.ts) 檔案 ( 定義檔案都會是 d.ts 結尾 )，所以我才可以輕易地在 TS 中使用，並且有嚴格的型別限制

```typescript
export interface AxiosRequestConfig {
  url?: string;
  method?: Method;
  baseURL?: string;
  transformRequest?: AxiosTransformer | AxiosTransformer[];
  transformResponse?: AxiosTransformer | AxiosTransformer[];
  headers?: any;
  params?: any;
  paramsSerializer?: (params: any) => string;
  data?: any;
  timeout?: number;
  withCredentials?: boolean;
  adapter?: AxiosAdapter;
  auth?: AxiosBasicCredentials;
  responseType?: ResponseType;
  xsrfCookieName?: string;
  xsrfHeaderName?: string;
  onUploadProgress?: (progressEvent: any) => void;
  onDownloadProgress?: (progressEvent: any) => void;
  maxContentLength?: number;
  validateStatus?: (status: number) => boolean;
  maxRedirects?: number;
  socketPath?: string | null;
  httpAgent?: any;
  httpsAgent?: any;
  proxy?: AxiosProxyConfig | false;
  cancelToken?: CancelToken;
}
```

至於沒有定義檔的專案呢? <https://aka.ms/types> 收集了很多 Library 的 type 定義

例如 [Lodash](https://www.npmjs.com/package/@types/lodash) ，只需要安裝 Package，TS 預設就會自動找到定義

### CDN Library

@types/googlemaps DEMO

### [React(JSX)](https://stackblitz.com/edit/react-ts-4nxlry)

這個範例中，我們可以清楚的知道 Component 需要的參數和型別

### Function Programming
