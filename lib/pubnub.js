var PubNub = require('pubnub');
var eventbus = require('./eventbus.js');
var config = require('../etc/pubnub.json');

var pubnub = new PubNub({
    subscribeKey: config.subscribeKey,
    publishKey: config.publishKey,
    ssl: true
});

const topic = 'startconferencecall';
const pn_channel = 'startconferencecall';

function start() {

    /* Emit temperature when message received */
    pubnub.addListener({
        message: function(m) {
            var msg = m.message; // The Payload
            console.log("PUBNUB: New Message on channel "+m.channel);
            //console.dir(msg);
            eventbus.emit(topic, msg );
        },
        status: function(s) {
            if (s.category === "PNConnectedCategory") {
                    console.log("PUBNUB: Successfully connected");
            }
        }
    });
    
    /**
     * status categories:
     * 
     * PNNetworkUpCategory     SDK detected that network is online.
     * PNNetworkDownCategory   SDK detected that network is down.
     * PNNetworkIssuesCategory A subscribe event experienced an exception when running.
     * PNReconnectedCategory   SDK was able to reconnect to pubnub.
     * PNConnectedCategory     SDK subscribed with a new mix of channels (fired every time the channel / channel group mix changed).SDK
    **/
    
    
    pubnub.subscribe({
        channels: [pn_channel],
        withPresence: false 
    });

}

module.exports = { start: start };