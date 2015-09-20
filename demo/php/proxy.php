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
    $_URL = $_GET['url'];

    switch ( $_HTTP_Header['Request-Method'] ) {
        case 'GET':
            echo  $_HTTP_Client->get($_URL, $_GET['second_out']);    break;
        case 'POST':
            echo  $_HTTP_Client->post($_URL, $_POST);    break;
        case 'DELETE':
            echo  $_HTTP_Client->delete($_URL, $_GET['second_out']);    break;
        case 'PUT':
            echo  $_HTTP_Client->put($_URL, $_POST);
    }
    exit;
}

// ----------------------------------------
//
//    User Information
//
// ----------------------------------------

$_User_Info = json_decode(
    $_HTTP_Client->get(
        'http://ip.taobao.com/service/getIpInfo.php?ip='.$_HTTP_Server->requestIPAddress
    ),
    true
);
$_User_Info['code'] = 200;

echo json_encode($_User_Info);