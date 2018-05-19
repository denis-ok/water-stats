import app from './';

const PORT = process.env.PORT || 5000;

const start = async () => {
  app().listen(PORT);
  console.log('Listening on port number:', PORT);
};

start();

