var restify = require('restify');
var calendar = require('./lib/calendar.js');
 
var server = restify.createServer({
  name: 'startconferencecall',
  version: '1.0.0'
});
// server.use(restify.acceptParser(server.acceptable));
// server.use(restify.queryParser());
// server.use(restify.bodyParser());
// server.use(restify.serveStatic());
 
server.get('/echo/:name', function (req, res, next) {
  res.send(req.params);
  return next();
});

server.get('/', (req,res,next) => {
  res.redirect('/index.html', next);
});

server.get(/\/.*\.(html|js)/, restify.serveStatic({
  directory: './www',
  default: 'index.html'
}));

server.get('/activemeetings', (req,res,next) => {
	console.log('Getting active meetings from calendar');
  calendar.getActiveMeetings().then(meetings=>{
      res.send(200,meetings);
  }, err => {
      res.send(500, {error: err});
  });
  return next();
});

server.get('/status', (req,res,next) => {
  res.send(200, { status: 'ok' });
  return next();
});
 
server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url);
});

//Jump start the outlook calendar libraries
calendar.getActiveMeetings();
