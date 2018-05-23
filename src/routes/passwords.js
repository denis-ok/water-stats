import { checkAuthMw } from '../utils/middlewares';
import { encrypt } from '../utils/secure';
import buildFormObj from '../utils/formObjectBuilder';

const showNewPasswordForm = async (ctx) => {
  ctx.render('passwords/new', { formObj: buildFormObj({}), title: 'Change Password' });
};


const changePasswordAttempt = async (ctx) => {
  const { currentPassword, password, confirmPassword } = ctx.request.body;
  const user = ctx.state.currentUser;

  if (user.passwordEncrypted === encrypt(currentPassword)) {
    if (currentPassword === password) {
      ctx.flash.set('Old and New passwords are same, please use another password');
      ctx.redirect('/passwords/new');
      return;
    }

    if (password !== confirmPassword) {
      ctx.flash.set('New passwords doesnt match');
      ctx.redirect('/passwords/new');
      return;
    }

    try {
      await user.update({ password });
      ctx.flash.set('You have sussessfully changed password');
      ctx.redirect('/');
    } catch (e) {
      ctx.render('passwords/new', { formObj: buildFormObj(user, e), title: 'Change Password' });
    }
    return;
  }

  ctx.flash.set('You typed incorrect current password, please try again');
  ctx.redirect('/passwords/new');
};


export default (router) => {
  const checkAuth = checkAuthMw('You must be logged to change password');

  router
    .get('changePassword', '/passwords/new', checkAuth, showNewPasswordForm)
    .patch('patchPassword', '/passwords', checkAuth, changePasswordAttempt);
};
