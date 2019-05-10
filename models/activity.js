const mongoose = require('mongoose');


const ActivitySchema = new mongoose.Schema({
	name: String,
	type: String,
	location: Object,
	userId: String,
	apiId: String,
	reviews:[{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Review'
	}],  
});



module.exports = mongoose.model('Activity', ActivitySchema);