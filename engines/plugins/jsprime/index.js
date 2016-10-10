module.exports = function(job, callback){
    var result = {};
    result.status = true;
    result.data = "This is testing one";
    result.data2 = "This is testing two";
    // var result = '{"data":"This is testing one", "data2":"This is testing two"}';
    callback(job, result);
};
