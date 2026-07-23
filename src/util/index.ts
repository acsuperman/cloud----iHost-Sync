import { ERequestIhostHeadName, ECapabilityType, EThermostatTargetSetpointSubName } from '@/enum';
import { cloudSideUserInfo, thermostat } from '@/store';
import { ThermostatCapabilities, WeeklyEntry, WeeklySchedule } from '@/interface';
import { WEEKLY_SCHEDULE_PARAM_KEYS, WEEKLY_SCHEDULE_DAY_NAMES } from '@/common';
import crypto from 'node:crypto';

export const errorLogAndExit = (meesage: string, data: any = '') => {
  console.error(meesage, data);
  process.exit(0);
};

export const generateUuidV4 = (): string => crypto.randomUUID();

export const generateRequestIhostHeadObject = (name: ERequestIhostHeadName) => {
  return {
    name,
    message_id: generateUuidV4(),
    version: '1',
  };
};

export const generateWsData = (params) => ({
  action: 'update',
  apikey: cloudSideUserInfo.userInfo.apikey,
  deviceid: thermostat.third_serial_number,
  params,
  userAgent: 'app',
  sequence: Date.now().toString(),
});

const parseDayHexSchedule = (hex: string): WeeklyEntry[] => {
  const result: WeeklyEntry[] = [];

  for (let i = 0; i < hex.length; i += 8) {
    result.push({
      startTimeInMinutes: parseInt(hex.slice(i, i + 4), 16),
      upperSetpoint: parseInt(hex.slice(i + 4, i + 8), 16) / 10,
    });
  }

  return result;
};

const formatDayHexSchedule = (entries: WeeklyEntry[]): string =>
  entries.map(e =>
    e.startTimeInMinutes.toString(16).padStart(4, '0')
    + Math.round(e.upperSetpoint * 10).toString(16).padStart(4, '0'),
  ).join('');

export const findAutoModeCapa = (capabilities: ThermostatCapabilities[]) =>
  capabilities.find(
    c => c.capability === ECapabilityType.THERMOSTAT_TARGET_SETPOINT
      && c.name === EThermostatTargetSetpointSubName.AUTO_MODE,
  );

/** params 中的日程 hex → capabilities AUTO_MODE 的 weeklySchedule */
export const paramsToWeeklySchedule = (
  capabilities: ThermostatCapabilities[],
  params: Record<string, any>,
): void => {
  const autoCapa = findAutoModeCapa(capabilities);

  if (!autoCapa?.configuration) return;

  const schedule: WeeklySchedule = {};

  for (let i = 0; i < WEEKLY_SCHEDULE_PARAM_KEYS.length; i++) {
    const hex = params[WEEKLY_SCHEDULE_PARAM_KEYS[i]] ;

    if (hex)
      schedule[WEEKLY_SCHEDULE_DAY_NAMES[i]] = parseDayHexSchedule(hex);
  }

  Object.assign(autoCapa.configuration.weeklySchedule, {
    ...schedule ,
  });
};

/** capabilities AUTO_MODE weeklySchedule → 日程 hex params */
export const weeklyScheduleToHexParams = (
  capabilities: ThermostatCapabilities[],
): Record<string, string> => {
  const autoCapa = findAutoModeCapa(capabilities);
  const schedule = autoCapa?.configuration?.weeklySchedule;
  const params = {};

  for (let i = 0; i < WEEKLY_SCHEDULE_PARAM_KEYS.length; i++) {
    const dayName = WEEKLY_SCHEDULE_DAY_NAMES[i];
    const entries = schedule?.[dayName];

    params[WEEKLY_SCHEDULE_PARAM_KEYS[i]] = entries?.length ? formatDayHexSchedule(entries) : '';
  }

  return params;
};
