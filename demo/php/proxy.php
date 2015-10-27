<?php

require('EasyLibs.php');

// ------------------------------
//
//    HTTP Proxy Cache  v0.2
//
// ------------------------------

class ProxyCache {
    private static function initCacheTable($_SQL_DB) {
        $_SQL_DB->createTable('Response', array(
            'RID'     =>  'Integer Primary Key',
            'URL'     =>  'Text not Null',
            'Header'  =>  'Text',
            'Expire'  =>  'Text default '.time()
        ));
        return $_SQL_DB;
    }

    public $cacheRoot;
    private $dataBase;

    public function __construct($_Path) {
        $this->cacheRoot = new FS_Directory( pathinfo($_Path, PATHINFO_DIRNAME) );
        $this->dataBase = self::initCacheTable(new EasySQLite($_Path));
    }

    private function getCacheFile($_URL) {
        $_Path = $this->cacheRoot.parse_url($_URL, PHP_URL_PATH);

        new FS_Directory( pathinfo($_Path, PATHINFO_DIRNAME) );

        return  new FS_File($_Path);
    }
    private function remove($_Cache = null) {
        if (empty( $_Cache )) {
            $_Cache = $this->dataBase->query(array(
                'select'     =>  'RID, URL',
                'from'       =>  'Response',
                'where'      =>  'Expire < '.time(),
                'order by'   =>  'Expire',
                'limit'      =>  1
            ));
            if (! count($_Cache))  return false;
        }
        $this->dataBase->Response->delete("RID = {$_Cache[0]['RID']}");
        return  $this->getCacheFile( $_Cache[0]['URL'] )->delete();
    }
    public function get($_URL) {
        $_Cache = $this->dataBase->query(array(
            'select'  =>  'RID, Expire, Header',
            'from'    =>  'Response',
            'where'   =>  "URL = '{$_URL}'"
        ));
        if (! count($_Cache))  return;

        if ($_Cache[0]['Expire'] < time())
            return $this->remove($_Cache);

        $_Data = $this->getCacheFile($_URL)->readAll();
        if ($_Data !== false)
            return  new HTTP_Response(
                json_decode($_Cache[0]['Header'], true),  $_Data
            );
    }
    public function add($_URL, $_Response, $_Expire) {
        $_Length = $this->getCacheFile($_URL)->write( $_Response->data );

        if ($_Length === false)  return false;

        $this->dataBase->Response->insert(array(
            'URL'     =>  $_URL,
            'Header'  =>  json_encode( $_Response->headers ),
            'Expire'  =>  $_Expire  ?  (time() + $_Expire)  :  null
        ));
        $this->remove();
    }
    public function clear() {
        $this->dataBase->dropTable('Response');
        self::initCacheTable( $this->dataBase );

        return $this->cacheRoot->delete();
    }
}

// -------------------------
//
//    Cross Domain Proxy
//
// -------------------------

$_HTTP_Server = new EasyHTTPServer();  $_HTTP_Client = new EasyHTTPClient();
$_Proxy_Cache = new ProxyCache('cache/http_cache');

if (isset( $_GET['cache_clear'] )) {
    $_Proxy_Cache->clear();
    exit;
}

if (isset( $_GET['url'] )) {
    $_URL = $_GET['url'];

    $_Time_Out = isset( $_GET['second_out'] )  ?  $_GET['second_out']  :  0;
    $_Time_Out = is_numeric($_Time_Out) ? $_Time_Out : 0;

    if ($_Time_Out > 0)
        $_Response = $_Proxy_Cache->get($_URL);

    if (empty( $_Response )) {
        $_Header = array_diff_key($_HTTP_Server->requestHeaders, array(
            'Host'              =>  '',
            'Referer'           =>  '',
            'X-Requested-With'  =>  ''
        ));
        $_Method = $_Header['Request-Method'];

        switch ($_Method) {
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

        if (isset( $_Response->headers['Location'] )) {
            $_Header = $_Response->headers;

            unset( $_Header['Location'] );
            $_Header['Response-Code'] = 200;

            $_Response->headers = $_Header;
        }
        if (
            ($_Time_Out > 0)  &&
            (($_Method == 'GET')  ||  ($_Method == 'DELETE'))
        )
            $_Proxy_Cache->add($_URL, $_Response, $_Time_Out);
    }
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