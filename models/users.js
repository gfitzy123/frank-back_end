const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

const UsersSchema = new Schema({
    userId: ObjectId,
    userName: String,
    email: { 
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    phone: Number,
    password: {
        type: String,
        required: true
    },
    resetPasswordCode: {
        type: String
    }
});

const Users = mongoose.model('Users', UsersSchema);
module.exports = Users;

// UsersSchema.pre('save', function (next) {
//     var user = this;
//     bcrypt.hash(user.password, 10, function (err, hash){
//       if (err) {
//         return next(err);
//       }
//       user.password = hash;
//       next();
//     })
// });