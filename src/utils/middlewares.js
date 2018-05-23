import debugLib from 'debug';

const debugLog = debugLib('app:utils:middlewares.js');


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


const checkDefaultPassword = () => async (ctx, next) => {
  const { url } = ctx.request;
  const { currentUser } = ctx.state;

  debugLog('Check default password middleware');
  debugLog('User go to url:', url);

  const allowedUrls = new Set(['/passwords', '/passwords/new', '/session']);

  if (!currentUser) {
    debugLog('User not logged in, next()');
    await next();
    return;
  }

  if (allowedUrls.has(url)) {
    debugLog('Its allowed url');
    await next();
    return;
  }

  if (currentUser.hasDefaultPassword()) {
    debugLog('Need to change password, show form');
    ctx.redirect('/passwords/new');
    return;
  }

  await next();
};


export { checkAuthMw, hasAdminRights, checkDefaultPassword };
