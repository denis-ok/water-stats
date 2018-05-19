// import debugLib from 'debug';
// const debugLog = debugLib('app:routes:welcome.js');

export default (router) => {
  router.get('root', '/', (ctx) => {
    ctx.render('welcome/index');
  });
};
