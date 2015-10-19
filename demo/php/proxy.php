<?php

require('EasyLibs.php');

// ----------------------------------------
//
//    Cross Domain Proxy
//
// ----------------------------------------

$_HTTP_Server = new EasyHTTPServer();
$_HTTP_Header = $_HTTP_Server->requestHeaders;

if ($_HTTP_Header['Request-Method'] == 'OPTION') {
    header('Access-Control-Allow-Origin: '.(
        isset( $_HTTP_Header['Origin'] )  ?  $_HTTP_Header['Origin']  :  '*'
    ));
    header('Access-Control-Allow-Methods: '.(
        isset( $_HTTP_Header['Access-Control-Request-Methods'] )  ?
            $_HTTP_Header['Access-Control-Request-Methods']  :  'GET,POST'
    ));
    header('Access-Control-Allow-Headers: '.(
        isset( $_HTTP_Header['Access-Control-Request-Headers'] )  ?
            $_HTTP_Header['Access-Control-Request-Headers']  :  'X-Requested-With'
    ));
    echo 'Hello, Cross Domain OPTION !';
    exit;
}

header('Access-Control-Allow-Origin: *');

$_HTTP_Client = new EasyHTTPClient();

if (isset( $_GET['cache_clear'] )) {
    $_HTTP_Client->clearCache();
    exit;
}
if (isset( $_GET['url'] )) {
    $_URL = $_GET['url'];  $_Header = array();
    $_Response = null;

    if (!  empty( $_GET['second_out'] ))
        $_Header['Cache-Control'] = "max-age={$_GET['second_out']}";

    switch ( $_HTTP_Header['Request-Method'] ) {
        case 'GET':
            $_Response = $_HTTP_Client->get($_URL, $_Header);    break;
        case 'POST':
            $_Response = $_HTTP_Client->post($_URL, $_POST, $_Header);    break;
        case 'DELETE':
            $_Response = $_HTTP_Client->delete($_URL, $_Header);    break;
        case 'PUT':
            $_Response = $_HTTP_Client->put($_URL, $_POST, $_Header);
    }
    $_rHeader = $_Response->headers;
    if (isset( $_rHeader['Location'] ))
        $_rHeader = array_diff($_rHeader, array(
            'Location'  =>  $_rHeader['Location']
        ));
    $_Response->headers = $_rHeader;

    $_HTTP_Server->send($_Response);
    exit;
}

// ----------------------------------------
//
//    User Information
//
// ----------------------------------------

$_User_Info = $_HTTP_Client->get(
    'http://ip.taobao.com/service/getIpInfo.php?ip='.'171.221.147.62'//$_HTTP_Server->requestIPAddress
);

if ($_User_Info !== false) {
    $_Data = $_User_Info->dataJSON;
    $_Data['code'] = 200;
    $_User_Info->dataJSON = $_Data;
} else
    $_User_Info->dataJSON = array(
        'code'     =>  404,
        'message'  =>  "您当前的 IP 地址（{$_HTTP_Server->requestIPAddress}）不能确定 您的当前城市……"
    );

$_HTTP_Server->send( $_User_Info );