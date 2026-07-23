import { cloudSideUserInfo, wsClient,thermostat } from '@/store';
import { EThermostatSubName, EThermostatWorkMode, EAdaptiveRecoveryStatus, EThermostatTargetSetpointSubName } from '@/enum';
import { regionMap,dispatchLongLinkUrlMap } from '@/common/index';
import { LoginResponse } from '@/interface';
import { userLogin, getLongLinkInfo, getFamilyAndRoomInfo, getFamilyDeviceList } from '@/api/cloud';
import { useWebSocket } from '@/common/websocket';
import { errorLogAndExit, paramsToWeeklySchedule } from '@/util';

const getLongLink = async () => {
  const data = await getLongLinkInfo(dispatchLongLinkUrlMap[cloudSideUserInfo.region]);

  cloudSideUserInfo.longLinkInfo = data;
};

const connectWebSocket = () => {
  const { domain, port } = cloudSideUserInfo.longLinkInfo;

  if (!domain || port <= 0) return;
  Object.assign(wsClient, useWebSocket(domain, port, {
    at: cloudSideUserInfo.accessToken,
    apikey: cloudSideUserInfo.userInfo.apikey,
    appid: process.env.APPID as string,
  }));

  wsClient.connect();
};

const initThermosta = (itemData, params) => {
  thermostat.name = itemData.name;
  thermostat.third_serial_number = itemData.deviceid;
  thermostat.manufacturer = itemData.extra.manufacturer;
  thermostat.model = itemData.extra.model;
  thermostat.firmware_version = params.fwVersion;
  thermostat.service_address = 'http://' + process.env.SERVER_IP! + ':' + process.env.SERVER_PORT + '/dealIhostDirective';
  thermostat.state = {
    thermostat: {
      [EThermostatSubName.THERMOSTAT_MODE]: {
        thermostatMode: EThermostatWorkMode[Number(params.workMode)],
      },
      [EThermostatSubName.ADAPTIVE_RECOVERY_STATUS]: {
        adaptiveRecoveryStatus: EAdaptiveRecoveryStatus[Number(params.workState)],
      },
    },
    'thermostat-target-setpoint': {
      [EThermostatTargetSetpointSubName.MANUAL_MODE]: { targetSetpoint: params.manTargetTemp / 10 },
      [EThermostatTargetSetpointSubName.AUTO_MODE]: { targetSetpoint: (params.autoTargetTemp ?? 0) / 10 },
      [EThermostatTargetSetpointSubName.ECO_MODE]: { targetSetpoint: params.ecoTargetTemp / 10 },
    },
  };

  paramsToWeeklySchedule(thermostat.capabilities, params);

};

export const connectEWeLink = async () => {

  const countryCode = process.env.COUNTRY_CODE ?? '+86';
  const phoneNumber = process.env.PHONE_NUMBER ?? '';
  const password = process.env.PASSWORD ?? '';

  if (!phoneNumber || !password) {
    errorLogAndExit('请设置环境变量 COUNTRY_CODE PHONE_NUMBER PASSWORD');
  }

  cloudSideUserInfo.region = regionMap.find(record => record.countryCode === countryCode)?.region || 'cn';
  cloudSideUserInfo.phoneNumber = phoneNumber;
  cloudSideUserInfo.password = password;
  const data: LoginResponse = await userLogin(phoneNumber, password, countryCode);

  cloudSideUserInfo.accessToken = data.at;
  cloudSideUserInfo.refreshToken = data.rt;
  cloudSideUserInfo.userInfo = data.user;
  const longLinkPromise = getLongLink();
  const familyPromise = getFamilyAndRoomInfo();

  await longLinkPromise;
  connectWebSocket();

  const res = await familyPromise;
  const { familyList } = res;
  const thingResults = await Promise.allSettled(familyList.map(item => getFamilyDeviceList(item.id)));

  for (const result of thingResults) {
    if (result.status !== 'fulfilled') continue;

    for (const thing of result.value.thingList) {
      const itemData = thing.itemData;
      const params = itemData.params;

      if (itemData.name !== 'TRVZB') continue;
      initThermosta(itemData,params);
    }
  }

};
