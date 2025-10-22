const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: { type:String, required:true },
  email:{ type:String, required:true, unique:true, index:true },
  password:{ type:String, required:true },
  role:{ type:String, enum:['user','admin'], default:'user' },
  resetPasswordTokenHash: { type: String },
  resetPasswordExpires:   { type: Date },
  avatarUrl:              { type: String, default: '' },
},{timestamps:true});

userSchema.pre('save', async function(next){
  if(!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function(plain){
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
