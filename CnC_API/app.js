var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');

var User = require('./model/User');
var Place = require('./model/Place');
var Room = require('./model/Room');
var Message = require('./model/Message');
var Vote = require('./model/Vote');

var app = express();
var socket = require('socket.io');
var server = app.listen(3000);
var io = socket.listen(server);
console.log("test");

io.on('connection', function(socket){
    socket.on('check_login_fb',function(userObject){
      console.log("login fb");
      User.findOne({ id_fb: userObject.id }, function(err, user) {
        if(err) {
          console.log(err);  // handle errors!
        }
        if (!err && user !== null) {
          done_login(userObject.name, userObject.id);
        } else {
          user = new User({
            id_fb: userObject.id,
            name: userObject.name,
            birthday: userObject.birthday,
            gender: userObject.gender,
            avatar: userObject.avatar,
            email: userObject.email,
            created: Date.now()
          });
          user.save(function(err) {
            if(err) {
              console.log(err);  // handle errors!
            } else {
              done_login(userObject.name, userObject.id);
            }
          });
        }
      });
    });
    function done_login(name, avatar){
      socket.username = name;
      socket.avatar = avatar;
      socket.emit("connect_successful", "Bạn đã kết nối thành công");  //check when login, if not success -> still login screen
      console.log("socket id : "+socket.id);
      User.findOneAndUpdate(
          {id_fb: socket.avatar},
          {$set: {status: 'online'}},
          {upsert: false},
          function(err, model) {
              //console.log(err);
          }
      );
      socket.broadcast.emit("user_online",socket.avatar); //--thong bao online to all the world
    }

    socket.on('checkin_place',function(placeObject){
      if(placeObject.type === "[0]")
      {
        socket.emit("join_room_unsuccessfull", placeObject);      //check right place?? if not -> let user choose other place
      }
      else
      {
        //check if place not exist then create place
        Place.findOne({ id_place: placeObject.id_place }, function(err, place) {
          if(err) {
            console.log(err);  // handle errors!
          }
          if (!err && place!==null) {
            done_checkin_place(place);
          } else {
            place = new Place({
              id_place: placeObject.id_place,
              nameplace: placeObject.nameplace,
              address: placeObject.address,
              location: placeObject.location,
              type: placeObject.type,
              founder_id_fb: placeObject.founder_id_fb,
              created: Date.now()
            });
            place.save(function(err) {
              if(err) {
                console.log(err);
              } else {
                done_checkin_place(place);
              }
            });
          }
        });
      }
    });
    function done_checkin_place(place){
      if(socket.room !== place.id_place){
        //left old room
        socket.broadcast.to(socket.room).emit('client_left', socket.avatar, socket.username);
        socket.leave(socket.room);
        //delete(socket.room);

        // join room chat of place
        socket.room = place.id_place;
          console.log(socket.room);
        socket.join(socket.room);
        // add member to list
        Place.findOneAndUpdate(
            {id_place: socket.room},
            {$addToSet: {members: {id:socket.avatar, name:socket.username}}},
            {upsert: false},
            function(err, model) {
                //console.log(err);
            }
        );
        socket.broadcast.to(place.id_place).emit('new_client_connect', socket.avatar, socket.username);//update a member
      }
      socket.emit("join_room_successfull", socket.room, place.members); //send id of place and list members

    }

    socket.on('client_send_chat_group', function(data){
      console.log(socket.username + " " +data +" "+ socket.avatar);
        socket.broadcast.to(socket.room).emit('server_send_chat_group', socket.username, data, socket.avatar);
    });

    //**** chat user - user
    socket.on('client_request_chat_user', function(data){
      var id_room, id_socket_b;
      if (socket.avatar<data){               // create a unique room id
        id_room = socket.avatar + '_' + data;
      } else {
        id_room = data + '_' + socket.avatar;
      }
      socket.join(id_room); // make user A join room
      socket.broadcast.emit("server_request_chat_user", data, id_room, socket.avatar, socket.username);
      //create room chat user
      Room.findOne({ id_room: id_room }, function(err, room) {
        if(err) {
          console.log(err);
        }
        if (!err && room !== null) {
        } else {
          room = new Room({
            id_room:id_room,
            user_a:data,
            user_b:socket.avatar,
            create: Date.now()
          });
          room.save(function(err) {
            if(err) {
              console.log(err);
            } else {
            }
          });
        }
      });
   });

   socket.on('accept_chat_user', function(data){
     console.log("123456789888556");
     socket.join(data); // make user A join room
  });
   socket.on('client_send_chat_user', function(data){
     var id_room;
     if (socket.avatar<data.id){               // create a unique room id
       id_room = socket.avatar + '_' + data.id;
     } else {
       id_room = data.id + '_' + socket.avatar;
     }
      socket.broadcast.to(id_room).emit('server_send_chat_user', socket.avatar, socket.username, data, Date.now());
      //create a message to stored db
      var message = new Message({
        uid:id_room,
        from:socket.avatar,
        to:data.id,
        message:data.message,
        create:Date.now()
      });
      message.save(function(err) {
        if(err) {
          console.log(err);
        } else {
        }
      });
   });

   //** vote in room
   socket.on('create_vote',function(data){
     var vote = new Vote({
       id_room:socket.room,
       id_user:socket.avatar,
       question:data.question,
       answers:data.answers,
       create:Date.now()
     });
     vote.save(function(err) {
       if(err) {
         console.log(err);
       } else {
         io.sockets.in(socket.room).emit('server_send_new_vote', vote);
       }
     });
   });
   socket.on('user_vote',function(data){    //structure data : {_id: , id_answer: }
       Vote.findOneAndUpdate(
           {_id: data._id, 'answers.id':data.id_answer},
           {$inc: {'answers.$.number_vote':1}},
           {upsert: false},
           function(err, vote) {
               //console.log(err);
               io.sockets.in(socket.room).emit('update_vote', vote);
           }
       );
   });
   socket.on('disable_vote',function(data){
     Vote.findOneAndUpdate(
         {_id: data._id},
         {$set: {status:false}},
         {upsert: false},
         function(err, vote) {
             //console.log(err);
             io.sockets.in(socket.room).emit('disable_vote', vote);
         }
     );
   });
    //-- nho lam phan : remove members in stored, send member need remove to other client
    socket.on('left_room',function(){
        socket.leave(socket.room);
        socket.emit("left_room_successfull", socket.room);
        socket.broadcast.to(socket.room).emit('client_left', socket.avatar, socket.username);
        Place.findOneAndUpdate(
            {id_place: socket.room},
            {$pull: {members: {id:socket.avatar, name:socket.username}}},
            {upsert: false},
            function(err, place) {
                //console.log(err);
            }
        );
    });
    socket.on('disconnect', function(){
        socket.broadcast.to(socket.room).emit('client_left', socket.avatar, socket.username);
        socket.leave(socket.room);
        Place.findOneAndUpdate(
            {id_place: socket.room},
            {$pull: {members: {id:socket.avatar, name:socket.username}}},
            {upsert: false},
            function(err, place) {
                //console.log(err);
            }
        );
        User.findOneAndUpdate(
            {id_fb: socket.avatar},
            {$set: {status: 'offline'}},
            {upsert: false},
            function(err, model) {
                //console.log(err);
            }
        );
        socket.broadcast.emit("user_offline",socket.avatar); //--thong bao online to all the world
    });

});

//int router

app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');
app.engine('html', require('hogan-express'));
app.set('view engine', 'html');

// app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
// app.use(passport.initialize());
// app.use(passport.session());
app.use('/', routes);

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
      console.log(err.message);
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
