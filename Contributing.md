# EasyWebApp v3

[![Join the chat at https://gitter.im/EasyWebApp-js/Lobby](https://badges.gitter.im/EasyWebApp-js/Lobby.svg)](https://gitter.im/EasyWebApp-js/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)


**String_Template 分支**专用于 **数据双向绑定**实验，基于 ECMAScript 6 **模板字符串**语法 完全重构 **SPA 引擎渲染内核**。


## 【开发初衷】

EasyWebApp 虽通过 v3.0 的“统一页面、模块抽象”彻底解决了 **局部数据渲染**的严重缺陷，但其 **渲染内核**依然沿用老版模块（只能主动读写 DOM 元素的 jQuery 插件），在 **数据/DOM 联动**方面依然需要开发者手写大量 DOM 操作代码，若有 *频繁的业务细节变动* 或人员更替，代码修改、测试的工作量与 *传统多页开发模式*相比并未下降……

所以，在不破坏 HTML **标记语言本质**的前提下，实现一套 易学易用的 **数据绑定模板**，即使在 **Web Component 标准**的时代也是极为必要的！


## 【新版特性】

 1. 支持 HTML 标签属性、文本内容中书写 **ES 6 模板字符串**（不带 函数名标签前缀），`name` 属性仅用于表单元素、ListView 对象的数据绑定
 2. **可输入元素**（[iQuery](http://git.oschina.net/Tech_Query/iQuery) 扩展的 `:input:not(:button)` 伪类选择符）引起的数据变更 会触发该数据所在作用域下的 UI 重绘
 3. UI 模块支持 `<slot />`（Web Component 标准草案）


## 【移除特性】

 1. [数据结构读写 jQuery 插件](../Component/source/ViewDataIO.js#L38)


## 【常用组件】

 1. [行政区多级联动选择](component/Admin_District.html)（基于高德地图 HTTP API）
 2. [分页数据表](component/Data_Table.html)
 3. [GitHub 仓库文档列表页](docs/html/Git_List.html)（[EasyWiki v2](http://git.oschina.net/Tech_Query/EasyWiki/blob/EWAwiki) 官方组件）


## 开发详情

 - [为什么我还在用 jQuery？](jQueryLove.md)
 - [开发进度](../../milestones/2)
 - [迭代记录](../../commits/String_Template)
 - [入门文档](docs/index.md)