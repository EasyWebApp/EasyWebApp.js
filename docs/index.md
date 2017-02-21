# 艾娃引擎入门

本篇讲解均以 [EasyWebApp v3 官方演示程序](../demo)的代码为例。



## 【代码基本结构】


### index.html

```HTML
<!DocType HTML>
<html><head>
    <meta charset="utf-8" />

    <style>
        /* 项目基本样式 */
    </style>

    <script src="//cdn.bootcss.com/require.js/2.2.0/require.min.js"></script>
    <script>
        require.config({
            baseUrl:    '../source/',
            paths:      {
                jquery:        '//cdn.bootcss.com/jquery/1.12.4/jquery.min',
                'jQuery+':     'http://tech_query.oschina.io/iquery/jQuery+',
                'iQuery+':     'http://tech_query.oschina.io/iquery/iQuery+',
                TimePassed:    '../demo/javascript/TimePassed'
            }
        });

        require(['../demo/index']);
    </script>
</head><body>
    <div class="Head Grid-Row Black_O CenterX CenterY">
        <h1>易资讯</h1>
        <ul class="NavBar No_Select">
            <!-- 二级下拉内容导航栏条目 -->
        </ul>
    </div>
    <div class="PC_Narrow">
        <!-- App 页面切换容器 -->
    </div>
    <div class="Foot Black_O Grid-Row CenterX">
        <!-- 版权信息 -->
    </div>
</body></html>
```

### index.js

```JavaScript
define(['jquery', 'TimePassed', 'EasyWebApp'],  function ($, TimePassed) {

    $.ajaxSetup({
        dataType:    'jsonp',
        cache:       true
    });

    /* --- 项目通用逻辑 --- */

    $(document).ready(function () {
    
        var iApp = $('body > .PC_Narrow').iWebApp('http://www.tngou.net/api/');

        //  WebApp 初始化后的更多处理
    });
});
```


## 【HTML 模板规则】

本章节前三点描述了一个重要概念 —— **SPA 链接元素**，它包含一些实用属性：
 1. `target` —— 链接指向的 **SPA 模块**渲染容器
 2. `href`、`src` 或 `action`（至少一种，至多两种）—— HTML/JSON 加载 URL
 3. `method`（缺省为 GET）—— JSON 加载所用的 **HTTP 动词**
 4. `data-*`（可选）—— JSON 加载所用的 **HTTP 请求参数**
 5. `title`（可选）—— 若目标模块为一个 **SPA 页面**，其值将作为网页标题

### （〇）加载页面

```HTML
<li class="DropDown Head"
    target="_self" href="html/list.html" src="top/list" autofocus>
    新闻
</li>
```
#### 属性解释
 - `target`（以下为可选值）
   - `_self`：模块容器为 JavaScript 代码中 **WebApp 初始化**时指定的 DOM 元素，即该模块为一个 **SPA 页面**，记入 **浏览器导航历史**
   - `name`：模块容器名为 name
 - `href` —— SPA 模块的 **HTML 片段**代码文件 URL
 - `src` —— SPA 模块的 **API 数据源** URL（相对于 WebApp 初始化时指定的 **API 根路径**） 
 - `autofocus` —— WebApp 初始化后加载的首个链接


### （一）调用 API

```HTML
<span target="_blank" method="DELETE" src="api/user/${this.uid}">
    删除
</span>
```
#### 属性解释
 - `target="_blank"` —— 该链接为 **纯 HTTP API 调用**，不渲染任何模块
 - `${this.uid}` —— 该 **SPA 链接所在数据作用域**中名为 uid 的数据值（语法规则 详见下文）


### （二）表单提交

`<form />` 被视作一个复杂的 **SPA 链接元素**。

```HTML
<form target="_self" href="html/list.html" action="search?name=topword">
    <input type="search" name="keyword" required placeholder="搜索关键词" />
</form>
```
#### 属性解释
 - `action` —— 相当于 SPA 链接的 `src` 属性


### （三）传统链接

为了兼容 **屏幕阅读器**（视力残障人士）、**后端渲染 SEO**，本引擎也支持 *传统链接*加载内页。

即当上述 SPA 链接的属性为 `target="_self" href="path/to/page.html"` 时，可改写如下 ——

```HTML
<a href="#!path/to/page.html">加载一个内页</a>
```


### （四）数据绑定

```HTML
<div class="Background-Image" style="background-image: url(${this.img})"></div>
<h1>${this.title}</h1>
<small class="Grid-Row CenterX">
    <span>${this.timePassed}</span>
    <a class="CenterX" target="_blank" href="${this.fromurl}">
        ${this.fromname}
    </a>
    <span>
        <i class="Icon Eye"></i>
        <em>${this.count}</em>
    </span>
</small>
<pre class="CenterX">${this.description}</pre>
<p>${this.message}</p>
```
#### 语法解释
 1. HTML 模板中任一标签属性、文本区域 均支持内嵌 [ES 6 模板字符串](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/template_strings)（不带 函数名标签前缀的基本语法），EWA v3.1 之前支持的 `name` 属性仅用于 表单元素的数据绑定
 2. **可输入元素**（[iQuery](//git.oschina.net/Tech_Query/iQuery) 扩展的 `:input:not(:button)` 伪类选择符）引起的数据变更 会触发该数据所在作用域下的 **UI 重绘**


### （五）迭代视图

```HTML
<ol class="CenterX" name="list">
    <li class="Item-Box visible Content" title="${this.description}" target="_self"
        href="html/content.html" src="${this._Data_Path_}/show?id=${this.id}">
        <div class="Background-Image" style="background-image: url(${this.img})">
        </div>
        <p>${this.title}</p>
        <small class="Grid-Row CenterX">
            <span title="${(new Date(this.time)).toLocaleString()}">
                ${this.timePassed}
            </span>
            <a target="_blank" href="${this.fromurl}">
                ${this.fromname}
            </a>
        </small>
    </li>
</ol>
```
#### 语法解释
 - `${this._Data_Path_}` —— 该 **DOM 元素所属 SPA 模块** `src` 属性中 URL 的路径部分
 - `${(new Date(this.time)).toLocaleString()}` —— ES 6 模板字符串内支持任何 [ES 5 严格模式](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Strict_mode)允许的 **JavaScript 表达式**


### （六）组件引用

```HTML
<div class="Panel">
    <div class="Head">网友评论</div>
    <div class="Body" href="html/comment.html"
         src="memo/comment?type=top&id=${this.id}"></div>
</div>
```
#### 属性解释
 - `href="html/comment.html"` —— 从相对于应用主文件 `index.html` 的路径 `html/comment.html` 加载 HTML 组件代码
 - `src="memo/comment?type=top&id=${this.id}"` —— 上述组件的数据来源



## 【组件化开发】


**EWA 组件** 是一个 **仅包含必要的 HTML、CSS、JS 代码**的合法 HTML 文件，其中 ——
 - HTML 对外可通过 `<slot name="" />` 提供 **元素插入点**
 - CSS 暂时没有局部作用域
 - JS 需要由 **符合 AMD 规范的异步加载器**引入
 - HTML 中可再引入其它模块


### （〇）异步逻辑

```JavaScript
<script>
require(['jquery'],  function ($) {

    //  在 WebApp 单例对象上定义页面组件的工厂函数

    $().iWebApp().component(function (data) {

        //  此时组件 HTML 已实例化，JSON 已加载、待渲染

        //  可以在当前组件下操作 DOM 元素
        this.$_View.find('tag.class');

        //  也可以绑定子组件的生命周期事件
        this.bind('data',  '#id .class',  function (link, data) {

            //  根据子组件的数据 更新父组件
            this.getParent().update('key', 'value');
        });

        //  修改过的 API 原始数据须返回给引擎
        return  $.map(data,  function () { });
    });
});
</script>
```

**示例组件** —— [分页数据表](../component/Data_Table.html)


### （一）页面组件

**页面组件** 是一种略微特殊的组件，它通常由用户点击 **SPA 链接**加载而来（SPA 链接 `src` 属性声明的 JSON URL 让 EWA 引擎可以异步加载页面数据），但也可能来自 用户 F5 刷新、URL 直接打开，为了保证 JSON 正常加载、URL 路由正确解析，需要在其 HTML 开头多写一个空指向的 **SPA 链接元素**（规则同上文）——

```HTML
<link target="_blank" src="path/to/json?key1=value1" />
```

**示例页面** —— [EWA 小试牛刀](html/try.html)



## 【JavaScript API】


### （〇）核心对象

`WebApp` 是一个 **单例对象**构造函数，其公开引用为 `$.fn.iWebApp`。

```JavaScript
//  初始化后再次调用（可无任何参数），仍返回之前的实例

var iApp = $('#PageBox').iWebApp();
```

### （一）模块生命周期 事件处理

**WebApp 对象**继承自 `iQuery.Observer()`（[多条件观察者对象]( http://tech_query.oschina.io/iquery/doc/#!data/Observer.md)），故其 **事件回调**有如下特性 ——
 1. 注册时，还可指定 **具体的 HTML、JSON 路径**（支持 部分匹配、正则表达式字符串）
 2. **同步/阻塞**执行
 3. 接受 **返回值**

#### 典型示例

```JavaScript
$('#PageBox').iWebApp()
    .on('data',  function (iLink, iData) {
        if ( iData.code )
            return  self.alert("【服务器报错】" + iData.message);

        return  (iData.data instanceof Array)  ?
            $.map(iData.data, Object_Filter)  :  Object_Filter( iData.data );
    })
    .on('ready',  'html/list.html',  function () {

        console.log("信息流 更新成功！");
    });
```

### （二）手动操作

```JavaScript
var iApp = $('#PageBox').iWebApp();

//  加载一个 SPA 页面
iApp.load('path/to/page.html');

//  加载一个 SPA 链接
iApp.load({
    target:    'module_name',
    href:      'path/to/module.html',
    src:       'path/to/data'
});

//  获取 DOM 元素所在的 SPA 模块对象，并将其重新加载
var Module_X = iApp.getModule('#Module_X');

var Promise_X = Module_X.load();
```


## 【EasyWebApp 插件开发】


### 基本写法

```JavaScript
$.fn.iWebApp.fn.plugin_x = function () {
    //  插件逻辑

    return this;
};
```

### itemDelete

为一个 **内含 ListView 的 UI 模块** 监听 **请求 DELETE 接口的 SPA 链接**，在用户确认后发送请求，并当响应成功后删除对应项目。

```JavaScript
$('#PageBox').iWebApp()
    .itemDelete($_ListBox,  'path/to/delete',  function () {
        return ConfirmDialog();
    });
```