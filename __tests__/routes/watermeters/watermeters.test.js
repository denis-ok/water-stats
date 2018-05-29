import request from 'supertest';
import { User, Address, WaterMeter, Readout } from '../../../src/models';
import initModels from '../../../src/init';
import { addRoles } from '../../../src/dummyData';
import app from '../../../src';
import { getGetReqCookie, getSessionCookie, getCookie } from '../../../src/utils/test/getSessionCookie';


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


  it('GET, Should NOT show Watermeters page (not logged in)', async () => {
    const res1 = await request(server).get('/watermeters');
    expect(res1.status).toEqual(302);

    const cookieForSet = await getGetReqCookie(request, server, '/watermeters');
    const res2 = await request(server).get('/').set('cookie', cookieForSet);
    expect(res2.text).toEqual(expect.stringContaining('You must be logged in'));
  });

  it('GET, Should NOT show Watermeters page (not admin)', async () => {
    await addUser();

    const cookieForSet = await getSessionCookie(request, server, userForm);
    const res1 = await request(server).get('/watermeters').set('cookie', cookieForSet);
    expect(res1.status).toEqual(302);

    const cookie = getCookie(res1);
    const res2 = await request(server).get('/').set('cookie', cookie);
    expect(res2.text).toEqual(expect.stringContaining('Sorry, only administrator can do it'));
  });

  it('GET, Should show Watermeters page (admin)', async () => {
    await addAdmin();

    const cookieForSet = await getSessionCookie(request, server, adminForm);
    const res = await request(server).get('/watermeters').set('cookie', cookieForSet);
    expect(res.status).toEqual(200);
    expect(res.text).toEqual(expect.stringContaining('All Water Meters Statistics'));
  });

  it('GET, Should NOT show user stats page (not logged in)', async () => {
    await addUser();

    const res1 = await request(server).get('/watermeters/user/1');
    expect(res1.status).toEqual(302);

    const cookie = getCookie(res1);

    const res2 = await request(server).get('/').set('cookie', cookie);
    expect(res2.text).toEqual(expect.stringContaining('You must be logged in'));
  });

  it('GET, Should NOT show user stats page (try to view not own stats)', async () => {
    await addAdmin(); // id 1
    await addUser(); // id 2

    const cookieForSet = await getSessionCookie(request, server, userForm);

    const res1 = await request(server).get('/watermeters/user/2').set('cookie', cookieForSet);
    expect(res1.status).toEqual(200);

    const res2 = await request(server).get('/watermeters/user/1').set('cookie', cookieForSet);
    expect(res2.status).toEqual(302);

    const cookie = getCookie(res2);

    const res3 = await request(server).get('/').set('cookie', cookie);
    expect(res3.text).toEqual(expect.stringContaining('Sorry, you dont have enough rights to do it'));
  });

  it('GET, Should show user stats page (as admin)', async () => {
    await addAdmin(); // id 1
    await addUser(); // id 2

    const cookieForSet = await getSessionCookie(request, server, adminForm);

    const res1 = await request(server).get('/watermeters/user/1').set('cookie', cookieForSet);
    expect(res1.status).toEqual(200);

    const res2 = await request(server).get('/watermeters/user/2').set('cookie', cookieForSet);
    expect(res2.status).toEqual(200);
  });

  it('GET, Should NOT show add readouts page (not logged in)', async () => {
    await addUser();

    const res1 = await request(server).get('/watermeters/user/1/addreadouts');
    expect(res1.status).toEqual(302);

    const cookie = getCookie(res1);

    const res2 = await request(server).get('/').set('cookie', cookie);
    expect(res2.text).toEqual(expect.stringContaining('You must be logged in'));
  });

  it('GET, Should NOT show add readouts page (link to not own profile)', async () => {
    await addAdmin(); // id 1
    await addUser(); // id 2

    const cookieForSet = await getSessionCookie(request, server, userForm);

    const res1 = await request(server).get('/watermeters/user/2/addreadouts').set('cookie', cookieForSet);
    expect(res1.status).toEqual(200);

    const res2 = await request(server).get('/watermeters/user/1/addreadouts').set('cookie', cookieForSet);
    expect(res2.status).toEqual(302);

    const cookie = getCookie(res2);

    const res3 = await request(server).get('/').set('cookie', cookie);
    expect(res3.text).toEqual(expect.stringContaining('Sorry, you dont have enough rights to do it'));
  });

  it('POST, Should not add new readouts (form is empty)', async () => {
    await addUser();
    const cookieForSet = await getSessionCookie(request, server, userForm);
    const readoutsBefore = await Readout.findAll();

    const form = {
      coldValue: '',
      hotValue: 2,
    };

    const res1 = await request(server)
      .post('/watermeters/user/1')
      .set('cookie', cookieForSet)
      .send(form);

    const readoutsAfter = await Readout.findAll();

    expect(res1.status).toEqual(302);
    expect(readoutsBefore).toHaveLength(readoutsAfter.length);

    const cookie = getCookie(res1);

    const res2 = await request(server).get('/').set('cookie', cookie);
    expect(res2.text).toEqual(expect.stringContaining('Fields cannot be blank'));
  });

  it('POST, Should not add new readouts (forms has letters)', async () => {
    await addUser();
    const cookieForSet = await getSessionCookie(request, server, userForm);
    const readoutsBefore = await Readout.findAll();

    const form = {
      coldValue: 'a1',
      hotValue: 2,
    };

    const res1 = await request(server)
      .post('/watermeters/user/1')
      .set('cookie', cookieForSet)
      .send(form);

    const readoutsAfter = await Readout.findAll();

    expect(res1.status).toEqual(302);
    expect(readoutsBefore).toHaveLength(readoutsAfter.length);

    const cookie = getCookie(res1);

    const res2 = await request(server).get('/').set('cookie', cookie);
    expect(res2.text).toEqual(expect.stringContaining('Please type only numbers in forms'));
  });

  it('POST, Should not add new readouts (not integer number)', async () => {
    await addUser();
    const cookieForSet = await getSessionCookie(request, server, userForm);
    const readoutsBefore = await Readout.findAll();

    const form = {
      coldValue: 1.2,
      hotValue: 3,
    };

    const res1 = await request(server)
      .post('/watermeters/user/1')
      .set('cookie', cookieForSet)
      .send(form);

    const readoutsAfter = await Readout.findAll();

    expect(res1.status).toEqual(302);
    expect(readoutsBefore).toHaveLength(readoutsAfter.length);

    const cookie = getCookie(res1);

    const res2 = await request(server).get('/').set('cookie', cookie);
    expect(res2.text).toEqual(expect.stringContaining('Please use only integer numbers in forms'));
  });

  it('POST, Should add first new readouts', async () => {
    await addUser();
    const cookieForSet = await getSessionCookie(request, server, userForm);
    const readoutsBefore = await Readout.findAll();

    const form = {
      coldValue: 123,
      hotValue: 456,
    };

    const res1 = await request(server)
      .post('/watermeters/user/1')
      .set('cookie', cookieForSet)
      .send(form);

    const readoutsAfter = await Readout.findAll();

    expect(res1.status).toEqual(302);
    expect(readoutsAfter).toHaveLength(readoutsBefore.length + 2);

    const cookie = getCookie(res1);

    const res2 = await request(server).get('/').set('cookie', cookie);
    expect(res2.text).toEqual(expect.stringContaining('Thank you! Readouts has been created'));
  });

  it('POST, Should NOT add next readouts (values are smaller than last)', async () => {
    await addUser();
    const cookieForSet = await getSessionCookie(request, server, userForm);
    const readoutsBefore = await Readout.findAll();

    const form1 = {
      coldValue: 10,
      hotValue: 20,
    };

    const res1 = await request(server)
      .post('/watermeters/user/1')
      .set('cookie', cookieForSet)
      .send(form1);

    const form2 = {
      coldValue: 9,
      hotValue: 19,
    };

    const res2 = await request(server)
      .post('/watermeters/user/1')
      .set('cookie', cookieForSet)
      .send(form2);

    const readoutsAfter = await Readout.findAll();

    expect(res1.status).toEqual(302);
    expect(readoutsAfter).toHaveLength(readoutsBefore.length + 2);

    const cookie = getCookie(res2);

    const res3 = await request(server).get('/').set('cookie', cookie);
    expect(res3.text).toEqual(expect.stringContaining('Your new readouts cannot be smaller than last'));
  });

  it('POST, Should NOT add next readouts (too early)', async () => {
    await addUser();

    const currentDate = Date.now();
    await Readout.create({ value: 5, date: currentDate, waterMeterId: 1 });
    await Readout.create({ value: 5, date: currentDate, waterMeterId: 2 });

    const cookieForSet = await getSessionCookie(request, server, userForm);
    const readoutsBefore = await Readout.findAll();

    const form1 = {
      coldValue: 10,
      hotValue: 10,
    };

    const res1 = await request(server)
      .post('/watermeters/user/1')
      .set('cookie', cookieForSet)
      .send(form1);

    const readoutsAfter = await Readout.findAll();

    expect(res1.status).toEqual(302);
    expect(readoutsAfter).toHaveLength(readoutsBefore.length);

    const cookie = getCookie(res1);

    const res2 = await request(server).get('/').set('cookie', cookie);
    expect(res2.text).toEqual(expect.stringContaining('its to early to add new readouts'));
  });

  it('POST, Should ADD next new readouts (next month)', async () => {
    await addUser();

    const currentDate = new Date(Date.now());

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDay();

    const previousDate = new Date(currentYear, currentMonth - 1, currentDay);

    await Readout.create({ value: 5, date: previousDate, waterMeterId: 1 });
    await Readout.create({ value: 5, date: previousDate, waterMeterId: 2 });

    const cookieForSet = await getSessionCookie(request, server, userForm);
    const readoutsBefore = await Readout.findAll();

    const form1 = {
      coldValue: 10,
      hotValue: 10,
    };

    const res1 = await request(server)
      .post('/watermeters/user/1')
      .set('cookie', cookieForSet)
      .send(form1);

    const readoutsAfter = await Readout.findAll();

    expect(res1.status).toEqual(302);
    expect(readoutsAfter).toHaveLength(readoutsBefore.length + 2);

    const cookie = getCookie(res1);

    const res2 = await request(server).get('/').set('cookie', cookie);
    expect(res2.text).toEqual(expect.stringContaining('Thank you! Readouts has been created'));
  });

  it('POST, Should ADD next new readouts (add additional blank readouts for skipped months)', async () => {
    await addUser();

    const currentDate = new Date(Date.now());

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDay();

    const previousDate = new Date(currentYear, currentMonth - 4, currentDay);

    await Readout.create({ value: 5, date: previousDate, waterMeterId: 1 });
    await Readout.create({ value: 5, date: previousDate, waterMeterId: 2 });

    const cookieForSet = await getSessionCookie(request, server, userForm);
    const readoutsBefore = await Readout.findAll();

    const form1 = {
      coldValue: 10,
      hotValue: 10,
    };

    const res1 = await request(server)
      .post('/watermeters/user/1')
      .set('cookie', cookieForSet)
      .send(form1);

    const readoutsAfter = await Readout.findAll();

    expect(res1.status).toEqual(302);
    expect(readoutsAfter).toHaveLength(readoutsBefore.length + 8);

    const cookie = getCookie(res1);

    const res2 = await request(server).get('/').set('cookie', cookie);
    expect(res2.text).toEqual(expect.stringContaining('Thank you! Readouts has been created'));
  });
});

