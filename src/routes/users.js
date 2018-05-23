import { checkAuthMw, hasAdminRights } from '../utils/middlewares';
import {
  showOneUser,
  showAllUsers,
  showFormNewUser,
  showFormEditUser,
  checkRights,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/users';


export default (router) => {
  const checkAuth = checkAuthMw('You must be logged in to edit profile');

  router
    .get('users', '/users', checkAuth, hasAdminRights, showAllUsers)
    .get('newUser', '/users/new', checkAuth, hasAdminRights, showFormNewUser)
    .get('editUser', '/users/:id/edit', checkAuth, hasAdminRights, showFormEditUser)
    .post('users', '/users', checkAuth, hasAdminRights, createUser)
    .get('userProfile', '/users/:id', checkAuth, checkRights, showOneUser)
    .patch('patchUser', '/users/:id', checkAuth, checkRights, updateUser)
    .delete('deleteUser', '/users/:id', checkAuth, hasAdminRights, deleteUser);
};
