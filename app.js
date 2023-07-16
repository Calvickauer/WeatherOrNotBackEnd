require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
require('./config/passport')(passport);
const axios = require('axios');
const { google } = require('googleapis');

const youtube = google.youtube({
  version: 'v3',
  auth: 'AIzaSyBS7kPVx_heg_GRZC2AnTUVVaZmlD_cbuU',
});


// App Set up
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json()); // JSON parsing
app.use(cors()); // allow all CORS requests
app.use(passport.initialize());

app.get('/', (req, res) => {
  res.json({ name: 'MERN Auth API', greeting: 'Welcome to our API', author: 'YOU', message: "Smile, you are being watched by the Backend Engineering Team" });
});

app.get('/api/weather', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    console.log("hellllllooooooo");

    const response = await axios.get(apiUrl);
    const weatherData = response.data;
    console.log(response);
    res.json(weatherData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch weather data' });
  }
});


app.get('/search-videos', async (req, res) => {
  const { query } = req.query;

  try {
    const response = await youtube.search.list({
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: 10,
    });

    const videos = response.data.items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.default.url,
    }));

    res.status(200).json(videos);
  } catch (error) {
    console.error('YouTube API error:', error);
    res.status(500).json({ message: 'Failed to fetch YouTube videos.' });
  }
});


app.use('/examples', require('./controllers/example'));
app.use('/users', require('./controllers/user'));

// Server
const server = app.listen(PORT, () => console.log(`Server is running on PORT: ${PORT}`));

module.exports = server;
module.exports = youtube;