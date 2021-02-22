const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('adventure', {
        name: Sequelize.STRING,
        slug: Sequelize.STRING,
        description: Sequelize.TEXT,
        full_description: Sequelize.TEXT,
        intro_text: Sequelize.TEXT,
        date_published: Sequelize.DATEONLY,
        dead_body_id: Sequelize.INTEGER,
        directions: Sequelize.INTEGER,
        featured_month: Sequelize.STRING,
    }, {
        tableName: 'adventure_adventure',
        timestamps: false
    });
};
