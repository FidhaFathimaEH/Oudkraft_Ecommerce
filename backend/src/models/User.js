const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  label: { type: String, trim: true, maxlength: 50 },
  fullName: { type: String, trim: true, maxlength: 100 },
  phone: { type: String, trim: true, maxlength: 20 },
  line1: { type: String, trim: true, maxlength: 150 },
  line2: { type: String, trim: true, maxlength: 150 },
  city: { type: String, trim: true, maxlength: 80 },
  state: { type: String, trim: true, maxlength: 80 },
  postalCode: { type: String, trim: true, maxlength: 20 },
  country: { type: String, trim: true, maxlength: 80 },
  isDefault: { type: Boolean, default: false },
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  phone: { type: String, required: true, unique: true, trim: true, maxlength: 20 },
  password: { type: String, required: true, minlength: 8, select: false },
  passwordChangedAt: { type: Date, select: false },
  avatar: { type: String, trim: true, default: null },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer', select: false },
  addresses: { type: [addressSchema], default: [] },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart', default: null },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true, select: false },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
  if (!this.isNew) this.passwordChangedAt = new Date(Date.now() - 1000);
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
  const user = this.toObject();
  delete user.password;
  delete user.passwordChangedAt;
  delete user.role;
  delete user.isActive;
  return user;
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
