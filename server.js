var express      = require('express');
var app          = express();
var port         = process.env.PORT || 3000;
var mongoose     = require('mongoose');
var passport     = require('passport');
var flash        = require('connect-flash');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var multiparty   = require('connect-multiparty');
var configDB     = require('./config/database.js');
var db           = mongoose.connection;

mongoose.connect(configDB.url, { useNewUrlParser: true });

require('./config/passport')(passport);

app.use(multiparty());
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json()); // get information from html forms
app.use('/public', express.static(__dirname + '/public'));
app.use(express.static('files'));

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: 'ilovethiscareerfield',            
    resave: true,
    saveUninitialized: true
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

app.listen(port);
console.log('Now listening to port ' + port);