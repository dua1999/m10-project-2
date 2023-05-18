const express = require('express');
const swaggerUi = require('swagger-ui-express');
const passport = require('passport');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./docs/swagger.yaml');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const config = require('./config');
const mongoose = require('mongoose');
const { Schema } = mongoose;
const ejs = require('ejs');

mongoose.connect('mongodb://localhost/m10', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const userSchema = new Schema({
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    age: {
      type: Number,
      min: 18,
    },
  });

  const User = mongoose.model('User', userSchema);

passport.use(
    new GoogleStrategy(
        {
            clientID: config.google.clientID,
            clientSecret: config.google.clientSecret,
            callbackURL: config.google.callbackURL,
        },
        (accessToken, refreshToken, profile, done) => {
            console.log(profile);
            done(null, profile);
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user);
});

app.use(passport.initialize());
app.use(passport.session());
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.send('Welcome to the home page');
});

app.get(
    '/auth/google',
    passport.authenticate('google', { scope: ['profile'] })
);

app.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        res.redirect('/profile');
    }
);


app.get('/profile', (req, res) => {
    res.send(req.user);
});

const app = express();
app.use(express.json());
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

let users = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
];

app.get('/users', async (req, res) => {
    try {
      const userList = await User.find();
      res.json(userList);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });
  
  app.post('/users', async (req, res) => {
    try {
      const { name} = req.body;
      const newUser = new User({ name });
      await newUser.save();
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

app.get('/users', (req, res) => {
    res.json(users);
});

app.post('/users', (req, res) => {
    const { name } = req.body;
    const newUser = { id: users.length + 1, name };
    users.push(newUser);
    res.status(201).json(newUser);
    
});

app.get('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const user = users.find((user) => user.id === userId);
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

app.put('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const { name } = req.body;
    const user = users.find((user) => user.id === userId);
    if (user) {
        user.name = name;
        res.json(user);
    } else {
        res.status(404).json({ error: 'User not found' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
