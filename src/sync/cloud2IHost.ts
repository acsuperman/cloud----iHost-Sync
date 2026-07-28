import { thermostat, wsClient } from '@/store';
import { WebSocketMessage } from '@/interface';
import { ERequestIhostHeadName } from '@/enum';
import { requestIhost } from '@/api/ihost';
import { generateRequestIhostHeadObject, paramsToWeeklySchedule } from '@/util';
import { inspect } from 'node:util';
import { thermostatStateParamMappings, WEEKLY_SCHEDULE_PARAM_KEYS } from '@/common';
const sysmsgSync = (data: WebSocketMessage) => {
  if (data.action != 'sysmsg' || data.deviceid != thermostat.third_serial_number)
    return;
  console.log('cloud-->>server via webSocket:设备上下线', data);
  const params = data.params as Record<string, any> | undefined;

  if (!params) return;
  const requestBody = {
    event: {
      header: generateRequestIhostHeadObject(ERequestIhostHeadName.DEVICE_ONLINE_CHANGE_REPORT),
      endpoint: {
        serial_number: thermostat.serial_number,
        third_serial_number: thermostat.third_serial_number,
      },
      payload: {
        'online': params.online,
      },
    },
  };

  requestIhost(requestBody).then((res) => {});
  console.log('server-->>ihost via /open-api/v1/rest/thirdparty/event:设备上下线', inspect(requestBody, { depth: null, colors: true }));
};

const updateSync = (data: WebSocketMessage) => {
  if (data.action !== 'update' || data.deviceid != thermostat.third_serial_number)
    return;
  console.log('cloud-->>server via webSocket:设备更新', data);

  const params = data.params as Record<string, any> | undefined;

  if (!params) return;

  const state = thermostat.state as Record<string, any>;
  let isChangeState = false;
  let isChangeCapability = false;

  for (const { paramKey, set, transform } of thermostatStateParamMappings) {
    if (paramKey in params) {
      isChangeState = true;
      set(state, transform(params[paramKey], true));
    }
  }

  if (isChangeState) {
    const stateRequestBody = {
      event: {
        header: generateRequestIhostHeadObject(ERequestIhostHeadName.DEVICE_STATES_CHANGE_REPORT),
        endpoint: {
          serial_number: thermostat.serial_number,
          third_serial_number: thermostat.third_serial_number,
        },
        payload: {
          state: thermostat.state,
        },
      },
    };

    requestIhost(stateRequestBody).then((res) => {});
    console.log('server-->>ihost via /open-api/v1/rest/thirdparty/event:设备状态更新', inspect(stateRequestBody, { depth: null, colors: true }));
  }

  // 日程
  if (WEEKLY_SCHEDULE_PARAM_KEYS.some(key => key in params)) {
    isChangeCapability = true;
  }

  if (isChangeCapability) {
    paramsToWeeklySchedule(thermostat.capabilities, params);
    const capabilityRequestBody = {
      event: {
        header: generateRequestIhostHeadObject(ERequestIhostHeadName.DEVICE_INFORMATION_UPDATED_REPORT),
        endpoint: {
          serial_number: thermostat.serial_number,
          third_serial_number: thermostat.third_serial_number,
        },
        payload: {
          capabilities: thermostat.capabilities,
        },
      },
    };

    requestIhost(capabilityRequestBody).then((res) => {});
    console.log('server-->>ihost via /open-api/v1/rest/thirdparty/event:设备能力更新', inspect(capabilityRequestBody, { depth: null, colors: true }));
  }

  if (!isChangeState && !isChangeCapability) {
    console.log('暂无支持的paramKey');
  }
 
};

export function cloud2IHost() {
  const { onMessage } = wsClient;

  onMessage(sysmsgSync);//上下线
  onMessage(updateSync);//更新状态
}
