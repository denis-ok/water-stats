import welcome from './welcome';
import sessions from './sessions';

const controllers = [welcome, sessions];

export default router => controllers.forEach(f => f(router));
