import { getIhostOpenTk, localLogin } from '@/api/ihost';
import { getIhostCertificate } from '@/api/ihost';
import { ihostSideUserInfo,sseCliet } from '@/store';
import { useSse } from '@/common/sse';
import { errorLogAndExit } from '@/util';

const connectIhost = async () => {
  try {
    const localLoginRes = await localLogin(process.env.LOCALPASSWORD!);

    ihostSideUserInfo.localToken = localLoginRes.at;
    await getIhostOpenTk();
    await getIhostCertificate();//代替点击页面上的凭证弹窗的确定按钮
    
    const openTkRes = await getIhostOpenTk();

    ihostSideUserInfo.openToken = openTkRes.data.token;
    Object.assign(sseCliet, useSse({ url: process.env + '/open-api/v1/sse/bridge',params: { 'access_token': ihostSideUserInfo.openToken } }));

  } catch (error) {
    errorLogAndExit('connectIhost failed:',error);

  }
  
};

export { connectIhost };
