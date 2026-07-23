
import WebSocket from 'ws';
import { HandshakeParams, WsConfig, WsSendData, WebSocketMessage } from '@/interface';

let reConnectInterval = 0;
const reConnectMaxInterval = 60;
let connectingFlag = false;

function randomNonce(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
}

export function useWebSocket(domain: string, port: number, handshake: HandshakeParams) {
  let config: WsConfig | null = null; 
  let ws: WebSocket | null = null;
  let heartbeatTimer: ReturnType<typeof setTimeout> | null = null;
  let heartbeatTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
  const heartbeatTimeout = 5000;
  const wsControlRes: Map<string, { reject: (reason?: WebSocketMessage) => void; resolve: (value: WebSocketMessage) => void ; deviceid: string }> = new Map();
  const listeners: Array<(data: any) => void> = [];

  const connect = async () => {
    if (connectingFlag === true)
      return;
    connectingFlag = true;
    await new Promise((resolve) => setTimeout(() => resolve(''), reConnectInterval * 1000));
    reConnectInterval += 5;
    if (reConnectInterval > reConnectMaxInterval)
      return;
    const url = `wss://${domain}:${port}/api/ws`;

    ws = new WebSocket(url);

    ws.on('open', () => {
      const handshakeMsg = {
        action: 'userOnline',
        version: 8,
        at: handshake.at,
        userAgent: 'app',
        apikey: handshake.apikey,
        appid: handshake.appid,
        nonce: randomNonce(),
        sequence: Date.now().toString(),
      };

      ws!.send(JSON.stringify(handshakeMsg));
    });

    ws.on('message', (data: Buffer) => {
      const text = data.toString();

      if (text === 'pong') {
        clearHeartbeatTimeout();

        return;
      }

      const msg = JSON.parse(text);

      if (msg.error === 0 && msg.config) {
        config = msg.config;
        reConnectInterval = 0;
        connectingFlag = false; //握手成功才是真的建好webSocket了
        startHeartbeat();
      }

      if (msg.error !== 0 && msg.config) {
        //握手失败，重新connect一下
        connectingFlag = false;
        connect();

      }

      listeners.forEach(fn => fn(msg));
    });

    ws.on('close', (code: number) => {
      connectingFlag = false;
      stopHeartbeat();
      clearHeartbeatTimeout();
      if (code !== 4001)
        connect();
    });

    ws.on('error', () => {
      console.log('这是ws.onerror');
    });

  };

  const startHeartbeat = () => {
    if (!config || config.hb !== 1) return;
    const interval = (config.hbInterval || 90) * (0.8 + Math.random() * 0.2);

    heartbeatTimer = setInterval(() => {
      ws?.send('ping');
      heartbeatTimeoutTimer = setTimeout(() => {
        stopHeartbeat();
        connect();
      }, heartbeatTimeout);
    }, interval * 1000);
  };

  const stopHeartbeat = () => {
    if (heartbeatTimer) {
      clearTimeout(heartbeatTimer);
      heartbeatTimer = null;
    }
  };

  const clearHeartbeatTimeout = () => {
    if (heartbeatTimeoutTimer) {
      clearTimeout(heartbeatTimeoutTimer);
      heartbeatTimeoutTimer = null;
    }
  };

  const send = (data: WsSendData) => {
    ws?.send(JSON.stringify(data));
  };

  const close = (params: { manualClose: boolean } = { manualClose: false }) => {
    stopHeartbeat();
    clearHeartbeatTimeout();
    const code = params.manualClose ? 4001 : 1005;

    ws?.close(code);
  };

  const onMessage = (handler: (data: WebSocketMessage) => void) => {
    listeners.push(handler);
  };

  const sendRequest = (data: WsSendData) => {
    send(data);

    return new Promise((resolve, reject) => {
      wsControlRes.set(data.sequence, { reject, resolve, deviceid: data.deviceid });
    });

  };

  const dealWsRes = (data: WebSocketMessage) => {

    if (wsControlRes.has(data.sequence)) {
      const targetRs = wsControlRes.get(data.sequence)!;

      if (data.error === 0) {
        targetRs.resolve(data);
      }
      else
        targetRs.reject(data);
      wsControlRes.delete(data.sequence);

      return;
    }
  };

  const init = () => {
    listeners.push(dealWsRes);
  };

  init();

  return { ws, onMessage, sendRequest,connect };
}
