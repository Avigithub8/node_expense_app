const  {DataTypes}  = require('sequelize');
const sequelize = require('./index');

const ForgotPasswordRequest = sequelize.define('ForgotPasswordRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // resetToken: { 
  //   type: DataTypes.UUID,
  //   defaultValue: DataTypes.UUIDV4,
  // },
  resetToken: {
    type: DataTypes.CHAR(36),
    defaultValue: null,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = ForgotPasswordRequest;
