import axios, { InternalAxiosRequestConfig } from 'axios';
import { dispatchLongLinkUrlMap, plainApiRegionDomainMap } from '../common/index.js';
import { cloudSideUserInfo,ihostSideUserInfo } from '@/store/index.js';
import { errorLogAndExit } from '@/util';

const api = axios.create({ baseURL: plainApiRegionDomainMap.cn });
const apiNeedSign = ['/v2/user/login'];
const env = process.env;
const apiNoDoubleData = ['/api/v1/rest/bridge/openapi/authorization',...Object.values(dispatchLongLinkUrlMap)];
const loginSign = async (config: InternalAxiosRequestConfig) => {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(env.APPSECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const toSign = JSON.stringify(config.data);
  const sigBuf = await crypto.subtle.sign('HMAC', key, encoder.encode(toSign));
  const sign = btoa(String.fromCharCode(...new Uint8Array(sigBuf)));

  config.headers['Authorization'] = `Sign ${sign}`;
};

const normalSign = (config: InternalAxiosRequestConfig) => {

  config.headers['Authorization'] = `Bearer ${cloudSideUserInfo.accessToken}`;
};

const cloudSideRequestInterceptor = async (config: InternalAxiosRequestConfig) => {
  if (cloudSideUserInfo.region && plainApiRegionDomainMap[cloudSideUserInfo.region]) {
    config.baseURL = plainApiRegionDomainMap[cloudSideUserInfo.region];
  }

  const urlWithoutQuery = (config.url as string).split('?')[0];

  if (apiNeedSign.includes(urlWithoutQuery)) {
    await loginSign(config);
  } else {
    normalSign(config);
  }

  config.headers['x-ck-appid'] = env.APPID;

  return config;
};

const ihostSideRequestInterceptor = (config: InternalAxiosRequestConfig) => {
  config.baseURL = env.IHOSTDOMAIN;
  const authorization = config.url === '/api/v1/rest/bridge/openapi/authorization' ? `Bearer ${ihostSideUserInfo.localToken}` : `Bearer ${ihostSideUserInfo.openToken}`;

  if (authorization)
    config.headers['Authorization'] = authorization;

  return config;
};

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const isIhost = config.url!.includes('/open-api') || config.url!.startsWith('/api/v1/rest/bridge/');

  if (!isIhost)
    return cloudSideRequestInterceptor(config);
  else
    return ihostSideRequestInterceptor(config);
});

api.interceptors.response.use(response => {

  if (response.data.error !== 0 && !response.config.url?.includes('/open-api')) {
    console.log(`http响应错误${response.config.url}`,response.data);
  }
  else if (response.config.url?.includes('/open-api') && response.data.header?.name === 'ErrorResponse')
    console.log(`/open-api http响应错误${response.config.url}`,response.data);

  if ((response.config.url && apiNoDoubleData.includes(response.config.url)) || response.config.url?.includes('/open-api')) {
    return response.data;
  }

  return response.data.data;
}, error => {
  const url = error.config?.url ?? 'unknown';
  const method = error.config?.method?.toUpperCase() ?? 'UNKNOWN';
  const status = error.response?.status ?? 'N/A';
  const statusText = error.response?.statusText ?? '';
  const message = error.message ?? '';

  console.error(`[HTTP ${method}] ${url} → ${status} ${statusText} | ${message}`);

  return error;
});

export default api;
