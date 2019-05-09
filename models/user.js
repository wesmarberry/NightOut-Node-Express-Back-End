const mongoose = require('mongoose');
const Activity = require('./activity')

const UserSchema = new mongoose.Schema({
	email: {type: String, required: true},
	username: {type: String, required: true},
	password: {type: String, required: true},
	lat: Number,
	lng: Number,
	activities:[{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Activity'
	}],
});



module.exports = mongoose.model('User', UserSchema);