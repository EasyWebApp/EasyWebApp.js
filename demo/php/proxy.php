<?php

require('EasyLibs.php');

// ----------------------------------------
//
//    Cross Domain Proxy
//
// ----------------------------------------

$_HTTP_Server = new EasyHTTPServer();  $_HTTP_Client = new EasyHTTPClient();

if (isset( $_GET['cache_clear'] )) {
    $_HTTP_Client->cache->clear();
    exit;
}
if (isset( $_GET['url'] )) {
    $_URL = $_GET['url'];

    $_Header = array_diff_key($_HTTP_Server->requestHeaders, array(
        'Host'              =>  '',
        'Referer'           =>  '',
        'X-Requested-With'  =>  ''
    ));

    switch ( $_Header['Request-Method'] ) {
        case 'GET':
            $_Response = $_HTTP_Client->get($_URL, $_Header);    break;
        case 'POST':
            $_Response = $_HTTP_Client->post($_URL, $_POST, $_Header);    break;
        case 'DELETE':
            $_Response = $_HTTP_Client->delete($_URL, $_Header);    break;
        case 'PUT':
            $_Response = $_HTTP_Client->put($_URL, $_POST, $_Header);   break;
        default:
            exit(1);
    }
    $_Header = $_Response->headers;
    if (isset( $_Header['Location'] ))  unset( $_Header['Location'] );
    $_Response->headers = $_Header;

    $_HTTP_Server->send($_Response);
    exit;
}

// ----------------------------------------
//
//    User Information
//
// ----------------------------------------

$_User_Info = $_HTTP_Client->get(
    'http://ip.taobao.com/service/getIpInfo.php?ip='.$_HTTP_Server->requestIPAddress
);
if ($_User_Info === false) {
    $_HTTP_Server->send(array(
        'code'     =>  504,
        'message'  =>  '网络拥塞，请尝试刷新本页~'
    ));
    exit(1);
}

$_Data = $_User_Info->dataJSON;

if (is_array( $_Data['data'] ))
    $_Data['code'] = 200;
else
    $_Data = array(
        'code'     =>  416,
        'message'  =>  "您当前的 IP 地址（{$_HTTP_Server->requestIPAddress}）不能确定 您的当前城市……"
    );
$_User_Info->dataJSON = $_Data;

$_HTTP_Server->send( $_User_Info );