const DataTypes  = require('sequelize');
const sequelize  = require('./index');
const Product=require('../models/product');
const forgotPassword=require('./forgotPassword')

const User = sequelize.define('User', {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    defaultValue: () => `user_${Date.now()}@example.com`, 
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '00000000',
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'random',
  },
  is_premium: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  resetToken: {
    type: DataTypes.CHAR(36),
    defaultValue: null,
  },
  
});

User.hasMany(Product, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});
Product.belongsTo(User, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});



User.hasMany(forgotPassword, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});
forgotPassword.belongsTo(User, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});

// User.hasMany(forgotPassword, {
//   foreignKey: 'resetToken', // Use resetToken as the foreign key
//   onDelete: 'CASCADE',
// });
// forgotPassword.belongsTo(User, {
//   foreignKey: 'resetToken',
//   onDelete: 'CASCADE',
// });




module.exports = User;

