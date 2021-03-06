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
    msg: 'House or flat number can be between 1 and 9999'
  },
  max: {
    args: 9999,
    msg: 'House or flat number can be between 1 and 9999'
  },
  notEmpty: {
    args: true,
    msg: 'Field cannot be empty'
  },
};

export default (sequelize, DataTypes) => {
  const Address = sequelize.define('Address', {
    house: {
      type: DataTypes.INTEGER,
      validate: numFieldValidation,
    },
    flat: {
      type: DataTypes.INTEGER,
      validate: numFieldValidation,
    },
    userId: {
      type: DataTypes.INTEGER,
    },
  }, {
    indexes: [
        {
            unique: true,
            fields: ['house', 'flat'],
        }
    ]
});

  Address.associate = function(models) {
  };

  return Address;
};

// This is not possible because it is a schema-validator, and not a general validator that falls inside the validate: { } object.
// The only work around is to include
// defaultValue: '' and then have a notNull object in the validate object.
// Otherwise, just removing allowNull disables most validate: {} checks.