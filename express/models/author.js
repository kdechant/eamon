const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('author', {
        name: Sequelize.STRING,
    }, {
        tableName: 'adventure_author',
        timestamps: false
    });
};

