const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  birthDate: {
    type: Date,
    required: [true, 'Birth date is required']
  },
  nationality: {
    type: String,
    required: [true, 'Nationality is required'],
    trim: true
  },
  biography: {
    type: String,
    required: [true, 'Biography is required'],
    maxlength: [2000, 'Biography cannot exceed 2000 characters']
  },
  awards: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Virtual for author's full name
authorSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
authorSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Author', authorSchema);
