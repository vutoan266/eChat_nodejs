var db = require('../model/config-db');
var ObjectId = db.Schema.Types.ObjectId;
var ListBlock = db.model('ListBlock', {
	roomid:{
		type:ObjectId,
		ref:'Room'
	},
    userid:{
       type: ObjectId,
       ref: 'User'
    },
    sex: String,
});
module.exports = ListBlock;