const User = require("../models/User");
const { SECRET } = require("../config");
const { Strategy, ExtractJwt } = require("passport-jwt");

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: SECRET,
};

module.exports = (passport) => {
  passport.use(
    new Strategy(opts, async (payload, done) => {
      console.log(payload);
      await User.findOne({ email: payload.email })
        .then((user) => {
          if (user) {
            console.log("taboni");
            return done(null, user);
          }
          console.log("taboniqsdqsdqsd");

          return done(null, false);
        })
        .catch((err) => {
          console.log("taboniqsdqsdddddqsd");

          return done(null, false);
        });
    })
  );
};
