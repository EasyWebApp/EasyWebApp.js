#EasyWebApp

## 【概述】
**EasyWebApp** 是一个基于 **jQuery API** 的**轻量级 SPA（单页应用）引擎**，**网页设计、后端接口、前端组件 充分解耦** —— 只用**原生 HTML** 做模板，对 **JSON 数据**的结构几无硬性要求，完全兼容现有的 **jQuery 插件**。


## 【入门】

### 一、加载引擎

本项目的开发最早基于 [**iQuery**](http://git.oschina.net/Tech_Query/iQuery)（相当于 **jQuery v1.x** 的精简与扩展），若要用 **jQuery 官方版**来驱动本引擎，需要同时加载 iQuery 项目中的 [jQuery+.js](http://git.oschina.net/Tech_Query/iQuery/blob/master/jQuery+.js) 来启用扩展的 jQuery API（一些 jQuery 插件）。

### 二、启动引擎
```html
<!DocType HTML>
<html><head>
    <meta http-equiv="X-UA-Compatible" content="IE=Edge, Chrome=1" />
    <script src="path/to/iQuery.js"></script>
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

### 三、模板制作
本引擎的网页模板不采用“自创模板语言”，而直接使用 **原生 HTML** 的常用属性来标记引擎的特性 ——

#### （一）加载内页（AJAX 无刷新）
```html
<div target="_self" href="path/to/page_1.html"
     src="path/to/data/api/{id}" data-arg_1="data_name_1">
    <img src="path/to/logo.png" />XXX
</div>
```
```javascript
(function ($) {

    $('body > section')
        .onPageIn(function (iApp, iData, This_Page, Prev_Page) {
            //  iData 是 API 返回的 JSON，格式自定义，默认为 空对象
            if (iData.code > 200)
                iApp.render(iData.data);
        })
        .WebApp();
})(self.jQuery);
```
#### （二）加载外页（传统刷新）
```html
<form method="POST" action="path/to/api/{uid}"
      target="_top" href="path/to/app_1.html" data-arg_2="data_name_2">
    <input type="hidden" name="uid" />
    <input type="email" name="email" placeholder="注册电邮" />
    <input type="password" name="password" placeholder="密码" />
    <input type="submit" />
</form>
```
```javascript
(function ($) {

    $('body > section')
        .on('appExit',  function (iApp, iData, This_URL, Next_URL) {
            //  若 被触动的元素 是 form，则 iData 为 表单提交所返回的数据
            if (iData.code > 200) {
                alert(iData.message);
                return false;           //   阻止页面刷新、跳转
            }
        })
        .WebApp();
   
})(self.jQuery);
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
        .on('apiCall',  function (iApp, iData, This_URL, API_URL) {
            //  iData 为 API 返回的数据
            if (iData.code > 200)
                alert(iData.message);
        })
        .WebApp();
   
})(self.jQuery);
```
### 四、数据填充
本引擎模板 把 **HTML name 属性** 推而广之，应用在任何 HTML 元素上，用作 JSON 数据的“**键值对应**”。仅有很少的 宽松规范 ——
 - 出现在**同一页面的不同数据不可重名**（如 用户、App、作品 等的名字，不可都用 name 来作为 JSON 键，无论它们在数据结构的哪一层）
 - 符合 CSS 3 选择器 `ul, ol, dl, *[multiple]:not(input)` 的**数据容器元素**（有 name 属性的），其对应的数据结构是一个**以普通对象为元素的数组**，其子元素（它也可以有子元素）只需有一个，引擎会自动复制这个子元素的作为**数组迭代的模板**

```html
<div multiple name="list">
    <img name="avatar" src="path/to/logo.png" />XXX
</div>
```


## 【API 总览】

### 一、jQuery 实例方法
```javascript
$_AppRoot
    .onPageIn(
        HTML_Match,    //  二选一，String 或 Regexp，匹配 HTML 文件路径
        JSON_Match,    //  二选一，String 或 Regexp，匹配 JSON API 路径
        Page_Render    //  必选，本引擎加载 HTML、JSON 后，进行错误处理，
                       //  并传入开发者自定义数据结构中的内容对象，以便引擎正确地渲染页面
                       //  （还可以有 更多自定义的逻辑）
    )
    .WebApp(
        Init_Data,                         //  可选，一般为 登录后的会话数据
        'http://cross.domain.api/root',    //  可选，API 服务器 与 静态网页资源服务器 不同时设置
        URL_Change                         //  可选，Boolean，控制 地址栏网址 是否改变
    );
```
### 二、jQuery 自定义事件
 - pageIn 回调参数：jQuery Event 对象、WebApp 实例对象、API 返回的数据、正在渲染的页面对象、刚切换走的页面对象
 - apiCall 回调参数：
 - formSubmit 回调参数：
 - appExit 回调参数：

### 三、WebApp 对象实例方法
```javascript
iWebApp.render(Content_Data, List_Limit);
```


## 【协作开发】

本项目提炼于其发起人的**日常开发实战**，其本人会**持续更新**，同时欢迎广大 **Web 开发爱好者**在 **OSChina 社区**与其交流、提交 **Pull Request**！~