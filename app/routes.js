var multer       = require('multer');
var fs           = require('fs');
var mongoose     = require('mongoose');
var bcrypt       = require('bcrypt-nodejs');
var need         = 'data:image/png;base64,';
var ImageModel   = require('../app/models/img');
var CommentModel = require('../app/models/comment');
var User         = require('../app/models/user');
var nodemailer   = require('nodemailer');
var crypto       = require('crypto');
var transporter  = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'camagru.co@gmail.com',
                        pass: 'lolajones'
                    }
                    });
var newImg       = new ImageModel();
var newComment   = new CommentModel();
var newUser      = new User();
var comments     = [];
var image;
var betaimage;
var username;
 
module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // process the login form
    // app.post('/login', do all our passport stuff here);

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    // app.post('/signup', do all our passport stuff here);

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/login', // redirect to the login section if successful
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // GOOGLE ROUTES =======================
    // =====================================
    // send to google to do the authentication
    // profile gets us their basic information including their name
    // email gets their emails
    app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
            passport.authenticate('google', {
                    successRedirect : '/profile',
                    failureRedirect : '/'
            }));
    app.get('/api/me',
            passport.authenticate('bearer', { session: false }),
            function(req, res) {
                res.json(req.user);
    });

    app.get('/settings/:id', function(req, res) {
        var id = req.params.id;
        User.findOne({'local.verifyNumber' : id}, { findAndModify: false}).exec(function(err, data) {
            if (data) {
                name = data.local.email;
            }
            else {
                console.log("Error: " + err);
            }
            doSomethingElse(data);
        });
        function doSomethingElse(name) {
            var username = name.local.email;
            String.prototype.hashCode = function() {
                                        var hash = 0, i, chr;
                                        if (this.length === 0) return hash;
                                        for (i = 0; i < this.length; i++) {
                                            chr   = this.charCodeAt(i);
                                            hash  = ((hash << 5) - hash) + chr;
                                            hash |= 0; // Convert to 32bit integer
                                        }
                                        return hash;
                                    };
            var address = username.hashCode();
            console.log(address);
            if (address == id) {
                console.log("Success");
                res.render('account.ejs', { message: req.flash('accountMessage') });
            }
            else {
                res.redirect('/profile');
            }
        }
    })

    app.get('/post', isLoggedIn, (req, res) => {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    app.get('/account', isLoggedIn, function(req, res) {
        var email = req.user.local.email;
        String.prototype.hashCode = function() {
                                        var hash = 0, i, chr;
                                        if (this.length === 0) return hash;
                                        for (i = 0; i < this.length; i++) {
                                            chr   = this.charCodeAt(i);
                                            hash  = ((hash << 5) - hash) + chr;
                                            hash |= 0; // Convert to 32bit integer
                                        }
                                        return hash;
                                    };
        var address = email.hashCode();
        var mailOptions = {
            from: 'noreply@gmail.com',
            to: email,
            subject: 'Account Changes in Camagru2.0',
            text: 'To Change Your Account Settings, Please Follow The Link Below: http://localhost:3000/settings/' + address
          };

        transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log("Error with E-mail" + error);
        } else {
            console.log('Email sent: ' + info.response);
        }
        });
        User.findOneAndUpdate({'local.email' : email}, {'local.verifyNumber' : address}).exec(function(err, data) {
            if (data) {
                console.log("Verify Code Saved");
            }
            else {
                console.log("Error Saving Verify Code: " + err);
                res.redirect('/profile');
            }
        });
        req.logout();
        res.redirect('/login');
    });

    app.get('/verify/:id', function(req, res) {
        var id = req.params.id;
        var username;
        User.findOne({'local.verifyNumber' : id}, { findAndModify: false}).exec(function(err, data) {
            if (data) {
                name = data.local.email;
            }
            else {
                console.log("Error: " + err);
            }
            doSomethingElse(data);
        });
        function doSomethingElse(name) {
            //console.log(name.local.email);
            username = name.local.email;
            String.prototype.hashCode = function() {
                var hash = 0, i, chr;
                if (this.length === 0) return hash;
                for (i = 0; i < this.length; i++) {
                    chr   = this.charCodeAt(i);
                    hash  = ((hash << 5) - hash) + chr;
                    hash |= 0; // Convert to 32bit integer
                }
                return hash;
            };
            var address = username.hashCode();
            if (address == id) {
                User.findOneAndUpdate({'local.email': username}, {'local.active' : 1}).exec(function(err, data) {
                if (data)
                console.log("Success");
                else
                console.log("Error: " + err);
                res.redirect('/login');
                })
            }
            else {
                res.redirect('/login');
            }
        };
    });

    app.post('/change', function(req, res) {
        if (!(isEmptyObject(req.body.current_email))) {
            var old_username = req.body.current_email
        }
        if (!(isEmptyObject(req.body.new_email))) {
            var new_username = req.body.new_email;
        }
        if (!(isEmptyObject(req.body.verify_password) && isEmptyObject(req.body.new_password))) {
            if (req.body.verify_password == req.body.new_password) {
                var new_password = req.body.new_password;
            }
            else {
                console.log("Passwords Don't Match");
                res.render('account.ejs', { message: req.flash('accountMessage') });
            }
        }
        var strongRegex = new RegExp("^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z].*[a-z].*[a-z]).{8,}$");
        if (strongRegex.test(new_password)) {
            User.update({'local.email': old_username}, {'local.email': new_username, 'local.password': newUser.generateHash(new_password)}).exec(function(err, data) {
                                            if (data)
                                                console.log("Updated");
                                            else
                                                console.log("Error: " + err);
            });
            res.redirect('/profile');
        }
        else {
            res.render('account.ejs', { message: req.flash('Password must contain at least 1 lowercase and 1 uppercase alphabetical character, 1 numeric character, 1 special character that is of this selection, !@#\$%\^&, and be 8 characters or longer') });
        }
       
    })

    app.get('/gallery/:id', isLoggedIn, function(req, res) {
        var id = req.params.id;
        CommentModel.find({}).exec(function(err, results) {
            if (err) {
                console.log("Error: " + err);
            }
            else {
                for (i = 0; i < results.length; i++) {
                    comments[i] = results[i];
                }
                console.log(comments);
            }
        })
        ImageModel.find({}).exec(function(err, data) {
            if (err) {
                console.log("Error: " + err);
            }
            else {
                res.render('gallery.ejs', {
                    camagru: data,
                    comments: comments,
                    id: id
                });
            }
        })
    });

    app.post('/delete/:_id', function(req, res) {
        var id = req.params._id;
        console.log(id);
        ImageModel.findOneAndRemove({ _id: id}).exec(function(err, data) {
            if (data) {
                console.log("Deleted");
            } else {
                console.log(err);
            }
            res.redirect('/gallery/1');
        })
    });

    app.get('/forgot', function(req, res) {
        res.render('forgot.ejs');
    })
    
    app.post('/forgetful', function(req, res) {
        console.log(req.body.email);
        var id = req.body.email;
        User.find({'local.email' : id}).exec(function(err, data) {
            if (data) {
                String.prototype.hashCode = function() {
                    var hash = 0, i, chr;
                    if (this.length === 0) return hash;
                    for (i = 0; i < this.length; i++) {
                        chr   = this.charCodeAt(i);
                        hash  = ((hash << 5) - hash) + chr;
                        hash |= 0; // Convert to 32bit integer
                    }
                    return hash;
                };
                var address = id.hashCode();
                var mailOptions = {
                    from: 'noreply@gmail.com',
                    to: id,
                    subject: 'Forgot Password?',
                    text: 'Someone asked for a request to change your password. If this was not you ignore this email, otherwise please follow the link to change your password: http://localhost:3000/password/' + address
                  };
        
                transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log("Error with E-mail" + error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
                });
            }
            else
                console.log("Error: " + err);
        })
        res.redirect('/');
    });

    app.get('/password/:_id', function(req, res) {
        User.findOne({'local.verifyNumber' : req.params._id}).exec(function(err, data) {
            if (data) {
                res.render('change_password.ejs', {
                    user: data.local
                });
            }
            else
                console.log("Error:" + err);
        })
    });

    app.post('/newpassword', function(req, res) {
        User.findOneAndUpdate({'local.email' : req.body.email}, {'local.password' : newUser.generateHash(req.body.password)}).exec(function(err, data) {
            if (data) {
                console.log("Success with Forgotten Password");
            }
            else {
                console.log("Error: " + err);
            }

        });
        res.redirect('/login');
    })

    app.post('/comment/:_id', function(req, res) {
        if (isEmptyObject(req.body.comment)) {
            console.log("Please Input Text");
        }
        else {
            newComment._id             = new mongoose.Types.ObjectId();
            newComment.comment.comment = req.body.comment;
            newComment.comment.imageid = req.params._id;
            if (isEmptyObject(req.user.google.name)) {
                username = req.user.local.email;
            }
            else {
                username = req.user.google.name;
                gmail = req.user.google.email;
                var mailOptions = {
                    from: 'noreply@gmail.com',
                    to: email,
                    subject: 'Someone Commented on Your Photo',
                    text: 'To Change Your Account Settings, Please Follow The Link Below: http://localhost:3000/settings/' + address
                  };
        
                transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log("Error with E-mail" + error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
                });
            }
            newComment.comment.username = username;
            newComment.save(function(err) {
                if (err) console.log(err);
            })

        }
        res.redirect('/gallery/1');
    })

    app.post('/like/:_id', isLoggedIn, function(req, res) {
        var id = req.params._id;
        console.log(id);
        ImageModel.findOneAndUpdate({ _id: id}, {$inc: {'img.like' : 1}}).exec(function(err, data) {
            if (data) {
                console.log("Success");
            } else {
                console.log(err);
            }
            res.redirect('/gallery/1');
        })
    });

    app.post('/post', isLoggedIn, function(req, res) {
        if (isEmptyObject(req.body.web_cap)) {
            betaimage = base64_encode(req.files.insert.path);
            image = need + betaimage;
        }
        else {
            image = req.body.web_cap;
        }
        if (image.length < 500) {
            console.log('No Image');
            res.redirect('/profile');
        }
        if (isEmptyObject(req.user.google.name)) {
            username = req.user.local.email;
        }
        else {
            username = req.user.google.name;
        }
        console.log(username);
        newImg.img.data = image;
        newImg.img.username = username;
        newImg.img.like = '0';
        newImg.save(function(err) {
            if (err) throw err;
        });
        res.redirect('/profile');
    })
};

function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer.from(bitmap).toString('base64');
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

function isEmptyObject(obj) {
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
}