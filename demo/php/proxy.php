<?php

// ----------------------------------------
//
//    Simple HTTP Synchronized Request
//
// ----------------------------------------

if (! function_exists('getallheaders'))
    function getallheaders() {
        $_Header = array();
        $_Special = array('CONTENT_TYPE', 'CONTENT_LENGTH', 'REMOTE_ADDR');

        foreach ($_SERVER  as  $_Key => $_Value) {
            if (substr($_Key, 0, 5) == 'HTTP_') {
                $_Key = substr($_Key, 5);
                $_Take = true;
            }
            if ($_Take  ||  in_array($_Key, $_Special))
                $_Header[str_replace(' ', '-', ucwords(
                    strtolower( str_replace('_', ' ', $_Key) )
                ))] = $_Value;
        }
        return $_Header;
    }

class EasyHTTPServer {
    public $requestHeaders;
    public $requestIPAddress;

    private function requestIPA() {
        if (! empty( $this->requestHeaders['Client-Ip'] )) {
            return $this->requestHeaders['Client-Ip'];
        }
        //  To check IP is passed from a Proxy Server
        if (! empty( $this->requestHeaders['X-Forwarded-For'] )) {
            return $this->requestHeaders['X-Forwarded-For'];
        }

        return $this->requestHeaders['Remote-Addr'];
    }

    public function __construct() {
        $this->requestHeaders = getallheaders();
        $this->requestIPAddress = $this->requestIPA();
    }
}

class EasyHTTPClient {
    private function responseHeaders($_Header_Array) {
        $_Header = array();

        foreach ($_Header_Array  as  $n => $_Str) {
            $_Item = explode(':', $_Str, 2);
            if (isset( $_Item[1] ))
                $_Header[trim( $_Item[0] )] = trim( $_Item[1] );
            else {
                $_Header[] = $_Str;
                if ( preg_match('#HTTP/[\d\.]+\s+(\d+)#', $_Str, $_Num) )
                    $_Header['reponse_code'] = intval( $_Num[1] );
            }
        }
        return $_Header;
    }
    private function request($_Method, $_URL, $_Data) {
        $_Response_Data = file_get_contents($_URL, false, stream_context_create(array(
            'http' => array(
                'method'  => $_Method,
                'content' => http_build_query($_Data)
            )
        )));
        $_Response_Header = $this->responseHeaders( $http_response_header );

//        if ( preg_match('#image/\w+#', $_Response_Header['Content-Type']) )
//            

        return $_Response_Data;
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
}

// ----------------------------------------
//
//    Cross Domain Proxy
//
// ----------------------------------------

$_HTTP_Server = new EasyHTTPServer();

if ($_SERVER['REQUEST_METHOD'] == 'OPTION') {
    $_HTTP_Header = $_HTTP_Server->requestHeaders;

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
        'http://ip.taobao.com/service/getIpInfo.php?ip='.$_HTTP_Server->requestIPAddress
    ),
    true
);
$_User_Info['code'] = 200;

echo json_encode($_User_Info);