const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');
//@route  GET api/auth
//@desc   Test route 
//@access Public

//to return the user's data in the route
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route  POST api/auth
//@desc   authenticate user & get token
//@access Public
router.post('/', 
[
  check('email', 'Please enter a valid email').isEmail(),
  check('password', 'Password is required').exists()
], 
async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({ errors: errors.array() });
  }
  
  //destruct request.body so it does not get repetitive when we extract the data
  const { email, password} = req.body;
  
  try {
    //**logic of user registration**
    // See if user exists
    let user = await User.findOne({ email });
    if(!user){
      return res.status(400).json({ errors: [{msg: 'Invalid Credentials'}]});
    }
    
    // // Get users gravatar based on their email 
    // const avatar = gravatar.url(email, {
    //   s: '200',
    //   r: 'pg',
    //   d: 'mm'
    // })
    
    // user = new User({
    //   name,
    //   email,
    //   avatar,
    //   password
    // });
    // 
    // // Encyrpt the password using bcrypt (salt for hashing
    // const salt = await bcrypt.genSalt(10);
    // user.password = await bcrypt.hash(password, salt);
    // await user.save();
    
    //bcrypt's compare function tells if a plain password and an encoded password math
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
      return res.status(400).json({ errors: [{msg: 'Invalid Credentials'}]});
    }
    
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
}
);

module.exports = router;


