var config = require('../etc/calendar.json');

/**
 * Stub for now just responding with whatever url is in ../etc/calendar.json
 * 
 */
function getClosest(callback) {
    callback(config.url);
}

module.exports = { getClosest: getClosest };