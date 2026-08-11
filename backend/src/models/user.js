module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
        validate: { notEmpty: true, len: [2, 120] },
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'password_hash',
      },
      role: {
        type: DataTypes.ENUM('customer', 'agent', 'admin'),
        allowNull: false,
        defaultValue: 'customer',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active',
      },
    },
    {
      tableName: 'users',
      underscored: true,
      timestamps: true,
      paranoid: true, // soft delete
    }
  );

  User.associate = (models) => {
    User.hasMany(models.Ticket, {
      foreignKey: 'createdBy',
      as: 'createdTickets',
    });
    User.hasMany(models.Ticket, {
      foreignKey: 'assignedTo',
      as: 'assignedTickets',
    });
    User.hasMany(models.TicketComment, { foreignKey: 'authorId' });
    User.hasMany(models.TicketStatusHistory, { foreignKey: 'changedBy' });
  };

  // Never leak the password hash
  User.prototype.toSafeJSON = function toSafeJSON() {
    const { id, name, email, role, isActive, createdAt, updatedAt } =
      this.get();
    return { id, name, email, role, isActive, createdAt, updatedAt };
  };

  return User;
};
