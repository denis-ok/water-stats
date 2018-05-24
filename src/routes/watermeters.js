import showWatermeters from '../controllers/watermeters';

export default (router) => {
  router.get('watermetersList', '/watermeters', showWatermeters);
};
