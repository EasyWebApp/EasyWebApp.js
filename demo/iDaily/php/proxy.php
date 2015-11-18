<?php

require_once('XDomainProxy.php');


$_XDomain_Proxy = new XDomainProxy();


if (isset( $_GET['cache_clear'] )) {
    $_XDomain_Proxy->cache->clear();
    exit;
}

if (empty( $_GET['url'] )) {
    $_IPA_DB = new IPA_DB();
    $_XDomain_Proxy->server->send(
        $_IPA_DB->getGeoInfo( $_XDomain_Proxy->server->requestIPAddress )
    );
    exit;
}

$_Time_Out = isset( $_GET['second_out'] )  ?  $_GET['second_out']  :  0;

$_XDomain_Proxy
    ->open($_GET['url'],  is_numeric($_Time_Out) ? $_Time_Out : 0)
    ->send();