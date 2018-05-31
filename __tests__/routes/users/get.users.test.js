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

// const newUserForm = {
//   email: 'aaa@bbb.ru',
//   firstName: 'User',
//   lastName: 'User',
//   house: '1',
//   flat: '1',
// };

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

  it('GET, Should NOT show user profile (not logged in)', async () => {
    await addUser();
    const res1 = await request(server).get('/users/1');
    expect(res1.status).toEqual(302);

    const cookie = getCookie(res1);
    const res2 = await request(server).get('/').set('cookie', cookie);
    expect(res2.text).toEqual(expect.stringContaining('You must be logged in'));
  });

  it('GET, Should NOT show user profile (not own profile)', async () => {
    await addAdmin();
    await addUser();

    const sessionCookie = await getSessionCookie(request, server, userForm);

    const res1 = await request(server).get('/users/1').set('cookie', sessionCookie);
    expect(res1.status).toEqual(302);

    const cookie = getCookie(res1);
    const res2 = await request(server).get('/').set('cookie', cookie);
    expect(res2.text).toEqual(expect.stringContaining('Sorry, you dont have enough rights to do it'));
  });

  it('GET, Should show user profile (own profile)', async () => {
    await addAdmin();
    await addUser();

    const sessionCookie = await getSessionCookie(request, server, userForm);

    const res1 = await request(server).get('/users/2').set('cookie', sessionCookie);
    expect(res1.status).toEqual(200);
    expect(res1.text).toEqual(expect.stringContaining('John Brown'));
  });

  it('GET, Should show user profiles (as admin)', async () => {
    await addAdmin();
    await addUser();

    const sessionCookie = await getSessionCookie(request, server, adminForm);

    const res1 = await request(server).get('/users/1').set('cookie', sessionCookie);
    expect(res1.status).toEqual(200);
    expect(res1.text).toEqual(expect.stringContaining('Admin Admin'));

    const res2 = await request(server).get('/users/2').set('cookie', sessionCookie);
    expect(res2.status).toEqual(200);
    expect(res2.text).toEqual(expect.stringContaining('John Brown'));
  });

  it('GET, Should NOT show users list page (not logged in)', async () => {
    const res1 = await request(server).get('/users');

    expect(res1.status).toEqual(302);

    const cookie = getCookie(res1);

    const res2 = await request(server).get('/').set('cookie', cookie);
    expect(res2.text).toEqual(expect.stringContaining('You must be logged in'));
  });

  it('GET, Should NOT show users list page (not admin)', async () => {
    await addUser();
    const cookieForSet = await getSessionCookie(request, server, userForm);
    const res1 = await request(server).get('/users').set('cookie', cookieForSet);
    expect(res1.status).toEqual(302);

    const cookie = getCookie(res1);
    const res2 = await request(server).get('/').set('cookie', cookie);
    expect(res2.text).toEqual(expect.stringContaining('Sorry, only administrator can do it'));
  });

  it('GET, Should show users list page (admin)', async () => {
    await addAdmin();
    const cookieForSet = await getSessionCookie(request, server, adminForm);
    const res1 = await request(server).get('/users').set('cookie', cookieForSet);
    expect(res1.status).toEqual(200);
    expect(res1.text).toEqual(expect.stringContaining('Users List'));
    expect(res1.text).toEqual(expect.stringContaining('admin@admin.ru'));
  });

  it('GET, Should NOT show edit user page (not logged in)', async () => {
    await addUser();
    const res1 = await request(server).get('/users/1/edit');
    expect(res1.status).toEqual(302);

    const cookie = getCookie(res1);
    const res2 = await request(server).get('/').set('cookie', cookie);
    expect(res2.text).toEqual(expect.stringContaining('You must be logged in'));
  });

  it('GET, Should NOT show edit user page (not admin)', async () => {
    await addUser();
    const cookieForSet = await getSessionCookie(request, server, userForm);
    const res1 = await request(server).get('/users/1/edit').set('cookie', cookieForSet);
    expect(res1.status).toEqual(302);

    const cookie = getCookie(res1);
    const res2 = await request(server).get('/').set('cookie', cookie);
    expect(res2.text).toEqual(expect.stringContaining('Sorry, only administrator can do it'));
  });

  it('GET, Should show edit user page (admin)', async () => {
    await addAdmin();
    const cookieForSet = await getSessionCookie(request, server, adminForm);
    const res1 = await request(server).get('/users/1/edit').set('cookie', cookieForSet);

    expect(res1.status).toEqual(200);
    expect(res1.text).toEqual(expect.stringContaining('Edit Profile'));
    expect(res1.text).toEqual(expect.stringContaining('admin@admin.ru'));
  });

  it('GET, Should NOT show new user page (not logged in)', async () => {
    const res1 = await request(server).get('/users/new');
    expect(res1.status).toEqual(302);

    const cookie = getCookie(res1);
    const res2 = await request(server).get('/').set('cookie', cookie);
    expect(res2.text).toEqual(expect.stringContaining('You must be logged in'));
  });

  it('GET, Should NOT show new user page (not admin)', async () => {
    await addUser();
    const cookieForSet = await getSessionCookie(request, server, userForm);
    const res1 = await request(server).get('/users/new').set('cookie', cookieForSet);

    expect(res1.status).toEqual(302);

    const cookie = getCookie(res1);
    const res2 = await request(server).get('/').set('cookie', cookie);
    expect(res2.text).toEqual(expect.stringContaining('Sorry, only administrator can do it'));
  });

  it('GET, Should show new user page (admin)', async () => {
    await addAdmin();
    const cookieForSet = await getSessionCookie(request, server, adminForm);
    const res1 = await request(server).get('/users/new').set('cookie', cookieForSet);

    expect(res1.status).toEqual(200);
    expect(res1.text).toEqual(expect.stringContaining('Add New User'));
    expect(res1.text).toEqual(expect.stringContaining('User address'));
  });
});

