import { DirectiveRequestBody, DirectiveResponseBody, DirectiveObject, ThermostatCapabilities } from '@/interface';
import { thermostat, wsClient } from '@/store';
import { EDirectiveResponseHeadName } from '@/enum';
import { Express } from 'express';
import { generateWsData,findAutoModeCapa,weeklyScheduleToHexParams } from '@/util';
import { inspect } from 'node:util';
import { thermostatStateParamMappings } from '@/common';

const resHeader = (name: EDirectiveResponseHeadName, message_id: string) => ({
  name,
  message_id,
  version: '1',
});

const updateDeviceStates = (directive: DirectiveObject): Promise<DirectiveResponseBody> => {
  const { state } = directive.payload as { state: Record<string, any> };

  console.log('ihost-->>server via /dealIhostDirective:设备状态更新', inspect(state, { depth: null, colors: true }));
  const { sendRequest } = wsClient;

  Object.assign(thermostat.state, state);

  const params: Record<string, any> = {};

  for (const { paramKey, get, transform } of thermostatStateParamMappings) {
    const val = get(state);

    if (val !== undefined) {
      params[paramKey] = transform(val, false);
    }
  }

  const wsData = generateWsData(params);

  console.log('server-->>cloud via webSocket:设备状态更新', inspect(wsData, { depth: null, colors: true }));

  return sendRequest(wsData).then(() => ({
    event: {
      header: resHeader(EDirectiveResponseHeadName.RESPONSE, directive.header.message_id),
      payload: {},
    },
  })).catch(() => ({
    event: {
      header: resHeader(EDirectiveResponseHeadName.ERROR_RESPONSE, directive.header.message_id),
      payload: { type: 'ENDPOINT_UNREACHABLE' },
    },
  }));
  
};

const configureDeviceCapabilities = (directive: DirectiveObject): Promise<DirectiveResponseBody> => {
  const payload = directive.payload as { capabilities: ThermostatCapabilities[] };
  const { sendRequest } = wsClient;

  console.log('ihost-->>server via /dealIhostDirective:设备能力更新', inspect(payload.capabilities, { depth: null, colors: true }));
  const autoModeCapablity = findAutoModeCapa(payload.capabilities);

  if (autoModeCapablity) {
    Object.assign(findAutoModeCapa(thermostat.capabilities)!.configuration!.weeklySchedule,autoModeCapablity.configuration!.weeklySchedule);
  }

  const params = weeklyScheduleToHexParams(thermostat.capabilities);

  const wsData = generateWsData(params);

  console.log('server-->>cloud via webSocket:设备能力更新', inspect(wsData, { depth: null, colors: true }));

  return sendRequest(wsData).then(() => ({
    event: {
      header: resHeader(EDirectiveResponseHeadName.RESPONSE, directive.header.message_id),
      payload: {},
    },
  })).catch(() => ({
    event: {
      header: resHeader(EDirectiveResponseHeadName.ERROR_RESPONSE, directive.header.message_id),
      payload: { type: 'ENDPOINT_UNREACHABLE' },
    },
  }));
};

export function iHost2Cloud(app: Express) {
  app.post('/dealIhostDirective', async (req, res) => {
    const body: DirectiveRequestBody = req.body;
    const { header } = body.directive;

    switch (header.name) {
      case 'UpdateDeviceStates':
        res.json(await updateDeviceStates(body.directive));
        break;
      case 'ConfigureDeviceCapabilities':
        res.json(await configureDeviceCapabilities(body.directive));
        break;
      default:
        res.status(400).json({
          event: {
            header: resHeader(EDirectiveResponseHeadName.ERROR_RESPONSE, header.message_id),
            payload: { type: 'INVALID_DIRECTIVE' },
          },
        });
    }
  });
}
