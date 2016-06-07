# EasyWiki 使用入门


## 【基础知识】

 1. [MarkDown 语法](markdown.md)


## 【安装部署】

### （一）纯静态

Web 前端 + Git/SVN

### （二）轻量动态

PHP + SQLite

#### 初始化

 1. 首个注册用户即 **系统管理员**
 2. 首个用户只能在 `//localhost` 注册并完成首次登录才能生效
 3. 首个用户不生效 将阻止其他任何人注册

### （三）Docker

 - 灵雀云镜像 —— https://hub.alauda.cn/repos/techquery/easywiki


## 【词条导入】

本系统的 **词条导入模块** 基于 [HTML to MarkDown 转换器](http://git.oschina.net/Tech_Query/EasyLibs.php/blob/d6c8367533c016a5ea3d943754b5bf570acfa5c1/EasyLibs.php/#L778) 实现，需要 Wiki 管理员具备一些 **Web 前端**基础知识 ——
 - URL 编码规则
 - 正则表达式
 - HTML 语法
 - CSS 选择符

### 爬站实例

以下目标百科站均为 MediaWiki 系统 ——

#### 较原生的系统

| 选项   | 值                                                                    |
|:-----:|:---------------------------------------------------------------------:|
| URL   | http://wiki.ibeike.com/index.php/%E5%8C%97%E7%A7%91%E7%99%BE%E7%A7%91 |
| 正则   | /index.php[\?\/\w=]+([^=&\#]+)/                                       |
| 选择符 | #content                                                              |

#### 二次开发较深的系统

| 选项   | 值                                                      |
|:-----:|:-------------------------------------------------------:|
| URL   | http://www.zzbaike.com/wiki/%E4%BA%92%E8%81%94%E7%BD%91 |
| 正则   | /\/wiki\/((%\w{2})+)/                                   |
| 选择符 | #firstHeading, #catlinks, .mw-content-ltr               |


## 【二次开发】

### 基础技术

 1. **iQuery**（对 jQuery API 的精简与拓展）
 2. **EasyImport.js**（简单、可靠的 JS 异步加载器）
 3. **EasyWebUI**（类 BootStrap CSS 框架）
 4. **EasyWebApp**（基于 jQuery API 的单页应用引擎）
 5. **EasyLibs.php**（基于 PHP v5.3+ 的后端类库）