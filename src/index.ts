import 'dotenv/config';
import express, { Express } from 'express';
import { connectEWeLink } from '@/cloud/init';
import { connectIhost } from './ihost/init';
import { integrateThermostatIntoIHost } from '@/ihost/integrateThermostatIntoIHost';
import { syncThermostat } from './sync';
import { errorLogAndExit } from './util';
const app: Express = express();
const port = process.env.SERVER_PORT;

app.use(express.json());

const init = async () => {
  try {
    await Promise.all([connectEWeLink(),connectIhost()]);
  } catch (error) {
    errorLogAndExit('初始连接失败',error);
  }

  integrateThermostatIntoIHost();
  syncThermostat(app);

};

init();

app.listen(port, () => {

});
