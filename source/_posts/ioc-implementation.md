---
title: IoC 在 TypeScript 中的實作
date: 2022-05-21 13:25:56
categories: ["程式", "Design Pattern"]
tags: ["中篇", "IoC", "TypeScript", "DI", "Design Pattern", "心得", "進階"]
geo: ioc in ts
---

最近為新專案導入 Inversion of Control (IoC) container，發現 Container Libraries 中，大部分都只有和自己相關的教學文件，比較少有實際實作的範例，這邊文章以一個有名的開源專案為例子，整理出幾個不錯的用法，以及基本應該遵守的規則。

## IoC Containers

現在有很多很棒的 Containers 供大家使用，如果您使用 [Angular](https://angular.io/) 或是 [Nest.js](https://nestjs.com/) 之類的 Framework，本身也有內建 Container/DI 的功能，這邊列出幾個比較多人使用的 Container：

- [InversifyJS](https://github.com/inversify/InversifyJS) (本篇使用的 Container)
- [TypeDI](https://github.com/typestack/typedi)
- [tsyringe](https://github.com/microsoft/tsyringe)

{% info "比起導入 Containers，修改現有程式以符合 IoC Model 應該要更為優先👍" %}

## Good Practices

開始使用 Container 之後，有一些規則是我們可以參考的，不敢說是最佳化實踐 (Best Practice)，畢竟每個專案的性質和團隊成員的習慣不同，但遵守這些規則可以讓我們少走點冤枉路 😊

### 以 Composition Root 來避免 Service Locator

現在有了 Container，我們只需要讓各個 Service 都能存取的到同一個 container 就能處理相依的問題了吧？假如我們有個 OrderProcess 相依於 OrderValidator：

```typescript
// Anti pattern!

// container.ts
class Container {
  public bind(name: string, instance) {
    /* ... */
  }
  public get(name: string) {
    /* ... */
  }
}

export default new Container(); // Export as a global singleton

// orderProcess.ts
import container from "./container";
class OrderProcess {
  public process(order: Order) {
    const validator = container.get("OrderValidator");
    validator.validate(order);
  }
}
```

這種模式稱為 Locator Pattern，看起來沒甚麼問題，但被大家視為[反模式](https://zh.wikipedia.org/zh-tw/%E5%8F%8D%E9%9D%A2%E6%A8%A1%E5%BC%8F)[[2](https://blog.ploeh.dk/2010/02/03/ServiceLocatorisanAnti-Pattern/)][[3](https://freecontent.manning.com/the-service-locator-anti-pattern/)]的原因主要是這些問題：

1. API 使用不明確。
   今天另外一個開發者想要使用 OrderProcess，在沒有看到內部程式的前提下，他應該會這麼寫：

   ```typescript
   import { OrderProcess } from "./orderProcess";
   const orderProcess = new OrderProcess();
   orderProcess.process(order); // Service not found error
   ```

   這樣會在執行階段發生找不到 OrderValidator 的錯誤，因為我們根本沒有註冊到容器中，相對於直接使用 Constructor 來注入，我們沒辦法明確地知道 OrderProcess 相依於那些 Services。

2. 維護困難
   今天我們想要在 Process function 中增加儲存訂單的功能：

   ```typescript
   class OrderProcess {
     public process(order: Order) {
       const validator = container.get("OrderValidator");
       validator.validate(order);
       const storage = container.get("OrderStorage");
       storage.save(order);
     }
   }
   ```

   改起來還算容易，多拿一個 Storage Service 來用就好，但我們的改動會造成 Breaking Changes 嗎？
   我不知道 😖，我沒法知道用的那些人有沒有在他們的 Container 中註冊 OrderStorage。

所以我們應該在一個統一的地方，而且只有在這裡來組成/拿取 Components，這個地方就是 Composition Root，一般來說會在程式的 Entry Point[[4](https://blog.ploeh.dk/2011/07/28/CompositionRoot/)] 來實作。

沒有使用 Container

```typescript
// OrderProcess.ts
class OrderProcess {
  constructor(private validator: OrderValidator) {}

  public process(order: Order) {
    this.validator.validate(order);
  }
}
// main.ts
class Main {
    public main {
        const orderValidator = new OrderValidator();
        const orderProcess = new OrderProcess(orderValidator);
        orderProcess.process(order);
    }
}
```

使用 Container

```typescript
// OrderProcess.ts
class OrderProcess {
  constructor(@Inject('OrderValidator') private validator: OrderValidator) {}

  public process(order: Order) {
    this.validator.validate(order);
  }
}
// main.ts
class Main {
    public main {
        const container = new Container();
        container.bind('OrderValidator', OrderValidator);
        container.bind('OrderProcess', OrderProcess);
        const orderProcess = container.get('OrderProcess');
        orderProcess.process(order);
    }
}
```

### 避免太多的注入

當我們發現一個 Service 有過多的注入時，通常代表他做了太多的事情，違反了[單一職責(Single-responsibility)原則](https://en.wikipedia.org/wiki/Single-responsibility_principle)，應該試著先做點重構，將他們分開。

### 盡量避免注入「資料」

我們應該盡量注入 Service，而不是資料本身。比如說我們需要一個時間參數，我們不應該直接注入 Date，而是注入提供時間參數的 Service。這樣能為我們保留彈性，也較容易測試。

### 避免直接注入 Class

直接注入 Class 會讓 Service 之間耦合，我們應該以**抽象**的介面為目標。

## 實作範例

我參考了使用 Inversify 作為容器的開源專案 [javascript-obfuscator](https://github.com/javascript-obfuscator/javascript-obfuscator)，找了一些有趣的設計，有些違反了上述的原則，還請大家自行參考。

### Configuration 注入

我們的程式會有很多設定，像是 Server Address, File path 之類的，不同專案會有自己設定的方法，像是 .NET Core 就提供了 Options pattern[[6](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration/options?view=aspnetcore-6.0)][[7](https://www.dabrowski.space/posts/asp.net-options-why-you-should-not-use-it/)]，直接讀取環境變數也是一種方法 ...。我們也可以建立一個 Options Service 來儲存/驗證這些設定參數：

```typescript
// Option class
class Options implements IOptions {
  @IsBoolean() // Validation - https://github.com/typestack/class-validator
  public readonly unicodeEscapeSequence!: boolean

  constructor (
        // Input object
        @inject(ServiceIdentifiers.TInputOptions) inputOptions: TInputOptions,
    ) {
        const optionsPreset: TInputOptions = Options.getOptionsByPreset(
            inputOptions.optionsPreset ?? OptionsPreset.Default
        );

        Object.assign(this, optionsPreset, inputOptions);

        const errors: ValidationError[] = validateSync(this, Options.validatorOptions);

        if (errors.length) {
            throw new ReferenceError(`Validation failed. errors:\n${ValidationErrorsFormatter.format(errors)}`);
        }
    }
}

// Binding
const optionsModule: interfaces.ContainerModule = new ContainerModule((bind: interfaces.Bind) => {
  // bind input
  bind<TInputOptions>(ServiceIdentifiers.TInputOptions)
    .toDynamicValue(() => options)
    .inSingletonScope();
  // bind option class
  bind<IOptions>(ServiceIdentifiers.IOptions)
    .to(Options)
    .inSingletonScope();
});

// Usage
class XXXService {
  constructor(@inject(ServiceIdentifiers.Options))
}
```

這邊使用了 InputOptions 以及 Options 這兩個 Binding ，InputOptions 只給 Options Service 用來輸入資料用，其他 Service 需要使用的時候需要直接注入 Options Service。

{% info "當專案成長時，通常會有越來越多的設定，全部包在一個 Options Service 會讓測試變得很麻煩，比如說 WebService 只需要 address, port 等相關的資訊，但在測試時因為需要組出完整的 Options Service，反而需要 mock filePath 之類其他 Service 的設定。這時候我們可以適度將設定分組，例如 WebServerOptions 等等。" %}

### Inject Factory

當我們需要在 Runtime 的時候才決定要用那個 Service 時，比如說依照不同設定，連接到 Azure Storage 或是 AWS S3，我們可以注入 Factory 來取代直接注入 Service。下面的例子提供了兩種不同的 Loader ，A 和 B，並在執行階段利用 options.loader 決定要用哪個。

```typescript
class ALoader implements Loader {}
class BLoader implements Loader {}

bind(Loader).to(ALoader).withName("A");
bind(Loader).to(BLoader).withName("B");

bind(LoaderFactory).to((name) => {
  return container.getWithName(TYPES.Loader, name);
});
// Usage
class App {
  constructor(@inject(Loadfactory) factory, @inject(Options) options) {
    this.loader = factory(options.loader);
  }
}
```

註 1：Inversify 提供了 [Auto named factory](https://github.com/inversify/InversifyJS/blob/master/wiki/auto_named_factory.md)，我們可以不需要自己實作 factory。
註 2：這樣的寫法有時候也被視為 locator pattern 的一個變種[[5](https://docs.microsoft.com/en-us/dotnet/core/extensions/dependency-injection-guidelines#recommendations)]，還請各位自行考量優缺點。

### Module

當我們有大量的服務時，把他們群組成 Module 會是個好主意！，這樣我們可以對一組 Services 進行 Load/Unload，而不用擔心漏掉了某些東西，Inversify 已經實作了 ContainerModule 的功能。

```typescript
// AnalyzersModule.ts
export const analyzersModule: interfaces.ContainerModule = new ContainerModule((bind: interfaces.Bind) => {
    // calls graph analyzer
    bind<ICallsGraphAnalyzer>(ServiceIdentifiers.ICallsGraphAnalyzer)
        .to(CallsGraphAnalyzer)
        .inSingletonScope();

    // number numerical expression analyzer
    bind<INumberNumericalExpressionAnalyzer>(ServiceIdentifiers.INumberNumericalExpressionAnalyzer)
        .to(NumberNumericalExpressionAnalyzer)
        .inSingletonScope();

    // prevailing kind of variables analyzer
    bind<IPrevailingKindOfVariablesAnalyzer>(ServiceIdentifiers.IPrevailingKindOfVariablesAnalyzer)
        .to(PrevailingKindOfVariablesAnalyzer)
        .inSingletonScope();
    ...
}
// Load
this.container.load(analyzersModule);
// Unload
this.container.unload(analyzersModule);
```

### Facade

除了直接輸出 Container，我們還可以建立一個 [Facade](https://zh.wikipedia.org/zh-tw/%E5%A4%96%E8%A7%80%E6%A8%A1%E5%BC%8F) Class 來幫助其他人更容易使用我們的程式。

```typescript
class InversifyContainerFacade {
  public load(options: TInputOptions): void {
    this.container
      .bind<TInputOptions>(ServiceIdentifiers.TInputOptions)
      .toDynamicValue(() => options)
      .inSingletonScope();
    this.container.load(analyzersModule);
    // ....
  }
}
```

## References

1. [Inverisy - Good practices](https://github.com/inversify/InversifyJS/blob/master/wiki/good_practices.md)
2. [Mark Seemann - Service Locator is an Anti-Pattern](https://blog.ploeh.dk/2010/02/03/ServiceLocatorisanAnti-Pattern/)
3. [Manning's focus - The Service Locator Anti-Pattern](https://freecontent.manning.com/the-service-locator-anti-pattern/)
4. [Mark Seemann - Composition Root](https://blog.ploeh.dk/2011/07/28/CompositionRoot/)
5. [Microsoft - Dependency injection guidelines](https://docs.microsoft.com/en-us/dotnet/core/extensions/dependency-injection-guidelines#recommendations)
6. [Microsoft - Options pattern in ASP.NET Core](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration/options?view=aspnetcore-6.0)
7. [Marcin Dąbrowski - asp.net Options - why You should not use it](https://www.dabrowski.space/posts/asp.net-options-why-you-should-not-use-it/)
