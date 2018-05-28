import { checkAuthMw, hasAdminRights, checkRights } from '../utils/middlewares';
import {
  showAllWatermeters,
  renderAddReadoutsView,
  renderWatermetersUser,
  validateInput,
  createFirstReadouts,
  checkDate,
  checkGreaterThenLatest,
  createIfNextMonth,
  createWithSkippedReadouts,
} from '../controllers/watermeters';


const createReadoutsFlow = [
  createFirstReadouts,
  checkGreaterThenLatest,
  checkDate,
  createIfNextMonth,
  createWithSkippedReadouts,
];


export default (router) => {
  const checkAuth = checkAuthMw();

  router.get('watermetersAll', '/watermeters', checkAuth, hasAdminRights, showAllWatermeters);
  router.get('watermetersUser', '/watermeters/user/:id', checkAuth, checkRights, renderWatermetersUser);
  router.get('addReadouts', '/watermeters/user/:id/addreadouts', checkAuth, checkRights, renderAddReadoutsView);
  router.post('createReadouts', '/watermeters/user/:id', checkAuth, checkRights, validateInput, ...createReadoutsFlow);
};
