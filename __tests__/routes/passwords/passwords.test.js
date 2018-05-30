import request from 'supertest';
import { User, Address, WaterMeter, Readout } from '../../../src/models';
import initModels from '../../../src/init';
import { addRoles } from '../../../src/dummyData';
import app from '../../../src';
import { getSessionCookie, getCookie } from '../../../src/utils/test/getSessionCookie';
import { encrypt } from '../../../src/utils/secure';


const userForm = {
  email: 'user@user.ru',
  password: 'qqqqqq',
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

  it('GET, Should NOT show change password page (not logged in)', async () => {
    await addUser();
    const res1 = await request(server).get('/passwords/new');
    expect(res1.status).toEqual(302);

    const cookie = getCookie(res1);
    const res2 = await request(server).get('/').set('cookie', cookie);
    expect(res2.text).toEqual(expect.stringContaining('You must be logged in'));
  });

  it('GET, Should show change password page (logged in)', async () => {
    await addUser();

    const sessionCookie = await getSessionCookie(request, server, userForm);
    const res1 = await request(server).get('/passwords/new').set('cookie', sessionCookie);

    expect(res1.status).toEqual(200);
    expect(res1.text).toEqual(expect.stringContaining('Please type old and new passwords and click submit'));
  });

  it('PATCH, Should not change password (wrong current password)', async () => {
    await addUser();

    const form = {
      currentPassword: 'qqqqqq',
      password: 'qqqqqq',
      confirmPassword: 'qqqqqq',
    };

    const sessionCookie = await getSessionCookie(request, server, userForm);
    const res1 = await request(server)
      .patch('/passwords')
      .set('cookie', sessionCookie)
      .send(form);

    expect(res1.status).toEqual(302);

    const cookie = getCookie(res1);
    const res2 = await request(server).get('/passwords/new').set('cookie', cookie);

    expect(res2.text).toEqual(expect.stringContaining('Old and New passwords are same, please use another password'));
  });

  it('PATCH, Should not change password (New passwords doesnt match)', async () => {
    await addUser();

    const userBefore = await User.findById(1);
    const passwordBefore = userBefore.passwordEncrypted;

    const form = {
      currentPassword: 'qqqqqq',
      password: 'aaaaaa',
      confirmPassword: 'aaaaab',
    };

    const sessionCookie = await getSessionCookie(request, server, userForm);
    const res1 = await request(server)
      .patch('/passwords')
      .set('cookie', sessionCookie)
      .send(form);

    expect(res1.status).toEqual(302);

    const userAfter = await User.findById(1);
    const passwordAfter = userAfter.passwordEncrypted;

    const cookie = getCookie(res1);
    const res2 = await request(server).get('/passwords/new').set('cookie', cookie);

    expect(passwordBefore).toEqual(passwordAfter);
    expect(res2.text).toEqual(expect.stringContaining('New passwords doesnt match'));
  });

  it('PATCH, Should change password', async () => {
    await addUser();

    const form = {
      currentPassword: 'qqqqqq',
      password: 'aaaaaa',
      confirmPassword: 'aaaaaa',
    };

    const sessionCookie = await getSessionCookie(request, server, userForm);
    const res1 = await request(server)
      .patch('/passwords')
      .set('cookie', sessionCookie)
      .send(form);

    expect(res1.status).toEqual(302);

    const userAfter = await User.findById(1);
    const passwordAfter = userAfter.passwordEncrypted;

    const cookie = getCookie(res1);
    const res2 = await request(server).get('/passwords/new').set('cookie', cookie);

    expect(passwordAfter).toEqual(encrypt(form.password));
    expect(res2.text).toEqual(expect.stringContaining('You have sussessfully changed password'));
  });

  it('PATCH, Should not change password (validation error: password too short)', async () => {
    await addUser();

    const userBefore = await User.findById(1);
    const passwordBefore = userBefore.passwordEncrypted;

    const form = {
      currentPassword: 'qqqqqq',
      password: 'aaa',
      confirmPassword: 'aaa',
    };

    const sessionCookie = await getSessionCookie(request, server, userForm);
    const res1 = await request(server)
      .patch('/passwords')
      .set('cookie', sessionCookie)
      .send(form);

    expect(res1.status).toEqual(200);

    const userAfter = await User.findById(1);
    const passwordAfter = userAfter.passwordEncrypted;

    expect(passwordAfter).toEqual(passwordBefore);
    expect(res1.text).toEqual(expect.stringContaining('Please use a longer password (6 or more symbols)'));
  });
});

