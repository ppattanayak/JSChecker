# JSChecker

## Introduction

JSChecker is a tool to check for various javascript related security requirements. This tool is currently under development and more documentation will be updated once it is completed.

## Docker Setup
```
docker pull ppattanayak/jschecker
```

### Run command
```
sudo docker run -it -p 58080:8080 ppattanayak/jschecker /root/entrypoint.sh
```

### Start Command
```
sudo docker container start <CONTAINER_ID>
```

### Attach with Container
```
sudo docker attach <CONTAINER_ID>
```

## Requirement

1. [PhantomJS 2](http://phantomjs.org/download.html)
2. [Redis](http://redis.io/download)
3. [NodeJS 4](https://nodejs.org/en/download/)
4. [openssl](https://www.openssl.org/source/)

## Usage

```
node . -p
```

## Config

1. Port (Default : 8080, 8082) : This application uses two ports mentioned. You can change the ports by editing the *config.json* inside the config directory. Make sure the ports are available before you run the application.

2. Redis : Redis configuration is used to manage the redis instance.
    * __host__ : Redis IP address (127.0.0.1 if running locally)
    * __port__ : Redis Port
    * __authPassword__ : Password for connecting to redis.
    * __keyPrefix__ : All the redis keys will start with this prefix.
    * __keyLife__ : How long will key live in memory.

## Plugins

You can write your own javascript checker plugin inside the *engines* folder. Your plugin should satisfy all the criteria to successfully execute.

### Basic Requirement
1. Create an *index.js* inside the root directory of the plugin.
2. Create *config/config.json* inside the root directory of the plugin.
3. Create a *routes/index/index.js* file inside the root directory of the plugin.

### Data Flow

#### 1. index.js
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

#### 2. config.json

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

### 3. Routes directory
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

### The Final Touch
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

## Default Plugins

### Sub Resource Integrity Check
As mentioned in the mozilla website, Subresource Integrity (SRI) is a security feature that enables browsers to verify that files they fetch (for example, from a CDN) are delivered without unexpected manipulation. It works by allowing you to provide a cryptographic hash that a fetched file must match.

Most of the tools available in the market check for the integrity of the JS or CSS file you supply them, but JSChecker checks for the integrity of the parent JS and all the other JS that it includes in the page. It also goes deep into the nested JS calls to calculate the end to end integrity.

#### How It helps
Using Content Delivery Networks (CDNs) to host files such as scripts and stylesheets that are shared among multiple sites can improve site performance and conserve bandwidth. However, using CDNs also comes with a risk, in that if an attacker gains control of a CDN, the attacker can inject arbitrary malicious content into files on the CDN (or replace the files completely) and thus can also potentially attack all sites that fetch files from that CDN.

The Subresource Integrity feature enables you to mitigate the risk of attacks such as this, by ensuring that the files your Web application or Web document fetches (from a CDN or anywhere) have been delivered without a third-party having injected any additional content into those files — and without any other changes of any kind at all having been made to those files.

#### Usage
You use the Subresource Integrity feature by specifying a base64-encoded cryptographic hash of a resource (file) you’re telling the browser to fetch, in the value of the integrity attribute of any <script> or <link> element.

An integrity value begins with at least one string, with each string including a prefix indicating a particular hash algorithm (currently the allowed prefixes are sha256, sha384, and sha512), followed by a dash, and ending with the actual base64-encoded hash.

#### Example
<script src="https://example.com/example-framework.js" integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC" crossorigin="anonymous"></script>
