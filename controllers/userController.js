const express = require('express');
const router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');


// route to register a new user
router.post('/register', async (req, res, next) => {

	// first we must hash the password
	const password = req.body.password;
	// the password has is what we want to put in the database

	const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(10))

  



	// create and object for the db entry
	const userDbEntry = {};
	userDbEntry.username = req.body.username;
	userDbEntry.password = passwordHash;
	userDbEntry.email = req.body.email;
	userDbEntry.lat = req.body.lat
	userDbEntry.lng = req.body.lng


  

  try {


  		// creates user based on DB entry
	    const createdUser = await User.create(userDbEntry)


	    // sets session properties
	    req.session.logged = true;
	    req.session.userDbId = createdUser._id
	    req.session.username = createdUser.username
	    req.session.lat = createdUser.lat
	    req.session.lng = createdUser.lng



	    res.json({
	      status: 200,
	      data: 'registration successful'
	    });
	  
	}
	catch (err) {
	    next(err)
	}
})


// logs in existing users
router.post('/new', async (req, res, next) => {

  try {
  	// finds user if user exists
    const userExists = await User.findOne({'username': req.body.username})
    // tests if user exists and sets the session properties
    if (userExists && userExists.password) {
    	// tests if the password is correct
      if (bcrypt.compareSync(req.body.password, userExists.password)) {
      	// if the password is correct set the session properties


      	const updatedUser = User.findByIdAndUpdate(userExists._id, {
      		lat: req.body.lat,
      		lng: req.body.lng
      	}, {new: true})
        req.session.userDbId = userExists._id
        req.session.logged = true
        req.session.username = req.body.username
        req.session.message = ''
        req.session.lat = updatedUser.lat
	    req.session.lng = updatedUser.lng

        res.json({
	      status: 200,
	      data: 'login successful'
	    });
        
      } else {
        req.session.message = 'username or password is incorrect'
        res.status(400).json({
			status: 400,
			error: req.session.message
		})
      }
    } else {
      req.session.message = "username or password does not exist"
      res.status(400).json({
			status: 400,
			error: req.session.message
		})
    }
    
  } catch (err) {

    res.status(400).json({
		status: 400,
		error: err
	})
  }

})  

// logout

router.get('/', (req, res, next) => {
	try {
		req.session.destroy()

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
		const foundUsers = await User.find({})
		res.json({
			status: 200,
			data: foundUsers,
			session: req.session
		})



	} catch (err) {
		next(err)
	}
})

//show route

router.get('/:id', async (req, res, next) => {
	try {
		const foundUser = await User.findById(req.params.id)
		res.json({
			status: 200,
			data: foundUser,
			session: req.session
		})



	} catch (err) {
		next(err)
	}
})

// update
router.put('/:id', async(req, res, next) => {
	try {
		const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {new: true})
		res.json({
			status: 200,
			data: updatedUser,
			session: req.session
		})



	} catch (err) {
		next(err)
	}
})

// delete

router.delete('/:id', async (req, res, next) => {
	try {
		const deletedUser = await User.findByIdAndRemove(req.params.id)
		req.session.destroy()
		res.json({
			status: 200,
			data: deletedUser
		})



	} catch (err) {
		next(err)
	}
})



module.exports = router;