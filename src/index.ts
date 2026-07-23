import 'dotenv/config';
import express, { Express } from 'express';
import { connectEWeLink } from '@/cloud/init';
import { connectIhost } from './ihost/init';
import { integrateThermostatIntoIHost } from '@/ihost/integrateThermostatIntoIHost';
import { syncThermostat } from './sync';
const app: Express = express();
const port = process.env.SERVER_PORT;

app.use(express.json());

const init = async () => {
  await connectEWeLink();
  await connectIhost();
  integrateThermostatIntoIHost();
  syncThermostat(app);

};

init();

app.listen(port, () => {

});
