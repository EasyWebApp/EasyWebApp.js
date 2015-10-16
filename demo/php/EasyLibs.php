<?php
//
//                >>>  EasyLibs.php  <<<
//
//
//      [Version]     v1.2.5  (2015-10-16)  Beta
//
//      [Based on]    PHP v5.3+
//
//      [Usage]       A Light-weight PHP Class Library
//                    without PHP Extensions.
//
//
//            (C)2015    shiy2008@gmail.com
//

// -----------------------------------
//
//    File System Node Object  v0.3
//
// -----------------------------------

abstract class FS_Node {
    public $type;
    public $URI;

    abstract protected function create($_Access_Auth);
    abstract public function delete();
    abstract public function copyTo($_Target);

    public function moveTo($_URI) {
        return  rename($this->URI, $_URI);
    }

    static protected function realPath($_Path) {
        $_Path = realpath($_Path);
        return  (substr($_Path, -1) == DIRECTORY_SEPARATOR)  ?  substr($_Path, 0, -1) : $_Path;
    }

    public function __construct($_URI, $_Access_Auth = 0777) {
        $this->URI = $_URI;
        $this->type = is_dir($_URI) ? 0 : 1;

        if (! file_exists($_URI))  $this->create($_Access_Auth);

        $this->URI = self::realPath($_URI);
    }
}
class FS_Directory extends FS_Node {
    protected function create($_Access_Auth) {
        return  mkdir($this->URI, $_Access_Auth, true);
    }
    public function traverse() {
        $_Args = func_get_args();

        if (! ($_Args[0] instanceof Closure)) {
            $_Mode = $_Args[0];
            $_Callback = $_Args[1];
        } else
            $_Callback = $_Args[0];

        foreach (
            new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($this->URI, FilesystemIterator::SKIP_DOTS),
                isset($_Mode) ? $_Mode : 0
            ) as
            $_Name => $_File
        )
            if (call_user_func($_Callback, $_Name, $_File)  ===  false)
                break;
    }
    public function delete() {
        $this->traverse(2,  function ($_Name, $_File) {
            $_URI = $_File->getRealPath();
            //  Let SplFileObject release the file,
            //  so that Internal Functions can use it.
            $_File = null;

            is_file($_URI) ? unlink($_URI) : rmdir($_URI);
        });

        return rmdir($this->URI);
    }
    public function copyTo($_Target) {
        $_Target = self::realPath($_Target);

        $this->traverse(2,  function ($_Name, $_File) use ($_Target) {
            $_Name = $_Target.DIRECTORY_SEPARATOR.$_Name;
            $_URI = $_File->getRealPath();
            $_File = null;

            if ( is_dir($_URI) )
                return  mkdir($_Name, 0777, true);

            if (! file_exists($_Name))
                mkdir(dirname($_Name), 0777, true);
            copy($_URI, $_Name);
        });
    }
}
class FS_File extends FS_Node {
    public function readAll() {
        return  file_get_contents($this->URI);
    }
    public function write($_Data) {
        return  file_put_contents($this->URI, $_Data);
    }
    protected function create($_Access_Auth) {
        return  $this->write('');
    }
    public function delete() {
        return  unlink($this->URI);
    }
    public function copyTo($_Target) {
        return  copy($this->URI, $_URI);
    }
}

// ------------------------------
//
//    SQLite OOP Wrapper  v0.4
//
// ------------------------------

class EasySQLite {
    private static $statement = array(
        'select'  =>  array('select', 'from', 'where', 'order by', 'limit', 'offset')
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
        new FS_Directory( pathinfo($_Base_Name, PATHINFO_DIRNAME) );
        try {
            $this->dataBase = new PDO("sqlite:{$_Base_Name}.db");
        } catch (PDOException $_Error) {
            echo '[Error - '.basename($_Base_Name).']  '.$_Error->getMessage();
        }
    }
    public function query($_SQL_Array) {
        $_Query = $this->dataBase->query( self::queryString( $_SQL_Array ) );

        return  $_Query ? $_Query->fetchAll() : array();
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
    public function dropTable($_Table_Name) {
        return  $this->dataBase->exec("drop Table {$_Table_Name}");
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
//    Simple HTTP Synchronized Request  v0.5.5
//
// ---------------------------------------------

class EasyHTTPServer {
    private static $Request_Header = array(
        'REMOTE_ADDR', 'REQUEST_METHOD', 'CONTENT_TYPE', 'CONTENT_LENGTH'
    );
    private static function getRequestHeaders() {
        $_Header = array();  $_Take = false;

        foreach ($_SERVER  as  $_Key => $_Value) {
            if (substr($_Key, 0, 5) == 'HTTP_') {
                $_Key = substr($_Key, 5);
                $_Take = true;
            }
            if ($_Take  ||  in_array($_Key, self::$Request_Header))
                $_Header[str_replace(' ', '-', ucwords(
                    strtolower( str_replace('_', ' ', $_Key) )
                ))] = $_Value;
        }
        return $_Header;
    }

    private static $IPA_Header = array('Client-Ip', 'X-Forwarded-For', 'Remote-Addr');

    private static function getRequestIPA($_Header) {
        foreach (self::$IPA_Header as $_Key)
            if (! empty( $_Header[$_Key] ))
                return $_Header[$_Key];
    }

    public $requestHeaders;
    public $requestIPAddress;

    public function __construct() {
        $this->requestHeaders = self::getRequestHeaders();
        $this->requestIPAddress = self::getRequestIPA( $this->requestHeaders );
    }
}

class EasyHTTPClient {
    private static function initCacheTable($_SQL_DB) {
        $_SQL_DB->createTable('Request', array(
            'CID'     =>  'Integer Primary Key',
            'URL'     =>  'Text not Null',
            'Type'    =>  "Text default 'text/plain'",
            'Expire'  =>  'Text default '.(time() + 86400)
        ));
        return $_SQL_DB;
    }
    private static function getCacheFile($_URL) {
        $_Path = 'cache'.parse_url($_URL, PHP_URL_PATH);

        new FS_Directory(pathinfo($_Path, PATHINFO_DIRNAME));

        return  new FS_File($_Path);
    }

    private $cacheBase;

    public function __construct() {
        $this->cacheBase = self::initCacheTable(new EasySQLite('cache/http_cache'));
    }
    private function deleteCache() {
        $_Cache = $this->cacheBase->query(array(
            'select'     =>  'CID, URL, Expire',
            'from'       =>  'Request',
            'where'      =>  'Expire < '.time(),
            'order by'   =>  'Expire',
            'limit'      =>  1
        ));
        if (! count($_Cache))  return false;

        $this->cacheBase->delete('Request',  "CID = {$_Cache[0]['CID']}");
        return  self::getCacheFile( $_Cache[0]['URL'] )->delete();
    }
    private function getCache($_URL) {
        $_Data = self::getCacheFile($_URL)->readAll();

        if ($_Data === false)  return false;

        $_Cache = $this->cacheBase->query(array(
            'select'  =>  'CID, URL, Type',
            'from'    =>  'Request',
            'where'   =>  "URL='{$_URL}'"
        ));
        if (count( $_Cache )) {
            $this->cacheBase->update('Request', "CID={$_Cache[0]['CID']}", array(
                'Expire'  =>  time() + 86400
            ));
            header('Content-Type', $_Cache[0]['Type']);
        }
        return $_Data;
    }
    private function setCache($_URL, $_Type, $_Data, $_Cache_Second) {
        $_Length = self::getCacheFile($_URL)->write($_Data);

        if ($_Length === false)  return false;

        $this->cacheBase->insert('Request', array(
            'URL'     =>  $_URL,
            'Type'    =>  $_Type,
            'Expire'  =>  $_Cache_Second  ?  (time() + $_Cache_Second)  :  null
        ));
        $this->deleteCache();
    }
    public function clearCache() {
        $this->cacheBase->dropTable('Request');
        self::initCacheTable( $this->cacheBase );

        $_Dir = new FS_Directory('./cache');
        return @$_Dir->delete();
    }

    private static function getResponseHeaders($_Header_Array) {
        $_Header = array();

        foreach ($_Header_Array as $_Str) {
            $_Item = explode(':', $_Str, 2);

            if (isset( $_Item[1] )) {
                $_Header[trim( $_Item[0] )] = trim( $_Item[1] );
                continue;
            }
            if ( preg_match('#HTTP/[\d\.]+\s+(\d+)#', $_Str, $_Num) )
                $_Header['Response-Code'] = intval( $_Num[1] );
            else
                $_Header[] = $_Str;
        }
        return $_Header;
    }
    private static function setRequestHeaders($_Header_Array) {
        $_Header = array();

        foreach ($_Header_Array  as  $_Key => $_Value)
            $_Header[] = "$_Key: $_Value";

        if (
            empty( $_Header_Array['Content-Type'] )  &&
            (strtoupper( $_Header_Array['Request-Method'] )  ==  'POST')
        )
            $_Header[] = 'Content-Type: application/x-www-form-urlencoded';

        return  join("\r\n", $_Header);
    }

    private function request($_Method,  $_URL,  $_Data,  $_Cache_Second = 0) {
        $_Response = array(
            'Cache'   =>  $_Cache_Second  &&  (($_Method == 'GET')  ||  ($_Method == 'DELETE')),
            'Data'    =>  '',
            'Header'  =>  ''
        );
        if ($_Response['Cache'])  $_Response['Data'] = $this->getCache($_URL);

        if (! $_Response['Data']) {
            $_Response['Data'] = file_get_contents($_URL, false, stream_context_create(array(
                'http' => array(
                    'method'   =>  $_Method,
                    'header'   =>  self::setRequestHeaders(array(
                        'Request-Method'  =>  $_Method
                    )),
                    'content'  =>  http_build_query($_Data ? $_Data : array())
                )
            )));
            $_Response['Header'] = self::getResponseHeaders( $http_response_header );
            if ($_Response['Cache'])
                $this->setCache(
                    $_URL,
                    $_Response['Header']['Content-Type'],
                    $_Response['Data'],
                    $_Cache_Second
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
    public function get($_URL,  $_Cache_Second = 0) {
        return  $this->request('GET', $_URL, null, $_Cache_Second);
    }
    public function post($_URL,  $_Data = array()) {
        return  $this->request('POST', $_URL, $_Data);
    }
    public function delete($_URL,  $_Cache_Second = 0) {
        return  $this->request('DELETE', $_URL, null, $_Cache_Second);
    }
    public function put($_URL,  $_Data = array()) {
        return  $this->request('PUT', $_URL, $_Data);
    }
}