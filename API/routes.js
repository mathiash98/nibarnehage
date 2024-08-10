console.log('Hello from routes.js');
var express = require('express');
var router = express.Router();
var passport = require('passport');
var hbs = require('hbs');
const async = require('async');
var mongoose = require("mongoose");
var embImg = require("../customDeps/embImg.js")({mongoose:mongoose});
var embFile = require("../customDeps/embFile.js")({mongoose:mongoose});
var Grid = require('gridfs-stream');
var conf = require('../config.js');
var gfs = Grid(mongoose.connection, mongoose.mongo);


var User = require('../app/models/user.js');
var PageData = require('../app/models/pageData.js');
var Innlegg = require('../app/models/innlegg.js');
var FileCategory = require('../app/models/fileCategory.js');
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
var adminIsAuthenticatedReturnJson = function(req, res, next) {
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
router.get('/planer', function(req, res) {
  gfs.files.find({"metadata.category" : 'plan'}, { _id: 1, filename: 1, uploadDate: 1 }).toArray(function (err, files) {
    if (err) {
      console.log(err);
      res.render('planer', {
        files:[{"filename":"error"}]
      });
    } else {
      res.render('planer', {
        files:files.reverse()
      });
    }
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
// ==================== Admin file related stuff
// TODO add function for storing files to gridfs, add some metadata
// When asking for files: Look through gridfs files and output files with metadata tag: plan

router.get('/admin/planer', function (req, res) {
  gfs.files.find({"metadata.category" : 'plan'}, { _id: 1, filename: 1, uploadDate: 1 }).toArray(function (err, files) {
    if (err) {
      console.log(err);
      res.json({
        err: true,
        data: err,
        msg: "Det oppstod en feil ved henting av filer"
      });
    } else {
      if (files.length != 0) {
        res.json({
          err: null,
          data: files,
          msg: "Fant "+files.length+" filer."
        });
      } else {
        res.json({
          err: true,
          data: [],
          msg: "Fant 0 filer."
        });
      }
    }
  });

});
router.get('/planer/:fileid', function (req, res) {
  var _id = mongoose.Types.ObjectId(req.params.fileid);
  gfs.findOne({ _id: _id}, function (err, file) {
	  if (file && file.metadata) {
	    // 2024-06-27 Added if statement to prevent website from crashing when fetching a file without metadata
	    res.writeHead(200, {'Content-Type': file.metadata.mimetype});
	  }

    var readstream = gfs.createReadStream({_id:_id});
    req.on('error', function(err) {
      res.send(500, err);
    });
    readstream.on('error', function (err) {
      res.send(500, err);
    });
    readstream.pipe(res);
  });

});

router.delete('/admin/planer/:fileid', adminIsAuthenticatedReturnJson, function (req, res) {
  console.log("Skal slette",req.params.fileid);
  var _id = mongoose.Types.ObjectId(req.params.fileid);
  gfs.files.remove({_id: _id}, function (err) {
    if (err) {
        console.log(err);
        res.json({
            err: true,
            data: err,
            msg: 'Det oppstod en feil ved sletting av fil med id: ' + req.params.fileid
        });
    } else {
      console.log(req.params.fileid + " er slettet.");
      res.json({
          err: null,
          data: null,
          msg: 'Fil med id: ' + req.params.fileid + " ble slettet."
      });
    }
     });

});
router.post('/admin/planer', adminIsAuthenticatedReturnJson, embFile, function (req, res) {
  console.log(req.body.files);
  res.json({
    err: null,
    data: req.body.files,
    msg: req.body.files.length + " Fil(er) ble lastet opp til planer"
  });
});
// ================== Admin edit pagedata info stuff
router.post('/admin/pageData', adminIsAuthenticatedReturnJson, function(req, res) {
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
router.put('/admin/pagedata/:id', adminIsAuthenticatedReturnJson, function(req, res) {
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
router.get('/admin/pagedata/:navn', adminIsAuthenticatedReturnJson, function(req, res) {
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
        } else {
          res.json({
            err: null,
            data: data,
            msg: null
          });
        }
    });
});
router.post('/admin/album', adminIsAuthenticatedReturnJson, embImg, function(req, res) {
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
router.put('/admin/album/:id', adminIsAuthenticatedReturnJson, embImg, function(req, res) {
    var tempAlbum = {
      _id:req.params.id,
      name:req.body.name,
      description:req.body.description,
    };
    if (req.body.files != '') {
      tempAlbum.imgs = req.body.files;
    }
    Album.findById(req.params.id, function (err, album) {
      if (err) {
        console.log(err);
        res.json({
          err:true,
          data:err,
          msg:'Det oppstod en feil ved endring av album med navn '+req.body.name
        });
      } else {
        tmpAlbum = album;
        tmpAlbum.name = tempAlbum.name;
        tmpAlbum.description = tempAlbum.description;
        tmpAlbum.edited = new Date();
        if (req.body.files != '') {
          // var imgsArr = JSON.parse(album.imgs);
          var imgsArr = tmpAlbum.imgs;
          console.log(imgsArr);
          Array.prototype.push.apply(imgsArr, tempAlbum.imgs);
          // for (var i = 0; i < tempAlbum.length; i++) {
          //   console.log(tempAlbum[i], i);
          //   album.imgs.push(tempAlbum[i]);
          // }
          console.log(imgsArr);
          tmpAlbum.imgs = imgsArr;
        }
        console.log(album);
        Album.update({_id:tmpAlbum._id}, tmpAlbum, function (err, info) {
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
              data:tmpAlbum._id,
              msg:'Albumet: '+album.name+' ble endret.'
            });
          }
        });
      }
    });
});
router.delete('/admin/album/:id', adminIsAuthenticatedReturnJson, function(req, res) {
    Album.findByIdAndRemove(req.params.id, function(err, data) {
        if (err) {
            res.json({
                err: true,
                data: err,
                msg: "Det oppstod en feil ved å finne albumet."
            });
        }
        async.each(data.imgs, function(img, cb) {
          var id = img._id;
          console.log("Typeof id " + typeof id);
          gfs.files.remove({_id: img._id}, function (err) {
          // gfs.files.remove({_id: img._id}, function (err) {
            if (err) console.log(err);
            console.log("Slettet bilde",img._id);
            cb();
          });
        }, function (err) {
          console.log("done");
          if (err) {
            console.log(err);
            res.json({
                err: true,
                data: err,
                msg: "Det oppstod en feil"
            });
          } else {
            res.json({
              err: null,
              data: null,
              msg: "Album med navn: " + data.name + " har blitt slettet."
            });
          }
        });


    });
});
router.get('/admin/bilde/:id', adminOrForeldre, function (req,res) {
  gfs.findOne({ _id: req.params.id}, function (err, file) {
    res.writeHead(200, {'Content-Type': file.metadata.mimetype});
    var readstream = gfs.createReadStream({_id:req.params.id});
    req.on('error', function(err) {
      res.send(500, err);
    });
    readstream.on('error', function (err) {
      res.send(500, err);
    });
    readstream.pipe(res);
  });
});
router.delete('/admin/bilde/:albumid', adminIsAuthenticatedReturnJson, function (req,res) {
  var deleteImgsArr = req.body;
  if (deleteImgsArr == '') {
    res.json({
      err:true,
      data:req.params.albumid,
      msg:'Du må markere bilder.'
    });
  } else {
    Album.findById(req.params.albumid, function (err, album) {
      if (err) {
        console.log(err);
        res.json({
          err:true,
          data:err,
          msg:'Det oppstod en feil ved sletting av bilder i album: '+req.body.name
        });
      } else {
        var tempAlbum = album;
        tempAlbum.edited = new Date();
        if (req.body != '') {
          // var imgsArr = JSON.parse(album.imgs);
          // TODO replace with async.parrallell
          async.each(deleteImgsArr, function (imgId, cb) {
            var index = tempAlbum.imgs.map(function(x) {return String(x._id);}).indexOf(imgId);
            if (index > -1) {
              tempAlbum.imgs.splice(index,1);
            }
            var _id = mongoose.Types.ObjectId(imgId);
            gfs.files.remove({_id: _id}, function (err) {
              if (err) {
                console.log(err);
              } else {
                console.log(imgId + " er slettet.");
                cb();
              }
            });
          }, function (err) {
            if (err) {
              console.log(err);
            } else {
              console.log(deleteImgsArr.length + " bilder ble slettet.");
            }
          });

        }
        Album.update({_id:tempAlbum._id}, tempAlbum, function (err, info) {
          if (err) {
            console.log(err);
            res.json({
              err:true,
              data:err,
              msg:'Det oppstod en feil ved sletting av bilder i album med navn '+req.body.name
            });
          } else {
            console.log('Albumet: '+album.name+' ble endret.');
            res.json({
              err:null,
              data:tempAlbum._id,
              msg:'Det ble slettet '+deleteImgsArr.length+' bilder i: '+album.name
            });
          }
        });
      }
    });
  }
});

// ================== LOGIN related api calls
router.get('/admin/user', adminIsAuthenticatedReturnJson, function (req, res) {
  User.find({}).lean().exec(function (err, data) {
    if (err) {
      console.log(err);
      res.json({
        err:true,
        data:err,
        msg:"Det oppstod en feil ved henting av brukere"
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
router.put('/admin/user/:id', adminIsAuthenticatedReturnJson, function (req, res) {
    User.findById(req.params.id, function (err, data) {
      tmpUser = data;
      tmpUser.comparePass(req.body.currentPass, function (err, isMatch) {
        if (err) {
          console.log(err);
          res.json({
            err:true,
            data:err,
            msg:"Det oppstod en feil, vennligst prøv i gjen."
          });
        } else {
          if(!isMatch) {
          res.json({
            err:true,
            data:null,
            msg:"Nåværende passord er feil, vennligst prøv på nytt."
          });
        } else {
          if (req.body.currentPass == req.body.newPass) {
            res.json({
              err:true,
              data:null,
              msg:"Passord er allerede det du vil endre til."
            });
          } else {
            tmpUser.password = req.body.newPass;
            tmpUser.save(function (err, newUser) {
              if (err) {
                res.json({
                  err:true,
                  data:err,
                  msg: "Det forekom en feil ved endring av passord."
                });
              }
              res.json({
                err:null,
                data:newUser,
                msg: "Passord til " + newUser.username + " er endret!"
              });
            });
          }
        }
      }
      });

    });


});
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
router.post('/admin/innlegg', adminIsAuthenticatedReturnJson, function(req, res) {
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
router.get('/admin/innlegg', adminIsAuthenticatedReturnJson, function(req, res) {
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
router.put('/admin/innlegg/:id', adminIsAuthenticatedReturnJson, function(req, res) {
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
router.delete('/admin/innlegg/:id', adminIsAuthenticatedReturnJson, function(req, res) {
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
