const mongoose = require('mongoose');


const ActivitySchema = new mongoose.Schema({
	name: String,
	type: String,
	location: Object,
	userId: String,
	apiId: String,
	photoUrl: String,
	price_level: String,
	reviews:[{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Review'
	}],
	includeInFuture: {type: Boolean, default: false}
});



module.exports = mongoose.model('Activity', ActivitySchema);