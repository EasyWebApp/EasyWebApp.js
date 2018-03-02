'use strict';

require('should');

const HTMLPages = require('html-pages'),  Chromy = require('chromy');

const Debug = JSON.parse(process.env.NODE_DEBUG || '0');



//  静态文件服务器、Web 浏览器

const server = HTMLPages(process.cwd(), {
          'log-level':    Debug ? 'warn' : 'silent'
      });

exports.browser = new Chromy({visible: Debug});



//  退出前清理 服务器、浏览器

async function exit(code = 0) {

    if (! Debug)  await Chromy.cleanup();

    server.stop();

    if (code !== 0)  process.exit(code || 1);
};

process.on('uncaughtException', exit);

process.on('unhandledRejection', exit);

process.on('SIGINT', exit);

process.on('exit', exit);

after( exit );


//  刷新待测代码

exports.loadHTML = function (module, more) {

    return  async function () {

        await exports.browser.goto(
            module.id
                .replace(process.cwd(), 'http://localhost:8084')
                .replace(/\\/g, '/')
                .split('/').slice(0, -1).join('/')
        );

        await more.apply(this, arguments);
    };
};

exports.loadJS = function () {

    return  exports.browser.evaluate(function () {

        return  new Promise(function (resolve, reject) {

            require(['EasyWebApp'], resolve, reject);
        });
    });
};
