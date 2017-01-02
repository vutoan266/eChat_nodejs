var db = require('../model/config-db');
var ObjectId = db.Schema.Types.ObjectId;
var Wait = db.model('Wait', {
    userid:{
       type: ObjectId,
        ref: 'User'
    },
    sex: String,
});
module.exports = Wait;