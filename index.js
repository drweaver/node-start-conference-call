var pubnub = require('./lib/pubnub.js');
var eventbus = require('./lib/eventbus.js');
var calendar = require('./lib/calendar.js');
const opn = require('opn');


pubnub.start();

eventbus.on('startconferencecall', function() {
    
    calendar.getClosest().then(url => {
        console.log("Attempting to open: " + url);
        opn(url);        
    }, err => {
        console.error(err);
    });
    
});