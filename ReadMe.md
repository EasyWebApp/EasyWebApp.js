# 声明式 MVVM 引擎 —— EasyWebApp v4

基于 AMD 规范加载器、jQuery v3.2+ 构建，兼容 IE 9+、ECMAScript 5+、HTML 5+

[![Learn it with Demo](https://img.shields.io/badge/Learn%20it-with%20Demo-blue.svg)](https://github.com/TechQuery/GitHub/)
[![Join the chat at https://gitter.im/EasyWebApp-js/Lobby](https://badges.gitter.im/EasyWebApp-js/Lobby.svg)](https://gitter.im/EasyWebApp-js/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)



## 【原生态模板】

**EWA 模板语法**完全沿用各种 **Web 前端原生技术**的标准语义 ——

 - **UI 结构**：HTML 5+ 标准标签、`data-*` 自定义属性

 - **数据绑定**：HTML 标签文本、属性中书写 **ECMAScript 6 模板字符串**（形如 `${view.propX}`）

 - **事件回调**：像绑定数据一样去绑定函数

 - **资源加载**：可带参数的 HTTP URL，并自动处理相对路径

MVVM 引擎只需扫描 DOM 树，即可 **自动加载 HTML、JSON** 来构建 VM 树，开发者专注于数据整理、事件回调即可，无需任何本地编译、打包环境，享受低学习成本的 **原生 HTML、JavaScript 开发体验**。



## 【易拆分视图】

**ViewModel** 是对 View (HTML/DOM) 基于 **“数据驱动”模型**的面向对象封装 ——

 1. View 的所有 HTML 结构要放在唯一的容器元素中，方便 **VM 挂载**

 2. 同一时刻 **View 容器**只能挂载一个 VM 对象

 3. VM 在渲染时会检测 **JavaScript 数据类型**，自动匹配 HTML 模板中对应的 HTML 标签属性、DOM 对象属性

 4. DOM 标准事件、VM 自定义事件的回调函数，也视同数据的一部分绑定到 View，无需专门的 API

 5. View 容器本身的 HTML 标签属于上级 View 的结构，但挂载于其上的 VM 会监听其 `data-*=""` 自定义属性的数据变更

 6. 若不存在指向 解挂的 VM 或摘下的容器元素的其它引用，整个视图将被 **自动垃圾回收**


### 内置视图对象

<a target="_blank" href="docs/API/TreeView.html">【API 文档】</a>

以上视图的构造函数 均可从 `$.fn.iWebApp` 命名空间访问到，并可无需 `WebApp()` 实例初始化即可单独使用。

<a target="_blank" href="docs/API/external-_jQuery.fn_.html">【jQuery 快捷方法】</a>

 - 构建视图：`$('selector of view').view(Class_Name, iScope)`
 - 查找视图：`$(':view', Root_DOM).view()`



## 【声明式 AJAX】

如下格式的合法 HTTP URL 会被 EWA 引擎理解 ——
```
path/to/template.html?key1=value1&keyN=valueN&data=/path/to/json
```
`path/to/template.html`、`/path/to/json` 会被并行加载，`{key1: value1, keyN: valueN}` 会成为 `template.html` 对应 VM 初始数据的一部分。


### （〇）加载页面

```HTML
<a target="_blank" href="path/to/outer.html">
    新窗口打开外部页面
</a>
<a href="path/to/static.html">
    纯静态 SPA 页
</a>
<a href="path/to/template.html">
    无初始数据的模板
</a>
<a href="path/to/template.html?data=/path/to/json">
    用一份数据初始化一个模板
</a>
<a href="path/to/template.html?key1=value1&keyN=valueN&data=/path/to/json">
    用一份数据初始化一个模板，并传入一些参数
</a>
<div id="PageBox"></div>
<script>
    $('#PageBox').iWebApp('//api.test.com/v1');
</script>
```
**SPA 页面**总是在初始化 **WebApp 实例**的元素中被加载。


### （一）提交表单

```HTML
<form method="put" enctype="application/json" action="?data=/path/to/submit">
    <input type="hidden" name="extraParam" />

    <input type="text" name="key1" required /> 已填 ${view.key1.length} 字

    <input type="submit" />
</form>
```
 - `method` 属性支持 [RESTful API 规范](http://www.ruanyifeng.com/blog/2014/05/restful_api.html)中的常用 HTTP 动词
 - `enctype` 属性支持 [MIME-Type 标准](http://www.iana.org/assignments/media-types/media-types.xhtml)中的常用类型（如 `application/json`）
 - **数据字段校验**：完全依赖 HTML 5 Form API


### （二）引用组件

```HTML
<div data-href="path/to/template.html" data-key1="${view.Key1}" data-keyN="${view.KeyN}">
    <span slot="Slot_1"></span>
    <span slot="Slot_2"></span>
</div>
```
**EWA 组件**支持 [Web Components 标准草案](//webcomponents.org)的 Slot 机制、自定义属性，但引用时无需自定义标签。


### （三）请求接口

```HTML
<a data-method="PUT" href="?data=/path/to/put">点个赞</a>

<h3>列个表</h3>
<div data-href="?data=/path/to/list?count=10&page=1">
    <ul data-name="list">
        <li>内置索引号：${view.__index__}</li>
    </ul>
    共 ${view.total} 项
</div>
```


## 【纯前端路由】

利用 HTML 5 History API 对“纯 Hash URL”的支持，EWA 引擎直接把 **SPA 页面 URL** 置于 `#!` （Hash Bang，Google 提出的纯前端路由规则）之后，即使无后端渲染支持，用户也可随意【F5】或【Ctrl + C/V】。


### （〇）请求拦截

```JavaScript
(new EWA()).on({
    type:    'request',
    src:     'api.test.com'
},  function (iEvent, iAJAX) {

    //  基于 iQuery 扩展的实用方法，处理 jQuery AJAX 选项对象

    iAJAX.option.url = $.extendURL(iAJAX.option.url, {
        token:    self.sessionStorage.token
    });
});
```

### （一）响应处理

```JavaScript
(new EWA()).on({
    type:    'template',
    href:    /\.md$/i
},  function (iEvent, iData) {

    //  MarkDown 转 HTML

    return  marked( iData );

}).on({
    type:    'data',
    src:     'api.test.com'
},  function (iEvent, iData) {

    if (iData.code  ||  (iEvent.method != 'GET'))
        self.alert( iData.message );
    else
        return iData.data;
});
```

### （二）加载收尾

```JavaScript
(new EWA()).on({
    type:    'ready',
    href:    'path/to/template.html'
},  function (iEvent) {

    //  一个组件/页面的 DOM Ready

    //  即除 img、iframe、audio、video 等多媒体资源的 UI 渲染完成
});
```

### （三）实用方法

 - 获取 **页面路由原文**：`WebApp.prototype.getRoute()`

   - 为防止某些 URL 解析库欠考虑，EWA 路由做了一次 Base64 编码

 - 修改 **路由初始数据**：`WebApp.prototype.setURLData(key, value)`

   - 调用时可只传一个数据对象

   - 每次调用都生成一条新浏览历史

 - **页面浏览历史** 导航：`WebApp.prototype.loadPage( iStep )`

   - 不传参时刷新当前页

   - 传参时，参数与 `window.history.go()` 的用法一致

   - 页面切换后会重新加载，并解决本方法返回的 Promise 对象



## 【异步式组件】


### （〇）HTML 模板

**EWA 组件**代码本身是完全合法的 HTML 片段，可直接被 AJAX 加载并在 DOM 树中实例化 ——

```HTML
<style disabled>
    /*  此处的 disabled 标准属性是为了防止 DOM 子树初始化时影响全局 CSS，
     *  组件 VM 对象初始化时会自动生成 CSS 作用域
     */
</style>
<!--
    一个组件只有一份 JS 代码，推荐写在其 HTML 文件同目录的同名 .js 文件中
-->
<script src="component.js"></script>
<!--
    组件 UI 结构完全是普通的 HTML、JavaScript 表达式
-->
<div>
    现在是 ${(new Date()).toLocaleString()}
    <slot name="Slot_1" />
</div>
```

### （一）JavaScript 模块

无论 EWA 引擎本身，还是 EWA 组件的 JS 代码，均遵循 [AMD 规范](https://github.com/amdjs/amdjs-api/wiki/AMD)，其必要格式如下 ——

```JavaScript
require([
    'jquery', 'Module_1', 'Module_N', 'EasyWebApp'
],  function ($, Module_1, Module_N, EWA) {

    //  获取已初始化的 WebApp 单例

    var iWebApp = new EWA();

    EWA.component(function (iData) {

        //  iData 是与组件 HTML 并行加载的 JSON

        //  此处的 this 是自动创建好的 VM 对象

        var VM = this;

        iData.handler_1 = function () {

            //  回调函数也可以作为数据的一部分，用同样的模板语法绑定到 HTML 上

            //  此处的 this 还是 VM 对象

            this.xxx = 'yyy';
        };

        //  若你改变了传入的数据对象的引用，就必须 return 新的对象

        iData = $.extend({ }, iData);

        return iData;
    });
});
```
EWA 引擎会自动用它返回的数据对象来更新 VM。


### （二）官方组件

 1. [全局 AJAX 加载遮罩](component/loading.html)

 2. [行政区多级联动选择](component/Admin_District.html)（基于高德地图 HTTP API）

 3. [分页数据表](component/Data_Table.html)

 4. [轮播图](component/carousel.html)

 5. [阅读导航栏](component/read-nav.html)

 6. [GitHub 网页挂件](https://github.com/TechQuery/GitHub-Web-Widget)



## 【声明式事件】


**声明式事件绑定**的统一形式：`<element onEvent="${view.callback}" />`

 - `element`：HTML 标签名
 - `Event`：HTML / EWA 事件名
 - `callback`：事件回调在数据对象中的键名，该函数运行时 `this` 指向 `element` 在 HTML 结构上所处视图的 VM 对象


### 内置事件

| 事件名    | 来源对象   | 监听方式   | 触发原因     | 触发阶段 | 回调数据                                    |
|:--------:|:---------:|----------|:-----------:|:-------:|-------------------------------------------|
| request  | InnerLink | JS、HTML | AJAX 请求    | 之前     | jQuery AJAX 选项、jqXHR 对象               |
| template | HTMLView  | JS、HTML | 组件模板      | 之后     | 组件结构代码（如 HTML、MarkDown）           |
| data     | InnerLink | JS、HTML | 数据加载      | 之后     | JSON 对象                                |
| ready    | View      | JS、HTML | 组件渲染      | 之后     | 视图对象                                  |
| route    | WebApp    | JS       | 路由切换      | 之后     | 当前页**匹配的超链接**元素集合（jQuery 对象） |
| attach   | View      | JS       | 组件挂载      | 之后     |                                         |
| detach   | View      | JS       | 组件卸载      | 之后     |                                         |
| update   | View      | JS、HTML | 自定义属性更新 | 之后     | 更新的键值对                              |


### 事件接口

 - 多条件观察者 `Observer($_Box)`

   - 查找实例：`.instanceOf(iDOM, Check_Parent)` 

   - 注册回调：`.prototype.on(iEvent, iCallback)`
     - 回调函数 `this` 指向注册时的对象
     - 回调函数 第一参数为事件对象，第二参数为事件触发时的附加数据
     - 当前回调函数的返回值 将作为下个执行回调的第二参数

   - 注销回调：`.prototype.off(iEvent, iCallback)`

   - 一次监听：`.prototype.one(iEvent, iCallback)`
     - 省略回调 将返回 Promise 对象

   - 触发事件：`.prototype.emit(iEvent, iData)`

 - 实现类：`View`、`InnerLink`、`WebApp`

上述 `iEvent` 参数可仅为一个事件名字符串，也可用一个对象描述更多的条件（对象属性值可为字符串、正则表达式、DOM 对象等）。



## 【沉浸式体验】

EWA 充分利用现有技术，实现 [Google PWA 规范](https://developers.google.cn/web/progressive-web-apps/)一般的 App 体验，并且一切都是自动完成的 ——

 1. **跨域超链接** 自动在新网页中打开，不会全局刷新当前页，防止丢失应用状态

 2. 组件模板 **预加载**：基于 `<link rel="prefetch" />`，支持 IE 11+ 及所有非 Safari/Webkit 浏览器

 3. HTTP API **数据缓存**：基于 `Window.localStorage`，GET 请求失败也可正常显示页面