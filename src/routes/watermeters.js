import {
  showAllWatermeters,
  renderAddReadoutsView,
  renderWatermetersUser,
  createReadouts,
} from '../controllers/watermeters';

export default (router) => {
  router.get('watermetersAll', '/watermeters', showAllWatermeters);
  router.get('watermetersUser', '/watermeters/user/:id', renderWatermetersUser);
  router.get('addReadouts', '/watermeters/user/:id/addreadouts', renderAddReadoutsView);
  router.post('createReadouts', '/watermeters/user/:id', createReadouts);
};
