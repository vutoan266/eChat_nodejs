var express = require('express');
var router = express.Router();

//model database
var Room = require('../model/Room');
var Message = require('../model/Message');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/get-history/:id',function(req,res){

  Room.find({$or:[{'user_a':req.params.id},{'user_b':req.params.id}]},function(errRoom,rawRoom){
    Message.find({$or:[{'from':req.params.id},{'to':req.params.id}]},function(errMes,rawMes){

      if(errRoom||errMes){

        var err = errRoom||errMes;
        return res.json(err);
      }

      return res.json({data:{
        rooms:rawRoom,
        messages:rawMes
      }});

    });

  });
});

module.exports = router;
