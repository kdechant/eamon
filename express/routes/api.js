const express = require('express');
const router = express.Router();

const { models } = require('../db');

router.get('/adventures', async (req, res) => {
  const adventures = await models.adventure.findAll({ include: models.author })
  adventures.forEach(adv => {
    // FIXME: overwriting authors here is not working.
    //  (it's possible to overwrite 'name' but not 'authors', and it's
    //  also not possible to add new props)
    adv.authors = adv.authors.map(a => a.name);
    adv.authors = 'nope'
  });
  // TODO: include tags and ratings
  return res.json(adventures);
});

router.get('/adventures/:slug/rooms',
    async (req, res) => {
    const adv = await models.adventure.findOne({ where: {slug: req.params.slug} });
    const rooms = await models.room.findAll(
      { where: {adventure_id: adv.id}, include: models.roomExit});
    res.json(rooms);
});

module.exports = router;
