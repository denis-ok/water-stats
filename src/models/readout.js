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
    msg: 'Readout value can be between 0 and 99999'
  },
  max: {
    args: 99999,
    msg: 'Readout value can be between 0 and 99999'
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
    date: {
      type: DataTypes.DATE,
    },
    waterMeterId: {
      type: DataTypes.INTEGER,
    },
  }, {});

  Readout.associate = function(models) {
  };

  Readout.prototype.getYear = function() {
    const date = new Date(this.date);
    const month = date.toLocaleString('en-US', { year: 'numeric' });
    return month;
  };

  Readout.prototype.getMonth = function() {
    const date = new Date(this.date);
    const month = date.toLocaleString('en-US', { month: 'long' });
    return month;
  };

  Readout.prototype.getMonthNum = function() {
    const date = new Date(this.date);
    const month = date.getMonth();
    return month;
  };

  return Readout;
};