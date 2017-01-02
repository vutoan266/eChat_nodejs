var db = require('../model/config-db');
var ObjectId = db.Schema.Types.ObjectId;
var Room = db.model('Room', {
    id_room:String,
    user_a:String,
    user_b:String,
    create:Date
});
module.exports = Room;
