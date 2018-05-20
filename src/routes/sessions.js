import debugLib from 'debug';
import buildFormObj from '../utils/formObjectBuilder';
import { encrypt } from '../utils/secure';
import { User } from '../models';

const debugLog = debugLib('app:routes:sessions.js');


export default (router) => {
  router
    .get('newSession', '/session/new', async (ctx) => {
      ctx.render('sessions/new', { formObj: buildFormObj({}), title: 'Login Page' });
    })
    .post('session', '/session', async (ctx) => {
      const { email, password } = ctx.request.body;
      const user = await User.findOne({
        where: {
          email: email.toLowerCase(),
        },
      });

      if (user && user.passwordEncrypted === encrypt(password)) {
        ctx.session.userId = user.id;
        debugLog('Correct password, redirecting to root');
        debugLog('ctx.session:', ctx.session);

        ctx.flash.set(`Welcome, ${user.getFullname()}`);
        ctx.redirect(router.url('root'));
        return;
      }

      ctx.flash.set('email or password were wrong');
      ctx.redirect(router.url('newSession'));
    })
    .delete('sessionDelete', '/session', async (ctx) => {
      ctx.session = {};
      ctx.flash.set('Session Deleted');
      ctx.redirect(router.url('root'));
    });
};

