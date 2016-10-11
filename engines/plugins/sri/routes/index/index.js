var express = require('express');
var router = express.Router();

/* GET home page. */

function renderHTML(options, callback){

    var sri = options.data.result.result;
    var title = options.title;

    var html = '<div id="sri">';
    html += '<h3>' + title + '</h3>';
    html += '<table class="table"><thead class="bg-primary"><tr><th>#</th><th>URL</th><th>Integrity</th><th>Supported Domains</th></tr></thead><tbody id="sritablebody">';
    var headerData = '';
    var data = '';
    for (var i = 0; i < sri.length; i++) {

        if (sri[i].headersInfo.status === 0) {
            data += "<tr class='bg-danger'><td>" + i + "<td>" + sri[i].url + "</td><td>" + sri[i].integrity + "</td><td>None</td></tr>";
            headerData += "<div class='bs-callout bs-callout-danger'><h4>" + sri[i].url + "</h4><b>Note:</b> <code>Access-Control-Allow-Origin</code> header not found. Integrity check for this file cannot be done.";
        } else if (sri[i].headersInfo.status === 1) {
                data += "<tr class='bg-success'><td>" + i + "<td>" + sri[i].url + "</td><td>" + sri[i].integrity + "</td><td>All Domains</td></tr>";
                headerData = "<div class='bs-callout bs-callout-success'><h4>" + sri[i].url + "</h4><b>Note:</b> Everything looks good. You can use the integrity now.";
        } else {
            data += "<tr class='bg-warning'><td>" + i + "<td>" + sri[i].url + "</td><td>" + sri[i].integrity + "</td><td>" + sri[i].headersInfo.allowedDomains + "</td></tr>";
            headerData = "<div class='bs-callout bs-callout-warning'><h4>" + sri[i].url + "</h4><b>Note:</b> Only domains mentioned above are allowed to do integrity check for this file.";
        }

        headerData += "<h5>Response Headers:</h5>";
        var urlHeadersLength = sri[i].headersInfo.headers.length;
        for (var j = 0; j < urlHeadersLength; j++) {
            headerData += '<b>' + sri[i].headersInfo.headers[j].name + ': </b>' + sri[i].headersInfo.headers[j].value + '</br>';
        }
        headerData += "</div>";
    }

    html += data + '</tbody></table> <div id="sriheaders">';
    html += headerData + '</div></div>';

    callback(html);
}


router.post('/', function(req, res, next) {

    var options = {
        title: 'Sub Resource Integrity',
        data: req.body
    };
    renderHTML(options, function(html){
        res.send(html);
    });
});

router.get('/', function(req, res, next) {

    var options = {
        title: 'Sub Resource Integrity',
        data: req.query.data.result
    };

    renderHTML(options, function(html){
        res.send(html);
    });
    // template.render(options, res);
});

module.exports = router;
