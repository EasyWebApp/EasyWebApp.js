<?php

//
//                >>>  EasyLibs.php  <<<
//
//
//      [Version]    v0.9  (2015-9-18)  Alpha
//
//      [Usage]      A Light-weight PHP Class Library
//                   without PHP Extensions.
//
//
//            (C)2015    shiy2008@gmail.com
//

// ------------------------------
//
//    SQLite OOP Wrapper  v0.4
//
// ------------------------------

class EasySQLite {
    private static $statement = array(
        'select'  =>  array('select', 'from', 'where', 'order', 'limit', 'offset')
    );
    private static function queryString($_SQL_Array) {
        $_SQL = array();

        foreach (self::$statement  as  $_Name => $_Key)
            if (isset( $_SQL_Array[$_Name] ))
                for ($i = 0;  $i < count($_Key);  $i++)
                    if (isset( $_SQL_Array[ $_Key[$i] ] )) {
                        $_SQL[] = $_Key[$i];
                        $_SQL[] = $_SQL_Array[ $_Key[$i] ];
                    }
        return  join(' ', $_SQL);
    }

    private $dataBase;
    public function __construct($_Base_Name) {
        $_Path = pathinfo($_Base_Name, PATHINFO_DIRNAME);
        try {
            if (! file_exists($_Path))  mkdir($_Path);
            $this->dataBase = new PDO("sqlite:{$_Base_Name}.db");
        } catch (PDOException $_Error) {
            echo '[Error - '.basename($_Base_Name).']  '.$_Error->getMessage();
        }
    }
    public function query($_SQL_Array) {
        return  $this->dataBase->query( self::queryString( $_SQL_Array ) )->fetchAll();
    }
    public function existTable($_Table_Name) {
        return  !! $this->dataBase->exec(
            self::queryString(array(
                'select'  =>  'count(*)',
                'from'    =>  'SQLite_Master',
                'where'   =>  "type='table' and name='{$_Table_Name}'"
            ))
        );
    }
    public function createTable($_Table_Name, $_Column_Define) {
        if ($this->existTable( $_Table_Name ))  return;

        $_Define_Array = array();

        foreach ($_Column_Define  as  $_Name => $_Define)
            $_Define_Array[] = "{$_Name} {$_Define}";

        return $this->dataBase->exec(
            "create Table {$_Table_Name} (\n    ".join(",\n    ", $_Define_Array)."\n)"
        );
    }
    public function insert($_Table_Name, $_Record) {
        $_Field_Name = array();  $_Field_Value = array();

        foreach ($_Record  as  $_Name => $_Value)
            if ($_Value !== null) {
                $_Field_Name[] = $_Name;
                $_Field_Value[] = (gettype($_Value) == 'string')  ?
                    $this->dataBase->quote($_Value)  :  $_Value;
            }
        return  $this->dataBase->exec(join('', array(
            "insert into {$_Table_Name} (",
            join(', ', $_Field_Name),
            ') values (',
            join(', ', $_Field_Value),
            ')'
        )));
    }
    public function update($_Table_Name, $_Where, $_Data) {
        $_Set_Data = array();

        foreach ($_Data  as  $_Name => $_Value)
            $_Set_Data[] = "{$_Name}=".(
                (gettype($_Value) == 'string')  ?
                    $this->dataBase->quote($_Value)  :  $_Value
            );
        return  $this->dataBase->exec(join(' ', array(
            "update {$_Table_Name} set",
            join(', ', $_Set_Data),
            "where {$_Where}"
        )));
    }
    public function delete($_Table_Name, $_Where) {
        return  $this->dataBase->exec(
            "delete from {$_Table_Name} where {$_Where}"
        );
    }
}
// ---------------------------------------------
//
//    Simple HTTP Synchronized Request  v0.5
//
// ---------------------------------------------

class EasyHTTPServer {
    private static function getallheaders() {
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

        return $this->requestHeaders['Remote-Address'];
    }

    public function __construct() {
        $this->requestHeaders = function_exists('getallheaders') ?
            getallheaders() : self::getallheaders();
        $this->requestIPAddress = $this->requestIPA();
    }
}
class EasyHTTPClient {
    private $cacheBase;

    public function __construct() {
        $this->cacheBase = new EasySQLite('cache/http_cache');

        $this->cacheBase->createTable('Default', array(
            'CID'     =>  'Integer Primary Key',
            'URL'     =>  'Text not Null',
            'Type'    =>  "Text default 'text/plain'",
            'Expire'  =>  "Text default datetime('now', 'unixepoch', 'localtime') + 86400"
        ));
    }

    private function cachePath($_URL) {
        return  realpath( 'cache/'.parse_url($_URL, PHP_URL_PATH) );
    }
    private function clearCache() {
        return rmdir('cache');
    }
    private function deleteCache() {
        $_Cache = $this->cacheBase->query(array(
            'select'     =>  '*',
            'from'       =>  'Default',
            'order by'   =>  'Expire',
            'limit'      =>  1
        ));
        if (! count($_Cache))  return false;

        return  unlink( $this->cachePath( $_Cache[0]['URL'] ) );
    }
    private function getCache($_URL) {
        $_Data = file_get_contents( $this->cachePath($_URL) );

        if ($_Data === false)  return false;

        $_Cache = $this->cacheBase->query(array(
            'select'  =>  '*',
            'from'    =>  'Default',
            'where'   =>  "URL='{$_URL}'"
        ));
        if (count( $_Cache )) {
            $this->cacheBase->update('Default', "CID={$_Cache[0]['CID']}", array(
                'Expire'  =>  "datetime('now', 'unixepoch', 'localtime') + 86400"
            ));
            header('Content-Type', $_Cache[0]['Type']);
        }
        return $_Data;
    }
    private function setCache($_URL, $_Type, $_Data, $_Cache_Second) {
        $_Length = file_put_contents($this->cachePath($_URL), $_Data);

        if ($_Length === false)  return false;

        $this->cacheBase->insert('Default', array(
            'URL'     =>  $_URL,
            'Type'    =>  $_Type,
            'Expire'  =>  $_Cache_Second ?
                "datetime('now', 'unixepoch', 'localtime') + {$_Cache_Second}"  :  null
        ));
        $this->deleteCache();
    }
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
    private function request($_Method, $_URL, $_Data, $_Cache_Second) {
        $_Response = array(
            'Cache'   =>  $_Cache_Second  &&  (($_Method == 'GET')  ||  ($_Method == 'DELETE')),
            'Data'    =>  '',
            'Header'  =>  ''
        );
        if ($_Response['Cache'])  $_Response['Data'] = $this->getCache($_URL);

        if (! $_Response['Data']) {
            $_Response['Data'] = file_get_contents($_URL, false, stream_context_create(array(
                'http' => array(
                    'method'  => $_Method,
                    'content' => http_build_query($_Data)
                )
            )));
            $_Response['Header'] = $this->responseHeaders( $http_response_header );
            if ($_Response['Cache'])
                $this->setCache(
                    $_URL,
                    $_Response['Header']['Content-Type'],
                    $_Response['Data'],
                    func_get_arg(3)
                );
        }

        return $_Response['Data'];
    }

    public function head($_URL) {
        stream_context_set_default(array(
            'http' => array(
                'method' => 'HEAD'
            )
        ));
        return get_headers($_URL, 1);
    }
    public function get($_URL,  $_Data = array(),  $_Cache_Second = null) {
        return  $this->request('GET', $_URL, $_Data, $_Cache_Second);
    }
    public function post($_URL,  $_Data = array()) {
        return  $this->request('POST', $_URL, $_Data);
    }
    public function delete($_URL,  $_Data = array(),  $_Cache_Second = null) {
        return  $this->request('DELETE', $_URL, $_Data, $_Cache_Second);
    }
    public function put($_URL,  $_Data = array()) {
        return  $this->request('PUT', $_URL, $_Data);
    }
}