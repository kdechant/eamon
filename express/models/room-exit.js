const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('roomExit', {
        direction: Sequelize.CHAR,
        room_from_id: Sequelize.INTEGER,
        room_to: Sequelize.INTEGER,
        door_id: Sequelize.INTEGER,
        effect_id: Sequelize.INTEGER,
    }, {
        tableName: 'adventure_roomexit',
        timestamps: false
    });
};
