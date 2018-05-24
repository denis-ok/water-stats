import welcome from './welcome';
import sessions from './sessions';
import users from './users';
import passwords from './passwords';
import watermeters from './watermeters';

const controllers = [welcome, sessions, users, passwords, watermeters];

export default router => controllers.forEach(f => f(router));
