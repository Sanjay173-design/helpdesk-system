module.exports = (sequelize, DataTypes) => {
  const Ticket = sequelize.define(
    'Ticket',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      ticketNumber: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        field: 'ticket_number',
      },
      subject: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: { notEmpty: true, len: [3, 200] },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { notEmpty: true },
      },
      status: {
        type: DataTypes.ENUM(
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
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium',
      },
      category: {
        type: DataTypes.STRING(60),
        allowNull: true,
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'created_by',
      },
      assignedTo: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'assigned_to',
      },
      resolvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'resolved_at',
      },
      closedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'closed_at',
      },
      // Used for optimistic concurrency checks from the client
      version: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
    },
    {
      tableName: 'tickets',
      underscored: true,
      timestamps: true,
      paranoid: true,
      hooks: {
        beforeUpdate: (ticket) => {
          ticket.version += 1;
        },
      },
    }
  );

  Ticket.associate = (models) => {
    Ticket.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
    Ticket.belongsTo(models.User, { foreignKey: 'assignedTo', as: 'agent' });
    Ticket.hasMany(models.TicketComment, {
      foreignKey: 'ticketId',
      as: 'comments',
      onDelete: 'CASCADE',
    });
    Ticket.hasMany(models.TicketStatusHistory, {
      foreignKey: 'ticketId',
      as: 'history',
      onDelete: 'CASCADE',
    });
  };

  return Ticket;
};
