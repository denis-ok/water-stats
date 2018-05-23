import welcome from './welcome';
import sessions from './sessions';
import users from './users';
import passwords from './passwords';

const controllers = [welcome, sessions, users, passwords];

export default router => controllers.forEach(f => f(router));
