const Queue = require('bull');
const { Category } = require('../models');
const { invalidateCache } = require('../middlewares/cache');

const categoryQueue = new Queue('categoryQueue');

categoryQueue.process(async (job) => {
  const { action, data } = job.data;

  try {
    if (action === 'create') {
      await Category.create(data);
    } else if (action === 'update') {
      const { id, ...updateData } = data;
      await Category.update(updateData, { where: { id } });
    }
    await invalidateCache('categories*');
  } catch (error) {
    console.error('Category Queue Error:', error);
  }
});

module.exports = categoryQueue;
