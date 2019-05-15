const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Activity = require('../models/activity');
const Review = require('../models/review');
const superagent = require('superagent');





const findFilledParameters = (reqBody) => {

	for (let i = 0; i < reqBody.type.length; i++) {
		if (reqBody.type[i] === undefined) {
			return true
		}
	}

	for (let i = 0; i < reqBody.priceLevel.length; i++) {
		if (reqBody.priceLevel[i] === undefined) {
			return true
		}
	} 

	let NumActivities = 0
	if (reqBody.type.length === 1 && reqBody.priceLevel.length === 1) {
		NumActivities = 1
	} 
	if (reqBody.type.length === 2 && reqBody.priceLevel.length === 2) {
		NumActivities = 2
	} 
	if (reqBody.type.length === 3 && reqBody.priceLevel.length === 3) {
		NumActivities = 3
	}
	return NumActivities
}


//create route

router.post('/', async (req, res, next) => {
	try {
		console.log(req.body);
		const foundUser = await User.findById(req.session.userDbId)
		console.log(foundUser);
		// api call parameters
		const userLat = req.session.lat
		const userLng = req.session.lng
		const radius = (Number(req.body.distance) * 1609.34)
		const numActivities = findFilledParameters(req.body)
		console.log(numActivities + '============== is num activities');
		if (numActivities === true || req.body.distance === 0) {
			res.json({
			status: 201,
			data: 'Please fill out required fields',
			session: req.session
		})
		} else {
			const activities = []
			
			for (let i = 0; i < numActivities; i++) {
				let type = req.body.type[i]
				const otherTypes = ['bowling_alley', 'casino', 'movie_theater', 'museum', 'stadium', 'zoo']
				let results = []
				// if (type === 'other') {
				// 	console.log('ran other');
				// 	const price = req.body.priceLevel[i]
				// 	console.log(price);
				// 	const radius = (Number(req.body.distance) * 1609.34)
				// 	console.log(radius);
					
				// 	for (let i = 0; i < otherTypes.length; i++){
				// 		console.log('running other types');
				// 		type = otherTypes[i]
				// 		const apiRes = await superagent.post('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + userLat + ',' + userLng + '&radius=' + radius + '&type=' + type + '&opennow=true&maxprice=' + price + '&key=' + process.env.API_KEY)
				// 		console.log(apiRes.body.results.length);
						
				// 		for (let i = 0; i < apiRes.body.results.length; i++) {
				// 			console.log('ran push');
				// 			apiRes.body.results[i].type = type
				// 			results.push(apiRes.body.results[i])

				// 		}
				// 	}
				if (type !== 'restaurant' && type !== 'bar') {
					const radius = (Number(req.body.distance) * 1609.34)
					const priceLevel = req.body.priceLevel[i]
					const keyword = type
					const apiCall = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + userLat + ',' + userLng + '&radius=' + radius + '&keyword=' + keyword + '&opennow=true&maxprice=' + priceLevel + '&key=' + process.env.API_KEY
					console.log(apiCall);
					const apiRes = await superagent.post(apiCall)
					results = apiRes.body.results
					console.log(results);
				}	else {

					const radius = (Number(req.body.distance) * 1609.34)
					const priceLevel = req.body.priceLevel[i]
					console.log(priceLevel);
					const apiCall = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + userLat + ',' + userLng + '&radius=' + radius + '&type=' + type + '&opennow=true&maxprice=' + priceLevel + '&key=' + process.env.API_KEY
					console.log(apiCall);

					const apiRes = await superagent.post('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + userLat + ',' + userLng + '&radius=' + radius + '&type=' + type + '&opennow=true&maxprice=' + priceLevel + '&key=' + process.env.API_KEY)
					for (let i = 0; i < apiRes.body.results.length; i++) {
							apiRes.body.results[i].type = type

						}
					results = apiRes.body.results
					console.log(results);


				}
				// console.log(apiRes);
				if (results.length === 0 || results === undefined) {
					console.log('no activity found');
					const activityParams = {}
					activityParams.name = 'No Activity Found'
					activityParams.type = 'N/A'
					activityParams.address = 'N/A'
					activityParams.price_level = 'N/A'
					const createdActivity = await Activity.create(activityParams)
					activities.push(createdActivity)
					const deletedActivity = await Activity.findByIdAndDelete(createdActivity._id)
				} else {
					console.log(results + ' is results');
					console.log(results.length);
					const randNum = Math.floor(Math.random() * results.length)
					console.log(randNum);
					const activity = results[randNum]
					console.log(activity);

					const activityParams = {}
					activityParams.name = activity.name
					activityParams.type = activity.type
					activityParams.address = activity.vicinity
					activityParams.location = activity.geometry.location
					activityParams.price_level = activity.price_level
					activityParams.userId = foundUser._id
					activityParams.apiId = activity.id
					// activityParams.photoUrl = activity.photos.html_attributions[0]
					const createdActivity = await Activity.create(activityParams)
					foundUser.activities.push(createdActivity)
					foundUser.save()
					activities.push(createdActivity)
					console.log('ran api call');
					
				}
			}


			
			console.log(activities);
			

			


			

			// foundUser.actvities.push(createdActivity)

			res.json({
				status: 201,
				data: activities,
				user: foundUser,
				session: req.session
			})
			
		}
		
		// dummy request
		// const apiRes = await superagent.post('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=41.8853109,-87.6285003&radius=1000&type='+ type + '&opennow=true&key=' + process.env.API_KEY)
		// console.log(apiRes);
		// real request



	} catch (err) {
		res.json({
				status: 400,
				error: err
			})
	}
})

//show single activity route

router.get('/:id', async (req, res, next) => {
	try {
		const foundActivity = await Activity.findById(req.params.id)
		const foundMatching = await Activity.find({apiId: foundActivity.apiId}).populate('reviews')
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



// show all found activities
// route TBD

router.post('/:id/review', async (req, res, next) => {
	try {
		const foundActivity = await Activity.findById(req.params.id)
		console.log(foundActivity + '============================= is foundActivity');
		const createdReview = await Review.create(req.body)
		console.log(createdReview + '============================ is createdReview');
		foundActivity.reviewed = true
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

// deletes the activities generated from the API

router.delete('/delete', async (req, res, next) => {
	try {
		const foundUser = await User.findById(req.session.userDbId)
		console.log(foundUser);
		console.log(req.body);
		for (let i = 0; i < req.body.length; i++) {
			const deletedActivity = await Activity.findByIdAndDelete(req.body[i]._id)
			foundUser.activities.pop()
			foundUser.save()
		}
		res.json({
			status: 200,
			data: foundUser,
			session: req.session
		})


	} catch (err) {

	}
})





module.exports = router;