var express = require('express');
var router = express.Router();

function renderHTML(options, callback){

    var jslint = options.data.result.result;
    var title = options.title;
    var html = '<div id="jslint">';
    html += '<h3>' + title + '</h3>';
    html += '<table class="table"><thead class="bg-primary"><tr><th>#</th><th>Name</th><th>Line</th><th>Column</th><th>Code</th></tr></thead><tbody id="jslinttablebody">';

    for(var i = 0; i < jslint.length; i++){
        html += "<tr class='bg-danger'><td>" + (i+1) + "<td>" + jslint[i].name + "</td><td>" + jslint[i].line + "</td><td>"+ jslint[i].column +"</td><td>"+ jslint[i].code +"</td></tr>";
    }
    html += '</tbody></table> </div>';

    callback(html);
}

router.post('/', function(req, res, next) {

    var options = {
        title: 'JSLint',
        data: req.body
    };

    renderHTML(options, function(html){
        res.send(html);
    });
});

router.get('/', function(req, res, next) {
    res.send('GET Request Not Supported');
});

module.exports = router;
