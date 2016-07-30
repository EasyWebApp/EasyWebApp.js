# EasyWebApp v3


**Component 分支**专用于 **亚页面级组件化**实验，基于官方最新版 **jQuery**、jQuery+、iQuery+ 完全重写 **SPA 引擎**、Demo 源码。


## 开发初衷

EasyWebApp 虽然从 v2.2 “ **ListView 对象**独立”开始支持 **局部数据渲染**，但依然把每次 **数据加载**视为一次 **页面切换**（即一次 `history.pushState()`），导致不同类型 **InnerPage 对象**的 *加载、缓存、取值、回退* 逻辑复杂，导致其后几个大版本都只能修修补补，最终代码混乱……

所以，难以开发出近年来风行业界的 **Web 前端组件化**方案的核心架构只能被推到重来……


## 新版特性

 1. InnerPage 对象抽象为 UI_Module 对象， **SPA UI 构建的基本单位**变为一般性的 UI 模块
 2. 只有在“ **UI 模块的容器元素** === **SPA 换页容器**”时才会被记录在 **HTML 5 History** 中
 3. Form 元素提交逻辑大幅简化
 4. InnerHistory 对象的职责融入 **WebApp 单例对象**， **SPA 换页历史维护**逻辑大大简化
 5. UI 模块支持 **自加载**，可无需 **SPA 链接元素**触发加载
 6. UI 模块可嵌套，并支持 **继承式数据作用域**（受 Angular 启发）


## 开发详情

 - [迭代记录](http://git.oschina.net/Tech_Query/EasyWebApp/commits/Component)
 - [为什么我还在用 jQuery？](jQueryLove.md)