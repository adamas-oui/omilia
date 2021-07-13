const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

//@route  POST api/users
//@desc   Register user
//@access Public
router.post('/', 
[
  check('name', 'Name is required!').not().isEmpty(),
  check('email', 'Please enter a valid email').isEmail(),
  check('password', 'Please enter a password with 6 or more charachters').isLength({ min: 6 })
], 
async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() });
  }
  
  //destruct request.body so it does not get repetitive when we extract the data
  const {name, email, password} = req.body;
  
  try {
    //**logic of user registration**
    // See if user exists
    let user = await User.findOne({ email });
    if(user){
      return res.status(400).json({ errors: [{msg: 'User already exists'}]});
    }
    
    // Get users gravatar based on their email 
    const avatar = gravatar.url(email, {
      s: '200',
      r: 'pg',
      d: 'mm'
    })
    
    user = new User({
      name,
      email,
      avatar,
      password
    });
    
    // Encyrpt the password using bcrypt (salt for hashing
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    
    // Return jsonwebtoken
    const payload = {
      user: {
        id: user.id
      }
    }
    jwt.sign(
      payload, 
      config.get('jwtSecret'),
      { expiresIn: 360000}, 
      (err, token) => {
        if(err) throw err;
        res.json({ token });
      });
    
  } catch(err){
    //server errors
    console.error(err.message);
    res.status(500).send('Server error');
  }

  
    

});
module.exports = router;

