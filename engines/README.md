# Plugins

You can write your own javascript checker plugin inside the *engines* folder. Your plugin should satisfy all the criteria to successfully execute.

## Basic Requirement
1. Create an *index.js* inside the root directory of the plugin.
2. Create *config/config.json* inside the root directory of the plugin.
3. Create a *routes/index/index.js* file inside the root directory of the plugin.

## Data Flow

### 1. index.js
The *index.js* is the entry point to the plugin, where a function needs to exposed accepting two parameters. __job__ and __callback__.
```
module.exports = function(job, callback){
    ...
    ...
    ...
};
```
* __job__ : This is a object with three values mentioned below.
    * ID : This is the request ID, the application has created. This is unique for all requests.
    * URL : This is the JavaScript URL you need to work on.
    * Plugin Name : This is the name of your plugin.

* __callback__ : This is the function where the plugin should return the data after processing. It accepts two parameters.
    * Job : This is the same job you received in the above function.
    * Result : The actual JSON object with result. (__Make sure you do not stringify this value. This has to be a JSON object__)

### 2. config.json

You can store anything into the config file you want, which will help your plugin to execute. This will be merged with the application config inside the config directory in application root. The application config have higher precedence over the plugin config. Which means if you have same key inside both, the application config will take higher precedence.

Inside your plugin you can get the combined application and plugin config by using the below code.

```
var cache = require('cache');
var config = cache.get('config');
```

You should atleast have your plugin name inside your config.json

* __Sample Config File__
```
{
    name: <Your_Plugin_Name>
}
```

## 3. Routes directory
The *index.js* file inside your directory should be capable of handling HTTP request. Once you return the result to the callback function in the index.js inside your application root, the application will make a post request call to your plugin which must be handled by the routes index.js. You will have the same result you sent back to the application inside the request object. Which can be accessed as below.

```
var express = require('express');
var router = express.Router();

router.post('/', function(req, res, next) {

    var data = req.data.result;

    renderHTML(data, function(html){
        res.send(html);
    });
});
```

Once you get your data back, you have create a function which will take the data and return an HTML code with the data in it. Be creative and think how to want your data to displayed back in the HTML. Once you are ready with the html, send it as the response.

## The Final Touch
Once you are through all the above step. The final step is to enable your plugin and start accepting request.
1. Go to *config/config.json* inside the application root and create a new entry inside  *engines/plugins*.
2. Use your name of the plugin as the key without *space* and *-*.
3. Inside your plugin set the __status__ as *true* (This will let the application know to use the plugin).
4. Also create a __priority__ key inside your plugin object, set it according to the execution order of the plugins.

```
"<Your_Plugin_Name>":{
    "status": true,
    "priority": 100
},
```
