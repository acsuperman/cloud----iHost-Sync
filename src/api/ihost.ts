import axios from '@/api/axios';
import { GetIhostTkRes, IhostRequestBody, IhostResponseBody,LocalLoginRes,LongLinkInfo } from '@/interface';

export const localLogin = (password: string) => {
  return axios.post<any, LocalLoginRes>('/api/v1/rest/bridge/login',{ password } );
};

export const getIhostCertificate = () => {
  return axios.post<any, any>('/api/v1/rest/bridge/openapi/authorization', { 'type': 'openapi' });
};

export const getIhostOpenTk = () => {
  return axios.get<any, GetIhostTkRes>('/open-api/v1/rest/bridge/access_token');
};

export const requestIhost = (body: IhostRequestBody) => {
  return axios.post<any, IhostResponseBody>('/open-api/v1/rest/thirdparty/event', body);
};
