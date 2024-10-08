const LocalStrategy = require('passport-local').Strategy;
const Profiles = require('../models/Profile');
const bcrypt = require('bcrypt');
const passport = require('passport');

async function initGateway() {
  let authenticate_user = async (username, password, done) => {
    const user = await Profiles.findOne({ user_name: username });
    if (!user) {
      return done(null, false, { code: 'NO_USER_FOUND' });
    }
    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        done(null, false, { code: 'INVALID_PASSWORD' });
      }
    } catch (error) {
      return done(error);
    }
  };
  passport.use('local', new LocalStrategy({ username_field: 'username' }, authenticate_user));
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    let user = await Profiles.findById(id, '_id display_name user_name image socials chats createdAt');
    return done(null, user);
  });
}

module.exports = initGateway;