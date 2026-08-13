'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'password_reset_token', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'password_reset_expires', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addIndex('users', ['password_reset_token']);
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex(
      'users',
      ['password_reset_token']
    );

    await queryInterface.removeColumn(
      'users',
      'password_reset_expires'
    );

    await queryInterface.removeColumn(
      'users',
      'password_reset_token'
    );
  },
};