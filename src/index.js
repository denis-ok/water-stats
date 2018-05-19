import Koa from 'koa';
import serve from 'koa-static';
import Pug from 'koa-pug';
import Router from 'koa-router';
import koaLogger from 'koa-logger';
import bodyParser from 'koa-bodyparser';
import flash from 'koa-flash-simple';
import session from 'koa-session';
import debugLib from 'debug';
import methodOverride from 'koa-override';
// import Rollbar from 'rollbar';
import path from 'path';
import dotenv from 'dotenv';
import colors from './utils/colors';
import addRoutes from './routes';


const env = process.env.NODE_ENV || 'development';
dotenv.config();

const debugLog = debugLib('app:index.js');

export default () => {
  console.log('Starting app, environment:', env);

  const app = new Koa();

  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      debugLog(colors.warn('Error catch from top error handler: \n', err));
      ctx.status = err.status || 500;
      ctx.app.emit('error', err, ctx);
    }
  });

  app.on('error', (err, ctx) => {
    debugLog('Render error view');

    ctx.status = err.status;
    switch (ctx.status) {
      case 404:
        ctx.render('errors/index', { err });
        break;
      default:
        ctx.body = 'Oops! Error happened.';
    }
  });

  app.keys = ['some secret hurr'];

  app.use(koaLogger());

  app.use(session(app));
  app.use(flash());

  app.use(async (ctx, next) => {
    ctx.state = {
      flash: ctx.flash,
      isSignedIn: () => ctx.session.userId !== undefined,
      getUserId: () => ctx.session.userId,
    };
    await next();
  });

  app.use(bodyParser());
  app.use(serve(path.join(__dirname, '..', 'public')));
  app.use(methodOverride());

  const router = new Router();
  addRoutes(router);

  app.use(router.allowedMethods());
  app.use(router.routes());

  app.use(async (ctx) => {
    debugLog('No route found. Throwing 404 err');
    ctx.throw(404);
  });

  const pug = new Pug({
    viewPath: path.join(__dirname, 'views'),
    debug: true,
    pretty: false, // deprecated, not recommended in pug docs
    compileDebug: true,
    locals: {},
    basedir: path.join(__dirname, 'views'),
    helperPath: [
      { urlFor: (...args) => router.url(...args) }, // build string of path parts. route must exist
    ],
  });

  pug.use(app);

  return app;
};

