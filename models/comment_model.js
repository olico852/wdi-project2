// link to the user through making user id reference here...

const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
  author : {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  text: {
    type: String,
    required: true
  }
}, { timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'} })

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment
