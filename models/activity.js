const mongoose = require('mongoose');


const ActivitySchema = new mongoose.Schema({
	name: String,
	type: String,
	location: Object,
	userId: String, 
});



module.exports = mongoose.model('Activity', ActivitySchema);