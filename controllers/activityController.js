const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Activity = require('../models/activity');
const Review = require('../models/review');
const superagent = require('superagent');




// function to find out how many of the inputs the user has FULLY filled out
const findFilledParameters = (reqBody) => {
	// finds out if at least one of the parameters are fully filled out
	for (let i = 0; i < reqBody.type.length; i++) {
		if (reqBody.type[i] === undefined) {
			return true
		}
	}
	// finds out at least one if the pricelevel parameter is filled out
	for (let i = 0; i < reqBody.priceLevel.length; i++) {
		if (reqBody.priceLevel[i] === undefined) {
			return true
		}
	} 


	// returns the number of activities that are fully filled out
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

// if the "other" category is filled out with spaces, it replaces the spaces with an underscore
// this is necessary for the syntax of the API call
const generateKeyword = (string) => {
	const NewString = string.replace(/ /g,'_')
	return NewString
}


//create route
// creates an activity based on the required parameters

// required parameters in req.body
// userId
// distance
// at least one type and price level
router.post('/', async (req, res, next) => {
	try {
		// finds the user that is logged in in order to get the user's lat/lng when they logged in 
		const foundUser = await User.findById(req.body.userId)
		// sets the base lat lng for the API call
		const userLat = foundUser.lat
		const userLng = foundUser.lng
		// sets the radius for the API call
		const radius = (Number(req.body.distance) * 1609.34)
		// runs the function fo find the number of activities that have been filled out
		const numActivities = findFilledParameters(req.body)
		console.log(req.body);
		const othermaxPrice = ''
		const otheropenNow = ''
		if (req.body.maxPrice === 'true') {
			maxPrice = 'maxprice'
		} else {
			maxPrice = 'minprice'
		}

		if (req.body.openNow === 'true') {
			openNow = 'true'
		} else {
			openNow = 'false'
		}
		console.log('====================');
		console.log(maxPrice);
		console.log(openNow);
		// if the activities were not fully filled out by the user it returns the error message
		if (numActivities === true || req.body.distance === 0) {
				console.log('ran upper error');
				res.json({
				status: 400,
				data: 'Please fill out required fields',
				session: req.session
			})
		} else {
			// initialized the activities array to be randomized from the API call
			const activities = []
			console.log(numActivities);
			// loops over the number of activities that were filled out
			for (let i = 0; i < numActivities; i++) {
				let type = req.body.type[i]
				console.log(req.body.type[i]);
				let results = []
				// if the other text field is filled out it makes an API call with the keyword property
				// instead of the "Type" property
				if (type !== 'restaurant' && type !== 'bar') {
					const radius = (Number(req.body.distance) * 1609.34)
					const priceLevel = req.body.priceLevel[i]
					// runs the function to turn keywords with spaces into keywords with underscores
					const keyword = generateKeyword(type)
					// the google places API call based on the user input
					const apiCall = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + userLat + ',' + userLng + '&radius=' + radius + '&keyword=' + keyword + '&opennow=' + openNow  + '&' + maxPrice + '=' + priceLevel + '&key=' + process.env.API_KEY + '&libraries=places'
					// stores the apiCall in the session for tracking
					req.session.apiCall = apiCall
					// the API call using superagent
					const apiRes = await superagent.post(apiCall)
					// sets the type property to all of the results based on the user input
					for (let i = 0; i < apiRes.body.results.length; i++) {
							apiRes.body.results[i].type = type

						}
					// sets the results	
					results = apiRes.body.results
				}	else {
					console.log('running else');
					const radius = (Number(req.body.distance) * 1609.34)
					const priceLevel = req.body.priceLevel[i]
					// creates the api call based on the user input from the form on the client side
					const apiCall = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + userLat + ',' + userLng + '&radius=' + radius + '&type=' + type + '&opennow=' + openNow + '&' + maxPrice + '=' + priceLevel + '&key=' + process.env.API_KEY + '&libraries=places'
					console.log(apiCall);
					req.session.apiCall = apiCall
					const apiRes = await superagent.post('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + userLat + ',' + userLng + '&radius=' + radius + '&type=' + type + '&opennow=' + openNow + '&' + maxPrice + '=' + priceLevel + '&key=' + process.env.API_KEY + '&libraries=places')
					for (let i = 0; i < apiRes.body.results.length; i++) {
							apiRes.body.results[i].type = type

						}
					results = apiRes.body.results
					console.log(results);


				}
				// if the results are 0 or undefined then the acitvity shown will be 'no activity found' and no activities
				// will be added to the user's database or any database
				if (results.length === 0 || results === undefined) {
					console.log('no activity found');
					const activityParams = {}
					activityParams.name = 'No Activity Found'
					activityParams.type = 'N/A'
					activityParams.address = 'N/A'
					activityParams.price_level = 'N/A'
					activityParams.userId = foundUser._id
					const createdActivity = await Activity.create(activityParams)
					activities.push(createdActivity)
					const deletedActivity = await Activity.findByIdAndDelete(createdActivity._id)
				} else { // activities are created and added to the user's activities
					// generates a random number that will be plugged into the overall array of results
					const randNum = Math.floor(Math.random() * results.length)
					// random index of the results array
					const activity = results[randNum]
					
					// generates activity parameters to create the activity
					const activityParams = {}
					activityParams.name = activity.name
					activityParams.type = activity.type
					activityParams.address = activity.vicinity
					activityParams.location = activity.geometry.location
					activityParams.price_level = activity.price_level
					activityParams.userId = foundUser._id
					activityParams.apiId = activity.id
					

					// creates the activity
					const createdActivity = await Activity.create(activityParams)
					// pushes the activity into the user's activities array
					foundUser.activities.push(createdActivity)
					foundUser.save()
					// pushes the activity into the activities array to be displayed on the "accept" page
					activities.push(createdActivity)
					
					
				}
			}


			
			
			

			


			

			

			res.json({
				status: 201,
				data: activities,
				user: foundUser,
				session: req.session
			})
			
		}
		
		


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
		// finds the activity to show
		const foundActivity = await Activity.findById(req.params.id)
		// finds all of the activities that have the same apiID
		// this will populate the "matchingActivityData" with all users' reviews of this activity
		const foundMatching = await Activity.find({apiId: foundActivity.apiId}).populate('reviews')
		res.json({
			status: 200,
			data: foundActivity,
			matchingActivityData: foundMatching,
			session: req.session
		})



	} catch (err) {
		res.json({
			status: 400,
			data: err
		})
	}
})



// create a review route
// the form shows on the user home page when the activity is accepted
router.post('/:id/review', async (req, res, next) => {
	try {
		// finds the activity that is being reveiwed
		const foundActivity = await Activity.findById(req.params.id)
		console.log(foundActivity + '============================= is foundActivity');
		// creates the review based on the entered parameters
		const createdReview = await Review.create(req.body)
		console.log(createdReview + '============================ is createdReview');
		// finds the user that is reviewing
		const foundUser = await User.findById(foundActivity.userId)
		// ties the username to the review to give a signature to each review
		createdReview.username = foundUser.username
		createdReview.save()
		// sets the reviewed property to true so that a user cannot write multiple reviews of a place
		// without going more than once
		foundActivity.reviewed = true
		// puts the review at the beginning of the activities reviews array
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
// finds all activities and responds with them
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
// deletes the activities from the user's activity array if the user declines the agenda
router.delete('/delete', async (req, res, next) => {
	try {
		console.log(req.body[0].userId);
		const foundUser = await User.findById(req.body[0].userId)
		console.log('====================');
		console.log(foundUser);
		console.log('======================');
		console.log(req.body);
		// removes all of the activities generated from the API call
		for (let i = 0; i < req.body.length; i++) {
			const deletedActivity = await Activity.findByIdAndDelete(req.body[i]._id)
			foundUser.activities.pop()
			await foundUser.save()
		}
		res.json({
			status: 200,
			data: foundUser,
			session: req.session
		})


	} catch (err) {
		res.json({
			status: 400,
			data: err
		})
	}
})


// updates the overall rating of an activity
router.put('/:id/overallRating', async (req, res, next) => {
	try {
		console.log(req.body);
		const activityToUpdate = await Activity.findById(req.params.id)
		console.log(activityToUpdate);
		activityToUpdate.overallRating = req.body.overallRating
		activityToUpdate.save()
		res.json({
			status: 200,
			data: activityToUpdate
		})
	} catch (err) {
		res.json({
			status: 400,
			data: err
		})
	}
})






module.exports = router;