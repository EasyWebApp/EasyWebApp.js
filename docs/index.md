# 艾娃入门

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
                jquery:       '//cdn.bootcss.com/jquery/1.12.4/jquery.min',
                'jQuery+':    'http://tech_query.oschina.io/iquery/jQuery+',
                'iQuery+':    'http://tech_query.oschina.io/iquery/iQuery+'
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
define([
    'jquery',
    './javascript/TimePassed',
    'iQuery+',
    'EasyWebApp'
],  function ($, TimePassed) {

    var BOM = self;

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
<span target="_blank" method="DELETE" src="api/user/{uid}">
    删除
</span>
```
#### 属性解释
 - `target="_blank"` —— 该链接为 **纯 HTTP API 调用**，不渲染任何模块
 - `{uid}` —— 该 **SPA 链接所在数据作用域**中名为 uid 的数据值


### （二）表单提交

`<form />` 被视作一个复杂的 **SPA 链接元素**。

```HTML
<form target="_self" href="html/list.html" action="search?name=topword">
    <input type="search" name="keyword" required placeholder="搜索关键词" />
</form>
```
#### 属性解释
 - `action` —— 相当于 SPA 链接的 `src` 属性


### （三）数据填充

```HTML
<div class="Background-Image" name="img">
    <i></i>
</div>
<h1 name="title"></h1>
<small class="Grid-Row CenterX">
    <span name="timePassed"></span>
    <a class="CenterX" target="_blank" name="fromurl">
        <span name="fromname"></span>
    </a>
    <span>
        <i class="Icon Eye"></i>
        <em name="count"></em>
    </span>
</small>
<pre class="CenterX" name="description"></pre>
<p name="message"></p>
```
#### 属性解释
 - `name` —— API 返回的 **JSON 数据对象**中的 **数值键名**


### （四）迭代视图

```HTML
<ol class="CenterX">
    <li class="Item-Box visible Content" target="_self"
        href="html/content.html" src="{_Data_Path_}/show" data-id="id">
        <div class="Background-Image" name="img">
            <i></i>
        </div>
        <p name="title"></p>
        <small class="Grid-Row CenterX">
            <span name="timePassed"></span>
            <a target="_blank" name="fromurl">
                <span name="fromname"></span>
            </a>
        </small>
    </li>
</ol>
```
#### 属性解释
 - `{_Data_Path_}` —— 该 **DOM 元素所属 SPA 模块** `src` 属性中 URL 的路径部分
 - `data-name="key"` —— 该 DOM 元素所在 **SPA 数据作用域**中名为 `key`（驼峰命名法）的数据值，将以 `name` 为参数名去请求 **HTTP API**


### （五）模块引用

```HTML
<div class="Panel">
    <div class="Head">网友评论</div>
    <div class="Body" href="html/comment.html"
         src="memo/comment?type=top" data-id="id"></div>
</div>
```
【特别注意】 **SPA 模块引用容器**的 HTML 标签内不能有任何代码、字符（即 **DOM 实例化**后不能有任何子节点，符合 `:empty` **CSS 3 选择符**的定义）



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
            return  BOM.alert("【服务器报错】" + iData.message);

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

Module_X.load();
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

```JavaScript
$('#PageBox').iWebApp()
    .itemDelete($_ListBox,  'path/to/delete',  function () {
        return ConfirmDialog();
    });
```

### selectLoad

```JavaScript
var iApp = $('#PageBox').iWebApp();

//  单下拉框
iApp.selectLoad('path/to/list',  'value_key',  function (iLink, iData) {
    return iData.data;
});

//  多级联动
iApp.selectLoad(
    'path/to/list',
    'value_key',
    function (iLink, iData) {
        return iData.data;
    },
    'path/to/parent_module.html',
    function () {
        //  修改 src 属性
        return  arguments[1].replace(/\/\d+$/,  '/' + ID);
    }
);
```