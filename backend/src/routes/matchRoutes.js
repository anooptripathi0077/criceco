const express = require('express');
const router = express.Router();
const {
    getMatches,
    addMatch,
    getMatchSeatsAndPricing,
    getBlockSeats,
    getStandBlocks,
    getMatchStands,       
    getSeatPrice,
} = require('../controllers/matchController');
const { protect } = require('../middlewares/authMiddleware');
const { admin } = require('../middlewares/adminMiddleware');

router.route('/')
    .get(getMatches)
    .post(protect, admin, addMatch);

router.get('/:id/stands',                   getMatchStands);        // ← new route (must be before /:id/stands/:standId/blocks)
router.get('/:id/seats',                    getMatchSeatsAndPricing);
router.get('/:id/stands/:standId/blocks',   getStandBlocks);
router.get('/:id/blocks/:blockId/seats',    getBlockSeats);
router.get('/:id/seat-price/:seatId',       getSeatPrice);

module.exports = router;