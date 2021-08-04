/*var mysql = require('mysql');

var pool = mysql.createPool({
	connectionLimit: 10,
	host: 'classmysql.engr.oregonstate.edu',
	user: 'cs290_hagmana',
	password: '1161',                   //normally pool would be in a separate file for better security
	database: 'cs340_hagmana' });

 */

var express = require('express');

var app = express();

var handlebars = require('express-handlebars');

var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.engine('handlebars', handlebars({defaultLayout: 'main', extname: '.handlebars'}));
app.set('view engine', 'handlebars');
app.set('port', 6976);

app.listen(app.get('port'), function(){
	console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});

//app.engine('handlebars', handlebars({layoutsDir: __dirname + '/views/layouts',}));
//app.use(express.static(path.join(__dirname, '/public')));

app.get('/',function(req,res){
	res.render('home');
});

app.get('/profile', (req, res) => {
	res.render('profile');
});

app.get('/signup', (req, res) => {
	res.render('usersignup');
});

app.get('/loggedin', (req, res) => {
	res.render('loggedin');
});

