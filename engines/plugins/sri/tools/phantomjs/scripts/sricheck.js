var phantom = require('phantom');
var fs = require('fs');
var sys = require('sys');
var exec = require('child_process').exec;

var host = 'http://localhost:8082/?url=';
var allUrls = [];
var sri = [];
var downloaded = 0;
var headerInformation = {};
var inValidUrls = [];

function resetAll() {
    allUrls = [];
    sri = [];
    downloaded = 0;
    headerInformation = {};
    inValidUrls = [];
}

function wgetAndGenerateHash(url, len, callback) {

    console.log(url);
    var filepath = url.substring(url.lastIndexOf('/') + 1);

    var command = 'wget --no-check-certificate -O ' + filepath + ' ' + url;
    console.log(command);
    exec(command, function(error, stdout, stderr) {
        console.log(stdout);
        console.log('Error : ', stderr);
        console.log('Error 1 :', error);
        if (error === null) {
            var cmd = 'openssl dgst -sha384 -binary ' + filepath + ' | openssl base64 -A';
            exec(cmd, function(error, stdout, stderr) {
                console.log(url + ' : ' + 'sha384-' + stdout);
                console.log('Error : ', stderr);
                sri.push({
                    "url": url,
                    "integrity": 'sha384-' + stdout,
                    "headersInfo": headerInformation[url]
                }); // Sample Object to Return

                /* {"status":true, "sri":[{"url":"<JS URl>","integrity":"sha384-yGcy15y7ezBTj+bOaB7GnMKa4auQOdAMCIDwZEcjReXG0KL51p1LJPUvA147u05e","headersInfo":{"headers":[{"name":"Date","value":"Wed, 21 Sep 2016 21:06:58 GMT"},{"name":"Server","value":"Apache/2.4.7 (Ubuntu)"},{"name":"Last-Modified","value":"Fri, 02 Sep 2016 22:39:13 GMT"},{"name":"ETag","value":"\"ba-53b8dffe771a0-gzip\""},{"name":"Accept-Ranges","value":"bytes"},{"name":"Vary","value":"Accept-Encoding"},{"name":"Content-Encoding","value":"gzip"},{"name":"Keep-Alive","value":"timeout=5, max=100"},{"name":"Connection","value":"Keep-Alive"},{"name":"Content-Type","value":"application/javascript"}],"status":0,"allowedDomains":"none"}},{"url":"JS URL 2","integrity":"sha384-PELZvjkz6cPUAQaT8DdCeTvtMw2OfoxiYO/paYT5vp6bRXnF06Ka/G3V47lUvWV/","headersInfo":{"headers":[{"name":"Date","value":"Wed, 21 Sep 2016 21:06:58 GMT"},{"name":"Server","value":"Apache/2.4.7 (Ubuntu)"},{"name":"Last-Modified","value":"Fri, 02 Sep 2016 22:38:33 GMT"},{"name":"ETag","value":"\"1d-53b8dfd8d4560\""},{"name":"Accept-Ranges","value":"bytes"},{"name":"Content-Length","value":"29"},{"name":"Keep-Alive","value":"timeout=5, max=99"},{"name":"Connection","value":"Keep-Alive"},{"name":"Content-Type","value":"application/javascript"}],"status":0,"allowedDomains":"none"}}]}*/
                console.log(sri);
                fs.unlinkSync(filepath);
                downloaded += 1;
                if (downloaded === len) {
                    var result = {};
                    result.status = true;
                    result.result = sri;
                    callback(result);
                }
            });
        }else{
            fs.unlinkSync(filepath);
            inValidUrls.push(url);
            downloaded += 1;
            if (downloaded === len) {
                var result = {};
                result.status = false;
                result.invalidurls = inValidUrls;
                result.message = "Invalid resources found!!";
                callback(result);
            }
        }
    });
}

function downloadResources(urls, callback) {
    console.log('Calculate SRI function');
    exec("pwd", function(error, stdout, stderr) {
        console.log(stdout);
    });
    console.log(urls.length);
    for (var i = 0; i < urls.length; i++) {
        wgetAndGenerateHash(urls[i], urls.length, callback);
    }
    console.log(sri);
}


module.exports = {

    start: function(url, callback) {
        // console.log('Inside PhantomJS :', url);
        resetAll();
        console.log('Starting PhantomJS checks');
        phantom.create().then(function(ph) {
            ph.createPage().then(function(page) {
                console.log('Starting PhantomJS checks 2');

                page.on('onResourceRequested', function(requestData, networkRequest) {
                    // console.log('onResourceRequested : ', requestData.url);
                    if (requestData.url !== host + url && (requestData.url.endsWith('.js') || requestData.url.endsWith('.css'))) {

                        allUrls.push(requestData.url);
                        console.log("REQUEST URL :", requestData.url);
                    }
                });
                page.on('onResourceReceived', function(data, networkRequest) {
                    // console.log('onResourceReceived : ', data.url);
                    if (data.url !== host + url && (data.url.endsWith('.js') || data.url.endsWith('.css'))) {
                        // console.log('+++++++++++++++++++++++++', data);
                        var headers = data.headers;
                        var info = {};
                        info.headers = headers;
                        for (var i = 0; i < headers.length; i++) {
                            var headerName = headers[i].name.toUpperCase();
                            var accessControlAllowOrigin = 'ACCESS-CONTROL-ALLOW-ORIGIN';
                            if (headerName === accessControlAllowOrigin && headers[i].value === "*") {
                                info.status = 1;
                                info.allowedDomains = headers[i].value;
                                break;
                            } else if (headerName === accessControlAllowOrigin && headers[i].value !== "*") {
                                info.status = 2;
                                info.allowedDomains = headers[i].value;
                                break;
                            } else {
                                info.status = 0;
                                info.allowedDomains = "none";
                            }
                        }
                        headerInformation[data.url] = info;
                    }
                });
                page.on('onLoadFinished', function(status) {
                    console.log("Page Loading Finished with Status : ", status);
                });
                page.open(host + url).then(function(status) {
                    console.log('Starting PhantomJS checks 3');
                    ph.exit();
                    callback(status);
                });
            });
        });
    },

    evaluateAllUrls: function(callback) {

        var jsUrls = [];
        console.log('Evaluating all URLs', allUrls);
        if (allUrls.length !== 0) {
            console.log('ALL URLS ARE : ', allUrls );
            for (var i = 0; i < allUrls.length; i++) {
                if (allUrls[i].endsWith('.js') || allUrls[i].endsWith('.css')) {
                    jsUrls.push(allUrls[i]);
                }
            }
            downloadResources(jsUrls, callback);
        } else {
            var result = {};
            result.status = false;
            result.message = "No Javascript and CSS resources found!!";
            callback(result);
        }
    }
};
