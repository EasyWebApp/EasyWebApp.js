# EasyWebApp

## 【项目概述】
[**EasyWebApp**](http://tech_query.oschina.io/easywebapp) 是一个基于 **jQuery API** 的 **轻量级 SPA（单页应用）引擎**， **网页设计、后端接口、前端组件 充分解耦** —— 只用 **原生 HTML** 做模板，对 **JSON 数据**的结构几无硬性要求，完全兼容现有的 **jQuery 插件**。

本引擎广泛使用的最新开源稳定版 v2.5 脱胎于 3 个 **移动端网页应用**（微信公众平台）和 3 个 **桌面端网页系统**（某公司开放平台），是一个有较高 **抽象性**、 **普适性**的 SPA 引擎， **个人独立开发**、 **团队协作开发** 都能轻松胜任~


## 【核心理念】
EasyWebApp 与其作者开发的 [**EasyWebUI**](http://git.oschina.net/Tech_Query/EasyWebUI)（Web 前端 UI 框架）的理念一致 ——

    充分利用 HTML 标签、属性 原生的语义、样式、功能，力求 Web 前端代码 表达上的简练、架构上的解耦！

这使得本引擎 ——
 - **学习曲线缓**：只会 HTML、CSS 网页制作的人即可开发 SPA（基于 后端开发者 或 **BaaS** 的 HTTP API）
 - **开发成本低**：原有项目的 HTML/CSS 模板、jQuery 插件 完全不用修改，只需加入一点 HTML 属性、jQuery 事件监听的代码，再清理掉大量由引擎代劳的 HTML、JavaScript 代码
 - **维护效率高**：基于本引擎的项目代码 主要是 **根据运行时具体事件的相关页面 URL 处理数据**，很少涉及直接操作 DOM、AJAX，每个 HTML、JavaScript 文件也大都只有 100 行左右


## 【演示项目】

演示源码的授权协议与本项目的 **开源协议**一致 —— **自由使用、自主修改，保留署名、分享改进**！

### 一、每日资讯（移动版）
 - 前端页面
   - 项目代码：http://git.oschina.net/Tech_Query/iDaily
   - 因为前期主要演示本引擎的核心特性，Demo 界面暂无美术设计，仅有 EasyWebUI 框架组件的默认样式
 - 后端数据
   - 引用了 **淘宝网 IP 地理信息**、[**天狗云平台**](http://www.tngou.net) 的开放 API

### 二、后台管理 UI
 - 前端页面
   - 访问网址：http://tech_query.oschina.io/easywebapp/demo/Admin/
 - 后端数据
   - 主要基于 [**天狗云平台**](http://www.tngou.net) 的开放 API

### 三、开放内容系统（Wiki / CMS）
【实战项目】 **EasyWiki（易维基）百科系统** —— http://git.oschina.net/Tech_Query/EasyWiki


## 【版本历史】
 - v2.6   Alpha   —— 2016年7月4日
   - **多条件事件绑定** jQuery API 基于 `iQuery.Observer()` 重构到 WebApp 对象上
   - 支持 iQuery+ v1.4 新增的 `$.CommonView()` **抽象视图接口**
   - 引擎源代码 AMD 规范化
 - v2.5   Stable  —— 2016年5月13日
   - 独立出 **抽象视图数据读写**方法 `$.fn.dataRender()`、`$.fn.dataReader()`，方便业务逻辑复用
   - 支持 **内页模板文件**中的 **内联 JavaScript** 执行
   - `WebApp` 对象继承 **iQuery+ v1.4** 内置的 `$.EventInterface()` 抽象接口，实现 **事件多回调**采用最后一次有效返回数据
   - 提高了 DOM 缓存可控性
 - v2.4   Stable —— 2016年4月25日
   - 所有 HTML 文件中均可 **内联内页**
   - **纯 API 调用**返回的数据 也会压入数据栈
   - URL 默认参数、API 调用代理不再由本引擎负责 URL 处理，应由 jQuery 标准 API `$.ajaxPrefilter()` 统一处理
   - 内部对象 DataStack 的功能融入 InnerHistory，大幅简化数据的存取、渲染
 - v2.3   Stable —— 2016年2月22日  **内页加载方式**更灵活
   - 支持 `#!` 静态路径导航
   - 数据栈中可取到每个内页的 **模版 URL 参数**、 **环境变量**（首批支持 `_File_Path_`、`_File_Name_`、`_Ext_Name_`）
   - 支持用 HTML `head > link` **链接元素**加载内页
   - 支持首页 **HTML 内联内页**
 - v2.2   Stable —— 2015年12月3日  引擎内部实现 **OOP 重构**（第二阶段）
   - 重构 PageLink、ListView、InnerPage，实现 **局部数据刷新**
   - ListView 实现独立为一个 jQuery 静态方法，并贡献给 iQuery 项目的 [iQuery+ 插件库](http://git.oschina.net/Tech_Query/iQuery/blob/master/iQuery+.js)
   - WebApp 对象“手动控制”实例方法 整合为一个 loadLink 方法
 - v2.1   Stable —— 2015年11月12日
   - 把 用户操作事件的监听与分发 独立为一个“实例无关”的底层公共模块
   - 将 页面加载、切换的核心逻辑 融入 **PageLink 对象**
   - 独立出 **ListView 对象**，便于实现 局部刷新
 - v2.0   Beta   —— 2015年10月7日   引擎内部实现 **OOP 重构**（第一阶段）
   - **WebApp 对象实现** 独立为 InnerPage、InnerHistory、DataStack、PageLink 四大内部对象
 - v1.8.5 Stable —— 2015年9月24日
   - SPA 内页也支持用 `<link />` 声明 **多数据源**
   - 新增 **pageLoad 同步事件**，会在用户触发内页跳转时产生
   - 所有的接口调用点 都可用 **apiCall 同步事件**来 Hook
 - v1.7   Stable —— 2015年9月11日
   - 数据在每个 WebApp 实例内外的流转链 更顺畅
   - WebApp 对象“手动控制”实例方法 参数写法与 HTML 属性统一（也支持 缺省简写形式）
 - v1.6   Stable —— 2015年8月20日
   - **第一代数据堆栈** 独立为一个对象
   - 支持 **RESTful API** 的 Post、Delete、Put 方法
   - 支持 **模板文件 预加载**
   - 支持 数据模型 嵌套一层对象
 - v1.4.5 Stable —— 2015年8月11日
   - 集成 **首屏渲染数据**的 API 调用
   - 支持 **API URL 访问代理**、API 返回 纯文本数据
 - v1.3   Stable —— 2015年8月3日    支持 **MarkDown 模板渲染**，并发布 首个演示程序
 - v1.2   Stable —— 2015年7月24日   首个 **开源稳定版**， **第一代 API** 形态已稳定
 - v1.1   Beta   —— 2015年7月22日   首个开源版本，基本模式、架构已成形

---

## 【使用入门】

### 〇、开发流程

本节总述 EasyWebApp 建议的 SPA 开发流程，后面三节是本流程具体步骤的示例讲解 ——
 1. **产品设计师** 做好 **Web 原型**后， **前端工程师** 即可按原型制作页面，与 **视觉设计师**（美工）并行工作
 2. 同时，在前端工程师开始制作页面时，综合考虑 原型中页面、功能的划分，与 **后端工程师** 商定好 **数据 API** 的 **URL**、 **数据结构**、 **字段名**（参考 **RESTful 规范**、下文【数据填充】规范）
 3. 用 **HTML、CSS、jQuery 最自然的思维方式** 去制作页面（原来你 **前后端分离**模式下怎么写前端程序 现在就怎么写）~
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
    <script src="path/to/iQuery+.js"></script>
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
本引擎模板 把 **HTML name 属性** 推而广之，应用在任何 HTML 元素上，用作 JSON 数据的“ **键值对应**”，自动填充 **数据容器元素**的 `innerHTML`、`value`、`src`、`href` 乃至 `background-image`，仅有很少的 宽松规范 ——

 - 出现在 **同一页面的不同数据不可重名**（如 用户、App、作品 等的名字，不可都用 name 来作为 JSON 键，无论它们 来自哪个 API 或 在数据结构的哪一层）
 - 符合 CSS 3 选择器 `ul, ol, dl, tbody, select, datalist, *[multiple]:not(input)` 的数据容器元素（有 name 属性的），其对应的数据结构是一个 **以普通对象为元素的数组**，其子元素（它也可以有子元素）只需有一个，引擎会自动复制这个子元素的作为 **数组迭代的模板**
 - 数据值 若是 **URL**，它会被优先填在 `<img src="" />`、`<a href="" />` 中，其次会尝试设为 **枝节点元素**（有子元素的）的 background-image，最后才会被赋给 **叶节点元素**（无子元素的）的 innerHTML

```html
<div multiple name="list" max="6">
    <img name="avatar" />XXX
</div>
```

### 四、页面串接
本引擎的网页模板不采用“自创模板语言”，而直接使用 **原生 HTML 的常用属性** 来标记引擎的特性 ——

#### （〇）链接元素（重要概念）
**SPA 链接元素** 是指 —— **不限于 `<a />` 的 HTML 可见元素**，在添加 **SPA 专用属性**后，将由 SPA 引擎响应 用户操作，执行 SPA 页面切换、接口调用、整页刷新 等程序逻辑，起到 传统网页中 `<a />` 的作用。

因此，直接用普通元素作为链接 ——
 - 优点：简化 DOM 树结构、绕开 `<a />` 在部分老版移动浏览器上禁用默认事件行为无效的 Bug
 - 缺点：链接指向的外部页面无法被搜索引擎收录

#### （一）加载内页（AJAX 无刷新）
```HTML
<script>
(function (BOM, $) {

    $('body > section').WebApp()
        .on('PageRender',  'page_1.html',  function (iData, This_Page, Prev_Page) {
            //  iData 是 API 返回的 JSON，格式自定义，默认为 空对象
            if (iData.code == 200)
                return iData.data;

            BOM.alert(iData.message);
            BOM.history.go(-1);
        });

})(self, self.jQuery);
</script>

<div target="_self" title="New Page" href="path/to/page_1.html"
     src="path/to/data/api/{id}" data-arg_1="data_name_1">
    <img src="path/to/logo.png" />XXX
</div>
```
【注】上述代码加载的内页 可以是 **HTML 代码片段**（包括 所有可见元素、style 元素），无需重复编码。

#### （二）加载外页（传统刷新）
```HTML
<script>
(function (BOM, $) {

    $('body > section').WebApp()
        .on('appExit',  function () {
            //  若 SPA 链接元素 是 form，则 iData 为 表单提交所返回的数据
            iData = arguments[2];

            if (iData.code > 200) {
                alert(iData.message);
                return false;           //   阻止页面刷新、跳转
            }
        });

})(self, self.jQuery);
</script>

<div target="_top" href="path/to/page_2.html" data-arg_1="data_name_1">
    <img src="path/to/logo.png" />XXX
</div>
```

#### （三）调用接口（纯数据，无页面加载）
```html
<script>
(function ($) {

    $('body > section').WebApp()
        .on('apiCall',  function () {
            //  iData 为 API 返回的数据
            iData = arguments[1].data;

            if (iData.code > 200)
                alert(iData.message);
        });

})(self.jQuery);
</script>

<button target="_blank" src="path/to/data/api/{id}" data-arg_3="data_name_3">
    喜欢
</button>
```
【注】 **纯 API 调用返回的数据** 会合并到 当前内页的数据栈

#### （四）首屏渲染
若首屏渲染时的数据来自 HTTP API，则可复用“调用接口”功能的 HTML 语义，在 `<head />` 中用 `<link />` 声明数据来源即可 ——
```html
<head>
    ...
    <link target="_blank" src="path/to/data/api_0/{id}" data-arg_a="data_name_a" />
    <link target="_blank" src="path/to/data/api_1/{id}" data-arg_b="data_name_b" />
</head>
```
此外，因为 前一个 **WebApp 实例**（加载外页、整页刷新 跳转到当前实例）的 **SPA 链接元素的数据子集**、本页 URL query 参数 会被首先压入当前 SPA 的数据栈，所以它们也会参与到首屏渲染。

【注】前文所述的 SPA 内页代码中也可用形如以上的 `<link />` 标签来声明 **多数据源**，此时，打开此内页的 SPA 链接元素上就可以省略 src 属性。

#### （五）表单提交
SPA 中所有 **可见表单** 均会被本引擎用 **AJAX 提交**接管，用户在表单内填写的数据、表单提交返回的数据 都会被压入引擎的数据栈。

同时，上述表单的源码标签上也可使用 **SPA 链接元素**的属性，用以在表单提交后继续 加载内外页面（但 表单提交的 Method 与 接口调用的不可不同）~
```html
<script>
(function ($) {

    $('body > section').WebApp()
        .on('formSubmit',  function () {

            var iData = arguments[2];

            alert( iData.message );
            return  (iData.code == 200)  &&  iData;
        });

})(self.jQuery);
</script>

<form method="POST" action="path/to/api/{uid}"
      target="_top" href="path/to/app_1.html" data-arg_2="data_name_2">
    <input type="hidden" name="uid" />
    <input type="email" name="email" placeholder="注册电邮" />
    <input type="password" name="password" placeholder="密码" />
    <input type="submit" />
</form>
```

#### （六）请求预处理

##### 自定义参数
```JavaScript
$.ajaxPrefilter(function (iOption) {
    iOption.contentType = 'application/json';
    iOption.url += '&custom=xxx';
});
```
##### 跨域代理
```JavaScript
$.ajaxPrefilter(function (iOption) {
    iOption.url = 'http://proxy.com/?url=' + BOM.encodeURIComponent(iOption.url);
});
```
##### 请求签名
```JavaScript
var URL_Args = $.paramJSON();


$.ajaxPrefilter(function (iOption) {
    if ( iOption.url.match(/\.(html|md)/) )  return;

    iOption.xhrFields = $.extend(iOption.xhrFields || { },  {
        withCredentials:    true
    });

    var iData = (typeof iOption.data == 'string')  ?
            ('?' + iOption.data)  :  iOption.data;

    var iArgs = {
            AppID:    URL_Args.AppID,
            sign:     md5($.paramSign(iData || iOption.url)  +  URL_Args.AppKey)
        };

    if (iOption.type == 'GET')
        iOption.url = iOption.url.split('?')[0] + '?' +
            $.param($.extend($.paramJSON(iOption.url), iArgs, {
                token:    URL_Args.token
            }));
    else {
        iOption.url += 'token=' + URL_Args.token;
        iOption.data = $.param($.extend(iData, iArgs));
    }
});
```
【注】上述代码中的 `$.paramJSON()`、`$.paramSign()` 来自 [**iQuery**](http://git.oschina.net/Tech_Query/iQuery)。


## 【API 总览】

### 一、jQuery 实例方法

#### 应用初始化
```JavaScript
//  幂等方法，不会重复初始化，且总返回 WebApp 实例对象
var iWebApp = $_AppRoot.WebApp(
        Init_Data,                     //  可选，一般为 登录后的会话数据
        'http://api.demo.net/root',    //  可选，API 服务器 与 静态网页资源服务器 不同时设置
        Cache_Second,                  //  可选，DOM 缓存时限（秒，默认无限）
        URL_Change                     //  可选，Boolean，控制 地址栏网址 是否改变
    );
```
#### 数据渲染
```JavaScript
//  层次、递进结构
$_Gradation.dataRender( iObject );

//  水平展开的迭代结构
$_Iteration.dataRender( iArray );
```
#### 数据读取
```JavaScript
var iData = $_Any.dataReader();
```

### 二、WebApp 对象实例方法

#### 事件绑定
```JavaScript
iWebApp.on(
    'pageRender',                //  （必填）事件名
    'path/to/InnerPage.html',    //  （选填）String 或 Regexp，匹配当前内页 HTML 文件路径
    'path/to/Data_JSON',         //  （选填）String 或 Regexp，匹配当前内页 JSON API 路径
    function (This_Page, Prev_Page, iData) {
        //  数据结构 整理逻辑

        return iData.data;    //  返回处理过的数据用于渲染
    }
);
```
#### 事件解绑
```JavaScript
iWebApp.off('pageRender', iCallback);
```
#### 手动加载
```JavaScript
//  完整参数写法

iWebApp.loadLink({
    title:     "局部刷新",
    href:      HTML_URL,
    method:    'POST',
    src:       API_URL,
}, {
    arg_1:    'arg_1_name'
});

//  参数简写形式（只能用于加载内页）

iWebApp.loadLink('path/to/template.html', 'path/to/api', {
    arg_1:    'arg_1_name'
});
```
【注】传参规则 请参考本引擎的 **页面串接规则**（上文【使用入门】第四大节）

### 三、WebApp 自定义事件
本引擎不支持“在 jQuery 插件 初始化时传入各种回调函数”的方式，一切 **可编程点**均直接在 **WebApp 实例对象**上触发 **自定义事件**，开发者只需使用 **类 jQuery 事件监听方法**，就可以在其回调函数中调用 **WebApp 实例**的方法。

【事件分类】
 - [A] 表示 **异步事件**，一般在 事件名所表示的操作 完成时 触发，可在回调内根据 API 返回值，酌情调用 WebApp 实例方法， **手动控制 WebApp 加载页面**
 - [S] 表示 **同步事件**，一般在 事件名所表示的操作 进行前 触发，可能需要开发者：
   -  判断是否阻止 **事件操作**执行 —— `return false;`
   -  在自定义数据格式中提取 **内容数据**参与渲染 —— `return {...};`

【事件总表】
 - [S] **pageLoad 事件** 在用户触发内页跳转时产生。其回调参数如下：
   -  正在渲染的页面对象
   -  刚切换走的页面对象
 - [S] **pageRender 事件** 在一个内部页面的模板、数据加载完，准备 **用数据渲染模板**时触发。其回调参数如下：
   -  正在渲染的页面对象
   -  刚切换走的页面对象
   -  API 返回数据
 - [A] **pageReady 事件** 在一个内部页面渲染完成时触发。其回调参数如下：
   -  刚渲染好的页面对象
   -  刚切换走的页面对象
   -  WebApp 实例对象
 - [S] **apiCall 事件** 在一个 HTTP API 请求结束时触发。其回调参数如下：
   -  API 响应对象（包含 URL、HTTP 方法名、返回的数据）
   -  当前 HTML URL
   -  WebApp 实例对象
 - [S] **appExit 事件** 在一个外部页面加载（单页应用实例 销毁）前触发。其回调参数如下：
   -  当前 HTML URL
   -  将加载的外部页面 URL
   -  SPA 链接元素对应的数据对象（如 id 等 须附加在 URL 后页面才能正常跳转的参数）
 - [S] **formSubmit 事件** 在一个表单提交并返回数据后触发（此时可能会跳转页面）。其回调参数如下：
   -  当前 HTML URL
   -  当前 form 实际使用的 action URL
   -  表单提交 返回数据
   -  即将跳转到的页面 HTML URL


## 【进阶导引】

EasyWebApp v2.x 的基本模型（对照 MVC 模式）——
 - 页面模板 —— 数据接口 (View - Model)
 - 接口数据 —— 操作历史 (Model - View)
 - 操作事件 —— 业务逻辑 (Controller)
 - 组件化（依靠 CSS 框架、jQuery 插件，不越俎代庖）


## 【参与开发】

### （〇）环境搭建
 1. 安装 **Git**（比 SVN 更适合 **开源团队**）
 2. 安装 **Node.JS** 最新 LTS 版

### （一）从源码构建

UNIX-Shell、Windows-CMD 通用脚本 ——

```Shell
npm install -g requirejs
npm install -g uglify-js

mkdir ./EasyWebApp
git clone https://git.oschina.net/Tech_Query/EasyWebApp.git ./EasyWebApp

node r.js -o build/source.js
uglifyjs EasyWebApp.js -c -m -o EasyWebApp.min.js --source-map=EasyWebApp.min.map
```

## 【项目缘起】
**EasyWebApp** 算是其作者与 产品、设计、后端的各种“撕逼”后，或坚持、或折中的结果。其 **HTML 模板机制** 源于作者早期的一个 PHP 前端项目 [EasyWebTemplate](http://git.oschina.net/Tech_Query/EasyWebTemplate)（基于 **phpQuery**），而其 **事件驱动的 API** 则源于文首提到的开放平台首个版本的 **智能表单引擎** JSON_Web.js（强数据格式依赖、不支持不规律的界面设计，未到达开源水准，但会继续吸收其优秀的特性）。虽然前面这些小项目 都有些幼稚，但却又是 **敢于把独立思考成果付诸实践**的有益尝试，若没有这些沉淀，就没有本项目自 2015年6月29日的26天 内即发布 **开源稳定版**的成绩~