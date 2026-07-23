import {
  CloudSideUserInfo,
  WsClient,
  IhostSideUserInfo,
  SseClient,
  Thermostat,
  MessageHandler,
  WsSendData,
  WebSocketMessage,
} from '@/interface';
import { initThermostatCapabilities } from '@/common';

const cloudSideUserInfo: CloudSideUserInfo = {
  phoneNumber: '',
  password: '',
  region: '',
  accessToken: '',
  refreshToken: '',
  userInfo: { apikey: '' },
  longLinkInfo: {
    IP: '',
    port: 0,
    domain: '',
    error: -1,
    reason: '',
  },
};

const wsClient: WsClient = {
  ws: null,
  onMessage: () => {},
  sendRequest: (data: WsSendData) => Promise.resolve({} as WebSocketMessage),
  connect: () => {},
};

const ihostSideUserInfo: IhostSideUserInfo = {
  openToken: '',//三方的token
  localToken: '',//ihost本地网页token
};

const sseCliet: SseClient = {
  connect: () => {},
  close: () => {},
  essAddEventListener: (eventName: string, dealFun: MessageHandler) => {},
  essRemoveEventListener: (eventName: string, dealFun: MessageHandler) => {},
};

const thermostat: Thermostat = {
  name: '',
  serial_number: '',
  third_serial_number: '',
  display_category: 'thermostat',
  capabilities: initThermostatCapabilities,
  state: {},
  manufacturer: '',
  model: '',
  tags: {},
  firmware_version: '',
  service_address: '',
};

export { cloudSideUserInfo, wsClient, ihostSideUserInfo, sseCliet, thermostat };
