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
		const foundActivity = await Activity.findById(req.params.id)
		const foundMatching = await Activity.find({apiId: foundActivity.apiId})
		res.json({
			status: 200,
			data: foundActivity,
			matchingActivityData: foundMatching,
			session: req.session
		})



	} catch (err) {
		next(err)
	}
})

// index route

router.get('/', async (req, res, next) => {


	try {
		const foundActivities = await Activity.find({})
		res.json({
			status: 200,
			data: foundActivities,
			session: req.session
		})



	} catch (err) {
		next(err)
	}
})



module.exports = router;