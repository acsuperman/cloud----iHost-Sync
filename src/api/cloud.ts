import axios from '@/api/axios';
import {
  LoginResponse,
  FamilyResponse,
  FamilyDeviceListResponse,
  LongLinkInfo,
} from '@/interface';

export const userLogin = (phoneNumber: string, password: string, countryCode: string) => {
  const data: { password: string; countryCode: string; email?: string; phoneNumber?: string } = {
    password: password,
    countryCode: countryCode,
  };

  if (phoneNumber.includes('@')) {
    data.email = phoneNumber;
  }
  else
    data.phoneNumber = phoneNumber;

  return axios.post<any, LoginResponse>('/v2/user/login', data);
};

export const getFamilyAndRoomInfo = () => {
  return axios.get<any, FamilyResponse>('/v2/family');
};

export const getFamilyDeviceList = (familyid: string) => {
  return axios.get<any, FamilyDeviceListResponse>('/v2/device/thing', {
    params: {
      familyid,
      num: 0,
    },
  });
};

export const getLongLinkInfo = (url: string) => {
  return axios.get<any, LongLinkInfo>(url);
};
