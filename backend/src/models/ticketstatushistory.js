module.exports = (sequelize, DataTypes) => {
  const TicketStatusHistory = sequelize.define(
    'TicketStatusHistory',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      ticketId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'ticket_id',
      },
      changedBy: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'changed_by',
      },
      fromStatus: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'from_status',
      },
      toStatus: {
        type: DataTypes.STRING(20),
        allowNull: false,
        field: 'to_status',
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'ticket_status_history',
      underscored: true,
      timestamps: true,
      updatedAt: false,
    }
  );

  TicketStatusHistory.associate = (models) => {
    TicketStatusHistory.belongsTo(models.Ticket, {
      foreignKey: 'ticketId',
      as: 'ticket',
    });
    TicketStatusHistory.belongsTo(models.User, {
      foreignKey: 'changedBy',
      as: 'changer',
    });
  };

  return TicketStatusHistory;
};
