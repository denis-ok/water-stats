import _ from 'lodash';

export default (object, error = { errors: [] }) => ({
  name: 'form',
  object: object.dataValues || {},
  errors: _.groupBy(error.errors, 'path'),
});
