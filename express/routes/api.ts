import express from 'express';
import { PrismaClient } from '@prisma/client'

const router = express.Router();
const prisma = new PrismaClient()

router.get('/authors',
    async (req, res) => {
    const authors = await prisma.author.findMany();
    res.json(authors);
});

router.get('/adventures', async (req, res) => {
  // TODO: include tags and ratings
  const adventures = await prisma.adventure.findMany({
    include: {
      authors: {
        include: {
          author: true,
        }
      }
    }
  })
  // TODO: need to not flatten the authors array for editing
  const advs = adventures.map(a => {
    return {
      ...a,
      authors: a.authors.map(aa => aa.author.name),
    }
  });
  return res.json(advs);
});

router.get('/adventures/:slug/rooms',
    async (req, res) => {
    const adv = await prisma.adventure.findFirst({
      where: {
        slug: req.params.slug
      }});
    const rooms = await prisma.room.findMany({
      where: {
        adventure_id: adv.id
      },
      include: {
        exits: true
      }});
    res.json(rooms);
});

router.get('/adventures/:slug/artifacts',
    async (req, res) => {
    const adv = await prisma.adventure.findFirst({
      where: {
        slug: req.params.slug
      }});
    const rooms = await prisma.artifact.findMany({
      where: {
        adventure_id: adv.id
      }});
    res.json(rooms);
});

router.get('/adventures/:slug/effects',
    async (req, res) => {
    const adv = await prisma.adventure.findFirst({
      where: {
        slug: req.params.slug
      }});
    const rooms = await prisma.effect.findMany({
      where: {
        adventure_id: adv.id
      }});
    res.json(rooms);
});

router.get('/adventures/:slug/monsters',
    async (req, res) => {
    const adv = await prisma.adventure.findFirst({
      where: {
        slug: req.params.slug
      }});
    const rooms = await prisma.monster.findMany({
      where: {
        adventure_id: adv.id
      }});
    res.json(rooms);
});

router.get('/adventures/:slug/hints',
    async (req, res) => {
    const adv = await prisma.adventure.findFirst({
      where: {
        slug: req.params.slug
      }});
    const rooms = await prisma.hint.findMany({
      where: {
        adventure_id: adv.id
      },
      include: {
        answers: true,
      }
    });
    res.json(rooms);
});

module.exports = router;
