import { showAllWatermeters, renderAddReadoutsView, renderWatermetersUser } from '../controllers/watermeters';

export default (router) => {
  router.get('watermetersAll', '/watermeters', showAllWatermeters);
  router.get('watermetersUser', '/watermeters/user/:id', renderWatermetersUser);
  router.get('addReadouts', '/watermeters/user/:id/addreadouts', renderAddReadoutsView);
};
