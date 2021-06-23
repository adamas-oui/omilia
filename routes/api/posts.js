const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator'); //error-checker
const auth = require('../../middleware/auth');
const checkObjectId = require('../../middleware/auth');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route  Post api/posts
//@desc   Create a post 
//@access Private
router.post('/',[ auth, [
  check('text', 'Text is required').not().isEmpty()
]],
async (req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(400).json({
      errors: errors.array()
    })
  }
  
  try {
    //get the user, the name and avatar
    const user = await User.findById(req.user.id).select('-password');
    const newPost = new Post({
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id
    });
    
    const post = await newPost.save();
    res.json(post);
  } catch (err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }

});

//@route  GET api/posts
//@desc   Get all posts 
//@access Private (see only if login)
router.get('/', auth, async (req, res) => {
  try {
    //get the posts by the most recent date
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err){
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route  GET api/posts/:id
//@desc   Get a single post by the id 
//@access Private (see only if login)

router.get('/:id', auth, checkObjectId('id'), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //check if there is a post with this certain id 
    if(!post) {
      return res.status(404).json({ msg: 'Post not found'});
    }
    res.json(post);
  } catch (err){
    console.error(err.message);

    res.status(500).send('Server Error');
  }
});

//@route  DELETE api/posts/:id
//@desc   Delete a single post by the id 
//@access Private 
router.delete('/:id', [auth,checkObjectId('id')], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //check if the post exists
    if(!post) {
      return res.status(404).json({ msg: 'Post not found'});
    }
    //check if the user owns the post
    //if the user of this post matches the user login
    //Note: post.user is an ObjectId while req.user.id is a string
    if(post.user.toString() !== req.user.id) {
      return res.status(401).json({msg: 'User not authorized'});
    }
    await post.remove();
    res.json({ msg: 'Post removed' });
  } catch (err){
    console.error(err.message);
    //check if the object if is true
    if(err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found'});
    }
    res.status(500).send('Server Error');
  }
});

//@route  PUT api/posts/like/:id (update a post - if a user clicks like then we add a like to the like array)
//@desc   Like a post
//@access Private 
router.put('/like/:id', auth, checkObjectId('id'), async (req, res) => {
  try {
    //get the post
    const post = await Post.findById(req.params.id);
    //check if the post has already been liked by the user
    //some function: compare the current iteration with the current logged-in user
    //return if matches
    //the post has already been liked if the length is greater than 0
    if(post.likes.some(like => like.user.toString() === req.user.id)){
      return res.status(400).json({ msg: 'Post already liked'});
    }
    //if the post has not been liked 
    post.likes.unshift({ user: req.user.id });
    
    //save back to the database 
    await post.save();
    //should return an id of the like and the user that liked it
    res.json(post.likes);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

//@route  PUT api/posts/unlike/:id 
//@desc   Like a post
//@access Private 
router.put('/unlike/:id', auth, checkObjectId('id'), async (req, res) => {
  try {
    //get the post
    const post = await Post.findById(req.params.id);
    //check if the post has not yet been liked
    if(!post.likes.some(like => like.user.toString() === req.user.id)){
      return res.status(400).json({ msg: 'Post has not yet been liked'});
    }
    
    //remove the like
    post.likes = post.likes.filter(
      ({user}) => user.toString() !== req.user.id
    );
    
    //save back to the database 
    await post.save();
    //should return an id of the like and the user that liked it
    res.json(post.likes);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});



module.exports = router;