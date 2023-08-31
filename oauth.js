const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2').Strategy;
const session = require('express-session');

// Configure session middleware
app.use(
  session({
    secret: 'your-secret',
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Configure the OAuth 2.0 strategy
passport.use(
  'provider', // Replace 'provider' with a name for your strategy
  new OAuth2Strategy(
    {
      authorizationURL: 'https://provider.com/oauth2/authorize',
      tokenURL: 'https://provider.com/oauth2/token',
      clientID: process.env.CLIENT_ID, // Use environment variables
      clientSecret: process.env.CLIENT_SECRET, // Use environment variables
      callbackURL: 'http://your-app/callback', // Replace with your callback URL
    },
    (accessToken, refreshToken, profile, done) => {
      // Handle the authentication callback
      try {
        // Save user data to your database or session
        // For example, save to session: req.session.user = profile;
        done(null, profile);
      } catch (error) {
        done(error);
      }
    }
  )
);

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  // Serialize user details
  done(null, user);
});

passport.deserializeUser((user, done) => {
  // Deserialize user details
  done(null, user);
});

// Check Authentication Middleware
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(); // Proceed to the next middleware
  }
  res.redirect('/login'); // Redirect to login page if not authenticated
};

// Logout Route
app.get('/logout', (req, res) => {
  req.logout(); // Passport function to clear session
  res.redirect('/'); // Redirect to home page after logout
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('An error occurred.');
});
