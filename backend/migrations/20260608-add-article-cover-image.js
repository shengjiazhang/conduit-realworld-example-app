'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Articles', 'coverImage', {
      type: Sequelize.STRING(2048),
      allowNull: false,
      defaultValue: '',
      comment: 'Article cover image URL, maximum 2048 characters'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Articles', 'coverImage');
  }
};
