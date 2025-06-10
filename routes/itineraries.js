const express = require('express');
const router = express.Router();
const { Itinerary, Activity } = require('../models/Itinerary');

// Get all itineraries with their activities
router.get('/', async (req, res) => {
  try {
    const itineraries = await Itinerary.findAll({
      include: [Activity],
      order: [['createdAt', 'DESC']]
    });
    res.json(itineraries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one itinerary with its activities
router.get('/:id', async (req, res) => {
  try {
    const itinerary = await Itinerary.findByPk(req.params.id, {
      include: [Activity]
    });
    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' });
    res.json(itinerary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create itinerary with activities
router.post('/', async (req, res) => {
  try {
    const { title, description, startDate, endDate, activities } = req.body;
    
    const itinerary = await Itinerary.create({
      title,
      description,
      startDate,
      endDate
    });

    if (activities && activities.length > 0) {
      await Promise.all(activities.map(activity => 
        Activity.create({
          ...activity,
          ItineraryId: itinerary.id
        })
      ));
    }

    const createdItinerary = await Itinerary.findByPk(itinerary.id, {
      include: [Activity]
    });
    
    res.status(201).json(createdItinerary);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update itinerary and its activities
router.put('/:id', async (req, res) => {
  try {
    const itinerary = await Itinerary.findByPk(req.params.id);
    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' });

    const { title, description, startDate, endDate, activities } = req.body;

    // Update itinerary
    await itinerary.update({
      title,
      description,
      startDate,
      endDate
    });

    // Handle activities
    if (activities) {
      // Delete existing activities
      await Activity.destroy({
        where: { ItineraryId: itinerary.id }
      });

      // Create new activities
      if (activities.length > 0) {
        await Promise.all(activities.map(activity =>
          Activity.create({
            ...activity,
            ItineraryId: itinerary.id
          })
        ));
      }
    }

    // Fetch updated itinerary with activities
    const updatedItinerary = await Itinerary.findByPk(itinerary.id, {
      include: [Activity]
    });

    res.json(updatedItinerary);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete itinerary and its activities
router.delete('/:id', async (req, res) => {
  try {
    const itinerary = await Itinerary.findByPk(req.params.id);
    if (!itinerary) return res.status(404).json({ message: 'Itinerary not found' });

    // Delete associated activities first
    await Activity.destroy({
      where: { ItineraryId: itinerary.id }
    });

    // Delete the itinerary
    await itinerary.destroy();
    res.json({ message: 'Itinerary deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 