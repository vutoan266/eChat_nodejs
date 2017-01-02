var db = require('../model/config-db');
var User = db.model('User', {
	id_fb: String,
	name:String,
	birthday:String,
	email:String,
	password:String,
	avatar:String,
  gender:String,
	socket_id:{
      type:String,
      default:'no'
  },
  status:{
      type:String,
      default:'offline'
  },
  created: Date,
  role:{
  	type:String,
  	default:'member'
  }
});
module.exports = User;
