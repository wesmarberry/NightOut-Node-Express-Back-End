const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Activity = require('../models/activity');




//create route

router.post('/', async (req, res, next) => {
	try {
		const createdActivity = await Activity.create(req.body)
		res.json({
			status: 201,
			data: createdActivity,
			session: req.session
		})



	} catch (err) {
		next(err)
	}
})

//show route

router.get('/:id', async (req, res, next) => {
	try {
		const foundActivity = await User.findById(req.params.id)
		res.json({
			status: 200,
			data: foundActivity,
			session: req.session
		})



	} catch (err) {
		next(err)
	}
})





module.exports = router;