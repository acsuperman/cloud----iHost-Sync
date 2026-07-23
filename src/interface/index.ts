import WebSocket from 'ws';
import { ECapabilityType, EPermissionType,EDirectiveResponseHeadName } from '@/enum';

// ========== Cloud API ==========

export interface LoginResponse {
  at: string;
  rt: string;
  user: { apikey: string };
  region: string;
}

export interface RoomListItem {
  id: string;
  name: string;
  index: number;
}

export interface FamilyListItem {
  id: string;
  apikey: string;
  name: string;
  index: number;
  roomList?: RoomListItem[];
}

export interface FamilyResponse {
  familyList: FamilyListItem[];
  currentFamilyId: string;
}

export interface ItemData {
  name: string;
  family: { roomid: string; familyid: string };
  extra: { uiid: number; ui: string; manufacturer: string; model: string };
  deviceid: string;
  showBrand: boolean;
  online: boolean;
  brandLogo: string;
  brandName: string;
  params: {
    switches: Array<{ outlet: number; switch: 'on' | 'off' }>;
    online: boolean;
    fwVersion: string;
    workMode: string;
    workState: string;
    manTargetTemp: number;
    autoTargetTemp: number;
    ecoTargetTemp: number;
  };
}

export interface ThingListItem {
  itemType?: number;
  index?: number;
  itemData: ItemData;
}

export interface FamilyDeviceListResponse {
  thingList: ThingListItem[];
  total: number;
}

export interface LongLinkInfo {
  IP: string;
  port: number;
  domain: string;
  error: number;
  reason: string;
}

// ========== iHost API ==========
export interface LocalLoginRes {
  at: string;
}

export interface HeaderObject {
  name: string;
  message_id: string;
  version: string;
}

export interface EndpointObject {
  serial_number: string;
  third_serial_number: string;
  tags?: Record<string, any>;
}

export interface DiscoveryEndpoint {
  name: string;
  third_serial_number: string;
  display_category: 'thermostat';
  capabilities: ThermostatCapabilities[];
  state: Record<string, any>;
  manufacturer: string;
  model: string;
  tags: Record<string, any>;
  firmware_version: string;
  service_address: string;
}

export interface DiscoveryRequestPayload {
  endpoints: DiscoveryEndpoint[];
}

export interface DeviceStatesChangeReportPayload {
  state: Record<string, any>;
}

export interface DeviceOnlineChangeReportPayload {
  online: boolean;
}

export interface DeviceInformationUpdatedReportPayload {
  capabilities: ThermostatCapabilities[];
  tags?: Record<string, any>;
}

export type RequestPayload =
  | DiscoveryRequestPayload
  | DeviceStatesChangeReportPayload
  | DeviceOnlineChangeReportPayload
  | DeviceInformationUpdatedReportPayload;

export interface EventObject {
  header: HeaderObject;
  endpoint?: EndpointObject;
  payload: RequestPayload;
}

export interface IhostRequestBody {
  event: EventObject;
}

export type ErrorType =
  | 'INVALID_PARAMETERS'
  | 'AUTH_FAILURE'
  | 'INTERNAL_ERROR';

export interface ErrorResponsePayload {
  type: ErrorType;
  description: string;
}

export interface DiscoveryResponsePayload {
  endpoints: EndpointObject[];
}

export type ResponsePayload =
  | DiscoveryResponsePayload
  | ErrorResponsePayload
  | Record<string, any>;

export interface IhostResponseBody {
  header: HeaderObject;
  payload: ResponsePayload;
}

export interface GetIhostTkRes {
  data: {
    token: string;
  };
}

// ========== 网关下发指令 (iHost → 三方) ==========

/** 网关下发指令的 header.name */
type DirectiveHeaderName =
  | 'UpdateDeviceStates'
  | 'QueryDeviceStates'
  | 'ConfigureDeviceCapabilities';

interface DirectiveHeaderObject {
  name: DirectiveHeaderName;
  message_id: string;
  version: string;
}

/** 网关下发指令的 endpoint */
interface DirectiveEndpointObject {
  serial_number: string;
  third_serial_number: string;
  tags?: Record<string, any>;
}

/** 更新设备状态 */
interface UpdateDeviceStatesPayload {
  state: Record<string, any>;
}

/** 查询设备状态 */
interface QueryDeviceStatesPayload {
  state: Record<string, any>;
}

/** 更新设备能力配置 */
interface ConfigureDeviceCapabilitiesPayload {
  capabilities: ThermostatCapabilities[];
}

type DirectivePayload =
  | UpdateDeviceStatesPayload
  | QueryDeviceStatesPayload
  | ConfigureDeviceCapabilitiesPayload;

export interface DirectiveObject {
  header: DirectiveHeaderObject;
  endpoint: DirectiveEndpointObject;
  payload: DirectivePayload;
}

export interface DirectiveRequestBody {
  directive: DirectiveObject;
}

// ========== 指令响应 (三方 → iHost) ==========

type DirectiveErrorType =
  | 'ENDPOINT_UNREACHABLE'
  | 'ENDPOINT_LOW_POWER'
  | 'INVALID_DIRECTIVE'
  | 'NO_SUCH_ENDPOINT'
  | 'NOT_SUPPORTED_IN_CURRENT_MODE'
  | 'INTERNAL_ERROR'
  | 'REMOTE_KEY_CODE_NOT_LEARNED';

interface DirectiveErrorResponsePayload {
  type: DirectiveErrorType;
}

/** 查询设备状态的响应 */
interface QueryDeviceStatesResponsePayload {
  state: Record<string, any>;
}

type DirectiveResponsePayload =
  | QueryDeviceStatesResponsePayload
  | DirectiveErrorResponsePayload
  | Record<string, any>;

export interface DirectiveResponseHeaderObject {
  name: EDirectiveResponseHeadName.RESPONSE | EDirectiveResponseHeadName.ERROR_RESPONSE;
  message_id: string;
  version: string;
}

export interface DirectiveResponseEventObject {
  header: DirectiveResponseHeaderObject;
  payload: DirectiveResponsePayload;
}

export interface DirectiveResponseBody {
  event: DirectiveResponseEventObject;
}

// ========== SSE  ==========

export type MessageHandler = (event: MessageEvent) => void;

export interface SseOptions {
  url: string;
  params?: Record<string, string>;
}

// ========== WebSocket ==========

export interface HandshakeParams {
  at: string;
  apikey: string;
  appid: string;
}

export interface WsConfig {
  hb: number;
  hbInterval: number;
}

export interface WebSocketMessage {
  action?: string;
  deviceid?: string;
  error: number;
  sequence: string;
  online: boolean;
  params: Record<string,any>;
}

export interface WsSendData {
  action: string;
  apikey: string;
  deviceid: string;
  params: Record<string,any>;
  userAgent: string;
  sequence: string;
}

// ========== Store ==========

export interface CloudSideUserInfo {
  phoneNumber: string;
  password: string;
  region: string;
  accessToken: string;
  refreshToken: string;
  userInfo: { apikey: string };
  longLinkInfo: LongLinkInfo;
}

export interface WsClient {
  ws: WebSocket | null;
  onMessage: (event: any) => void;
  sendRequest: (data: WsSendData) => Promise<WebSocketMessage>;
  connect: () => void;
}

export interface IhostSideUserInfo {
  openToken: string;
  localToken: string;
}

export interface SseClient {
  connect: () => void;
  close: () => void;
  essAddEventListener: (eventName: string, dealFun: MessageHandler) => void;
  essRemoveEventListener: (eventName: string, dealFun: MessageHandler) => void;
}

export interface ThermostatCapabilities {
  capability: ECapabilityType;
  name?: string;
  permission: EPermissionType;
  configuration?: Record<string, any>;
  settings?: Record<string, any>;
}

export interface WeeklyEntry {
  startTimeInMinutes: number;
  upperSetpoint: number;
}

export type WeeklySchedule = Record<string, WeeklyEntry[]>;

export interface Thermostat {
  name: string;
  third_serial_number: string;
  serial_number: string;
  display_category: 'thermostat';
  capabilities: ThermostatCapabilities[];
  state: Record<string, any>;
  manufacturer: string;
  model: string;
  tags: Record<string, any>;
  firmware_version: string;
  service_address: string;
}
