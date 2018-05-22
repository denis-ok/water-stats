// import debugLib from 'debug';
import buildFormObj from '../utils/formObjectBuilder';
import { encrypt } from '../utils/secure';
import { User } from '../models';

// const debugLog = debugLib('app:controllers:sessions.js');

const showLoginForm = async (ctx) => {
  ctx.render('sessions/new', { formObj: buildFormObj({}), title: 'Login Page' });
};

const loginAttempt = async (ctx) => {
  const { email, password } = ctx.request.body;
  const user = await User.findOne({
    where: {
      email: email.toLowerCase(),
    },
  });


  if (user && user.passwordEncrypted === encrypt(password)) {
    ctx.session.userId = user.id;

    ctx.flash.set(`Welcome, ${user.getFullname()}`);
    ctx.redirect('/');
    return;
  }

  ctx.flash.set('Please try again, email or Password were wrong');
  ctx.redirect('sessions/new');
};

const deleteSession = async (ctx) => {
  ctx.session = {};
  ctx.flash.set('Session Deleted');
  ctx.redirect('/');
};

export { showLoginForm, loginAttempt, deleteSession };
