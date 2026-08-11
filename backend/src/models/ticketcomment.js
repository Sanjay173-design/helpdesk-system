module.exports = (sequelize, DataTypes) => {
  const TicketComment = sequelize.define(
    'TicketComment',
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
      authorId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'author_id',
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: { notEmpty: true },
      },
      // internal notes are visible to agents/admins only, not the customer
      isInternal: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_internal',
      },
    },
    {
      tableName: 'ticket_comments',
      underscored: true,
      timestamps: true,
    }
  );

  TicketComment.associate = (models) => {
    TicketComment.belongsTo(models.Ticket, {
      foreignKey: 'ticketId',
      as: 'ticket',
    });
    TicketComment.belongsTo(models.User, {
      foreignKey: 'authorId',
      as: 'author',
    });
  };

  return TicketComment;
};
