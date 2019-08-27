const express = require('express');
const router = express.Router();

module.exports = () => {
  router.get('/:id', (req, res) => {
    console.log(process.env.GOOGLE_API_KEY)
    res.render('account', { userName: req.params.id, googleApiKey: process.env.GOOGLE_API_KEY })
  })

  return router;
}
