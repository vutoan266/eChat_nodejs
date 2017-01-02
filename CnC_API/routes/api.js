var express = require('express');
var router = express.Router();
var passport = require('../config-passport')
var isAuthenticated = require('../middleware/passport');

router.get('/auth/facebook',
  passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.json({statusCode:200,message:"successfullly"});
  });

module.exports = router;
