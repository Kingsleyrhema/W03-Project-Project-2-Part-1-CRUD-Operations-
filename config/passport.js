const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('../models/User');

module.exports = function (app) {
  // serialize / deserialize
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  // Initialize Google strategy only when credentials are present
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback'
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const existing = await User.findOne({ provider: 'google', providerId: profile.id });
        if (existing) return done(null, existing);
        const user = new User({
          name: profile.displayName,
          email: profile.emails?.[0]?.value,
          provider: 'google',
          providerId: profile.id
        });
        await user.save();
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }));
  }

  app.use(passport.initialize());
  app.use(passport.session());
};
