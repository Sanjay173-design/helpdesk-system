'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface) => {
    const passwordHash = await bcrypt.hash('Password123!', 10);
    const now = new Date();

    await queryInterface.bulkInsert('users', [
      {
        id: uuidv4(),
        name: 'Admin User',
        email: 'admin@helpdesk.test',
        password_hash: passwordHash,
        role: 'admin',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: 'Agent Smith',
        email: 'agent@helpdesk.test',
        password_hash: passwordHash,
        role: 'agent',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        name: 'Customer Jane',
        email: 'customer@helpdesk.test',
        password_hash: passwordHash,
        role: 'customer',
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('users', {
      email: [
        'admin@helpdesk.test',
        'agent@helpdesk.test',
        'customer@helpdesk.test',
      ],
    });
  },
};
