var mysql = require('mysql');
const path = require('path');
var pool = mysql.createPool({
	connectionLimit: 10,
	host: '127.0.0.1',
	user: 'root',
	password: 'root',                   //normally pool would be in a separate file for better security
	database: 'cs340_hagmana'
});

var express = require('express');

var app = express();

var handlebars = require('express-handlebars');

var bodyParser = require('body-parser');
app.use(express.static(path.join(__dirname, '/views')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.engine('handlebars', handlebars({ defaultLayout: 'main', extname: '.handlebars' }));
app.set('view engine', 'handlebars');
app.set('port', 6976);

app.listen(app.get('port'), function() {
	console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});

var STATESMAP = {
	'AZ': 'Arizona',
	'AL': 'Alabama',
	'AK': 'Alaska',
	'AR': 'Arkansas',
	'CA': 'California',
	'CO': 'Colorado',
	'CT': 'Connecticut',
	'DE': 'Delaware',
	'FL': 'Florida',
	'GA': 'Georgia',
	'HI': 'Hawaii',
	'ID': 'Idaho',
	'IL': 'Illinois',
	'IN': 'Indiana',
	'IA': 'Iowa',
	'KS': 'Kansas',
	'KY': 'Kentucky',
	'LA': 'Louisiana',
	'ME': 'Maine',
	'MD': 'Maryland',
	'MA': 'Massachusetts',
	'MI': 'Michigan',
	'MN': 'Minnesota',
	'MS': 'Mississippi',
	'MO': 'Missouri',
	'MT': 'Montana',
	'NE': 'Nebraska',
	'NV': 'Nevada',
	'NH': 'New Hampshire',
	'NJ': 'New Jersey',
	'NM': 'New Mexico',
	'NY': 'New York',
	'NC': 'North Carolina',
	'ND': 'North Dakota',
	'OH': 'Ohio',
	'OK': 'Oklahoma',
	'OR': 'Oregon',
	'PA': 'Pennsylvania',
	'RI': 'Rhode Island',
	'SC': 'South Carolina',
	'SD': 'South Dakota',
	'TN': 'Tennessee',
	'TX': 'Texas',
	'UT': 'Utah',
	'VT': 'Vermont',
	'VA': 'Virginia',
	'WA': 'Washington',
	'WV': 'West Virginia',
	'WI': 'Wisconsin',
	'WY': 'Wyoming',
}

/* **********************************
Looking for a section? search:

1. DATA DISPLAY - all the app.get sections that render data from selects
2. INSERT handling - all the routes that handle inserting information
3. UPDATE handling - all the routes that handle updating information
4. DELETE SECTION - all the routes and functions that handle deleting information
5. ERROR handling - handles the 404 and 500 errors for pages
6. GET SECTION - all the select functions that gather data from the database
7. COUNTS - all the count functions
8. ECL - errors, corrections and learning

****************** */

app.get('/', function(req, res) {
	res.render('home');
});

app.get('/profile', (req, res) => {
	res.render('profile');
});

app.get('/admin', (req, res) => {
	res.render('admin');
});

/* ******************************************************************************

1. DATA DISPLAY

 ************************************************************************ */

app.get('/signup', (req, res) => {
	var callbackCount = 0;
	var context = {};

	var mysql = req.app.get('mysql');

	getUsers(res, mysql, context, complete);
	getStates(res, mysql, context, complete);
	getDiagnoses(res, mysql, context, complete);

	function complete() {
		callbackCount++;
		if (callbackCount >= 3) {
			res.render('usersignup', context);
		}
	}
});

app.get('/loggedin/:userID', function(req, res) {
	callbackCount = 0;

	var context = {};

	var mysql = req.app.get('mysql');

	getUser(res, mysql, context, req.params.userID, complete);
	getInstances(res, mysql, context, req.params.userID, complete);
	getDiagnoses(res, mysql, context, complete);
	getStates(res, mysql, context, complete);

	function complete() {
		callbackCount++;
		if (callbackCount >= 4) {
			res.render('loggedin', context);
		}

	}
});

app.get('/loggedin/:userID/:instanceID', function(req, res) {
	callbackCount = 0;

	var context = {};

	var mysql = req.app.get('mysql');

	getUser(res, mysql, context, req.params.userID, complete);
	getInstance(res, mysql, context, req.params.instanceID, complete);
	getDiagnoses(res, mysql, context, complete);

	function complete() {
		callbackCount++;
		if (callbackCount >= 3) {
			res.render('user-instance', context);
		}
	}
});

app.get('/admin/users', (req, res) => {
	var callbackCount = 0;
	var context = {};

	var mysql = req.app.get('mysql');

	getUsers(res, mysql, context, complete);
	getDiagnoses(res, mysql, context, complete);

	function complete() {
		callbackCount++;
		if (callbackCount >= 2) {
			res.render('admin-users', context);
		}
	}
});

app.get('/admin/states', (req, res) => {
	var callbackCount = 0;
	var context = {};

	var mysql = req.app.get('mysql');

	getStates(res, mysql, context, complete);

	function complete() {
		callbackCount++;
		if (callbackCount >= 1) {
			res.render('admin-states', context);
		}
	}
});

app.get('/admin/instances', (req, res) => {
	var callbackCount = 0;
	var context = {};

	var mysql = req.app.get('mysql');

	getAllInstances(res, mysql, context, complete);

	function complete() {
		callbackCount++;
		if (callbackCount >= 1) {
			res.render('admin-instances', context);
		}
	}
});

app.get('/admin/diagnoses', (req, res) => {
	var callbackCount = 0;
	var context = {};

	var mysql = req.app.get('mysql');

	getDiagnoses(res, mysql, context, complete);

	function complete() {
		callbackCount++;
		if (callbackCount >= 1) {
			res.render('admin-diagnoses', context);
		}
	}
});

app.get('/code/counts/:state', getColdThisState);
app.get('/flu/counts/:state', getFluThisState);
app.get('/fp/counts/:state', getFPThisState);

app.get('/code/counts', getColdAllStates);
app.get('/flu/counts', getFluAllStates);
app.get('/fp/counts', getFPAllStates);

app.get('/population/:state', (req, res) => {
	var state = req.params.state;
	var sql = 'SELECT statePop as count FROM states WHERE stateID = ?'
	pool.query(sql, [STATESMAP[state]], function(error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		}
		return res.json(results[0])
	})
});

app.get('/population', (req, res) => {
	var sql = 'SELECT sum(statePop) as count FROM states'
	pool.query(sql, function(error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		}
		return res.json(results[0])
	})
});


app.post('/profile', function(req, res) {
	var mysql = req.app.get('mysql');

	if (req.body.username == 'admin' && req.body.password == 'adminpass') {
		res.redirect('/admin')
	}
	else {
		var context = {};

		var sql = "SELECT userID FROM users WHERE username = ? AND password = ?";
		var inserts = [req.body.username, req.body.password];
		pool.query(sql, inserts, function(error, results, fields) {
			if (error) {
				res.write(JSON.stringify(error));
				res.end();
			} else {
				userID = results[0];
				userID = JSON.stringify(userID);    //turns the JSON object into a string
				userID = userID.replace("{\"userID\":", ""); //cleans up the ID
				usersID = userID.replace("}", "");
				//console.log(thisUsersID);

				res.redirect('/loggedin/' + usersID);
			}
		})
	}
});

/* ******************************************************************************

2. INSERT SECTION


 ************************************************************************ */

//inserts a new user in the users table
app.post('/signup', function(req, res) {
	var mysql = req.app.get('mysql');
	var sql = "INSERT INTO users (email, stateID, sicknessID, fname, lname, username, password) VALUES (?,?,?,?,?,?,?)";
	var inserts = [req.body.email, req.body.stateID, req.body.sicknessID, req.body.fname, req.body.lname, req.body.username, req.body.password];
	sql = pool.query(sql, inserts, function(error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		} else {
			res.redirect('/profile');
		}
	});
});

//inserts a new instances for a specific user

app.post('/instances/:userID', function(req, res) {
	var sql = "INSERT INTO instances (startDate, endDate, userID, sicknessID) VALUES (?,?,?,?)";
	var thisUser = req.params.userID;

	thisUser = thisUser.replace(":", "");    //removes the : so that SQL doesn't freak out when it tries to insert the userID

	var inserts = [req.body.startDate, , thisUser, req.body.sicknessID];
	sql = pool.query(sql, inserts, function(error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		} else {
			var redirectString = '/loggedin/' + thisUser;
			res.redirect(redirectString);
		}
	});
});

//inserts a new state. this should never be used. most likely. I don't think we're getting any new states anytime soon. But who knows.

app.post('/admin/states', function(req, res) {
	var sql = "INSERT INTO states (stateID, statePop) VALUES (?,?)";

	var inserts = [req.body.stateID, req.body.statePop];

	sql = pool.query(sql, inserts, function(error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		} else {
			res.redirect('/admin/states');
		}
	});
});

//inserts a new diagnosis. should be agreed upon by whoever controls the site.

app.post('/admin/diagnosis', function(req, res) {
	var sql = "INSERT INTO diagnoses (diagnosisName) VALUES (?)";

	var inserts = [req.body.diagnosisName];

	sql = pool.query(sql, inserts, function(error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		} else {
			res.redirect('/admin/diagnosis');
		}
	});
});


/* ******************************************************************************

3. UPDATE SECTION.

 ************************************************************************ */

//updates a user's data

app.post('/loggedin/:userID', function(req, res, next) {
	var sql = "UPDATE users SET email=?, stateID=?, sicknessID=?, fname=?, lname=?, username=?, password=? WHERE userID=?";

	var thisUser = req.params.userID;

	thisUser = thisUser.replace(":", "");

	var inserts = [req.body.email, req.body.stateID, req.body.sicknessID, req.body.fname, req.body.lname, req.body.username, req.body.password, thisUser];

	sql = pool.query(sql, inserts, function(error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		} else {
			var redirectString = '/loggedin/' + thisUser;

			res.redirect(redirectString)
		}
	});
});

//updates a specific users specific instance

app.post('/loggedin/:userID/:instanceID', function(req, res, next) {
	var sql = "UPDATE instances SET endDate=? WHERE instanceID=?";

	var thisInstance = req.params.instanceID;

	thisInstance = thisInstance.replace(":", "");

	var thisUser = req.params.userID;

	thisUser = thisUser.replace(":", "");

	var inserts = [req.body.endDate, thisInstance];

	sql = pool.query(sql, inserts, function(error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		} else {
			var redirectString = '/loggedin/' + thisUser;

			res.redirect(redirectString)
		}
	});
});

/* ******************************************************************************

4. DELETE SECTION

 ************************************************************************ */

app.post('/deleteUser/:userID', function(req, res, next) {
	var callbackCount = 0;

	var thisUser = req.params.userID;

	thisUser = thisUser.replace(":", "");

	deleteInstances(res, mysql, thisUser, complete);
	deleteUser(res, mysql, thisUser, complete);

	function complete() {
		callbackCount++;
		if (callbackCount >= 2) {
			res.redirect('/');
		}
	}

});

//deletes all instances belonging to a specific user

function deleteInstances(res, mysql, userID, complete) {
	var sql = "DELETE FROM instances WHERE userID=?";
	var inserts = [userID];

	pool.query(sql, inserts, function(error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		}
		complete();
	});
};

//deletes a user

function deleteUser(res, mysql, userID, complete) {
	var sql = "DELETE FROM users WHERE userID=?";
	var inserts = [userID];

	pool.query(sql, inserts, function(error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		}
		complete();
	});
};

/* ******************************************************************************

5. ERROR handling.


 ************************************************************************ */

app.use(function(req, res) {
	res.status(404);
	res.render('404');
});

app.use(function(err, req, res, next) {
	console.error(err.stack);
	res.status(500);
	res.render('500');
});

/* ******************************************************************************

6. GET SECTION. This is where are the select functions are.


 ************************************************************************ */


//selects the whole table of users, joins diagnoses on sicknessID so that the diagnosis is displayed

function getUsers(res, mysql, context, complete) {
	pool.query("SELECT userID, email, stateID, diagnosisName, fname, lname, username, password, diagnoses.sicknessID FROM diagnoses JOIN users ON diagnoses.sicknessID = users.sicknessID", function(error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		}
		context.users = results;
		complete();
	});
};

//selects the whole table of states

function getStates(res, mysql, context, complete) {
	pool.query("SELECT stateID, statePop FROM states", function(error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		}
		context.states = results;
		complete();
	});
};
//selects a specific userID

function getUser(res, mysql, context, userID, complete) {
	var sql = "SELECT userID FROM users WHERE username = ? AND password = ?";
	var inserts = [req.body.username, req.body.password];
	pool.query(sql, inserts, function(error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		}
		context.user = results[0];
		complete();
	});
};

//selects a specific user's data

function getUser(res, mysql, context, userID, complete) {
	var sql = "SELECT userID, email, stateID, diagnosisName, fname, lname, username, password, diagnoses.sicknessID FROM diagnoses JOIN users ON diagnoses.sicknessID = users.sicknessID WHERE userID = ?";
	var inserts = [userID];
	pool.query(sql, inserts, function(error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		}
		context.user = results[0];
		complete();
	});
};

//selects instances based upon a specific userID

function getInstances(res, mysql, context, userID, complete) {
	var sql = "SELECT instanceID, startDate, endDate, userID, instances.sicknessID, diagnosisName FROM instances JOIN diagnoses ON diagnoses.sicknessID = instances.sicknessID WHERE userID = ?";
	var inserts = [userID];
	pool.query(sql, inserts, function(error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		}
		context.instances = results;
		complete();
	});
};

//selects a specific instance

function getInstance(res, mysql, context, instanceID, complete) {
	var sql = "SELECT instanceID, startDate, endDate, userID, instances.sicknessID, diagnosisName FROM instances JOIN diagnoses ON diagnoses.sicknessID = instances.sicknessID WHERE instanceID=?";
	var inserts = [instanceID];
	pool.query(sql, inserts, function(error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		}
		context.instance = results;
		complete();
	});
};

//selects all instances across all users

function getAllInstances(res, mysql, context, complete) {
	var sql = "SELECT startDate, endDate, userID, sicknessID FROM instances";

	pool.query(sql, function(error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		}
		context.allinstances = results;
		complete();
	});
};

//selects the sicknessID and diagnosisNames from the diagnoses table

function getDiagnoses(res, mysql, context, complete) {
	pool.query("SELECT sicknessID, diagnosisName FROM diagnoses", function(error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		}
		context.diagnoses = results;
		complete();
	});
};

/* ******************************************************************************

7. COUNTS. This where the select count queries are

 ************************************************************************ */

//counts the number of instances of all unhealthy diagnoses across all states

function getNumAllStates(res, mysql, context, complete) {
	var sql = "SELECT COUNT(instances.sicknessID) FROM states JOIN users on states.stateID = users.stateID JOIN instances on users.sicknessID = instances.sicknessID WHERE NOT instances.sicknessID = 1 AND endDate IS NULL";

	pool.query(sql, function(error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		}
		context.numAllStates = results;
		complete();
	});
};

//counts the number of instances of all unhealthy diagnoses in a state

function getNumThisStates(res, mysql, context, stateID, complete) {
	var sql = "SELECT COUNT(instances.sicknessID) FROM states JOIN users on states.stateID = users.stateID JOIN instances on users.sicknessID = instances.sicknessID WHERE NOT instances.sicknessID = 1 AND endDate IS NULL AND states.stateID = ?";
	var inserts = [stateID];
	pool.query(sql, inserts, function(error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		}
		context.numThisState = results;
		complete();
	});
};

//counts the number of cold diagnoses across all states

function getColdAllStates(req, res) {
	var sql = "SELECT COUNT(instances.sicknessID) as count FROM states JOIN users on states.stateID = users.stateID JOIN instances on users.sicknessID = instances.sicknessID WHERE instances.sicknessID = 2 AND endDate IS NULL";

	pool.query(sql, function(error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		}
		res.json(results[0]);
	});
};

//counts the number of cold diagnoses in a specific state

function getColdThisState(req, res) {
	var state = req.params.state
	var sql = "SELECT COUNT(instances.sicknessID) as count FROM states JOIN users on states.stateID = users.stateID JOIN instances on users.sicknessID = instances.sicknessID WHERE instances.sicknessID = 2 AND endDate IS NULL AND states.stateID = ?";
	var inserts = [STATESMAP[state]]
	pool.query(sql, inserts, function(error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		}
		res.json(results[0]);
	});
};

//counts the number of flu diagnoses in all states

function getFluAllStates(req, res) {
	var sql = "SELECT COUNT(instances.sicknessID) as count FROM states JOIN users on states.stateID = users.stateID JOIN instances on users.sicknessID = instances.sicknessID WHERE instances.sicknessID = 3 AND endDate IS NULL";

	pool.query(sql, function(error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		}
		res.json(results[0]);
	});
};

// counts the number of flu diagnoses in a specific state

function getFluThisState(req, res) {
	var state = req.params.state
	var sql = "SELECT COUNT(instances.sicknessID) as count FROM states JOIN users on states.stateID = users.stateID JOIN instances on users.sicknessID = instances.sicknessID WHERE instances.sicknessID = 3 AND endDate IS NULL AND states.stateID = ?";
	var inserts = [STATESMAP[state]]
	pool.query(sql, inserts, function(error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		}
		res.json(results[0]);
	});
};


//counts the number current cases of food poisoning across all states

function getFPAllStates(req, res) {
	var sql = "SELECT COUNT(instances.sicknessID) as count FROM states JOIN users on states.stateID = users.stateID JOIN instances on users.sicknessID = instances.sicknessID WHERE instances.sicknessID = 4 AND endDate IS NULL";

	pool.query(sql, function(error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		}
		res.json(results[0]);
	});
};

//counts the number of current cases of food poisoning in a specific state

function getFPThisState(req, res) {
	var state = req.params.state
	var sql = "SELECT COUNT(instances.sicknessID) as count FROM states JOIN users on states.stateID = users.stateID JOIN instances on users.sicknessID = instances.sicknessID WHERE instances.sicknessID = 4 AND endDate IS NULL AND states.stateID = ?";
	var inserts = [STATESMAP[state]]
	pool.query(sql, inserts, function(error, results, fields) {
		if (error) {
			res.write(JSON.stringify(error));
			res.end();
		}
		res.json(results[0]);
	});
};

//for testing purposes only

function alertMe() {
	alert("This function was called properly.")
}


/* ECL SECTION

7/20/2021
	- make sure that the pages (app.get('/')) come before the error handlers, otherwise they dont load
7/21/2021
	- removing the ':' from the userID parameter for inserting instances
		https://stackoverflow.com/questions/10398931/how-to-remove-text-from-a-string
	- insert still not working???
		- woah. inserting on the userID + 1? was testing insert on userID3, and nothing happened. but userID 4 now
		has new instances????
			- it's sorting by diagnoses, not userID
	 - inserting was correct, select statement was incorrect. removed the join and currently only selecting from the
	 instances table
7/24/2020
	- update not working. not sure why
	- was putting in params.userID and not thisUser resulting in :3 and not 3 being put into the sql query.
	not sure why there wasn't a sql error though.
8/1/2021
	- unsure of how to interact with the .js file through the jquery files to pull data from the database.



 */
