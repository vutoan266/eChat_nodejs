var db = require('../model/config-db');
var ObjectId = db.Schema.Types.ObjectId;
// var autoIncrement = require('mongoose-auto-increment');
// autoIncrement.initialize(db);
// var mongoose = require('mongoose'),
//     Schema = mongoose.Schema;
var messageSchema = db.model('Message', {
    uid:String,
    from:String,
    from_name:String,
    to:String,
    to_name:String,
    images:{
        type:String,
        default:''
    },
    message:{
        type:String,
        default:''
    },
    create:Date
});
//messageSchema.plugin(autoIncrement.plugin, 'Message');
//var Message = db.model('Message', messageSchema);
module.exports = messageSchema;
