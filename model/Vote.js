var db = require('../model/config-db');
var Vote = db.model('Vote', {
    id_room: String,
    id_user:String,
    question:String,
    answers:{ type : [] , default : [] }, //answer structure {id:,answer:,number_vote:}
    number_vote:{
      type:Number,
      default:0
    },
    create:Date,
    status:{
      type:Boolean,
      default:true
    }
});
module.exports = Vote;
