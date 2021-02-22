const Sequelize = require('sequelize');

// db
//   .authenticate()
//   .then(() => {
//     console.log('Connection has been established successfully.');
//   })
//   .catch(err => {
//     console.error('Unable to connect to the database:', err);
//   });

// const { applyExtraSetup } = require('./extra-setup');

// In a real app, you should keep the database connection URL as an environment variable.
// But for this example, we will just use a local SQLite database.
// const sequelize = new Sequelize(process.env.DB_CONNECTION_URL);
const sequelize = new Sequelize({
	dialect: 'sqlite',
    storage: './db/eamon.sqlite3',
	logQueryParameters: true,
	benchmark: true
});

const modelDefiners = [
	require('./models/adventure'),
	require('./models/room'),
	require('./models/room-exit')
];

// We define all models according to their files.
for (const modelDefiner of modelDefiners) {
	modelDefiner(sequelize);
}

// We execute any extra setup after the models are defined, such as adding associations.
const { adventure, room, roomExit } = sequelize.models;

adventure.hasMany(room, {
  foreignKey: 'adventure_id'
});
room.belongsTo(adventure, {
  foreignKey: 'adventure_id'
});
room.hasMany(roomExit, {
  foreignKey: 'room_from_id'
});
roomExit.belongsTo(room, {
    foreignKey: 'room_from_id'
});

// We export the sequelize connection instance to be used around our app.
module.exports = sequelize;
