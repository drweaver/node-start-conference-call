var config = require('../etc/calendar.json');
var exec = require('child_process').exec;

/**
 * Stub for now just responding with whatever url is in ../etc/calendar.json
 * 
 */
function getClosest() {
    return new Promise(function(res, rej) {
        exec(__dirname + '/../bin/GetActiveOutlookMeetings.exe 5', function(err, stdout, stderr) {
          if( err ) return rej(stderr);
          
          try {
            var meetings = JSON.parse(stdout);
            var now = Date.now();
            // console.dir(meetings);
            var found = [];
            meetings.map(meeting => {
                console.log("Found meeting titled: " + meeting.Title + " starting at " + meeting.StartTime);
                var startTime = Date.parse(meeting.StartTime);   
                // console.log("Now is " + now + " startTime is " + startTime);
                // Is the meeting starting in next 5 minutes?
                if( now > (startTime - 300000) && now <= startTime ) {
                    console.log("This meeting is starting soon");
                    found.push({ state: 'starting_soon', urls: meeting.EmbeddedUrls, title: meeting.Title});
                } else if ( now > startTime && now < (startTime + 1200000) ) {
                    console.log("This meeting started recently");
                    found.push({ state: 'started', urls: meeting.EmbeddedUrls, title: meeting.Title});
                } else {
                    console.log('This meeting is not applicable');
                }
            });
            
            if( found.length == 0 ) {
                return rej('no active or soon to start meetings found');
            }
            
            var chooseBestUrl = (urls, callback) => {
                // remove urls not matching any patterns
                urls = urls.filter(url=>{
                    var found = false;
                    config.urlRegexp.map( regexp => {
                        var re = new RegExp(regexp.regexp, "i"); 
                        if( url.search(re) != -1 ) {
                            found = true;
                        }
                    });
                    return found;
                });

                
                
                urls.sort( (a,b) => {
                    var urlPriority = (url) => {
                        var result = -1;
                        config.urlRegexp.map( (regexp, priority) => {
                            
                           var re = new RegExp(regexp.regexp, "i"); 
                           if( url.search(re) != -1  && priority > result ) {
                                result = priority;
                           }
                        }); 
                        return result;
                    };
                    return urlPriority(a) < urlPriority(b);
                });
                
                if( urls.length == 0 ) 
                    callback('No URLs found matching known conference patterns');
                else 
                    callback(null, urls[0]);
                
            };
            
            var startingSoon = found.filter( meeting => { return meeting.state == 'starting_soon'});
            if( startingSoon.length > 0 ) {
                if( startingSoon.length > 1 ) {
                    return rej('There is more than 1 meeting startnig in next 5 minutes, system cannot choose');
                }
                
                chooseBestUrl(startingSoon[0].urls, (err,url) => {
                  if( err ) {
                      rej(err);
                  } else {
                      res(url);
                  }
                });

            } else {
                if( found.length > 1 ) {
                    return rej('There is more than 1 active meeting, system cannot choose');
                }
                chooseBestUrl(found[0].urls, (err,url) => {
                   if( err ) {
                       rej(err);
                   } else {
                       res(url);
                   }
                  
                });
            }
            

          } catch( err ) {
            rej(err);
          }
          
        });
    });
    
}

function matchUrls(urls) {
    // remove urls not matching any patterns
    urls = urls.map(url=>{
        var patternName = 'unknown';
        var priority = -1;
        config.urlRegexp.map( (regexp, i) => {
            var re = new RegExp(regexp.regexp, "i"); 
            if( url.search(re) != -1 && i > priority) {
                patternName = regexp.name;
                priority = i;
            }
        });
        return { url: url, priority: priority, patternName: patternName };
    });
    
    urls.sort( (a,b) => {
        return a.priority < b.priority;
    });
    
    return urls;
    
}

function getActiveMeetings() {
    return new Promise(function(res, rej) {
        exec(__dirname + '/../bin/GetActiveOutlookMeetings.exe 5', function(err, stdout, stderr) {
          
          if( err ) return rej(stderr);
          console.log("getting here");
          try {
            var meetings = JSON.parse(stdout);
            var now = Date.now();
            // console.dir(meetings);
            var found = [];
            meetings.map(meeting => {
                console.log("Found meeting titled: " + meeting.Title + " starting at " + meeting.StartTime);
                var startTime = Date.parse(meeting.StartTime);   
                // console.log("Now is " + now + " startTime is " + startTime);
                // Is the meeting starting in next 5 minutes?
                var state = 'started';
                if( now > (startTime - 300000) && now <= startTime ) {
                    console.log("This meeting is starting soon");
                    state = 'starting_soon';
                } else {
                    console.log("This meeting has already started");
                } 
                found.push({ state: state, urls: matchUrls(meeting.EmbeddedUrls), title: meeting.Title, now: now, startTime: startTime});
            });
            
            res(found.sort( (a,b) => {
                var delta = meeting => {
                    return meeting.startTime > meeting.now ? meeting.startTime - meeting.now : meeting.now - meeting.startTime;
                };
                return delta(a) - delta(b);
            }));
          } catch(err) {
              console.error("Error caught: "+err);
              rej(err);
          }
        });
    });
}

module.exports = { getClosest: getClosest, getActiveMeetings: getActiveMeetings };