import { requestIhost } from '@/api/ihost';
import { IhostRequestBody, DiscoveryResponsePayload } from '@/interface';
import { generateRequestIhostHeadObject } from '@/util';
import { thermostat } from '@/store';
import { inspect } from 'node:util';
import { ERequestIhostHeadName } from '@/enum';
export const integrateThermostatIntoIHost = () => {
  const { serial_number: _, ...shallowCopy } = thermostat;

  const integrateThermostatIntoIHost: IhostRequestBody = {
    event: {
      header: generateRequestIhostHeadObject(ERequestIhostHeadName.DISCOVERY_REQUEST),
      payload: { endpoints: [shallowCopy] },
    },
  };

  console.log('server-->>ihost via /open-api/v1/rest/thirdparty/event:同步新设备', inspect(integrateThermostatIntoIHost, { depth: null, colors: true }));
  requestIhost(integrateThermostatIntoIHost).then((res) => {
    thermostat.serial_number = (res.payload as DiscoveryResponsePayload).endpoints[0].serial_number;
  });
};
