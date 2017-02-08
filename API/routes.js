console.log('Hello from routes.js');
var express = require('express');
var router = express.Router();
var passport = require('passport');
var hbs = require('hbs');
const async = require('async');
var mongoose = require("mongoose");
var emb = require("../customDeps/express-mongo-busboy.js")({mongoose:mongoose});
var Grid = require('gridfs-stream');
var conf = require('../config.js')
var gfs = Grid(mongoose.connection, mongoose.mongo);


var User = require('../app/models/user.js');
var PageData = require('../app/models/pageData.js');
var Innlegg = require('../app/models/innlegg.js');
var ForesatteKoder = require('../app/models/foresatteKoder.js');
var Bilde = require('../app/models/bilde.js');
var Album = require('../app/models/album.js');

require('./auth/strategy.js')(passport);

hbs.registerHelper('breaklines', function(text) {
    text = hbs.Utils.escapeExpression(text);
    text = text.replace(/(\r\n|\n|\r)/gm, '<br>');
    return new hbs.SafeString(text);
});
// Register partials
hbs.registerPartials(__dirname + '/../app/views/partials/');

var isAdminAuthenticated = function(req, res, next) {
    if (req.user){
      if (req.user.admin) {
        return next();
      } else {
        return res.render('adminLogin');
      }
    } else {
      return res.render('adminLogin');
    }
}
var adminIsAuthenticated = function(req, res, next) {
    if (req.user) {
        if (req.user.admin) {
            return next();
        } else {
            return res.json({
                err: true,
                data: null,
                msg: 'Du er ikke admin.'
            });;
        }
    } else
        return res.json({
            err: true,
            data: null,
            msg: 'Du er ikke innlogget, vennligst logg inn på nytt.'
        });;
}
var adminOrForeldre = function(req, res, next) {
    if (req.user) {
        if (req.user.admin || req.user.foreldre) {
            return next();
        } else {
            return res.json({
                err: true,
                data: null,
                msg: 'Du er ikke autorisert til å se dette innholdet.'
            });;
        }
    } else
        return res.json({
            err: true,
            data: null,
            msg: 'Du er ikke innlogget, vennligst logg inn på nytt.'
        });;
}

router.use(function timeLog(req, res, next) {
    console.log(req.ip + ' ' + req.originalUrl + ' Time: ', new Date());
    next();
});

//===================ROUTES===============================

// ============= Different sites with each mongodb data calls
router.get('/', function(req, res) {
    var pageBoxes = {
        "textBox1": {
            data: "empty"
        }
    };
    PageData.findOne({
        'name': 'index'
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

        res.render('index', pageBoxes);
    });

});
router.get('/om-oss', function(req, res) {
    var pageBoxes = {
        "textBox1": {
            data: "empty"
        }
    };
    PageData.findOne({
        'name': 'om-oss'
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

        res.render('om-oss', pageBoxes);
    });

});
router.get('/sok-barnehageplass', function(req, res) {
    var pageBoxes = {
        "textBox1": {
            data: "empty"
        }
    };
    PageData.findOne({
        'name': 'sok-barnehageplass'
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

        res.render('sok-barnehageplass', pageBoxes);
    });

});
router.get('/foreldreportal', function (req, res) {
  if (req.user) {
    if (req.user.admin || req.user.foreldre) {
      res.render('foreldreportal', {
        user: req.user
      }, function(err, html) {
        // If page doesn't exist send 404-page
        if (err) {
          console.log(err);
          console.log("foreldreportal" + " Does not exist in view folder! " + new Date());
          res.render('404', function(err, html) {
            res.send(html);
          });
        } else {
          // If page exists send the rendered html
          res.send(html);
        }
      });
    } else {
      res.render('foreldreportal', {msg:"Du er ikke autorisert, logg inn på nytt."}, function(err, html) {
          // If page doesn't exist send 404-page
          if (err) {
              console.log(err);
              console.log("foreldreportal" + " Does not exist in view folder! " + new Date());
              res.render('404', function(err, html) {
                  res.send(html);
              });
          } else {
              // If page exists send the rendered html
              res.send(html);
          }
      });
    }
  } else {
    res.render('foreldreportal', {msg:"Vennligst logg inn"}, function(err, html) {
        // If page doesn't exist send 404-page
        if (err) {
            console.log(err);
            console.log("foreldreportal" + " Does not exist in view folder! " + new Date());
            res.render('404', function(err, html) {
                res.send(html);
            });
        } else {
            // If page exists send the rendered html
            res.send(html);
        }
    });
  }
});
router.get('/innlegg', function(req, res) {
    Innlegg.find({}).sort({added: 'desc'}).lean().exec(function(err, data) {
        var innlegg = data;
        if (err) {
            console.log(err);
        }
        res.render('innlegg', {
            list: innlegg
        });
    });
});
router.get('/admin', isAdminAuthenticated, function(req, res) {
        async.parallel({
                pages: function(cb) {
                    PageData.find({}).lean().exec(function(err, data) {
                        cb(null, JSON.stringify(data));
                    });
                }
            },
            function(err, results) {
                res.render('admin', {
                    user: req.user,
                    pages: results.pages,
                });
            });
});

// ================== Admin edit pagedata info stuff
router.post('/admin/pageData', adminIsAuthenticated, function(req, res) {
    console.log(req.body);
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
});
router.put('/admin/pagedata/:id', adminIsAuthenticated, function(req, res) {
        console.log('Body: '+req.body);
        PageData.update({_id:req.params.id}, {"textBoxes":req.body} ,function(err, data) {
            if (err) {
                console.log(err);
                res.json({
                    err: true,
                    data: err,
                    msg: 'Error, mest sannsynlig er det feil navn på nettsiden'
                });
            } else {
                res.json({
                    err: null,
                    data: data,
                    msg: 'Textbokser er endret'
                });
            }
        });
});
router.get('/admin/pagedata/:navn', adminIsAuthenticated, function(req, res) {
  PageData.find({name:req.params.navn}, function (err,data) {
    if (err) {
      console.log(err);
      res.json({
        err:true,
        data:err,
        msg:'Kunne ikke finne side med navn: '+req.params.navn
      });
    } else {
      res.json({
        err:null,
        data:data,
        msg:null
      });
    }
  });
});

// ==================== album and picture gallery related stuff
router.get('/admin/album', adminOrForeldre, function(req, res) {
    Album.find({}).sort({added: 'desc'}).lean().exec(function(err, data) {
        if (err) {
            res.json({
                err: true,
                data: err,
                msg: "Det oppstod en feil ved å finne album."
            });
        }
        res.json({
            err: null,
            data: data,
            msg: data.length + ' album funnet.'
        });
    });
});
router.get('/admin/album/:id', adminOrForeldre, function(req, res) {
    Album.findById(req.params.id).lean().exec(function(err, data) {
        if (err) {
            res.json({
                err: true,
                data: err,
                msg: "Det oppstod en feil ved å finne albumet."
            });
        }
        res.json({
            err: null,
            data: data,
            msg: null
        });
    });
});
router.post('/admin/album', adminIsAuthenticated, emb, function(req, res) {
    console.log('Body',req.body);
    var tempAlbum = new Album({
      name:req.body.name,
      description:req.body.description,
      imgs:req.body.files,
    });
    tempAlbum.save(function (err, album) {
      if (err) {
        console.log(err);
        res.json({
          err:true,
          data:err,
          msg:'Det oppstod en feil ved opprettelse av album, vennligst prøv på nytt'
        });
      } else {
        console.log(album.name,'Has been created.');
        res.json({
          err: null,
          data:album,
          msg:'Album '+album.name+' er opprettet.'
        });
      }
    });
});
router.put('/admin/album/:id', adminIsAuthenticated, emb, function(req, res) {
    console.log('Body',req.body);
    var tempAlbum = {
      _id:req.params.id,
      name:req.body.name,
      description:req.body.description,
      imgs:req.body.files,
    };
    Album.findOne({_id:req.params.id}, function (err, album) {
      if (err) {
        console.log(err);
        res.json({
          err:true,
          data:err,
          msg:'Det oppstod en feil ved endring av album med navn '+req.body.name
        });
      } else {
        album.name = tempAlbum.name;
        album.description = tempAlbum.description;
        var imgsArr = JSON.parse(album.imgs);
        imgsArr.push(tempAlbum.imgs);
        album.imgs = imgsArr;

        album.save(function (err, album) {
          if (err) {
            console.log(err);
            res.json({
              err:true,
              data:err,
              msg:'Det oppstod en feil ved endring av album med navn '+req.body.name
            });
          } else {
            console.log('Albumet: '+album.name+' ble endret.');
            res.json({
              err:null,
              data:album,
              msg:'Albumet: '+album.name+' ble endret.'
            });
          }
        });
      }
    });
    tempAlbum.save(function (err, album) {
      if (err) {
        console.log(err);
        res.json({
          err:true,
          data:err,
          msg:'Det oppstod en feil ved opprettelse av album, vennligst prøv på nytt'
        });
      } else {
        console.log(album.name,'Has been created.');
        res.json({
          err: null,
          data:album,
          msg:'Album '+album.name+' er opprettet.'
        });
      }
    });
});
router.delete('/admin/album/:id', adminIsAuthenticated, function(req, res) {
    Album.findByIdAndRemove(req.params.id, function(err, data) {
        if (err) {
            res.json({
                err: true,
                data: err,
                msg: "Det oppstod en feil ved å finne albumet."
            });
        }
        res.json({
            err: null,
            data: data,
            msg: "Album med navn: " + data.name + " har blitt slettet."
        });
    });
});
router.get('/admin/bilde/:id', adminOrForeldre, function (req,res) {
  var bufs = [];
  gfs.createReadStream({_id:req.params.id})
  .on('error', function (err) {
    res.send(err);
  })
  .on('data', function(chunk) {
    bufs.push(chunk);
  })
  .on('end', function () {
    var fbuf = Buffer.concat(bufs);
    var base64 = fbuf.toString('base64');
    // res.send(base64);
    res.send(base64);
  });
});

// ================== LOGIN related api calls
//sends the request through our local login/signin strategy, and if successful takes user to homepage, otherwise returns then to signin page
router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/admin',
    failureRedirect: '/admin',
    failureFlash: true
}));
router.post('/foreldreportalLogin', passport.authenticate('local-login', {
    successRedirect: '/foreldreportal',
    failureRedirect: '/foreldreportal',
    failureFlash: true
}));
router.post('/signup', passport.authenticate('local-signup', function(req, res) {
    res.send({
      err: null,
      data: req.user,
      msg: "User registered"
    });
    console.log('Registered: ', req.user);
}));
//logs user out of site, deleting them from the session, and returns to homepage
router.get('/logout', function(req, res) {
    console.log(req.logout);
    req.logout();
    req.flash("logged out");
    res.redirect('/');
});

// =============================== Admin related api calls
router.post('/admin/innlegg', adminIsAuthenticated, function(req, res) {
    console.log(req.body);
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
router.get('/admin/innlegg', adminIsAuthenticated, function(req, res) {
    Innlegg.find({}).sort({added: 'desc'}).lean().exec(function(err, data) {
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
            msg: data.length + ' Innlegg ble funnet'
        });
    });
});
router.put('/admin/innlegg/:id', adminIsAuthenticated, function(req, res) {
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
router.delete('/admin/innlegg/:id', adminIsAuthenticated, function(req, res) {
    console.log("remove " + req.params.id);
    Innlegg.findByIdAndRemove(req.params.id, function(err, data) {
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
            msg: 'Innlegg med name: ' + data.name + ' er fjernet.'
        });
    });
});

router.get('/admin/:data', isAdminAuthenticated, function(req, res) {
        (req.params.data).find({}).lean().exec(function(err, data) {
            if (err) console.log(err);
            console.log(data);
            res.json({
                err: null,
                data: data,
                msg: null
            });
        });
});

// === Remaining sites, that may lay in views folder, if page does not exist, send 404-page ============
router.get('/:pageName', function(req, res) {

    switch (req.params.pageName) {
        case "innlegg":
            {

                break;
            }
        default:
            {
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
