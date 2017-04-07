# 声明式 MVVM 引擎 —— EasyWebApp v4



## 【原生态模板】

**EWA 模板语法**完全沿用各种 **Web 前端原生技术**的标准语义 ——

 - **UI 结构**：HTML 5+ 标准标签、`data-*` 自定义属性

 - **数据绑定**：HTML 标签文本、属性中书写 **ECMAScript 6 模板字符串**（形如 `${vm.propX}`）

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

 - **抽象视图** `View( $_Box )`（不可实例化）
   - 继承父类：`Observer()`
   - 继承视图：`.extend(iConstructor, iStatic, iPrototype)`
   - 查找实例：`.instanceOf(iDOM, Check_Parent)` 
   - 遍历 DOM：`.prototype.scan( iParser )` 
   - 获取数据：`.prototype.valueOf()`
   - 查子组件：`.prototype.childOf( iSelector )`
 - **普通视图** `HTMLView( $_Box )`（对应 JSON 对象）
   - 继承父类：`View()`
   - 解析 DOM：`.prototype.parse( Template_with_Slot )`
   - 渲染数据：`.prototype.render( iObject )`
 - **迭代视图** `ListView( $_Box )`（对应 JSON 数组）
   - 继承父类：`View()`
   - 清空列表：`.prototype.clear()`
   - 插入一项：`.prototype.insert( iObject )`
   - 渲染列表：`.prototype.render( iArray )` 
   - 删除一项：`.prototype.remove( Index )`

以上视图的构造函数 均可从 `$.fn.iWebApp` 命名空间访问到，并可无需 `WebApp()` 实例初始化即可单独使用。



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

    <input type="text" name="key1" required /> 已填 ${vm.key1.length} 字

    <input type="submit" />
</form>
```
 - `method` 属性支持 [RESTful API 规范](http://www.ruanyifeng.com/blog/2014/05/restful_api.html)中的常用 HTTP 动词
 - `enctype` 属性支持 [MIME-Type 标准](http://www.iana.org/assignments/media-types/media-types.xhtml)中的常用类型（如 `application/json`）
 - **数据字段校验**：完全依赖 HTML 5 Form API


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
        <li>内置索引号：${this._index_}</li>
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
},  function (iEvent, iAJAX) {

    //  基于两个 iQuery 扩展的实用方法，处理 jQuery AJAX 选项对象

    iAJAX.option.url = $.extendURL(iAJAX.option.url, {
        token:    self.sessionStorage.token
    });

    iAJAX.option.contentType = 'application/json';

    iAJAX.option.data = JSON.stringify($.paramJSON('?' + iAJAX.option.data));
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
    组件的 JS 代码必须全写在其 HTML 文件同目录的同名 .js 文件中
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
EWA 引擎会自动用它返回的数据对象来更新 VM。