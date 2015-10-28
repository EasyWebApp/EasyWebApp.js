<?php

require('EasyLibs.php');

// -----------------------------------
//
//    HTTP Cross Domain Proxy  v0.4
//
// -----------------------------------

class Proxy_Cache {
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
        $_Path = $this->cacheRoot.rtrim(
            parse_url($_URL, PHP_URL_PATH),  '/'
        );
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

class XDomainProxy {
    public  $server;
    public  $cache;
    private $client;

    private $URL;
    private $cacheSecond;
    private $callback = array(
        'GET'     =>  array(),
        'POST'    =>  array(),
        'DELETE'  =>  array(),
        'PUT'     =>  array()
    );
    private $failback;

    public function __construct() {
        $this->server = new EasyHTTPServer();
        $this->cache = new Proxy_Cache('cache/http_cache');
        $this->client = new EasyHTTPClient();
    }
    public function open($_URL,  $_Cache_Second = 0) {
        $this->URL = $_URL;
        $this->cacheSecond = $_Cache_Second;
    }

    public function onLoad($_Method, $_URL, $_Callback) {
        $this->callback[ strtoupper($_Method) ][$_URL] = $_Callback;

        return $this;
    }
    public function onError($_Callback) {
        $this->failback = $_Callback;

        return $this;
    }

    private function callBack($_Method, $_Response) {
        if (empty( $_Response ))
            return  call_user_func($this->failback, $this->URL);

        foreach ($this->callback[$_Method]  as  $_URL => $_Callback) {
            if (stripos($this->URL, $_URL)  ===  false)  continue;

            $_Return = call_user_func(
                $_Callback,
                $_Response->dataJSON ? $_Response->dataJSON : $_Response->data,
                $_Response->headers
            );
            if (isset( $_Return['header'] ))
                $_Response->headers = $_Return['header'];
            if (isset( $_Return['data'] ))
                if (is_array( $_Return['data'] ))
                    $_Response->dataJSON = $_Return['data'];
                else
                    $_Response->data = $_Return['data'];
        }
        if (
            ($this->cacheSecond > 0)  &&
            (($_Method == 'GET')  ||  ($_Method == 'DELETE'))
        )
            $this->cache->add($this->URL, $_Response, $this->cacheSecond);

        return $_Response;
    }
    private function request() {
        $_Header = array_diff_key($this->server->requestHeaders, array(
            'Host'              =>  '',
            'Referer'           =>  '',
            'X-Requested-With'  =>  ''
        ));
        $_Header['Host'] = parse_url($this->URL, PHP_URL_HOST);
        $_Header['Accept-Encoding'] = 'plain';

        $_Method = $_Header['Request-Method'];

        switch ($_Method) {
            case 'GET':
                $_Response = $this->client->get($this->URL, $_Header);    break;
            case 'POST':
                $_Response = $this->client->post($this->URL, $_POST, $_Header);    break;
            case 'DELETE':
                $_Response = $this->client->delete($this->URL, $_Header);    break;
            case 'PUT':
                $_Response = $this->client->put($this->URL, $_POST, $_Header);   break;
            default:
                return;
        }
        return  $this->callBack($_Method, $_Response);
    }
    public function send() {
        if ($this->cacheSecond > 0)
            $_Response = $this->cache->get( $this->URL );

        if (empty( $_Response )) 
            $_Response = $this->request();

        $this->server->send($_Response);
    }
}
// ----------------------------------------
//
//    App Main Logic
//
// ----------------------------------------

$_XDomain_Proxy = new XDomainProxy();


if (isset( $_GET['cache_clear'] )) {
    $_XDomain_Proxy->cache->clear();
    exit;
}

if (empty( $_GET['url'] )) {
    $_URL = 'http://ip.taobao.com/service/getIpInfo.php?ip='.'171.221.147.62';//$_XDomain_Proxy->server->requestIPAddress
    $_Time_Out = 86400;
} else {
    $_URL = $_GET['url'];
    $_Time_Out = isset( $_GET['second_out'] )  ?  $_GET['second_out']  :  0;
}

$_XDomain_Proxy->open($_URL,  is_numeric($_Time_Out) ? $_Time_Out : 0);

$_XDomain_Proxy->onLoad('Get',  'http://ip.taobao.com',  function ($_Data) {
    if (is_array( $_Data['data'] ))
        $_Data['code'] = 200;
    else
        $_Data = array(
            'code'     =>  416,
            'message'  =>  "您当前的 IP 地址（{$_XDomain_Proxy->server->requestIPAddress}）不能确定 您的当前城市……"
        );
    return array(
        'data'  =>  $_Data
    );
})->onError(function () {
    return array(
        'data'  =>  array(
            'code'     =>  504,
            'message'  =>  '网络拥塞，请尝试刷新本页~'
        )
    );
})->send();