var LintStream = require('jslint').LintStream;
var http = require('http');
var https = require('https');
var colors = require('colors/safe');

function handleResponse(res) {
    if (res.statusCode !== 200) {
        output.status = false;
    } else {
        output.status = true;
        output.body = '';

        res.on("data", function(chunk) {
            output.body += chunk;
        }).on('end', function() {
            console.log('Response Ended');
        });
        fulfill(output);
    }
}

function getURLInformation(requrl) {
    console.log(colors.cyan('JSLint plugin step 3'));
    return new Promise(function(fulfill, reject) {
        var output = {};
        var urlsplit = requrl.split('/');
        output.filename = urlsplit[urlsplit.length - 1];

        try {
            var request;
            if (requrl.startsWith('https')) {
                var port = urlsplit[2].split(':')[1] || 443;
                var options = {
                    host: urlsplit[2].split(':')[0],
                    port: port,
                    path: '/' + urlsplit.slice(3).join('/') || '/',
                    method: 'GET',
                    rejectUnauthorized: false,
                    requestCert: false,
                    agent: false
                };

                request = https.request(options, function(res) {
                    if (res.statusCode !== 200) {
                        output.status = false;
                    } else {
                        output.status = true;
                        output.body = '';

                        res.on("data", function(chunk) {
                            output.body += chunk;
                        }).on('end', function() {
                            console.log('Response Ended');
                        });
                    }
                    fulfill(output);
                });
            } else {
                request = http.request(requrl, function(res) {
                    if (res.statusCode !== 200) {
                        output.status = false;
                    } else {
                        output.status = true;
                        output.body = '';

                        res.on("data", function(chunk) {
                            output.body += chunk;
                        }).on('end', function() {
                            console.log('Response Ended');
                        });
                    }
                    fulfill(output);
                });
            }

            request.on('error', function(err) {
                console.log(err);
                output.status = false;
                reject(output);
            }).end();

        } catch (e) {
            console.log(e);
            output.status = false;
            reject(output);
        }
    });
}

function executeJSlint(url, callback) {
    console.log(colors.cyan('JSLint plugin step 2'));
    getURLInformation(url).then(function(result) {
        console.log(colors.cyan('JSLint plugin step 4'));
        var options = {
                "edition": "latest",
                "length": 100
            },
            l = new LintStream(options);
        console.log(colors.green(JSON.stringify(result)));
        console.log(colors.green(result.filename, ' : ', result.body));
        l.write({
            file: result.filename,
            body: result.body
        });
        l.on('data', function(chunk, encoding) {
            callback(chunk.linted.errors);
        });
    }).catch(function(err) {
        console.log(err);
    });
}

module.exports = function(job, callback) {

    console.log(colors.cyan('JSLint plugin step 1'));
    executeJSlint(job.url, function(result) {
        var finalOutput = {};
        finalOutput.status = true;
        finalOutput.result = result;
        callback(job, finalOutput);
    });
};
