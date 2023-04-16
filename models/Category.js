module.exports = (sequelize, Sequelize) => {
  const Category = sequelize.define('Category', {
    name: {
      type: Sequelize.DataTypes.STRING,

      allowNull: false,
    },
  },
  {
    timestamps: false,
  }
  );
  return Category;
};

