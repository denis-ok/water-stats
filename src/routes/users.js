import { checkAuthMw, hasAdminRights } from '../utils/middlewares';
import {
  showOneUser,
  showAllUsers,
  showFormNewUser,
  showFormEditUser,
  hasRightsEditUser,
  checkRights,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/users';


export default (router) => {
  const checkAuth = checkAuthMw(router, 'You must be logged in to edit profile');

  router
    .get('users', '/users', checkAuth, hasAdminRights, showAllUsers)
    .get('newUser', '/users/new', checkAuth, hasAdminRights, showFormNewUser)
    .get('editUser', '/users/:id/edit', checkAuth, checkRights, showFormEditUser)
    .post('users', '/users', checkAuth, hasAdminRights, createUser)
    .get('userProfile', '/users/:id', checkAuth, checkRights, showOneUser)
    .patch('patchUser', '/users/:id', checkAuth, hasRightsEditUser, updateUser)
    .delete('deleteUser', '/users/:id', checkAuth, hasAdminRights, deleteUser);
};
