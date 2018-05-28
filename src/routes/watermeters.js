import { checkAuthMw, hasAdminRights, checkRights } from '../utils/middlewares';
import {
  showAllWatermeters,
  renderAddReadoutsView,
  renderWatermetersUser,
  validateInput,
  createFirstReadouts,
  checkGreaterThenLatest,
  createReadouts,
} from '../controllers/watermeters';

export default (router) => {
  const checkAuth = checkAuthMw();

  router.get('watermetersAll', '/watermeters', checkAuth, hasAdminRights, showAllWatermeters);
  router.get('watermetersUser', '/watermeters/user/:id', checkAuth, checkRights, renderWatermetersUser);
  router.get('addReadouts', '/watermeters/user/:id/addreadouts', checkAuth, checkRights, renderAddReadoutsView);
  router.post(
    'createReadouts', '/watermeters/user/:id',
    checkAuth,
    checkRights,
    validateInput,
    createFirstReadouts,
    checkGreaterThenLatest,
    createReadouts,
  );
};
