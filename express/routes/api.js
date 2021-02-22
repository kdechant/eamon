const express = require('express');
const router = express.Router();

const { models } = require('../db');

router.get('/adventures', (req, res) => {
    models.adventure.findAll().then(advs => res.json(advs));
});

router.get('/adventures/:slug/rooms',
    async (req, res) => {
    const adv = await models.adventure.findOne({ where: {slug: req.params.slug} });
    const rooms = await models.room.findAll({ where: {adventure_id: adv.id}, include: models.roomExit});
    res.json(rooms);
});

module.exports = router;
