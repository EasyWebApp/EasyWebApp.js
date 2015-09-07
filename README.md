#EasyWebApp

## 【项目概述】
**EasyWebApp** 是一个基于 **jQuery API** 的**轻量级 SPA（单页应用）引擎**，**网页设计、后端接口、前端组件 充分解耦** —— 只用**原生 HTML** 做模板，对 **JSON 数据**的结构几无硬性要求，完全兼容现有的 **jQuery 插件**。

本引擎首个广泛使用的开源稳定版 v1.6 脱胎于 2 个**移动端网页应用**（微信公众平台）和 2 个**桌面端网页系统**（某公司开放平台），是一个有较高 **抽象性**、**普适性**的 SPA 引擎，**个人独立开发**、**团队协作开发** 都能轻松胜任~


## 【核心理念】
EasyWebApp 与其作者开发的 [**EasyWebUI**](http://git.oschina.net/Tech_Query/EasyWebUI)（Web 前端 UI 框架）的理念一致 ——

    充分利用 HTML 标签、属性 原生的语义、样式、功能，力求 Web 前端代码 表达上的简练、架构上的解耦！

这使得本引擎 ——
 - **学习曲线缓**：只会 HTML、CSS 网页制作的人即可开发 SPA（基于 后端开发者 或 **BaaS** 的 HTTP API）
 - **开发成本低**：原有项目的 HTML/CSS 模板、jQuery 插件 完全不用修改，只需加入一点 HTML 属性、jQuery 事件监听的代码，再清理掉大量由引擎代劳的 HTML、JavaScript 代码
 - **维护效率高**：基于本引擎的项目代码 主要是 **根据运行时具体事件的相关页面 URL 处理数据**，很少涉及直接操作 DOM、AJAX，每个 HTML、JavaScript 文件也大都只有 100 行左右


## 【演示项目】
### 一、每日资讯（移动版）
 - 前端页面
   - 访问网址：[http://easywebapp.oschina.cnpaas.io/demo](http://easywebapp.oschina.cnpaas.io/demo)
   - 因为前期主要演示本引擎的核心特性，Demo 界面暂无美术设计，仅有 EasyWebUI 框架组件的默认样式
 - 后端数据
   - 基于 [方倍工作室 API 100](http://www.cnblogs.com/txw1958/p/weixin-api100.html)，支持 **微信公众平台 AppKey**（URL 形如 `/demo/index.html?wechat_appkey=xxx`）
   - 因为上述接口没有开放 **前端跨域访问**，所以引擎作者用一个 PHP 脚本做了一层代理，导致 **API 数据响应**较慢，请稍安勿臊
 - 源码授权：与本项目的开源协议一致 —— **自由使用、自主修改，保留署名、分享改进**


## 【版本历史】
 - v1.6.5 Stable —— 2015年9月7日   WebApp 对象“手动控制”实例方法 参数写法与 HTML 属性统一（也支持 缺省简写形式）
 - v1.6   Stable —— 2015年8月20日  **第一代数据堆栈** 独立为一个对象
 - v1.5.5 Stable —— 2015年8月18日
   - 支持 **RESTful API** 的 Post、Delete、Put 方法
   - 支持 **模板文件 预加载**
   - 支持 数据模型 嵌套一层对象
 - v1.4.5 Stable —— 2015年8月11日  集成 **首屏渲染数据**的 API 调用
 - v1.3.5 Stable —— 2015年8月10日  支持 **API URL 访问代理**、API 返回 纯文本数据
 - v1.3   Stable —— 2015年8月3日   支持 **MarkDown 模板渲染**，并发布 首个演示程序
 - v1.2   Stable —— 2015年7月24日  首个**开源稳定版**，**第一代 API** 形态已稳定
 - v1.1   Beta   —— 2015年7月22日  首个开源版本，基本模式、架构已成形

---

## 【使用入门】

### 〇、开发流程

本节总述 EasyWebApp 建议的 SPA 开发流程，后面三节是本流程具体步骤的示例讲解 ——
 1. **产品设计师** 做好 **Web 原型**后，**前端工程师** 即可按原型制作页面，与 **视觉设计师**（美工）并行工作
 2. 同时，在前端工程师开始制作页面时，综合考虑 原型中页面、功能的划分，与 **后端工程师** 商定好 **数据 API** 的 **URL**、**数据结构**、**字段名**（参考 **RESTful 规范**、下文【数据填充】规范）
 3. 用 **HTML、CSS、jQuery 最自然的思维方式** 去制作页面（原来你**前后端分离**模式下怎么写前端程序 现在就怎么写）~
 4. 应用本引擎在 HTML、jQuery 上的特性，引擎就会自动把各个页面串接起来，成为一个单页应用~

### 一、加载引擎

本项目的开发最早基于 [**iQuery**](http://git.oschina.net/Tech_Query/iQuery)（相当于 **jQuery v1.x** 的精简与扩展），若要用 **jQuery 官方版**来驱动本引擎，需要同时加载 iQuery 项目中的 [jQuery+.js](http://git.oschina.net/Tech_Query/iQuery/blob/master/jQuery+.js) 来启用扩展的 jQuery API（一些 jQuery 插件）。

本引擎 v1.3 开始支持的 **MarkDown 规范代码渲染** 还需要加载 [**marked.js**](https://github.com/chjj/marked/)（推荐引用 [中国大陆 CDN](http://www.bootcdn.cn/marked/)）。

### 二、启动引擎
```html
<!DocType HTML>
<html><head>
    <meta http-equiv="X-UA-Compatible" content="IE=Edge, Chrome=1" />
    <script src="path/to/iQuery.js"></script>
    <script src="path/to/marked.js"></script>
    <script src="path/to/EasyWebApp.js"></script>
    <script>
    $(document).ready(function () {
        $('body > section').WebApp();
    });
    </script>
</head><body>
    <header>
        ...
    </header>
    <section>
        ...
    </section>
    <footer>
        ...
    </footer>
</body></html>
```
### 三、数据填充
本引擎模板 把 **HTML name 属性** 推而广之，应用在任何 HTML 元素上，用作 JSON 数据的“**键值对应**”。仅有很少的 宽松规范 ——
 - 出现在**同一页面的不同数据不可重名**（如 用户、App、作品 等的名字，不可都用 name 来作为 JSON 键，无论它们 来自哪个 API 或 在数据结构的哪一层）
 - 符合 CSS 3 选择器 `ul, ol, dl, tbody, *[multiple]:not(input)` 的**数据容器元素**（有 name 属性的），其对应的数据结构是一个**以普通对象为元素的数组**，其子元素（它也可以有子元素）只需有一个，引擎会自动复制这个子元素的作为**数组迭代的模板**

```html
<div multiple name="list" max="6">
    <img name="avatar" src="path/to/logo.png" />XXX
</div>
```

### 四、页面串接
本引擎的网页模板不采用“自创模板语言”，而直接使用 **原生 HTML 的常用属性** 来标记引擎的特性 ——

#### （一）加载内页（AJAX 无刷新）
```html
<div target="_self" title="New Page" href="path/to/page_1.html"
     src="path/to/data/api/{id}" data-arg_1="data_name_1">
    <img src="path/to/logo.png" />XXX
</div>
```
```javascript
(function (BOM, $) {

    $('body > section')
        .onPageRender('page_1.html',  function (iData, Prev_Page) {
            //  iData 是 API 返回的 JSON，格式自定义，默认为 空对象
            if (iData.code == 200)
                return iData.data;

            BOM.alert(iData.message);
            BOM.history.go(-1);
        })
        .WebApp();

})(self, self.jQuery);
```
【注】上述代码加载的内页 可以是 **HTML 代码片段**（包括 所有可见元素、style 元素），无需重复编码。

#### （二）加载外页（传统刷新）
```html
<div target="_top" href="path/to/page_2.html" data-arg_1="data_name_1">
    <img src="path/to/logo.png" />XXX
</div>
```
```javascript
(function (BOM, $) {

    $('body > section')
        .on('appExit',  function () {
            //  若 被触动的元素 是 form，则 iData 为 表单提交所返回的数据
            iData = arguments[3];

            if (iData.code > 200) {
                alert(iData.message);
                return false;           //   阻止页面刷新、跳转
            }
        })
        .WebApp();

})(self, self.jQuery);
```
#### （三）调用接口（纯数据，无页面加载）
```html
<button target="_blank" src="path/to/data/api/{id}" data-arg_3="data_name_3">
    喜欢
</button>
```
```javascript
(function ($) {

    $('body > section')
        .on('apiCall',  function () {
            //  iData 为 API 返回的数据
            iData = arguments[4];

            if (iData.code > 200)
                alert(iData.message);
        })
        .WebApp();
   
})(self.jQuery);
```
#### （四）首屏渲染
若首屏渲染时的数据来自 HTTP API，则可复用“调用接口”功能的 HTML 语义，在 `<head />` 中用 `<link />` 声明数据来源即可 ——
```html
<head>
    ...
    <link target="_blank" src="path/to/data/api_0/{id}" data-arg_a="data_name_a" />
    <link target="_blank" src="path/to/data/api_1/{id}" data-arg_b="data_name_b" />
</head>
```
#### （五）表单提交
本小节功能的实质 是一个**引擎内置的综合应用**（参见本大节前三小节）—— 表单提交 实际上是一个接口调用，成功返回后，可以继续 加载内外页面~
```html
<form method="POST" action="path/to/api/{uid}"
      target="_self" href="path/to/app_1.html" data-arg_2="data_name_2">
    <input type="hidden" name="uid" />
    <input type="email" name="email" placeholder="注册电邮" />
    <input type="password" name="password" placeholder="密码" />
    <input type="submit" />
</form>
```
【注】在本例的情形中，为了顺应 form 的习惯，用 `action` 代替了 `src`。
```javascript
(function ($) {

    $('body > section')
        .on('formSubmit',  function () {

            var iData = arguments[3];

            if (iData.code == 200)
                return iData.data;

            alert(iData.message);
            return false;
        })
        .WebApp();
   
})(self.jQuery);
```

## 【API 总览】

### 一、jQuery 实例方法
```javascript
$_AppRoot
    .onPageRender(
        HTML_Match,    //  二选一，String 或 Regexp，匹配 HTML 文件路径
        JSON_Match,    //  二选一，String 或 Regexp，匹配 JSON API 路径
        Page_Render    //  必选，本引擎加载 HTML、JSON 后，进行错误处理，
                       //  并返回开发者自定义数据结构中的内容对象，以便引擎正确地渲染页面
                       //  （还可以有 更多自定义的逻辑）
    )
    .onPageReady(
        HTML_Match,    // （同上）
        JSON_Match,    // （同上）
        Page_Render    //  必选，本引擎渲染 HTML、JSON 后，执行传统 DOM Ready 回调中的页面逻辑
    )
    .WebApp(
        Init_Data,                         //  可选，一般为 登录后的会话数据
        'http://cross.domain.api/root',    //  可选，API 服务器 与 静态网页资源服务器 不同时设置，
                                               并支持 跨域代理 URL 前缀
        URL_Change                         //  可选，Boolean，控制 地址栏网址 是否改变
    );
```
### 二、jQuery 自定义事件
本引擎不支持“在 jQuery 插件 初始化时传入各种回调函数”的方式，一切**可编程点**均直接在 **实例化 WebApp** 的元素上触发**自定义 DOM 事件**，开发者只需使用 jQuery 标准的事件监听方法，就可以在其回调函数中调用 **WebApp 实例**的方法。

【事件分类】
 - [A] 表示 **异步事件**，一般在 事件名所表示的操作 完成时 触发，可在回调内根据 API 返回值，酌情调用 WebApp 实例方法，**手动控制 WebApp 加载页面**
 - [S] 表示 **同步事件**，一般在 事件名所表示的操作 进行前 触发，可能需要开发者：
   -  判断是否阻止**事件操作**执行 —— return false
   -  在自定义数据格式中提取**内容数据**参与渲染 —— return {...}

【事件总表】
 - [S] **pageRender 事件** 在一个内部页面的模板、数据加载完，准备**用数据渲染模板**时触发。其回调参数如下：
   -  jQuery Event 对象
   -  正在渲染的页面对象
   -  刚切换走的页面对象
   -  API 返回数据
 - [A/S] **apiCall 事件** 在一个 HTTP API 请求结束时触发。其回调参数如下：
   -  jQuery Event 对象
   -  WebApp 实例对象
   -  当前 HTML URL
   -  API URL
   -  API 返回数据
 - [S] **appExit 事件** 在一个外部页面加载（单页应用实例 销毁）前触发。其回调参数如下：
   -  jQuery Event 对象
   -  当前 HTML URL
   -  将加载的外部页面 URL
   -  事件源元素对应的数据对象（如 id 等 须附加在 URL 后页面才能正常跳转的参数）
 - [S] **formSubmit 事件** 在一个表单提交并返回数据后触发（此时可能会跳转页面）。其回调参数如下：
   -  jQuery Event 对象
   -  当前 HTML URL
   -  当前 form 实际使用的 action URL
   -  表单提交 返回数据
   -  即将跳转到的页面 HTML URL
 - [A] **pageReady 事件** 在一个内部页面渲染完成时触发。其回调参数如下：
   -  jQuery Event 对象
   -  WebApp 实例对象
   -  刚渲染好的页面对象
   -  刚切换走的页面对象

### 三、WebApp 对象实例方法
WebApp 支持手动调用 本引擎 **页面串接规则**（上文【使用入门】第四大节）对应的 JavaScript 实例方法 ——
```javascript
iWebApp
    .loadTemplate({                //  加载内页（参数简写形式 见下文）
        title:     "局部刷新",
        href:      HTML_URL,
        method:    'POST',
        src:       JSON_URL,
    }, {
        arg_1:    'arg_1_name'
    })
    .loadJSON(JSON_URL)            //  调用 API（参数详写形式 见上文）
    .loadPage(HTML_URL);           //  加载外页（参数详写形式 见上文）
```

## 【进阶导引】
EasyWebApp v1.x 的基本模型（对照 MVC）——
 - 页面模板 —— 数据接口 (View - Model)
 - 接口数据 —— 操作历史 (Model - View)
 - 操作事件 —— 业务逻辑 (Controller)
 - 组件化（依靠 CSS 框架、jQuery 插件，不越俎代庖）


## 【项目缘起】
**EasyWebApp** 算是其作者与 产品、设计、后端的各种“撕逼”后，或坚持、或折中的结果。其 **HTML 模板机制** 源于作者早期的一个 PHP 前端项目 [EasyWebTemplate](http://git.oschina.net/Tech_Query/EasyWebTemplate)（基于 **phpQuery**），而其 **事件驱动的 API** 则源于文首提到的开放平台首个版本的**智能表单引擎** JSON_Web.js（强数据格式依赖、不支持不规律的界面设计，未到达开源水准，但会继续吸收其优秀的特性）。虽然前面这些小项目 都有些幼稚，但却又是 **敢于把独立思考成果付诸实践**的有益尝试，若没有这些沉淀，就没有本项目自 2015年6月29日的26天 内即发布**开源稳定版**的成绩~