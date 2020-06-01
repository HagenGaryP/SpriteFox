const express = require('express');
const app = express();
const path = require('path');
const morgan = require('morgan');

app.use(morgan('dev'));

app.use(express.static(path.join(__dirname, '../public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use(function (err, req, res, next) {
  console.error(err);
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || 'Internal server error.');
});

const PORT = process.env.PORT || 3000; // this can be very useful if you deploy to Heroku!

module.exports = app;
