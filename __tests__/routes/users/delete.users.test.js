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

  it('DELETE, should NOT delete user (not logged in)', async () => {
    await addAdmin();
    await addUser();

    const usersBefore = await User.findAll();
    const addressesBefore = await Address.findAll();
    const waterMetersBefore = await WaterMeter.findAll();


    const res1 = await request(server).delete('/users/2');

    const usersAfter = await User.findAll();
    const addressesAfter = await Address.findAll();
    const waterMetersAfter = await WaterMeter.findAll();

    expect(usersBefore).toHaveLength(usersAfter.length);
    expect(addressesBefore).toHaveLength(addressesAfter.length);
    expect(waterMetersBefore).toHaveLength(waterMetersAfter.length);

    const cookie = getCookie(res1);
    const res2 = await request(server).get('/').set('cookie', cookie);

    expect(res2.text).toEqual(expect.stringContaining('You must be logged in'));
  });

  it('DELETE, should NOT delete user (not admin)', async () => {
    await addAdmin();
    await addUser();

    const usersBefore = await User.findAll();
    const addressesBefore = await Address.findAll();
    const waterMetersBefore = await WaterMeter.findAll();

    const sessionCookie = await getSessionCookie(request, server, userForm);

    const res1 = await request(server).delete('/users/1').set('cookie', sessionCookie);

    const usersAfter = await User.findAll();
    const addressesAfter = await Address.findAll();
    const waterMetersAfter = await WaterMeter.findAll();

    expect(usersBefore).toHaveLength(usersAfter.length);
    expect(addressesBefore).toHaveLength(addressesAfter.length);
    expect(waterMetersBefore).toHaveLength(waterMetersAfter.length);

    const cookie = getCookie(res1);
    const res2 = await request(server).get('/').set('cookie', cookie);

    expect(res2.text).toEqual(expect.stringContaining('Sorry, only administrator can do it'));
  });

  it('DELETE, should delete user with address, watermeters (admin)', async () => {
    await addAdmin();
    await addUser();

    const usersBefore = await User.findAll();
    const addressesBefore = await Address.findAll();
    const waterMetersBefore = await WaterMeter.findAll();

    const sessionCookie = await getSessionCookie(request, server, adminForm);

    const res1 = await request(server).delete('/users/2').set('cookie', sessionCookie);

    const usersAfter = await User.findAll();
    const addressesAfter = await Address.findAll();
    const waterMetersAfter = await WaterMeter.findAll();

    expect(usersAfter).toHaveLength(usersBefore.length - 1);
    expect(addressesAfter).toHaveLength(addressesBefore.length - 1);
    expect(waterMetersAfter).toHaveLength(waterMetersBefore.length - 2);

    const cookie = getCookie(res1);
    const res2 = await request(server).get('/').set('cookie', cookie);

    expect(res2.text).toEqual(expect.stringContaining('has been deleted'));
  });
});
