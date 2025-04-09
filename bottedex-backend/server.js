const express = require('express');
const NodeCache = require('node-cache');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = 3000;

// Setup default middleware
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(cors());
// Initialize cache with a default TTL of 60 seconds
const cache = new NodeCache({ stdTTL: 60 });

// Middleware to check cache
function checkCache(req, res, next) {
  const key = req.originalUrl;
  const cachedData = cache.get(key);
  if (cachedData) {
    return res.json({ source: 'cache', data: cachedData });
  }
  next();
}

app.get('/pokemons', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const offset = (page - 1) * limit;

    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/pokemon`, {
        params: {
          offset,
          limit,
        },
      });

      const data = response.data;
      cache.set(req.originalUrl, data);

      res.json({
        page,
        limit,
        total: data.count,
        results: data.results,
      });
    } catch (error) {
      console.error('Error fetching data:', error.message);
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  });


app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});