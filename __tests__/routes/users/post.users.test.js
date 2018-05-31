import request from 'supertest';
import { User, Address, WaterMeter, Readout } from '../../../src/models';
import initModels from '../../../src/init';
import { addRoles } from '../../../src/dummyData';
import app from '../../../src';
import { getSessionCookie, getCookie } from '../../../src/utils/test/getSessionCookie';


const adminForm = {
  email: 'admin@admin.ru',
  password: 'qqqqqq',
};

const userForm = {
  email: 'user@user.ru',
  password: 'qqqqqq',
};

const newUserForm = {
  email: 'aaa@bbb.ru',
  firstName: 'User',
  lastName: 'User',
  house: '1',
  flat: '1',
};

const addAdmin = async () => {
  const user = await User.create({
    firstName: 'Admin',
    lastName: 'Admin',
    email: adminForm.email,
    password: adminForm.password,
    roleId: 1,
    Address: {
      house: 11,
      flat: 111,
    },
    WaterMeters: [{ waterType: 'cold' }, { waterType: 'hot' }],
  }, {
    include: [
      {
        model: Address,
        as: 'Address',
      },
      {
        model: WaterMeter,
        as: 'WaterMeters',
      },
    ],
  });

  return user;
};

const addUser = async () => {
  const user = await User.create({
    firstName: 'John',
    lastName: 'Brown',
    email: userForm.email,
    password: userForm.password,
    roleId: 2,
    Address: {
      house: 12,
      flat: 345,
    },
    WaterMeters: [{ waterType: 'cold' }, { waterType: 'hot' }],
  }, {
    include: [
      {
        model: Address,
        as: 'Address',
      },
      {
        model: WaterMeter,
        as: 'WaterMeters',
      },
    ],
  });

  return user;
};


describe('requests', () => {
  let server;

  beforeAll(async () => {
    await initModels();
    await addRoles();
  });

  beforeEach(async () => {
    await WaterMeter.sync({ force: true });
    await Readout.sync({ force: true });
    await User.sync({ force: true });
    await Address.sync({ force: true });

    server = app().listen();
  });

  afterEach((done) => {
    server.close();
    done();
  });

  it('POST, should NOT add new user (not logged in)', async () => {
    const usersBefore = await User.findAll();
    const res1 = await request(server).post('/users').send(newUserForm);
    const usersAfter = await User.findAll();

    expect(usersBefore).toEqual(usersAfter);

    const cookie = getCookie(res1);
    const res2 = await request(server).get('/').set('cookie', cookie);

    expect(res2.text).toEqual(expect.stringContaining('You must be logged in'));
  });

  it('POST, should NOT add new user (not admin)', async () => {
    await addUser();

    const sessionCookie = await getSessionCookie(request, server, userForm);

    const usersBefore = await User.findAll();

    const res1 = await request(server)
      .post('/users')
      .set('cookie', sessionCookie)
      .send(newUserForm);

    const usersAfter = await User.findAll();

    expect(usersBefore).toEqual(usersAfter);

    const cookie = getCookie(res1);
    const res2 = await request(server).get('/').set('cookie', cookie);

    expect(res2.text).toEqual(expect.stringContaining('Sorry, only administrator can do it'));
  });

  it('POST, should add new user and address (admin)', async () => {
    await addAdmin();

    const sessionCookie = await getSessionCookie(request, server, adminForm);

    const res1 = await request(server)
      .post('/users')
      .set('cookie', sessionCookie)
      .send(newUserForm);

    const usersAfter = await User.findAll();
    const addressesAfter = await Address.findAll();

    expect(usersAfter).toHaveLength(2);
    expect(addressesAfter).toHaveLength(2);

    const cookie = getCookie(res1);
    const res2 = await request(server).get('/').set('cookie', cookie);

    expect(res2.text).toEqual(expect.stringContaining('User has been created'));
  });

  it('POST, should NOT add new user (email already exist)', async () => {
    const newUserFormWrong = {
      email: 'user@user.ru',
      firstName: 'User',
      lastName: 'User',
      house: '1234',
      flat: '1234',
    };

    await addAdmin();
    await addUser();

    const usersBefore = await User.findAll();
    const addressesBefore = await Address.findAll();
    const waterMetersBefore = await WaterMeter.findAll();

    const sessionCookie = await getSessionCookie(request, server, adminForm);
    const res1 = await request(server)
      .post('/users')
      .set('cookie', sessionCookie)
      .send(newUserFormWrong);

    const usersAfter = await User.findAll();
    const addressesAfter = await Address.findAll();
    const waterMetersAfter = await WaterMeter.findAll();

    expect(usersBefore).toHaveLength(usersAfter.length);
    expect(addressesBefore).toHaveLength(addressesAfter.length);
    expect(waterMetersBefore).toHaveLength(waterMetersAfter.length);

    expect(usersAfter).toHaveLength(2);
    expect(addressesAfter).toHaveLength(2);
    expect(waterMetersAfter).toHaveLength(4);

    expect(res1.status).toEqual(200);
    expect(res1.text).toEqual(expect.stringContaining('Sorry, user with this email already registered'));
  });

  it('POST, should NOT add new user (address already exist)', async () => {
    await addAdmin();
    await addUser();

    const usersBefore = await User.findAll();
    const addressesBefore = await Address.findAll();
    const waterMetersBefore = await WaterMeter.findAll();

    const newUserFormWrong = {
      email: 'user1@user.ru',
      firstName: 'User',
      lastName: 'User',
      house: '12',
      flat: '345',
    };

    const sessionCookie = await getSessionCookie(request, server, adminForm);
    const res1 = await request(server)
      .post('/users')
      .set('cookie', sessionCookie)
      .send(newUserFormWrong);

    const usersAfter = await User.findAll();
    const addressesAfter = await Address.findAll();
    const waterMetersAfter = await WaterMeter.findAll();

    expect(usersBefore).toHaveLength(usersAfter.length);
    expect(addressesBefore).toHaveLength(addressesAfter.length);
    expect(waterMetersBefore).toHaveLength(waterMetersAfter.length);

    expect(usersAfter).toHaveLength(2);
    expect(addressesAfter).toHaveLength(2);
    expect(waterMetersAfter).toHaveLength(4);

    expect(res1.status).toEqual(200);
    expect(res1.text).toEqual(expect.stringContaining('Address (house and flat) already used by another user'));
  });

  it('POST, should NOT add new user (validation error, wrong email)', async () => {
    await addAdmin();
    await addUser();

    const usersBefore = await User.findAll();
    const addressesBefore = await Address.findAll();
    const waterMetersBefore = await WaterMeter.findAll();

    const newUserFormWrong = {
      email: 'user',
      firstName: 'User',
      lastName: 'User',
      house: '5',
      flat: '5',
    };

    const sessionCookie = await getSessionCookie(request, server, adminForm);
    const res1 = await request(server)
      .post('/users')
      .set('cookie', sessionCookie)
      .send(newUserFormWrong);

    const usersAfter = await User.findAll();
    const addressesAfter = await Address.findAll();
    const waterMetersAfter = await WaterMeter.findAll();

    expect(usersBefore).toHaveLength(usersAfter.length);
    expect(addressesBefore).toHaveLength(addressesAfter.length);
    expect(waterMetersBefore).toHaveLength(waterMetersAfter.length);

    expect(usersAfter).toHaveLength(2);
    expect(addressesAfter).toHaveLength(2);
    expect(waterMetersAfter).toHaveLength(4);

    expect(res1.status).toEqual(200);
    expect(res1.text).toEqual(expect.stringContaining('Email you have entered is not valid'));
  });

  it('POST, should NOT add new user (validation error, wrong name)', async () => {
    await addAdmin();
    await addUser();

    const usersBefore = await User.findAll();
    const addressesBefore = await Address.findAll();
    const waterMetersBefore = await WaterMeter.findAll();

    const newUserFormWrong = {
      email: 'user1@mail.ru',
      firstName: '1',
      lastName: 'User',
      house: '5',
      flat: '5',
    };

    const sessionCookie = await getSessionCookie(request, server, adminForm);
    const res1 = await request(server)
      .post('/users')
      .set('cookie', sessionCookie)
      .send(newUserFormWrong);

    const usersAfter = await User.findAll();
    const addressesAfter = await Address.findAll();
    const waterMetersAfter = await WaterMeter.findAll();

    expect(usersBefore).toHaveLength(usersAfter.length);
    expect(addressesBefore).toHaveLength(addressesAfter.length);
    expect(waterMetersBefore).toHaveLength(waterMetersAfter.length);

    expect(usersAfter).toHaveLength(2);
    expect(addressesAfter).toHaveLength(2);
    expect(waterMetersAfter).toHaveLength(4);

    expect(res1.status).toEqual(200);
    expect(res1.text).toEqual(expect.stringContaining('First or Lastname must use only Alphabet letters'));
  });

  it('POST, should NOT add new user (validation error, name length)', async () => {
    await addAdmin();
    await addUser();

    const usersBefore = await User.findAll();
    const addressesBefore = await Address.findAll();
    const waterMetersBefore = await WaterMeter.findAll();

    const newUserFormWrong = {
      email: 'user1@mail.ru',
      firstName: 'a',
      lastName: 'User',
      house: '5',
      flat: '5',
    };

    const sessionCookie = await getSessionCookie(request, server, adminForm);
    const res1 = await request(server)
      .post('/users')
      .set('cookie', sessionCookie)
      .send(newUserFormWrong);

    const usersAfter = await User.findAll();
    const addressesAfter = await Address.findAll();
    const waterMetersAfter = await WaterMeter.findAll();

    expect(usersBefore).toHaveLength(usersAfter.length);
    expect(addressesBefore).toHaveLength(addressesAfter.length);
    expect(waterMetersBefore).toHaveLength(waterMetersAfter.length);

    expect(usersAfter).toHaveLength(2);
    expect(addressesAfter).toHaveLength(2);
    expect(waterMetersAfter).toHaveLength(4);

    expect(res1.status).toEqual(200);
    expect(res1.text).toEqual(expect.stringContaining('First or Lastname length must be from 3 to 16 letters'));
  });
});

