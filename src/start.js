import debugLib from 'debug';
import colors from './utils/colors';
import app from './';
import initModels from './init';
import { addRoles, addUsers, addAddresses, addWaterMeters, addReadouts } from './dummyData';

const debugLog = debugLib('app:start.js');

const PORT = process.env.PORT || 5000;

const start = async () => {
  debugLog('Adding default data to db...');

  try {
    await initModels();
    await addRoles();
    await addWaterMeters();
    await addReadouts();
    await addAddresses();
    await addUsers();
  } catch (e) {
    debugLog(colors.error(e));
  }

  debugLog('Starting server...');

  app().listen(PORT);
  console.log('Listening on port number:', PORT);
};

start();
