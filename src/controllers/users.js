import debugLib from 'debug';
import buildFormObj from '../utils/formObjectBuilder';
import { Address, User, Role, WaterMeter } from '../models';

const debugLog = debugLib('app:controllers:users.js');


const replaceAddressErrMsg = (e) => {
  const predicate = str => str === 'house must be unique' || str === 'flat must be unique';

  const replaceMsg = (err) => {
    const msg = err.message;

    if (predicate(msg)) {
      const newErr = err;
      newErr.message = 'Address (house and flat) already used by another user';
      return newErr;
    }

    return err;
  };

  const errObj = e;
  const errorsArr = errObj.errors;
  const errorsArrNew = errorsArr.map(err => replaceMsg(err));

  errObj.errors = errorsArrNew;

  return errObj;
};


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
  debugLog('showFormNewUser middleware...');
  const user = await User.build();
  const address = await Address.build();

  ctx.render('users/new', {
    formObjUser: buildFormObj(user),
    formObjAddr: buildFormObj(address),
    title: 'Add new user',
  });
};


const showFormEditUser = async (ctx) => {
  debugLog('showFormEditUser middleware...');

  const { id } = await ctx.params;
  const user = await User.findById(id);
  const address = await user.getAddress();

  ctx.render('users/edit', {
    formObjUser: buildFormObj(user),
    formObjAddr: buildFormObj(address),
    title: 'Edit Profile',
  });
};


const createUser = async (ctx) => {
  debugLog('Create User middleware...');
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
    WaterMeters: [{ waterType: 'cold' }, { waterType: 'hot' }],
  }, {
    include: [{
      model: Address,
      as: 'Address',
    },
    {
      model: WaterMeter,
      as: 'WaterMeters',
    }],
  });

  try {
    debugLog('Try to save...');
    await userFull.save();


    ctx.flash.set('User has been created');
    ctx.redirect('/');
  } catch (e) {
    debugLog('Catch error:', e);
    await userFull.destroy();
    ctx.render('users/new', {
      formObjUser: buildFormObj(user, e),
      formObjAddr: buildFormObj(address, replaceAddressErrMsg(e)),
      title: 'Add new user',
    });
  }
};

const updateUser = async (ctx) => {
  debugLog('Update User middleware...');

  const { id } = await ctx.params;
  const user = await User.findById(id);
  const address = await user.getAddress();

  const form = await ctx.request.body;

  const userForm = {
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
  };

  const addressForm = {
    house: form.house,
    flat: form.flat,
  };


  try {
    debugLog('Try to update...');

    await user.update(userForm);
    await address.update(addressForm);
    ctx.flash.set('Profile has been updated');
    ctx.redirect(['/users/', id, '/edit'].join(''));
  } catch (e) {
    debugLog('Catch error:', e);

    ctx.render('users/edit', {
      formObjUser: buildFormObj(user, e),
      formObjAddr: buildFormObj(address, replaceAddressErrMsg(e)),
      title: 'Edit User Profile',
    });
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
  createUser,
  updateUser,
  deleteUser,
};
