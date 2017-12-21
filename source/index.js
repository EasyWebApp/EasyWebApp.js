/**
 * EasyWebApp.js - A Light-weight SPA Engine based on jQuery Compatible API
 *
 * @module    {function} WebApp
 *
 * @version   4.0 (2017-12-22) stable
 *
 * @requires  jquery
 * @see       {@link http://jquery.com/ jQuery}
 * @requires  jQueryKit
 * @see       {@link https://techquery.github.io/iQuery.js iQuery}
 *
 * @copyright TechQuery <shiy2008@gmail.com> 2015-2017
 */

define(['jquery', './WebApp', './InnerLink'],  function ($, WebApp, InnerLink) {

    /**
     * 承诺对象
     *
     * @typedef {Promise} Promise
     *
     * @see     {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise|Promise}
     */

    /**
     * URL 对象
     *
     * @typedef {URL} URL
     *
     * @see     {@link https://developer.mozilla.org/en-US/docs/Web/API/URL|URL}
     */

    /**
     * DOM 树节点抽象类
     *
     * @typedef {Node} Node
     *
     * @see     {@link https://developer.mozilla.org/en-US/docs/Web/API/Node|Node}
     */

    /**
     * HTML 元素标签抽象类
     *
     * @typedef {HTMLElement} HTMLElement
     *
     * @see     {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement|HTMLElement}
     */

/* ---------- AMD based Component API ---------- */

    var _require_ = self.require,  _script_;

    /**
     * 增强的 require()
     *
     * @global
     * @function require
     *
     * @param {string[]} dependency
     * @param {function} [factory]
     * @param {function} [fallback]
     *
     * @return {Promise}
     *
     * @see {@link https://github.com/amdjs/amdjs-api/wiki/require#requirearray-function-}
     */

    self.require = $.extend(function (dependency, factory, fallback) {

        var script = document.currentScript;

        return  new Promise(function (resolve, reject) {

            var parameter = [
                    dependency,
                    (factory instanceof Function)  ?  factory  :  resolve,
                    (fallback instanceof Function)  ?  fallback  :  reject
                ];

            if (! script)  return _require_.apply(null, parameter);

            _require_.call(this,  parameter[0],  function () {

                _script_ = script;

                return  parameter[1].apply(this, arguments);

            },  parameter[2]);
        });
    },  _require_);

    /**
     * 组件工厂声明
     *
     * @author    TechQuery
     *
     * @memberof  WebApp
     *
     * @param     {function}  factory - The factory function of current
     *                                  component & its data
     * @returns   {function}  WebApp constructor
     */

    WebApp.component = function (factory) {

        var iWebApp = new this(), view = this.View.instanceOf(_script_);

        var link = (view.$_View[0] === iWebApp.$_View[0])  ?
                iWebApp[ iWebApp.lastPage ]  :
                InnerLink.instanceOf( view.$_View );

        if ( link )  link.emit('load', factory);

        return this;
    };

    $.extend(WebApp.prototype, {
        /**
         * 更新路由 URI 的参数数据
         *
         * @author    TechQuery
         *
         * @memberof  WebApp.prototype
         *
         * @param     {string|object}          key      String or
         *                                              Key-Value Object
         * @param     {number|boolean|string}  [value]
         * @returns   {WebApp}
         */
        setURLData:    function (key, value) {

            var URL = this.getRoute().split(/&?data=/);

            if (typeof key === 'string') {

                var name = key;  key = { };

                key[ name ] = value;
            }

            if (!  $.isEqual(key,  $.intersect(key, $.paramJSON( URL[0] ))))
                self.history.pushState(
                    {
                        index:    this.lastPage,
                        data:     key
                    },
                    document.title,
                    '#!' + self.btoa(
                        $.extendURL(URL[0], key)  +  (
                            URL[1]  ?  ('&data=' + URL[1])  :  ''
                        )
                    )
                );

            return this;
        }
    });

/* ---------- jQuery based Helper API ---------- */

    /**
     * jQuery 对象
     *
     * @typedef {jQuery} jQuery
     *
     * @see     {@link https://api.jquery.com/jQuery|jQuery}
     */

    /**
     * jQuery 构造函数 第一参数接受的数据类型
     *
     * @typedef {(string|HTMLElement|HTMLElement[]|jQuery)} jQueryAcceptable
     *
     * @see     {@link https://api.jquery.com/jQuery|jQuery Acceptable}
     */

    /**
     * jQuery 插件命名空间
     *
     * @external "jQuery.fn"
     *
     * @see      {@link http://learn.jquery.com/plugins/|jQuery Plugins}
     */

    /**
     * 在 jQuery 对象首个元素上创建/获取视图对象
     *
     * @author    TechQuery
     *
     * @function  external:"jQuery.fn".view
     *
     * @param     {string}  [Class_Name] - String for creating,
     *                                     or empty for getting
     * @returns   {View}
     */

    $.fn.view = function (Class_Name) {

        if (! this[0])  return;

        return  Class_Name  ?
            (new WebApp[Class_Name](this[0], arguments[1]))  :
            WebApp.View.instanceOf(this[0], false);
    };

    /**
     * 在 jQuery 对象首个元素上创建/获取 Web 应用对象
     *
     * @author   TechQuery
     *
     * @function external:"jQuery.fn".iWebApp
     *
     * @param    {(string|URL)}  [API_Root] - The Root Path of Back-end API
     *                                        formatted as Absolute URL
     * @returns  {WebApp}
     */

    return  $.fn.iWebApp = WebApp;

});
