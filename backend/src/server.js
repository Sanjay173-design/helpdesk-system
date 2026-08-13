require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Helpdesk API listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Unable to start server:', err);
    process.exit(1);
  }
}

start();

// Guard against unhandled rejections crashing the process silently
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
});