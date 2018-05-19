import welcome from './welcome';

const controllers = [welcome];

export default router => controllers.forEach(f => f(router));
