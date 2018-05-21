// import { User } from '../models';
// import buildFormObj from './formObjectBuilder';

const checkAuth = (router, msg = 'You must be logged in') => async (ctx, next) => {
  if (ctx.state.isUserSignedIn()) {
    await next();
    return;
  }

  ctx.flash.set(msg);
  ctx.redirect(router.url('newSession'));
};


const hasRightsEditUserMw = router => async (ctx, next) => {
  const { userId } = ctx.session;
  const { id } = ctx.params;

  if (Number(userId) === Number(id)) {
    await next();
    return;
  }

  ctx.flash.set('Sorry, you can edit only your own profile');
  ctx.redirect(router.url('root'));
};


const hasAdminRightsMw = router => async (ctx, next) => {
  if (!ctx.session.userId || !ctx.state.currentUser.isAdmin()) {
    ctx.flash.set('Sorry, only administrator can do it');
    ctx.redirect(router.url('root'));
    return;
  }

  await next();
};

// const checkDefaultPassword = async (ctx, next) => {
//   const currentUser = await User.findById(ctx.session.userId);

//   if (!currentUser) {
//     await next();
//     return;
//   }

//   if (currentUser.hasDefaultPassword()) {
//     ctx.render('users/edit', { formObj: buildFormObj(currentUser), title: 'Edit Profile' });
//     return;
//   }

//   await next();
// };


export { checkAuth, hasAdminRightsMw, hasRightsEditUserMw };
