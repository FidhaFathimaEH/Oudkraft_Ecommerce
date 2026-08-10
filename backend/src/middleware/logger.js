const morgan = require('morgan');

module.exports = process.env.NODE_ENV === 'production' ? morgan('combined') : morgan('dev');
