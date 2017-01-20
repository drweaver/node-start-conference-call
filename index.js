var pubnub = require('./lib/pubnub.js');
var eventbus = require('./lib/eventbus.js');
var calendar = require('./lib/calendar.js');
const opn = require('opn');


pubnub.start();

eventbus.on('startconferencecall', function() {
    
    calendar.getClosest(function(conferenceUrl) {
        console.log("Attempting to open: " + conferenceUrl);
        opn(conferenceUrl);        
    });

});