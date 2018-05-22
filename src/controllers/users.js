import debugLib from 'debug';
import buildFormObj from '../utils/formObjectBuilder';
import { Address, User, Role } from '../models';

const debugLog = debugLib('app:controllers:users.js');

const showOneUser = async (ctx) => {
  const { id } = ctx.params;
  const user = await User.findOne({
    where: {
      id,
    },
    include: [{
      model: Address,
      as: 'Address',
    }],
  });

  ctx.render('users/profile', { user, formObj: buildFormObj(user), title: 'Edit Profile' });
};

const showAllUsers = async (ctx) => {
  const users = await User.findAll({
    include: [{
      model: Role,
      as: 'Role',
    }, {
      model: Address,
      as: 'Address',
    }],
  });

  ctx.render('users', { users, title: 'Users List' });
};

const showFormNewUser = async (ctx) => {
  const user = await User.build();
  const address = await Address.build();

  ctx.render('users/new', {
    formObjUser: buildFormObj(user),
    formObjAddr: buildFormObj(address),
    title: 'Add new user',
  });
};

const showFormEditUser = async (ctx) => {
  const { userId } = ctx.session;

  const user = await User.findOne({
    where: {
      id: userId,
    },
  });

  ctx.render('users/edit', { formObj: buildFormObj(user), title: 'Edit Profile' });
};

const createUser = async (ctx) => {
  const form = await ctx.request.body;

  const defaultPassword = `${form.firstName}${form.lastName}`.toLowerCase();
  form.password = defaultPassword;

  const user = await User.build(form);
  const address = await Address.build(form);

  const userFull = User.build({
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    password: form.password,
    Address: {
      house: form.house,
      flat: form.flat,
    },
  }, {
    include: [{
      model: Address,
      as: 'Address',
    }],
  });


  try {
    await userFull.save();

    ctx.flash.set('User has been created');
    ctx.redirect('/');
  } catch (e) {
    debugLog('\nERROR:\n', e);
    ctx.render('users/new', {
      formObjUser: buildFormObj(user, e),
      formObjAddr: buildFormObj(address, e),
      title: 'Add new user',
    });
  }
};

const hasRightsEditUser = async (ctx, next) => {
  const { userId } = ctx.session;
  const { id } = ctx.params;

  if (Number(userId) === Number(id)) {
    await next();
    return;
  }

  ctx.flash.set('Sorry, you can edit only your own profile');
  ctx.redirect('/');
};

const checkRights = async (ctx, next) => {
  const { currentUser } = ctx.state;
  const profileId = ctx.params.id;

  if (currentUser.isAdmin()) {
    await next();
    return;
  }

  if (Number(currentUser.id) === Number(profileId)) {
    await next();
    return;
  }

  ctx.flash.set('Sorry, you dont have enough rights to do it');
  ctx.redirect('/');
  await next();
};

const updateUser = async (ctx) => {
  const { userId } = ctx.session;

  const user = await User.findOne({
    where: {
      id: userId,
    },
  });

  const form = await ctx.request.body;
  form.id = userId;

  try {
    await user.update(form);
    ctx.flash.set('Your profile has been updated');
    ctx.redirect('/');
  } catch (e) {
    debugLog('error', e);
    ctx.render('users/edit', { formObj: buildFormObj(user, e), title: 'Edit Profile' });
  }
};

const deleteUser = async (ctx) => {
  const { id } = ctx.params;

  if (id === ctx.session.id) {
    ctx.flash.set('Sorry, you cannot delete your own profile');
    ctx.redirect('/');
  }

  const user = await User.findOne({
    where: {
      id,
    },
  });


  try {
    await user.destroy();
    ctx.flash.set(`User "${user.getFullname()}" has been deleted`);
    ctx.redirect('/users');
  } catch (e) {
    debugLog('\nERROR:\n', e);
    ctx.flash.set('Error happened when deleting user');
    ctx.redirect('/users');
  }
};

export {
  showOneUser,
  showAllUsers,
  showFormNewUser,
  showFormEditUser,
  hasRightsEditUser,
  checkRights,
  createUser,
  updateUser,
  deleteUser,
};
