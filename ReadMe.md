# 声明式 MVVM 引擎 —— EasyWebApp v4

MVVM 引擎必需的所有 UI 结构，全部以 **完全标准的 HTML 5 代码**写出，其文本、属性也可以是 **合法的 ECMAScript 6 模板字符串**。MVVM 引擎只需扫描 DOM 树，即可 **自动加载 HTML、JSON** 来构建 VM 树，开发者专注于数据整理、事件回调即可，无需任何本地编译、打包环境，享受低学习成本的 **原生 HTML、JavaScript 开发体验**。



## 【视图模型】

**ViewModel** 是对 View (HTML/DOM) 基于 **“数据驱动”模型**的面向对象封装 ——

 1. View 的所有 HTML 结构要放在唯一的容器元素中，方便 **VM 挂载**

 2. 同一时刻 **View 容器**只能挂载一个 VM 对象

 3. VM 在渲染时会检测 **JavaScript 数据类型**，自动匹配 HTML 模板中对应的 HTML 标签属性、DOM 对象属性

 4. DOM 标准事件、VM 自定义事件的回调函数，也视同数据的一部分绑定到 View，无需专门的 API

 5. View 容器本身的 HTML 标签属于上级 View 的结构，但挂载于其上的 VM 会监听其 `data-*=""` 自定义属性的数据变更

 6. 若不存在指向 解挂的 VM 或摘下的容器元素的其它引用，整个视图将被 **自动垃圾回收**


### 内置视图对象

 - `View( $_Box )` 抽象视图（不可实例化）
   - `View.extend()` 继承视图
   - `View.instanceOf()` 查找视图对象
   - `View.prototype.scan()` 遍历视图 DOM 树
 - `HTMLView( $_Box )` 普通视图（对应 JSON 对象）
   - `HTMLView.prototype.parse()` 解析视图 DOM 树
   - `HTMLView.prototype.render( iObject )` 渲染视图
   - `HTMLView.prototype.valueOf()` 获取视图完整数据
 - `ListView( $_Box )` 迭代视图（对应 JSON 数组）
   - `ListView.prototype.clear()` 清空列表
   - `ListView.prototype.insert( iObject )` 插入一个普通视图
   - `ListView.prototype.render( iArray )` 渲染列表
   - `ListView.prototype.remove( Index )` 删除一个普通视图



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
<form method="post" action="?data=/path/to/submit">
    <input type="hidden" name="extraParam" />

    <input type="text" name="key1" required /> 已填 ${vm.key1.length} 字

    <input type="submit" />
</form>
```
**表单数据校验**完全依赖 HTML 5 Form API，但 `method` 支持 **RESTful API 规范**中的常用 HTTP 动词。


### （二）引用组件

```HTML
<div data-href="path/to/template.html" data-key1="${vm.Key1}" data-keyN="${vm.KeyN}">
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
        <li></li>
    </ul>
    共 ${this.total} 项
</div>
```


## 【纯前端路由】

利用 HTML 5 History API 对“纯 Hash URL”的支持，EWA 引擎直接把 **SPA 页面 URL** 置于 `#!` （Hash Bang，Google 提出的纯前端路由规则）之后，即使无后端渲染支持，用户也可随意【F5】或【Ctrl + C/V】。

但为防止某些 URL 解析库欠考虑，EWA 路由做了一次 Base64 编码，并可用 `WebApp.prototype.getRoute()` 获取原文。


### （〇）请求拦截

```JavaScript
$().iWebApp().on({
    type:    'request',
    src:     'api.test.com'
},  function (iEvent, AJAX_Option) {

    //  基于两个 iQuery 扩展的实用方法，处理 jQuery AJAX 选项对象

    AJAX_Option.url = $.extendURL(AJAX_Option.url, {
        token:    self.sessionStorage.token
    });

    AJAX_Option.contentType = 'application/json';

    AJAX_Option.data = JSON.stringify($.paramJSON('?' + AJAX_Option.data));
});
```

### （一）响应处理

```JavaScript
$().iWebApp().on({
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
$().iWebApp().on({
    type:    'ready',
    href:    'path/to/template.html'
},  function (iEvent) {

    //  一个组件/页面的 DOM Ready

    //  即除 img、iframe、audio、video 等多媒体资源的 UI 渲染完成
});
```


## 【AMD 模块化规范】

无论 EWA 引擎本身，还是 EWA 组件的 JS 代码，均遵循 [AMD 规范](https://github.com/amdjs/amdjs-api/wiki/AMD)。

并且一个组件的 JS 代码必须写在其 HTML 文件同目录的同名 `.js` 文件中，必要格式如下 ——

```JavaScript
require([
    'jquery', 'Module_1', 'Module_N', 'EasyWebApp'
],  function ($, Module_1, Module_N) {

    //  获取已初始化的 WebApp 单例

    var iWebApp = $().iWebApp();

    iWebApp.component(function (iData) {

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
当其所对应的 HTML 文件用 `<script src="module.js"></script>` 引用了它，EWA 引擎就会自动用它返回的数据对象来更新 VM。