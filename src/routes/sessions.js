import { showLoginForm, loginAttempt, deleteSession } from '../controllers/sessions';


export default (router) => {
  router
    .get('newSession', '/session/new', showLoginForm)
    .post('session', '/session', loginAttempt)
    .delete('deleteSession', '/session', deleteSession);
};

