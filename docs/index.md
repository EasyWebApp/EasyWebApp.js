# 艾娃入门

本篇讲解均以 [EasyWebApp v3 官方演示程序](../demo)的代码为例。



## 【代码基本结构】


### index.html

```HTML
<!DocType HTML>
<html><head>
    <meta charset="utf-8" />

    <title>易资讯</title>

    <link rel="stylesheet"
          href="http://tech_query.oschina.io/iquery/doc/core/css/EasyWebUI.css" />
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
    './javascript/iQuery+',
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


### SPA 链接元素

```HTML
<li class="DropDown Head"
    target="_self" href="html/list.html" src="top/list" autofocus>
    新闻
</li>
```
#### 属性解释
 - `target="_self"` —— 该链接指向的 **SPA 模块**的渲染容器为 JavaScript 代码中 **WebApp 初始化**时指定的 DOM 元素，即该模块为一个 **SPA 页面**，记入 **浏览器导航历史**
 - `href` —— SPA 模块的 **HTML 片段**代码文件 URL
 - `src` —— SPA 模块的 **API 数据源** URL（相对于 WebApp 初始化时指定的 **API 根路径**） 
 - `autofocus` —— WebApp 初始化后加载的首个链接


### 表单提交

`<form />` 被视作一个复杂的 **SPA 链接元素**。

```HTML
<form target="_self" href="html/list.html" action="search?name=topword">
    <input type="search" name="keyword" required placeholder="搜索关键词" />
</form>
```
#### 属性解释
 - `action` —— 相当于 SPA 链接的 `src` 属性


### 数据填充

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


### 迭代视图

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



## 【JavaScript 业务逻辑】



## 【EasyWebApp 插件开发】