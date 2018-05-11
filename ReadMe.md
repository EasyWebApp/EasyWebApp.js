# Web Cell

Light-weight **[Web Components](https://www.webcomponents.org/) engine** based on ECMAScript 6+, powered by the practice & experience from developing [EWA v1.0 ~ 4.0](https://gitee.com/Tech_Query/EasyWebApp/).

[![NPM Dependency](https://david-dm.org/EasyWebApp/WebCell.js.svg)](https://david-dm.org/EasyWebApp/WebCell.js)

[![NPM](https://nodei.co/npm/web-cell.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/web-cell/)



## Basic Usage

First

```Shell
npm install web-cell
```
then

```HTML
<!DocType HTML>
<html><head>
    <script src="https://cdn.bootcss.com/webcomponentsjs/1.2.0/webcomponents-lite.js"></script>
    <script src="node_modules/web-cell/build/WebCell.js"></script>

    <link rel="import" href="path/to/your-component/index.html" />
    <!-- More Import tags of your Web components -->
</head><body>
    <your-component></your-component>
</body></html>
```
If you use [ESLint](https://eslint.org/), add options below into its configuration:

```JSON
{
    "globals": {
        "WebCell": false
    }
}
```


## API document

 - Online --- https://easywebapp.github.io/WebCell/

 - Offline --- `npm run help`



## Typical case

 1. [Month Picker](https://github.com/TechQuery/month-picker)
