var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var fs = require('fs');
var app = express();

app.use(bodyParser.text({
	type : 'text/plain'
}))
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));
var router = express.Router();
app.use('/api', router);

//get the wiki markup
router.get('/page', function(req, res) {
	res.setHeader("Content-Type", "text/plain");
	res.send(fs.readFileSync('WikiRoot/page', req.body));
});

//update the wiki markup
router.post('/update', function(req, res) {
	fs.writeFileSync('WikiRoot/page', req.body);
	res.send('OK');
});

//need to proxy from localhost to remote servers to prevent CORS issues
router.get('/version', function(req, res) {
	http.get(req.query.url, function(response) {
		response.on('data', function(data) {
			res.send(data);
		});
		response.on('error', function(data) {
			res.send("??");
		});
	});

});

app.listen(app.get('port'), function() {
	console.log("Node app is running at localhost:" + app.get('port'))
})
