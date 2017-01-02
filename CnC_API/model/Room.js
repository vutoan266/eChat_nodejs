var db = require('../model/config-db');
var ObjectId = db.Schema.Types.ObjectId;
var Room = db.model('Room', {
    id_room:String,
    user_a:String,
    user_a_name:String,
    user_b:String,
    user_b_name:String,
    create:Date
});
module.exports = Room;
