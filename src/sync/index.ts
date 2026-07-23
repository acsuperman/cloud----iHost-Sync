import { cloud2IHost } from './cloud2IHost';
import { iHost2Cloud } from './iHost2Cloud';

export function syncThermostat(app) {
  //cloud-->>ihost
  cloud2IHost();

  //ihost-->>cloud
  iHost2Cloud(app);

}
