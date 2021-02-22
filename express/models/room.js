const DataTypes = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('room', {
        name: DataTypes.STRING,
        description: DataTypes.TEXT,
        is_dark: DataTypes.BOOLEAN,
    }, {
        tableName: 'adventure_room',
        timestamps: false
    });
};
