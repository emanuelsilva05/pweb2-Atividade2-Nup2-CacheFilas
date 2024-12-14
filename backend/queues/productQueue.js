const Queue = require('bull');
const { Product } = require('../models');
const { invalidateCache } = require('../middlewares/cache');

const productQueue = new Queue('productQueue');

productQueue.process(async (job) => {
  const { action, data } = job.data;

  try {
    if (action === 'create') {
      await Product.create(data);
    } else if (action === 'update') {
      const { id, ...updateData } = data;
      await Product.update(updateData, { where: { id } });
    }
    await invalidateCache('products*');
  } catch (error) {
    console.error('Product Queue Error:', error);
  }
});

module.exports = productQueue;
