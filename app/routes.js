console.log('Hello from routes.js');
var express = require('express');
var router = express.Router();
var passport = require('passport');
var hbs = require('hbs');
const async = require('async');

var User = require('../app/models/user.js');
var PageData = require('../app/models/pageData.js');
var Innlegg = require('../app/models/innlegg.js');
var ForesatteKoder = require('../app/models/foresatteKoder.js');

require('./auth/strategy.js')(passport);

var isAuthenticated = function(req, res, next) {
    if (req.user)
        return next();
    else
        return res.render('adminLogin');
}

var adminIsAuthenticated = function(req, res, next) {
    if (req.user){
      if (req.user.admin) {
        return next();
      } else {
        return res.json({
            err: true,
            data: null,
            msg: 'Du er ikke admin.'
        });;
      }
    }
    else
        return res.json({
            err: true,
            data: null,
            msg: 'Du er ikke innlogget, vennligst logg inn på nytt.'
        });;
}

// Register partials
hbs.registerPartials(__dirname + '/../app/views/partials/');

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
    console.log(req.ip + ' ' + req.originalUrl + ' Time: ', new Date());
    next();
});



//===================ROUTES===============================
router.get('/', function(req, res) {
    console.log('USER AUTHENTICATE THING ' + req.user);
    var pageBoxes = {
        "textBox1": {
            data: "empty"
        }
    };
    PageData.findOne({
        'name': 'frontPage'
    }, function(err, page) {
        if (err) {
            console.log(err);
            pageBoxes = {
                "textBox1": {
                    data: err
                }
            }
        } else if (page != null) {
            pageBoxes = page.textBoxes;
        }

        res.render('frontPage', pageBoxes);
    });

});

router.post('/admin/pageData/:id', adminIsAuthenticated, function(req, res) {
    console.log(req.body);
    if (req.user.admin) {
        console.log(req.body.textBoxes);
        var tempPageData = new PageData({
            name: req.body.name,
            textBoxes: req.body.textBoxes
        });
        tempPageData.save(function(err, page) {
            if (err) {
                console.log(err);
                res.json({
                    err: true,
                    data: err,
                    msg: 'Error, most probably the name already exists'
                });
            } else {
                console.log(page);
                res.json({
                    err: null,
                    data: page,
                    msg: 'Page successfully added/edited'
                });
            }
        });
    } else {
        res.json({
            err: true,
            data: "Not admin",
            msg: "not admin"
        });
    }

});

router.post('/admin/innlegg', adminIsAuthenticated, function(req, res) {
    var tempInnlegg = new Innlegg({
        name: req.body.name,
        data: req.body.data
    });
    tempInnlegg.save(function(err, innlegg) {
        if (err) {
            console.log(err);
            res.send({
                err: true,
                data: err,
                msg: 'Error!'
            });
        } else {
            console.log(innlegg);
            res.send({
                err: null,
                data: innlegg,
                msg: 'Innlegg ble lagt til'
            });
        }
    });
});

router.post('/admin/innlegg/:id', adminIsAuthenticated, function(req, res) {
    var tempInnlegg = new Innlegg({
        name: req.body.name,
        data: req.body.data
    });
    tempInnlegg.save(function(err, innlegg) {
        if (err) {
            console.log(err);
            res.send({
                err: true,
                data: err,
                msg: 'Error!'
            });
        } else {
            console.log(innlegg);
            res.send({
                err: null,
                data: innlegg,
                msg: 'Innlegg ble lagt til'
            });
        }
    });
});

//sends the request through our local login/signin strategy, and if successful takes user to homepage, otherwise returns then to signin page
router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/admin',
    failureRedirect: '/admin',
    failureFlash: true
}));


router.post('/signup', passport.authenticate('local-signup', function(req, res) {
    console.log('');
}));

//logs user out of site, deleting them from the session, and returns to homepage
router.get('/logout', function(req, res) {
    console.log(req.logout);
    req.logout();
    req.flash("logged out");
    res.redirect('/');
});

router.get('/innlegg', isAuthenticated, function(req, res) {
    Innlegg.find({}, function(err, data) {
        var innlegg = data;
        if (err) {
            console.log(err);
        }
        res.render('innlegg', {
            list: innlegg
        });
    });
});

router.get('/admin/innlegg',adminIsAuthenticated, function (req, res) {
  Innlegg.find({}).lean().exec(function (err, data) {
    if (err) {
      res.json({
        err: true,
        data: err,
        msg: "There was an error"
      });
    }
    res.json({
      err: null,
      data: data,
      msg: 'brofist'
    });
  });
});
router.get('/admin/:data', isAuthenticated, function (req,res) {
  if (req.user.admin) {
    console.log('hey');
    (req.params.data).find({}).lean().exec(function (err, data) {
      if (err)console.log(err);
      console.log(data);
      res.json({
        err: null,
        data: data,
        msg: 'brofist'
      });
    });

  }else {
    console.log('not admin');
    res.send('not admin bro');
  }
});

router.get('/admin', isAuthenticated, function(req, res) {
            if (req.user.admin) {
                async.parallel({
                        pages: function(cb) {
                            console.log('Skal finne pages');
                            PageData.find({}).lean().exec(function(err, data) {
                                cb(null, JSON.stringify(data));
                            });
                        },
                        innlegg: function(cb) {
                            console.log('Skal finne innlegg');
                            Innlegg.find({}).lean().exec(function(err, data) {
                                cb(null, JSON.stringify(data));
                            });
                        },
                        foresatteKoder: function(cb) {
                            console.log('Skal finne foresattekoder');
                            ForesatteKoder.find({}).lean().exec(function(err, data) {
                                cb(null, JSON.stringify(data));
                            });
                        }},
                        function(err, results) {
                          console.log(results);
                            console.log('Klar til render');
                            res.render('admin', {
                                user: req.user,
                                pages: results.pages,
                                innlegg: results.innlegg,
                                foresatteKoder: results.foresatteKoder
                            });
                        });

                }
                else {
                    res.render('admin', {
                        user: req.user
                    });
                }
            });

        router.get('/:pageName', function(req, res) {

            switch (req.params.pageName) {
                case "innlegg":
                    {

                        break;
                    }
                default:
                    {
                        console.log('AUTHENTICATE ' + req.user);
                        res.render(req.params.pageName, {
                            user: req.user
                        }, function(err, html) {
                            // If page doesn't exist send 404-page
                            if (err) {
                                console.log(err);
                                console.log(req.params.pageName + " Does not exist in view folder! " + new Date());
                                res.render('404', function(err, html) {
                                    res.send(html);
                                });
                            } else {
                                // If page exists send the rendered html
                                res.send(html);
                            }
                        });
                    }
            }

        });


        module.exports = router;
