<?php

// ----------------------------------------
//
//    Simple HTTP Synchronized Request
//
// ----------------------------------------

class EasyHTTPClient {
    private function request($_Method, $_URL, $_Data) {
        return  file_get_contents($_URL, false, stream_context_create(array(
                'http' => array(
                    'method'  => $_Method,
                    'content' => http_build_query($_Data)
                )
            )));
    }
    public function head($_URL) {
        stream_context_set_default(array(
            'http' => array(
                'method' => 'HEAD'
            )
        ));
        return get_headers($_URL, 1);
    }
    public function get($_URL, $_Data) {
        return  $this->request('GET', $_URL, $_Data);
    }
    public function post($_URL, $_Data) {
        return  $this->request('POST', $_URL, $_Data);
    }
    public static function fileHeader() {
        $_Header = array();

        foreach ($http_response_header  as  $n => $_Str) {
            $_Item = explode(':', $_Str, 2);
            if (isset( $_Item[1] ))
                $_Header[trim( $_Item[0] )] = trim( $_Item[1] );
            else {
                $_Header[] = $_Str;
                if (preg_match( "#HTTP/[\d\.]+\s+(\d+)#", $_Str, $_Num))
                    $_Header['reponse_code'] = intval( $_Num[1] );
            }
        }
        return $_Header;
    }
}

// ----------------------------------------
//
//    Cross Domain Proxy
//
// ----------------------------------------

if ($_SERVER['REQUEST_METHOD'] == 'OPTION') {
    $_HTTP_Header = EasyHTTPClient::fileHeader();

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

if (isset( $_GET['url'] )) {
    $_URL = $_GET['url'];

    switch ( $_SERVER['REQUEST_METHOD'] ) {
        case 'GET':
            echo  $_HTTP_Client->get($_URL);    break;
        case 'POST':
            echo  $_HTTP_Client->post($_URL, $_POST);
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
        'http://ip.taobao.com/service/getIpInfo.php?ip='.$_SERVER['REMOTE_ADDR']
    ),
    true
);
$_User_Info['code'] = 200;

echo json_encode($_User_Info);