# Sub Resource Integrity

## Requirement

1. [PhantomJS 2](http://phantomjs.org/download.html)
2. [openssl](https://www.openssl.org/source/)

## Introduction

This plugin is capable of calculating the sub resource integrity of the given javascript file. The plugin creates a demo web application and add the javascript file into the main page and run it through phantomJS to capture any other network call the Javascript makes. This helps to capture all the network calls and calculate the integrity of all those JavaScript files.

## Integrity

A Sha384 integrity is calculated for every JavaScript

## Limitation

If the JavaScript makes network call based on some programming logic, adding jquery if its not already added, then this will miss out.

## Sample Response

```
{"sri":{"status":true,"result":[{"url":"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js","integrity":"sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa","headersInfo":{"headers":[{"name":"Server","value":"nginx"},{"name":"Date","value":"Wed, 12 Oct 2016 05:43:10 GMT"},{"name":"Content-Type","value":"application/javascript"},{"name":"Connection","value":"keep-alive"},{"name":"Last-Modified","value":"Mon, 25 Jul 2016 16:08:02 GMT"},{"name":"ETag","value":"\"5869c96cc8f19086aee625d670d741f9\""},{"name":"Expires","value":"Sat, 07 Oct 2017 05:42:12 GMT"},{"name":"Cache-Control","value":"max-age=31104000"},{"name":"Vary","value":"Accept-Encoding"},{"name":"Access-Control-Allow-Origin","value":"*"},{"name":"X-Hello-Human","value":"Say hello back! @getBootstrapCDN on Twitter"},{"name":"Content-Encoding","value":"gzip"},{"name":"X-Cache","value":"HIT"},{"name":"Accept-Ranges","value":"bytes"}],"status":1,"allowedDomains":"*"}}],"headerName":"Sub Resource Integrity"}}
```
