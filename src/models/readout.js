const numFieldValidation = {
  isNumeric: {
    args: true,
    msg: 'Please use only integer numbers'
  },
  isInt: {
    args: true,
    msg: 'Please use only integer numbers'
  },
  min: {
    args: 1,
    msg: 'Readout value can be between 1 and 100'
  },
  max: {
    args: 999,
    msg: 'Readout value can be between 1 and 100'
  },
  notEmpty: {
    args: true,
    msg: 'Please type value, readout field cannot be empty'
  },
};

export default (sequelize, DataTypes) => {
  const Readout = sequelize.define('Readout', {
    value: {
      type: DataTypes.INTEGER,
      validate: numFieldValidation,
    },
  }, {});

  Readout.associate = function(models) {
  };

  return Readout;
};