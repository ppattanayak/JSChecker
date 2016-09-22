process.argv.forEach(function(val, index, array) {
    if (val === '-d' || val === '--development') {
        config = require('../config/development.json') || require('../config/config.json');
    } else if (val === '-p' || val === '--production') {
        config = require('../config/config.json');
    } else {
        config = require('../config/config.json');
    }
});

module.exports = {
    config: config
};
