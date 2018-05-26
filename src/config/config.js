const config = {
  development: {
    storage: './db.development.sqlite',
    dialect: 'sqlite',
    operatorsAliases: 'Sequelize.Op',
  },
  test: {
    storage: ':memory:',
    dialect: 'sqlite',
    operatorsAliases: 'Sequelize.Op',
  },
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: {
      // native: true,
      ssl: true,
    },
    operatorsAliases: 'Sequelize.Op',
  },
};

module.exports = config;

// operatorsAliases: 'Sequelize.Op' - this prop fix message:

// sequelize deprecated String based operators are now deprecated.
// Please use Symbol based operators for better security,
// read more at http://docs.sequelizejs.com/manual/tutorial/querying.html#operators

