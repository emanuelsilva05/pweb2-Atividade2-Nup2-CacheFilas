const redis = require('redis');
const client = redis.createClient();

client.on('error', (err) => {
  console.error('Redis Client Error', err);
});

client.connect();

const cacheMiddleware = async (req, res, next) => {
  const key = req.originalUrl;

  try {
    const cachedData = await client.get(key);
    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }
    next();
  } catch (error) {
    console.error('Cache Middleware Error:', error);
    next();
  }
};

const setCache = async (key, data, expiration = 3600) => {
  try {
    await client.set(key, JSON.stringify(data), {
      EX: expiration,
    });
  } catch (error) {
    console.error('Set Cache Error:', error);
  }
};

const invalidateCache = async (pattern) => {
  try {
    const keys = await client.keys(pattern);
    for (const key of keys) {
      await client.del(key);
    }
  } catch (error) {
    console.error('Invalidate Cache Error:', error);
  }
};

module.exports = { cacheMiddleware, setCache, invalidateCache };
