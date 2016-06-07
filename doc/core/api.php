<?php

set_time_limit(0);


/* ---------- 基础库 ---------- */

require_once('php/EasyWiki.php');

if (version_compare('5.4.0', PHP_VERSION) > 0)
    define('JSON_PRETTY_PRINT', null);

function Local_CharSet($_Raw,  $_Raw_CS = 'UTF-8') {
    return  iconv($_Raw_CS, ini_get('default_charset'), $_Raw);
}

/* ---------- 通用逻辑 ---------- */

$_Wiki_System = new EasyWiki('data');


$_No_Need = array(
    'logIn'    =>  array(
        'entry'     =>  array(
            'GET'  =>  true
        ),
        'category'  =>  array(
            'GET'  =>  true
        )
    ),
    'session'  =>  array(
        'user'    =>  array(
            'POST'  =>  true
        ),
        'online'  =>  array(
            'POST'  =>  true
        )
    )
);
function API_Filter($_Type, $_Model, $_Method) {
    global $_No_Need;

    $_Auth = $_No_Need[$_Type];

    if (isset( $_Auth[$_Model] )  &&  isset( $_Auth[$_Model][$_Method] ))
        return true;
}


$_HTTP_Server = new HTTPServer(false,  function ($_Route, $_Request) {
    global  $_HTTP_Server, $_Wiki_System;

    if (API_Filter('logIn', $_Route[0], $_Request->method))  return;

    $_User = $_Wiki_System->dataBase->query(array(
        'select'  =>  'aTime',
        'from'    =>  'User'
    ));
    switch (count( $_User )) {
        case 0:     ;
        case 1:     {
            $_TimeOut = 0;
            if (empty( $_User[0])  ||  (! $_User[0]['aTime']))
                break;
        }
        default:    $_TimeOut = 172800;
    }

    session_set_cookie_params($_TimeOut, '/', '', FALSE, TRUE);

    session_start();

    if (! (
        API_Filter('session', $_Route[0], $_Request->method)  ||
        count($_SESSION)
    )) {
        $_HTTP_Server->setStatus(403);
        return false;
    }
});


/* ---------- 业务逻辑 ---------- */

$_HTTP_Server->on('Get',  'entry/',  function () {

    $_KeyWord = Local_CharSet( $_GET['keyword'] );

    return json_encode(
        EasyWiki::searchFile("../data/*{$_KeyWord}*.md",  function ($_Path, $_Entry) {
            $_Entry['URL'] = substr($_Path, 3);
            return $_Entry;
        })
    );
})->on('Get',  'category/',  function () {
    return json_encode(array(
        'entry'  =>  array(
            array(
                'title'  =>  "首页",
                'tips'   =>  "百科起始页"
            ),
            array(
                'title'  =>  "关于",
                'tips'   =>  "百科介绍页"
            )
        )
    ));
})->on('Post',  'user/',  function () use ($_HTTP_Server, $_Wiki_System) {

    return json_encode(
        $_Wiki_System->addUser( $_HTTP_Server->request->IPAddress )
    );

})->on('Post',  'online/',  function () use ($_Wiki_System) {

    if (count( $_SESSION ))
        $_Return = $_SESSION;
    else
        $_Return = isset( $_POST['email'] )  ?
            $_Wiki_System->login()  :  array(
                'auth'  =>  json_decode(
                    file_get_contents('data/Auth/Reader.json'),  true
                )
            );
    return json_encode($_Return);

})->on('Delete',  'online/',  function () {

    $_SESSION = array();

})->on('Post',  'entry/',  function () use ($_Wiki_System) {

    $_Param = filter_input_array(INPUT_POST, array(
        'title'  =>  array(
            'filter'   =>  FILTER_VALIDATE_REGEXP,
            'options'  =>  array(
                'regexp'  =>  '/^[^\\/:\*\?"<>\|\.]{1,20}$/'
            )
        ),
        'type'   =>  array(
            'filter'   =>  FILTER_VALIDATE_INT,
            'options'  =>  array(
                'min_range'  =>  0,
                'max_range'  =>  2
            )
        )
    ));
    if (! is_int( $_Param['type'] ))
        return json_encode(array(
            'message'  =>  "词条类型错误！"
        ));

    require('php/HyperDown.php');

    $_Parser = new HyperDown\Parser;

    $_Marker = new HTML_MarkDown( $_Parser->makeHtml( $_POST['Source_MD'] ) );

    $_Name = Local_CharSet(
        $_Param['title']  ?  $_POST['title']  :  $_Marker->title
    );

    $_Wiki_System->addEntry($_POST['type'], $_Name, $_POST['Source_MD']);

    return json_encode(array(
        'message'  =>  "词条更新成功！"
    ));

})->on('Post',  'image/',  function () {

    $_File = $_FILES['editormd-image-file'];
    $_Type = explode('/', $_File['type'], 2);

    $_Return = array(
        'success'  =>  $_File['error'] ? 0 : 1,
        'message'  =>  $_File['error'] ? "失败……" : "成功！"
    );

    if ((! $_File['error'])  &&  ($_Type[0] == 'image')) {
        $_Path = '../data/image';
        @ mkdir($_Path);
        $_Path .= "/{$_File['name']}";

        move_uploaded_file($_File['tmp_name'], $_Path);

        $_Return['url'] = substr($_Path, 3);
    }

    return json_encode($_Return);

})->on('Post',  'spider/',  function () use ($_Wiki_System) {

    if (! filter_input(INPUT_POST, 'url', FILTER_VALIDATE_URL))
        return json_encode(array());

    //  HTML to MarkDown
    $_Marker = new HTML_MarkDown($_POST['url'], $_POST['selector']);

    $_Name = Local_CharSet($_Marker->title, $_Marker->CharSet);

    if (empty( $_Name )) {
        preg_match($_POST['name'], $_POST['url'], $_Name);
        $_Name = $_Name[1];
    }
    $_Wiki_System->addEntry(0, $_Name, $_Marker->convert(), $_POST['url']);

    //  Fetch History
    $_Wiki_System->dataBase->createTable('Fetch', array(
        'PID'    =>  'Integer Primary Key AutoIncrement',
        'URL'    =>  'Text not Null Unique',
        'Times'  =>  'Integer default 0',
        'Title'  =>  "Text default ''"
    ));
    foreach ($_Marker->link['inner'] as $_Link) {
        $_Title = trim( $_Link->getAttribute('title') );

        $_Wiki_System->dataBase->Fetch->insert(array(
            'URL'    =>  $_Link->getAttribute('href'),
            'Title'  =>  $_Title ? $_Title : $_Link->textContent
        ));
    }
    $_Wiki_System->dataBase->Fetch->update("URL = '{$_POST['url']}'", array(
        'Times'  =>  1
    ));

    return array(
        'header'    =>    array(
            'Content-Type'  =>  'application/json'
        ),
        'data'      =>    $_Wiki_System->dataBase->query(array(
            'select'  =>  'URL, Title',
            'from'    =>  'Fetch',
            'where'   =>  'Times = 0'
        ))
    );
})->on('Get',  'auth/',  function ($_Path) {

    if (empty( $_Path[1] ))
        $_Return = EasyWiki::searchFile('data/Auth/*.json');
    else {
        $_Auth = json_decode(
            file_get_contents("data/Auth/{$_Path[1]}.json"),  true
        );
        $_Return = array();

        foreach ($_Auth  as  $_API => $_Config) {
            $_Config['API_URL'] = $_API;
            $_Return[] = $_Config;
        }
    }
    return array(
        'header'    =>    array(
            'Content-Type'  =>  'application/json'
        ),
        'data'      =>    $_Return
    );
})->on('Post',  'auth/',  function ($_Path) {

    if (empty( $_Path[1] ))  return;

    $_Auth = array();

    foreach ($_POST  as  $_Key => $_Value)
        if ($_Value[0] == '{')
            $_Auth[$_Key] = json_decode($_Value);

    file_put_contents(
        "data/Auth/{$_Path[1]}.json",  json_encode($_Auth, JSON_PRETTY_PRINT)
    );

    return json_encode(array(
        'message'  =>  "权限更新成功！"
    ));
});