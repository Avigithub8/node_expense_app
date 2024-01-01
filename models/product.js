const  DataTypes  = require('sequelize');
const User = require('./user'); 
const sequelize  = require('./index');

const Product = sequelize.define('Product', {
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
   
  },
});

module.exports = Product;
