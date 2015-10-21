<?php
//
//                >>>  EasyLibs.php  <<<
//
//
//      [Version]     v1.5.5  (2015-10-21)  Beta
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
//    SQLite OOP Wrapper  v0.5
//
// ------------------------------

class SQL_Table {
    private $ownerBase;
    private $name;

    public function __construct($_DataBase, $_Name) {
        $this->ownerBase = $_DataBase;
        $this->name = $_Name;
    }

    public function insert($_Record) {
        $_Field_Name = array();  $_Field_Value = array();

        foreach ($_Record  as  $_Name => $_Value)
            if ($_Value !== null) {
                $_Field_Name[] = $_Name;
                $_Field_Value[] = (gettype($_Value) == 'string')  ?
                    $this->ownerBase->quote($_Value)  :  $_Value;
            }
        return  $this->ownerBase->exec(join('', array(
            "insert into {$this->name} (",
            join(', ', $_Field_Name),
            ') values (',
            join(', ', $_Field_Value),
            ')'
        )));
    }
    public function update($_Where, $_Data) {
        $_Set_Data = array();

        foreach ($_Data  as  $_Name => $_Value)
            $_Set_Data[] = "{$_Name}=".(
                (gettype($_Value) == 'string')  ?
                    $this->ownerBase->quote($_Value)  :  $_Value
            );
        return  $this->ownerBase->exec(join(' ', array(
            "update {$this->name} set",
            join(', ', $_Set_Data),
            "where {$_Where}"
        )));
    }
    public function delete($_Where) {
        return  $this->ownerBase->exec(
            "delete from {$this->name} where {$_Where}"
        );
    }
}
class EasySQLite {
    private static $statement = array(
        'select'  =>  array('select', 'from', 'where', 'order by', 'limit', 'offset')
    );
    private static $allTable = array(
        'select'  =>  'name, sql',
        'from'    =>  'SQLite_Master',
        'where'   =>  "type = 'table'"
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
    private $table = array();

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
    public function existTable($_Name) {
        $_Statement = self::$allTable;
        $_Statement['where'] .= " and name = '{$_Name}'";

        return  !! count( $this->query($_Statement) );
    }
    private function addTable($_Name) {
        return  $this->table[$_Name] = new SQL_Table($this->dataBase, $_Name);
    }
    public function __get($_Name) {
        if (isset( $this->table[$_Name] ))
            return $this->table[$_Name];
        elseif ($this->existTable( $_Name ))
            return $this->addTable($_Name);
    }

    public function createTable($_Name, $_Column_Define) {
        if ($this->existTable( $_Name ))  return;

        $_Define_Array = array();

        foreach ($_Column_Define  as  $_Key => $_Define)
            $_Define_Array[] = "{$_Key} {$_Define}";

        $_Result = $this->dataBase->exec(
            "create Table {$_Name} (\n    ".join(",\n    ", $_Define_Array)."\n)"
        );
        return  is_numeric($_Result) ? (!! $this->addTable($_Name)) : false;
    }
    public function dropTable($_Name) {
        $_Result = $this->dataBase->exec("drop Table {$_Name}");
        if (is_numeric( $_Result )) {
            unset( $this->table[$_Name] );
            return true;
        }
    }
}
// ---------------------------------------------
//
//    Simple HTTP Synchronized Request  v0.7.5
//
// ---------------------------------------------

class HTTP_Response {
    public static $statusCode = array(
        '200'  =>  'OK',
        '304'  =>  'Not Modified',
        '404'  =>  'Not Found',
        '502'  =>  'Bad Gateway'
    );
    private static function getFriendlyHeaders($_Header_Array) {
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

    private $headers;
    public  $data;
    private $dataJSON;

    public function __construct($_Header, $_Data) {
        $this->headers = isset($_Header[0]) ? self::getFriendlyHeaders($_Header) : $_Header;
        $this->data = $_Data;
        $this->dataJSON = json_decode($_Data, true);
    }
    public function __get($_Key) {
        switch ($_Key) {
            case 'headers':     return $this->headers;
            case 'dataJSON':    return $this->dataJSON;
        }
    }
    public function __set($_Key, $_Value) {
        switch ($_Key) {
            case 'headers':     $this->headers = $_Value;  break;
            case 'dataJSON':    {
                $this->data = json_encode($_Value);
                $this->dataJSON = $_Value;
            }
        }
    }
}
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
            if ($_Take  ||  in_array($_Key, self::$Request_Header)) {
                $_Header[str_replace(' ', '-', ucwords(
                    strtolower( str_replace('_', ' ', $_Key) )
                ))] = $_Value;
                $_Take = false;
            }
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

    private function setStatus($_Code) {
        return  isset( HTTP_Response::$statusCode[$_Code] )  &&
            header( "HTTP/1.1 {$_Code} ".HTTP_Response::$statusCode[$_Code] );
    }
    public function setHeader($_Head,  $_Value = null) {
        if (! is_array($_Head))
            $_Head = array("{$_Head}" => $_Value);

        if (! isset( $_Head['X-Powered-By'] ))  $_Head['X-Powered-By'] = '';
        $_Head['X-Powered-By'] .= '; EasyLibs.php/1.5';
        $_Head['X-Powered-By'] = trim(
            preg_replace('/;\s*;/', ';', $_Head['X-Powered-By']),  ';'
        );

        $this->setStatus(
            isset( $_Head['Response-Code'] )  ?  $_Head['Response-Code']  :  200
        );
        foreach ($_Head  as  $_Key => $_String)
            header("{$_Key}: {$_String}");

        return $this;
    }

    public function __construct($_xDomain = false) {
        $_Header = $this->requestHeaders = self::getRequestHeaders();
        $this->requestIPAddress = self::getRequestIPA( $this->requestHeaders );

        if (! $_xDomain)  return;

        if ($_Header['Request-Method'] != 'OPTION')  return;

        $this->setHeader(array(
            'Access-Control-Allow-Origin'   =>
                isset( $_Header['Origin'] )  ?  $_Header['Origin']  :  '*',
            'Access-Control-Allow-Methods'  =>
                isset( $_Header['Access-Control-Request-Methods'] )  ?
                    $_Header['Access-Control-Request-Methods']  :  'GET,POST',
            'Access-Control-Allow-Headers'  =>
                isset( $_Header['Access-Control-Request-Headers'] )  ?
                    $_Header['Access-Control-Request-Headers']  :  'X-Requested-With'
        ));
        exit;
    }
    public function send($_Data,  $_Header = null) {
        if ($_Data instanceof HTTP_Response) {
            $_Header = $_Data->headers;
            $_Data = $_Data->data;
        }
        if ($_Header)  $this->setHeader($_Header);
        echo  is_string($_Data) ? $_Data : json_encode($_Data);
        ob_flush() & flush();
    }
}

class HTTP_Cache {
    private static function initCacheTable($_SQL_DB) {
        $_SQL_DB->createTable('Request', array(
            'CID'     =>  'Integer Primary Key',
            'URL'     =>  'Text not Null',
            'Expire'  =>  'Text default '.(time() + 86400),
            'Header'  =>  'Text'
        ));
        return $_SQL_DB;
    }
    private static function getCacheFile($_URL) {
        $_Path = 'cache'.parse_url($_URL, PHP_URL_PATH);

        new FS_Directory(pathinfo($_Path, PATHINFO_DIRNAME));

        return  new FS_File($_Path);
    }

    private $dataBase;

    public function __construct() {
        $this->dataBase = self::initCacheTable(new EasySQLite('cache/http_cache'));
    }
    private function remove($_Cache = null) {
        if (empty( $_Cache )) {
            $_Cache = $this->dataBase->query(array(
                'select'     =>  'CID, URL',
                'from'       =>  'Request',
                'where'      =>  'Expire < '.time(),
                'order by'   =>  'Expire',
                'limit'      =>  1
            ));
            if (! count($_Cache))  return false;
        }
        $this->dataBase->Request->delete("CID = {$_Cache[0]['CID']}");
        return  self::getCacheFile( $_Cache[0]['URL'] )->delete();
    }
    public function get($_URL,  $_Header = null) {
        $_Cache = $this->dataBase->query(array(
            'select'  =>  'CID, Expire, Header',
            'from'    =>  'Request',
            'where'   =>  "URL = '{$_URL}'"
        ));
        if (count( $_Cache )) {
            if ($_Cache[0]['Expire'] < time())
                return $this->remove($_Cache);

            $_Data = self::getCacheFile($_URL)->readAll();
            if ($_Data !== false)
                return  new HTTP_Response(
                    json_decode($_Cache[0]['Header'], true),  $_Data
                );
        }
        return false;
    }
    public function add($_URL, $_Response, $_Expire) {
        $_Length = self::getCacheFile($_URL)->write( $_Response->data );

        if ($_Length === false)  return false;

        $this->dataBase->Request->insert(array(
            'URL'     =>  $_URL,
            'Expire'  =>  $_Expire  ?  (time() + $_Expire)  :  null,
            'Header'  =>  json_encode( $_Response->headers )
        ));
        $this->remove();
    }
    public function clear() {
        $this->dataBase->dropTable('Request');
        self::initCacheTable( $this->dataBase );

        $_Dir = new FS_Directory('./cache');
        return @$_Dir->delete();
    }
}

class EasyHTTPClient {
    private static function setRequestHeaders($_Header_Array) {
        $_Header = array();

        foreach ($_Header_Array  as  $_Key => $_Value)
            $_Header[] = "$_Key: $_Value";

        if (
            empty( $_Header_Array['Content-Type'] )  &&
            isset( $_Header_Array['Request-Method'] )  &&
            (strtoupper( $_Header_Array['Request-Method'] )  ==  'POST')
        )
            $_Header[] = 'Content-Type: application/x-www-form-urlencoded';

        return  join("\r\n", $_Header);
    }

    public $cache;

    public function __construct() {
        $this->cache = new HTTP_Cache();
    }

    private function request($_Method,  $_URL,  $_Header,  $_Data = array()) {
        if (
            (($_Method == 'GET')  ||  ($_Method == 'DELETE'))  &&
            isset( $_Header['Cache-Control'] )  &&
            preg_match('/max-age=(\d+)/i', $_Header['Cache-Control'], $_Expire)
        )
            $_Expire = $_Expire[1];

        if (isset( $_Expire ))  $_Response = $this->cache->get($_URL);

        if (empty( $_Response )) {
            $_Response = @file_get_contents($_URL, false, stream_context_create(array(
                'http' => array(
                    'method'   =>  $_Method,
                    'header'   =>  self::setRequestHeaders($_Header),
                    'content'  =>  http_build_query($_Data)
                )
            )));
            if ($_Response !== false) {
                $_Response = new HTTP_Response($http_response_header, $_Response);
                if (isset( $_Expire ))
                    $this->cache->add($_URL, $_Response, $_Expire);
            }
        }
        return $_Response;
    }

    public function head($_URL) {
        stream_context_set_default(array(
            'http' => array(
                'method' => 'HEAD'
            )
        ));
        return  get_headers($_URL, 1);
    }
    public function get($_URL,  $_Header = array()) {
        return  $this->request('GET', $_URL, $_Header);
    }
    public function post($_URL,  $_Data,  $_Header = array()) {
        return  $this->request('POST', $_URL, $_Data, $_Header);
    }
    public function delete($_URL,  $_Header = array()) {
        return  $this->request('DELETE', $_URL, $_Header);
    }
    public function put($_URL,  $_Data,  $_Header = array()) {
        return  $this->request('PUT', $_URL, $_Data, $_Header);
    }
}