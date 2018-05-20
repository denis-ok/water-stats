export default (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    name: DataTypes.STRING,
    description: DataTypes.STRING,
  }, {});

  Role.associate = function(models) {
  };

  return Role;
};