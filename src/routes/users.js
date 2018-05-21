import debugLib from 'debug';
import buildFormObj from '../utils/formObjectBuilder';
import { User, Role } from '../models';
// import colors from '../utils/colors';
import { checkAuth, hasRightsEditUserMw, hasAdminRightsMw } from '../utils/middlewares';

const debugLog = debugLib('app:routes:users.js');

export default (router) => {
  const checkAuthMw = checkAuth(router, 'You must be logged in to edit profile');
  const hasRightsEditUser = hasRightsEditUserMw(router);
  const hasAdminRights = hasAdminRightsMw(router);

  router
    .get('users', '/users', checkAuthMw, hasAdminRights, async (ctx) => {
      const users = await User.findAll({
        include: [{
          model: Role,
          as: 'Role',
        }],
      });

      ctx.render('users', { users, title: 'Users List' });
    })


    .get('newUser', '/users/new', checkAuthMw, hasAdminRights, (ctx) => {
      const user = User.build();
      ctx.render('users/new', { formObj: buildFormObj(user), title: 'Add new user' });
    })


    .post('users', '/users', checkAuthMw, hasAdminRights, async (ctx) => {
      const form = await ctx.request.body;

      const defaultPassword = `${form.firstName}${form.lastName}`.toLowerCase();
      form.password = defaultPassword;

      const user = User.build(form);


      try {
        await user.save();
        ctx.flash.set('User has been created');
        ctx.redirect(router.url('root'));
      } catch (e) {
        debugLog('\nERROR:\n', e);
        ctx.render('users/new', { formObj: buildFormObj(user, e), title: 'Add new user' });
      }
    })


    .get('editUser', '/users/:id/edit', checkAuthMw, hasRightsEditUser, async (ctx) => {
      const { userId } = ctx.session;

      const user = await User.findOne({
        where: {
          id: userId,
        },
      });

      ctx.render('users/edit', { formObj: buildFormObj(user), title: 'Edit Profile' });
    })


    .get('userProfile', '/users/:id', checkAuthMw, async (ctx) => {
      const { id } = ctx.params;
      const { currentUser } = ctx.state;

      if (currentUser.isAdmin() || Number(currentUser.id) === Number(id)) {
        const user = await User.findOne({
          where: {
            id,
          },
        });

        ctx.render('users/profile', { user, formObj: buildFormObj(user), title: 'Edit Profile' });
        return;
      }

      ctx.flash.set('Sorry, you can view only your own profile');
      ctx.redirect(router.url('root'));
    })


    .patch('patchUser', '/users/:id', checkAuthMw, hasRightsEditUser, async (ctx) => {
      const { userId } = ctx.session;

      const user = await User.findOne({
        where: {
          id: userId,
        },
      });

      const form = await ctx.request.body;
      form.id = userId;

      if (form.password !== form.confirmPassword) {
        ctx.flash.set('Please type same passwords');
        ctx.redirect(router.url('editUser', userId));
        return;
      }

      try {
        await user.update(form);
        ctx.flash.set('Your profile has been updated');
        ctx.redirect(router.url('root'));
      } catch (e) {
        debugLog('error', e);
        ctx.render('users/edit', { formObj: buildFormObj(user, e), title: 'Edit Profile' });
      }
    })


    .delete('deleteUser', '/users/:id', checkAuthMw, hasAdminRights, async (ctx) => {
      const { id } = ctx.params;

      if (id === ctx.session.id) {
        ctx.flash.set('Sorry, you cannot delete your own profile');
        ctx.redirect(router.url('users'));
      }

      const user = await User.findOne({
        where: {
          id,
        },
      });


      try {
        await user.destroy();
        ctx.flash.set(`User "${user.getFullname()}" has been deleted`);
        ctx.redirect(router.url('users'));
      } catch (e) {
        debugLog('\nERROR:\n', e);
        ctx.flash.set('Error happened when deleting user');
        ctx.redirect(router.url('users'));
      }
    });
};
