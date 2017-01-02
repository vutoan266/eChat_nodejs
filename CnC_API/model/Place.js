var db = require('../model/config-db');
var Place = db.model('Place', {
    id_place: String,
    nameplace:String,
    address:String,
    location:String,
    type:String,
    number_online:{
      type:Number,
      default:0
    },
    founder_id_fb:String,
    create:Date,
    members:{ type : [] , default : [] }
});
module.exports = Place;
