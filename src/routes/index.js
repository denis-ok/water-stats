import welcome from './welcome';
import sessions from './sessions';
import users from './users';

const controllers = [welcome, sessions, users];

export default router => controllers.forEach(f => f(router));
