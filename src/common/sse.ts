import { EventSource } from 'eventsource';
import { MessageHandler, SseOptions } from '@/interface';

export function useSse(options: SseOptions) {
  let es: EventSource | null = null;

  function connect(): void {

    const url = options.params
      ? `${options.url}?${new URLSearchParams(options.params)}`
      : options.url;

    es = new EventSource(url);

    es.onopen = (event) => {

    };

    es.onerror = () => {

    };
  }

  function close(): void {
    es?.close();
    es = null;
  }

  function essAddEventListener(eventName: string, dealFun: MessageHandler) {
    es?.addEventListener(eventName, dealFun);
  }

  function essRemoveEventListener(eventName: string, dealFun: MessageHandler) {
    es?.removeEventListener(eventName, dealFun);
  }

  return { connect, close, essAddEventListener, essRemoveEventListener };
}
