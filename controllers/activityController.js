const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Activity = require('../models/activity');
const Review = require('../models/review');
const superagent = require('superagent');




//create route

router.post('/', async (req, res, next) => {
	try {
		const foundUser = await User.findById(req.session.userDbId)
		// api call parameters
		// const userLat = foundUser.lat
		// const userLng = foundUser.lng
		// const radius = req.body.distance
		const type = req.body.type
		// dummy request
		const apiRes = await superagent.post('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=41.8853109,-87.6285003&radius=1000&type='+ type + '&opennow=true&key=' + process.env.API_KEY)
		console.log(apiRes);
		// real request
		// const apiRes = await superagent.post('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + userLat + ',' + userLng + '&radius=' + radius + '&type=' + type + '&opennow=true&key=' + process.env.API_KEY)
		const randNum = Math.floor(Math.random() * apiRes.body.results.length)
		const activity = apiRes.body.results[randNum]
		console.log(activity);
		const detailsApiCall = await superagent.post('https://maps.googleapis.com/maps/api/place/details/json?placeid=' + activity + '&fields=price_level&key=' + process.env.API_KEY)
		const allActivities = apiRes.body.results
		const activityParams = {}
		activityParams.name = activity.name
		activityParams.type = type
		activityParams.location = activity.geometry.location
		activityParams.price_level = activity.price_level
		// activityParams.userId = foundUser._id
		activityParams.apiId = activity.id


		const createdActivity = await Activity.create(activityParams)

		// foundUser.actvities.push(createdActivity)

		res.json({
			status: 201,
			data: createdActivity,
			// allActivities: allActivities,
			price_level: detailsApiCall,
			session: req.session
		})



	} catch (err) {
		res.status(400).json({
			status: 400,
			error: err
		})
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

router.post('/:id/review', async (req, res, next) => {
	try {
		const foundActivity = await Activity.findById(req.params.id)
		console.log(foundActivity);
		const createdReview = await Review.create(req.body)
		console.log(createdReview);
		foundActivity.reviews.unshift(createdReview)
		foundActivity.save()

		res.json({
			status: 200,
			data: createdReview,
			activity: foundActivity
		})

	} catch (err) {
		res.status(400).json({
			status: 400,
			error: err
		})
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