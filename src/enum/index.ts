export enum ECapabilityType { 
  /** 温控阀温控能力 */
  THERMOSTAT = 'thermostat',
  /** 温控阀设置目标温度能力 */
  THERMOSTAT_TARGET_SETPOINT = 'thermostat-target-setpoint',
}

export enum EPermissionType {
  READ = 'read',
  WRITE = 'write',
  READ_WRITE = 'readWrite',
  /** 设备不可控制不可上报不可配置不可查询 */
  NONE = '0000',
  /** 设备可控制 */
  UPDATE = '1000',
  /** 设备可上报 */
  UPDATED = '0100',
  /** 设备可配置 */
  CONFIGURE = '0010',
  /** 设备可查询 */
  QUERY = '0001',
  /** 设备可控制可上报 */
  UPDATE_UPDATED = '1100',
  /** 设备可控制可配置 */
  UPDATE_CONFIGURE = '1010',
  /** 设备可控制可查询 */
  UPDATE_QUERY = '1001',
  /** 设备可上报可配置 */
  UPDATED_CONFIGURE = '0110',
  /** 设备可上报可查询 */
  UPDATED_QUERY = '0101',
  /** 设备可配置可查询 */
  CONFIGURE_QUERY = '0011',
  /** 设备可控制可上报可配置 */
  UPDATE_UPDATED_CONFIGURE = '1110',
  /** 设备可控制可上报可查询 */
  UPDATE_UPDATED_QUERY = '1101',
  /** 设备可控制可配置可查询 */
  UPDATE_CONFIGURE_QUERY = '1011',
  /** 设备可上报可配置可查询 */
  UPDATED_CONFIGURE_QUERY = '0111',
  /** 设备可控制可上报可配置可查询 */
  UPDATE_UPDATED_CONFIGURE_QUERY = '1111',
}

export enum EThermostatSubName {
  ADAPTIVE_RECOVERY_STATUS = 'adaptive-recovery-status',
  THERMOSTAT_MODE = 'thermostat-mode',
}

export enum EThermostatTargetSetpointSubName {
  TEMPERATURE = 'temperature',
  MANUAL_MODE = 'manual-mode',
  AUTO_MODE = 'auto-mode',
  ECO_MODE = 'eco-mode',
}

/** 温控阀的工作模式 */
export enum EThermostatWorkMode {
  /** 手动模式 */
  MANUAL,
  /** 关闭（防霜冻）模式 */
  ECO ,
  /** 自动模式 */
  AUTO,
  /** 快速升温模式 */
  BOOST,
  /** 定时模式 */
  TIMER,
}

/** 工作状态 */
export enum EAdaptiveRecoveryStatus {
  /** 保温中 */
  INACTIVE,
  /** 加热中 */
  HEATING,

}

export enum ERequestIhostHeadName {
  //同步新设备
  DISCOVERY_REQUEST = 'DiscoveryRequest',
  //设备状态更新上报
  DEVICE_STATES_CHANGE_REPORT = 'DeviceStatesChangeReport',
  //设备上下线状态上报
  DEVICE_ONLINE_CHANGE_REPORT = 'DeviceOnlineChangeReport',
  //同步设备信息更新上报 >=1.9.0
  DEVICE_INFORMATION_UPDATED_REPORT = 'DeviceInformationUpdatedReport',
}

export enum EDirectiveResponseHeadName {
  RESPONSE = 'Response',
  ERROR_RESPONSE = 'ErrorResponse',
}
