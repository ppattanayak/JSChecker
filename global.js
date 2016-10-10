var merge = require('merge');
var cache = require('./src/cache');
var config = require('./config/config.json');
var fs = require('fs');

for(var i = 0; i < process.argv.length; i++){
    var val = process.argv[i];
    if (val === '-d' || val === '--development') {
        config = require('./config/development.json') || require('./config/config.json');
        startMerging();
        break;
    } else if (val === '-p' || val === '--production') {
        config = require('./config/config.json');
        startMerging();
        break;
    }
}

function startMerging(){
    mergeConfigs(config, function(newconfig){
        sortPluginByPriority(newconfig.engines.plugins, function(sortedPlugins){
            config.engines.sortedPlugins = sortedPlugins;
            cache.set('config', config);
        });
    });
}

function mergeConfigs(config, callback){
    var plugins = config.engines.plugins;
    var pluginMerged = 0;
    Object.keys(plugins).forEach(function(key) {
        pluginMerged += 1;
        if(plugins[key].status === true){

            var pluginConfigPath = './engines/plugins/'+key+'/config/config.json';
            var pluginConfig = {};
            if (fs.existsSync(pluginConfigPath)) {
                pluginConfig = require(pluginConfigPath) || {};
                console.log(pluginConfig);
            }
            config.engines.plugins[key] = merge.recursive(true, pluginConfig, config.engines.plugins[key]);
        }
        if(pluginMerged === Object.keys(plugins).length){
            callback(config);
        }
    });
}

function sortPluginByPriority(plugins, callback){
    var pluginArray = [];
    var pluginSorted = 0;
    Object.keys(plugins).forEach(function(key) {
        pluginSorted += 1;
        if(plugins[key].status === true){
            plugins[key].key = key;
            pluginArray.push(plugins[key]);
        }
        if(pluginSorted === Object.keys(plugins).length){
            var sortedPluginAsPriority = pluginArray.sort(function(a, b){
                return a.priority - b.priority;
            });
            callback(sortedPluginAsPriority);
        }
    });

}

module.exports = {
    config: config
};
