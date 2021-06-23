const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('config');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');



//@route  GET api/profile/me: to get current users profile; access: private

router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'avatar']);
    if(!profile){
      return res.status(400).json({msg:'There is no profile for this user'});
    }
    res.json(profile);
  } catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route  POST api/profile: create or update users profile; access: private
//auth and validation middleware 
router.post('/',[auth, 
  [check('status', 'Status is required').not().isEmpty()],
  [check('skills', 'Skills are required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()});
  }
  const {
        company,
        website,
        skills,
        location,
        bio,
        status,
        githubusername,
        youtube,
        twitter,
        instagram,
        linkedin,
        facebook
      } = req.body;
  //build profile object
  const profileFields = {};
  profileFields.user = req.user.id;
  if(company) profileFields.company = company;
  if(website) profileFields.website = website;
  if(location) profileFields.location = location;
  if(bio) profileFields.bio = bio;
  if(status) profileFields.status = status;
  if(githubusername) profileFields.githubusername = githubusername;
  //turn skills into an array of skills
  if(skills){
    profileFields.skills = skills.split(',').map(skill => skill.trim());
  }
  
  //build social object 
  //must initialize the social object
  profileFields.social = {};
  if(youtube) profileFields.youtube = youtube;
  if(twitter) profileFields.twitter = twitter;
  if(facebook) profileFields.facebook = facebook;
  if(linkedin) profileFields.linkedin = linkedin;
  if(instagram) profileFields.instagram = instagram;
  
  //update and insert data
  try{
    let profile = await Profile.findOne({user: req.user.id});
    if(profile){
      //update
      profile = await Profile.findOneAndUpdate({ user: req.user.id}, { $set: profileFields}, {new: true});
      return res.json(profile);
    }
    //otherwise, create new profile 
    profile = new Profile(profileFields);
    await profile.save();
    res.json(profile);
  } catch(err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }
  
  
});


//route: GET api/profile/user/:user_id ; Get all profiles -> get profile by user id; Public
router.get('/user/:user_id', async (req, res) => {
  try{
    const profile = await Profile.findOne({user: req.params.user_id}).populate('user', ['name', 'avatar']);
    if(!profile) return res.status(400).json({msg: 'Profile not found :('});
    res.json({profile});
  } catch(err){
    console.error(err.message);
    if(err.name === 'CastError'){
      return res.status(400).json({msg: 'Profile not found!'});
    }
    res.status(500).send('Server Error');
  }
});


//route: DELETE api/profile; delete profile, user and posts; Private

router.delete('/', auth, async (req, res) => {
  try {
    //todo: remove users posts
    //remove profile 
    await Profile.findOneAndRemove({user: req.user.id });
    //remove user
    await User.findOneAndRemove({_id: req.user.id });
    res.json({msg: 'User removed'});
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//route: PUT(or POST) api/profile/experience; add profile experience; Private 
//experience as an array with its own id 
router.put('/experience', [auth,[
  check('title', 'Title is required').not().isEmpty(),
  check('company', 'Company is required').not().isEmpty(),
  check('from', 'From date is required').not().isEmpty(),
]], async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()});
  }
  
  //get the body data
  const {
    title,
    company,
    location,
    from,
    to,
    current,
    description
  } = req.body;
  const newExp = {
    title,
    company,
    location,
    from,
    to,
    current,
    description
  }
   
  //mongdodb 
  try{
    //fetch the profile that we want to add the experience to
    //find the profile by the user
    const profile = await Profile.findOne({ user: req.user.id });
    //unshift() similar to push but push to the beginning of the array
    profile.experience.unshift(newExp);
    await profile.save();
    res.json(profile);
  } catch (err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//route: DELETE api/profile/experience; delete profile experience; Private 
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const foundProfile = await Profile.findOne({ user: req.user.id });

    foundProfile.experience = foundProfile.experience.filter(
      (exp) => exp._id.toString() !== req.params.exp_id
    );

    await foundProfile.save();
    return res.status(200).json(foundProfile);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Server error' });
  }
});


//route: PUT(or POST) api/profile/education; add profile education; Private 
router.put('/education', [auth,[
  check('school', 'School is required').not().isEmpty(),
  check('degree', 'Degree is required').not().isEmpty(),
  check('fieldofstudy', 'Field of study is required').not().isEmpty(),
  check('from', 'From date is required').not().isEmpty(),
]], async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({errors: errors.array()});
  }
  
  //get the body data
  const {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description
  } = req.body;
   
  const newEdu = {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description
  }
   
  //mongdodb 
  try{
    //fetch the profile that we want to add the experience to
    //find the profile by the user
    const profile = await Profile.findOne({ user: req.user.id });
    //unshift() similar to push but push to the beginning of the array
    profile.education.unshift(newEdu);
    await profile.save();
    res.json(profile);
  } catch (err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//route: DELETE api/profile/education/:edu_id; delete profile education; Private 
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const foundProfile = await Profile.findOne({ user: req.user.id });

    foundProfile.education = foundProfile.education.filter(
      (edu) => edu._id.toString() !== req.params.edu_id
    );

    await foundProfile.save();
    return res.status(200).json(foundProfile);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Server error' });
  }
});

//get github repos for profile
//create a personal access token
//route: GET api/profile/github/:username; get user repos from Github; Public
router.get('/github/:username', async (req,res) => {
  try{
    const uri = encodeURI(
      `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
    );
    const headers = {
      'user-agent': 'node.js',
      Authorization: `token ${config.get('githubToken')}`
    };
    const gitHubResponse = await axios.get(uri, {headers});
    return res.json(gitHubResponse.data);
  } catch (err){
    console.error(err.message);
    return res.status(404).json({msg: 'No Github profile found'});
  }
});







module.exports = router;