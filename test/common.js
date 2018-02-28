'use strict';

require('should');

const HTMLPages = require('html-pages'),  Chromy = require('chromy');



//  静态文件服务器、Web 浏览器

const server = HTMLPages(process.cwd(), {
          'log-level':    'warn'
      });

global.browser = new Chromy(/*{visible: true}*/);



//  退出前清理 服务器、浏览器

async function exit(code = 0) {

//    await Chromy.cleanup();

    server.stop();

    if (code !== 0)  process.exit(code || 1);
};

process.on('uncaughtException', exit);

process.on('unhandledRejection', exit);

process.on('SIGINT', exit);

process.on('exit', exit);

after( exit );


//  刷新待测代码

before(async function () {

    await browser.goto('http://localhost:8084/test/');

    await browser.evaluate(function () {

        return  new Promise(function (resolve, reject) {

            require(['index'], resolve, reject);
        });
    });
});
