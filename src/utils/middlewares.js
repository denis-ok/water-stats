const checkAuthMw = (msg = 'You must be logged in') => async (ctx, next) => {
  if (ctx.state.isUserSignedIn()) {
    await next();
    return;
  }

  ctx.flash.set(msg);
  ctx.redirect('/');
};


const hasAdminRights = async (ctx, next) => {
  if (!ctx.session.userId || !ctx.state.currentUser.isAdmin()) {
    ctx.flash.set('Sorry, only administrator can do it');
    ctx.redirect('/');
    return;
  }

  await next();
};


export { checkAuthMw, hasAdminRights };
