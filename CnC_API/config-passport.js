var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var User = require('./model/User');
var bCrypt = require('bcrypt-nodejs');
var nodemailer = require('nodemailer');
passport.use(new Strategy({
	clientID: "1761608537424435",
	clientSecret: "1563abf8c9937105dfa336644d8ebdca",
  callbackURL: "http://datewithme.nhutuit.com/auth/facebook/callback",
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({ idFace: profile.id }, function(err, user) {
      if(err) {
        console.log(err);  // handle errors!
      }
      if (!err && user !== null) {
        done(null, user);
      } else {
        user = new User({
          idFace: profile.id,
          name: profile.displayName,
          images:"https://graph.facebook.com/" + profile.username + "/picture" + "?width=200&height=200" + "&access_token=" + accessToken,
          sex:profile.gender,
          created: Date.now()
        });
        user.save(function(err) {
          if(err) {
            console.log(err);  // handle errors!
          } else {
            done(null, user);
          }
        });
      }
    });
  }
));
// passport.use('login', new LocalStrategy({
//     passReqToCallback : true
//   },
//   function(req,username, password, done) {
//     User.findOne({ 'username' :  username },
//       function(err, user) {
//         var isValidPassword = function(user, password){
//           return bCrypt.compareSync(password, user.password);
//         }
//         if (err)
//           return done(err);
//         if (!user){
//           return done(null, false,
//                 {'message': 'User Not found.','fail_user':true});
//         }
//         if (!isValidPassword(user, password)){
//           return done(null, false,
//               {'message': 'Invalid Password',password:false});
//         }
//         if(user.config === false){
//           return done(null, false,
//               {'message': 'User config false',config:false});
//         }
//         done(null, user);
//       }
//     );
// }));
// passport.use('signup', new LocalStrategy({
//     passReqToCallback : true
//   },
//   function(req,username, password, done) {
//     findOrCreateUser = function(){
//       User.findOne(
//           {'username':username}
//        ,function(err, user) {
//         if (user) {
//           return done(null,null,{message:'Tai khoan nay da ton tai',require:true});
//         } else {
//           var createHash = function(password){
//            return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
//           }
//           var hashConfig = function(username) {
//             return bCrypt.hashSync(username, bCrypt.genSaltSync(1), null);
//           }
//           var config = hashConfig(username);
//           var newUser = new User();
//           newUser.username = username;
//           newUser.password = createHash(password);
//           newUser.configuser = config;
//           if(req.body.sex == 'nam'){
//             newUser.images = '/images/nam.png'
//           }else if(req.body.sex == 'nu'){
//             newUser.images = '/images/nu.png'
//           }
//           newUser.email = req.body.email;
//           newUser.name = req.body.name;
//           newUser.save(function(err) {
//             if (err){
//               console.log('Error in Saving user: '+err);
//               throw err;
//             }
//             var domain = req.headers.host || 'nhutuit.com';
//             var mailOptions = {
//                 from: 'DateWithMe <tranvannhut4495@gmail.com>',
//                 to: req.body.email,
//                 subject: 'Email kích hoạt tài khoản',
//                 html: '<strong>Chúc mừng ' + req.body.name +' đã tham gia DateWithMe<ul><li>Tài khoản: '+req.body.username+'</li><li>Mật khẩu: ******</li></ul><br /><p>Mã kích hoạt tài khoản :&nbsp;' + config // Nội dung dạng html
//             };
//             var transporter = nodemailer.createTransport({
//                 service: 'Gmail',
//                 auth: {
//                     user: 'tranvannhut4495@gmail.com',
//                     pass: 'nhutnhut'
//                 }
//             });
//             transporter.sendMail(mailOptions, function(error, info) {
//                 if (error) {
//                     console.log(error);
//                 }
//             });
//             return done(null, newUser);
//           });
//         }
//       });
//     };
//     process.nextTick(findOrCreateUser);
// }));
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user){
      if(!err) done(null, user);
      else done(err, null);
    });
});
module.exports = passport;
