const mongoose = require('mongoose');


const ReviewSchema = new mongoose.Schema({
	body: String,
	rating: String,
	userId: String,
	activityId: String,
	activityApiId: String
});



module.exports = mongoose.model('Review', ReviewSchema);