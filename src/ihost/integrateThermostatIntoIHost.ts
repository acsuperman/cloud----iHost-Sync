import { requestIhost } from '@/api/ihost';
import { IhostRequestBody, DiscoveryResponsePayload } from '@/interface';
import { generateRequestIhostHeadObject } from '@/util';
import { thermostat } from '@/store';
import { ERequestIhostHeadName } from '@/enum';
export const integrateThermostatIntoIHost = () => {
  const { serial_number: _, ...shallowCopy } = thermostat;

  const integrateThermostatIntoIHost: IhostRequestBody = {
    event: {
      header: generateRequestIhostHeadObject(ERequestIhostHeadName.DISCOVERY_REQUEST),
      payload: { endpoints: [shallowCopy] },
    },
  };

  requestIhost(integrateThermostatIntoIHost).then((res) => {
    thermostat.serial_number = (res.payload as DiscoveryResponsePayload).endpoints[0].serial_number;
  });
};
