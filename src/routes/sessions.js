// import debugLib from 'debug';
import buildFormObj from '../utils/formObjectBuilder';
// import { encrypt } from '../utils/secure';
// import { User } from '../models';

// const debugLog = debugLib('app:routes:sessions.js');


export default (router) => {
  router
    .get('newSession', '/session/new', async (ctx) => {
      ctx.render('sessions/new', { formObj: buildFormObj({}), title: 'Login Page' });
    })
    .post('session', '/session', async (ctx) => {
      ctx.flash.set('Email or Password was wrong');
      ctx.redirect(router.url('newSession'));
    })
    .delete('sessionDelete', '/session', async (ctx) => {
      ctx.session = {};
      ctx.flash.set('Session Deleted');
      ctx.redirect(router.url('root'));
    });
};

