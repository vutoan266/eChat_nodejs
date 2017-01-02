var express = require('express');
var router = express.Router();
var passport = require('../config-passport');
var isAuthenticated = require('../middleware/passport');
router.get('/logout',isAuthenticated,function(req,res){
  if(req.session.passport.user){
    req.logout();
    req.session.destroy();
    res.jsonp({logout:'success'});
  }else{
    res.jsonp({logout:'fail'});
  }
});
router.post('/signup', function(req, res, next ){
    passport.authenticate('signup', function(err, user, info) {
      if (err) { return next(err) }
      if (!user) { return res.json(info) }
      res.json(user);
    })(req, res, next);
});
router.post('/dangnhap', function(req, res, next) {
  passport.authenticate('login', function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.send(info);
    }
    req.login(user, loginErr => {
      if (loginErr) {
        return next(loginErr);
      }
      return res.send(user);
    });
  })(req, res, next);
});
