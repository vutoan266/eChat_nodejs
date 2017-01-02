var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/CnC_data');

module.exports = mongoose;
