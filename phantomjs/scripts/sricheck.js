var phantom = require('phantom');
var fs = require('fs');
var sys = require('sys');
var process = require('process');
var exec = require('child_process').exec;
var host = 'http://localhost:8082/?url=';
var allUrls = [];
var sri = [];
var downloaded = 0;
var headerInformation = {};

function resetAll(){
    allUrls = [];
    sri = [];
    downloaded = 0;
    headerInformation = {};
}

function wgetAndGenerateHash(url, len, callback){
    console.log(url);
    var filepath = 'phantomjs/temp/'+url.substring(url.lastIndexOf('/')+1);

    var command = 'wget --no-check-certificate -O ' + filepath + ' ' + url;
    exec(command, function(error, stdout, stderr){
        console.log(stdout);
        console.log(stderr);
        if(error === null){
            var cmd = 'openssl dgst -sha384 -binary '+filepath+' | openssl base64 -A';
            exec(cmd, function(error, stdout, stderr){
                console.log(url + ' : '+ 'sha384-'+stdout);
                console.log(stderr);
                sri.push({"url":url, "integrity":'sha384-'+stdout, "headersInfo":headerInformation[url]});
                fs.unlinkSync(filepath);
                downloaded += 1;
                if(downloaded === len) callback(sri);
            });
        }
    });
}

function downloadResources(urls, callback) {
    console.log('Calculate SRI function');
    exec("pwd", function(error, stdout, stderr) {
        console.log(stdout);
    });
    console.log(urls.length);
    for(var i = 0; i < urls.length; i++){
        wgetAndGenerateHash(urls[i], urls.length, callback);
    }
    console.log(sri);
}


module.exports = {

    start: function(url, callback){
        resetAll();
        console.log('Starting PhantomJS checks');
        phantom.create().then(function(ph) {
            ph.createPage().then(function(page){
                console.log('Starting PhantomJS checks 2');
                page.on('onResourceRequested', function(requestData, networkRequest) {
                    if(requestData.url !== host+url){
                        allUrls.push(requestData.url);
                        console.log("REQUEST URL :", requestData.url);
                    }
                });
                page.on('onResourceReceived', function(data, networkRequest){
                    var headers = data.headers;
                    var info = {};
                    for(var i = 0; i < headers.length; i++){
                        if(headers[i].name === "Access-Control-Allow-Origin" && headers[i].value === "*"){
                        // if(headers[i].name === "Server" && headers[i].value === "Apache/2.4.7 (Ubuntu)"){
                            info.status = 1;
                            info.allowedDomains = headers[i].value;
                            break;
                        }else if(headers[i].name === "Access-Control-Allow-Origin" && headers[i].value !== "*"){
                            info.status = 2;
                            info.allowedDomains = headers[i].value;
                            break;
                        }else{
                            info.status = 0;
                            info.allowedDomains = "none";
                        }
                    }
                    headerInformation[data.url] = info;
                    console.log('Header Infromation :', headerInformation);
                });
                page.on('onLoadFinished', function(status){
                    console.log("Page Loading Finished with Status : ", status);
                });
                page.open(host+url).then(function(status){
                    console.log('Starting PhantomJS checks 3');
                    ph.exit();
                    callback(status);
                });
            });
        });
    },

    evaluateAllUrls: function(callback){

        var jsUrls = [];
        console.log('Evaluating all URLs');
        for(var i = 0; i < allUrls.length; i++){
            if(allUrls[i].endsWith('.js') || allUrls[i].endsWith('.css')){
                jsUrls.push(allUrls[i]);
            }
        }

        downloadResources(jsUrls, callback);
    }
};
