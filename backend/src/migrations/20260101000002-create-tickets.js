'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tickets', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      ticket_number: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      subject: { type: Sequelize.STRING(200), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      status: {
        type: Sequelize.ENUM(
          'open',
          'in_progress',
          'on_hold',
          'resolved',
          'closed'
        ),
        allowNull: false,
        defaultValue: 'open',
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium',
      },
      category: { type: Sequelize.STRING(60), allowNull: true },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
      assigned_to: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      resolved_at: { type: Sequelize.DATE, allowNull: true },
      closed_at: { type: Sequelize.DATE, allowNull: true },
      version: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addIndex('tickets', ['status']);
    await queryInterface.addIndex('tickets', ['priority']);
    await queryInterface.addIndex('tickets', ['assigned_to']);
    await queryInterface.addIndex('tickets', ['created_by']);
    await queryInterface.addIndex('tickets', ['created_at']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('tickets');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_tickets_status";'
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_tickets_priority";'
    );
  },
};
