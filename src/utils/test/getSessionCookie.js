const prepareCookies = str => str.split(',').map(item => item.split(' ')[0]).join(' ');

const getCookie = (res) => {
  const cookieString = res.headers['set-cookie'][0];
  const cookieForSet = prepareCookies(cookieString);
  return cookieForSet;
};

const getSessionCookie = async (request, server, authForm) => {
  const resLogin = await request(server)
    .post('/session')
    .send({ email: authForm.email, password: authForm.password });
  const cookieString = resLogin.headers['set-cookie'][0];
  const cookieForSet = prepareCookies(cookieString);
  return cookieForSet;
};

const getGetReqCookie = async (request, server, url) => {
  const res = await request(server).get(url);
  const cookieString = res.headers['set-cookie'][0];
  const cookieForSet = prepareCookies(cookieString);
  return cookieForSet;
};

export { getGetReqCookie, getSessionCookie, getCookie };
