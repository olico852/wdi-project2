const Post = require('../models/post_model')
const User = require('../models/user_model')
const express = require('express')
const router = express.Router()
const flash = require('connect-flash')



// router.get('/', function (req, res) { // express gets triggered when someone types in '/' which is a request
//   res.redirect('/' + req.user._id) // server to respond with 'homepage'
// })



/* express gets triggered when URL is /:id.... posts by all users listed
his has to be further down as this address is more generic catch-all */

/* get create todolist page */
router.get('/:userid/create', function (req, res) {
  res.render('post/createpost')
})

/* create todolist */
router.post('/:userid/create', function (req, res) {
  Post.create({
    user: req.user._id,
    title: req.body.title,
    article: req.body.article,
    tags: req.body.tags
  },
  function (err, newPost) {
    if (err) {
      req.flash('error', 'Post could not be created')
      res.redirect('/' + req.user._id + '/create')
    } else {
      User.findById(req.user._id, (err, user) => {
        if (err) return err
        user.posts.push(newPost._id)
        user.save()
        res.redirect('/user/' + req.user._id + '/yourposts')
      })
    }
  })
})

router.get('/:userid/edit/:postid', function (req, res) {
  Post.find({_id: req.params.postid}, function (err, currentPost) {
    if (err) return res.status(500).render({errorMsg: err})
    res.render('post/editpost', {article: currentPost})
  })
})

/* update the post */
router.put('/:userid/edit/:postid', function (req, res) {
  Post.findByIdAndUpdate(req.params.postid
  , {
    title: req.body.title,
    article: req.body.article,
    tags: req.body.tags
  }, {
    new: true,
    runValidators: true
  }, (err, updatedPost) => {
    if (err) return res.status(500).render({errorMsg: err})
    req.flash('success', 'Post updated')
    res.redirect('/user/' + req.user.id)
  })
})

  /* returns user's post only */
  router.get('/:userid', function (req, res) {
    User
    .findOne({_id: req.user.id})
    .populate('posts')
    .exec(function (err, myarticles) {
      // console.log(JSON.stringify('my articles are...', myarticles))// prints out specific req user object
      if (err) return res.status(500).render({errMsg: err})
      res.render('post/postpage', {articles: myarticles})
    })
  })

router.get('/', function (req, res) {
  Post.find({}, function (err, allArticles) {
    if (err) return res.status(500).render({errorMsg: err})
    res.render('post/homepage', {articles: allArticles})
  })
})


/* proof that post creation and embedding works */
// Post.create({
//   user: '5885d5908b1346beb802e676',
//   title: 'daily thoughts',
//   article: 'daily ramblings. not so cool after all womannnn',
//   tags: 'thoughts ramblings test',
//   comments: [
//   {
//     author: '5885d5908b1346beb802e676',
//     text: 'you need a bit more depth in your post',
//   },{
//     name: '5885d5908b1346beb802e676',
//     text: 'pretentious wanker!'
//   }]
// }, function (err, newPost) {
//  newPost.comments.push({ author: '5885d5908b1346beb802e676', text: 'somethingsomething' })
//  newPost.save()
// })


router.delete('/:userid/delete/:postid', function (req, res) {
  Post.findByIdAndRemove(req.params.postid, function (err, post) {
    if (err) return res.status(500).render({ errorMsg: err })
    User.findByIdAndUpdate(
      req.user._id,
      {'$pull': { posts: post._id }}, {
        new: true,
        runValidators: true
      }, (err, remainingPosts) => {
        if (err) return req.flash('error', 'Action unsuccesful')
        req.flash('success', 'Post deleted')
        res.redirect('/user/' + req.user.id)
      }
    )
  })
})

module.exports = router
