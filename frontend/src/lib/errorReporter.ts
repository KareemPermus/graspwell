const getAppId = (): string => {
  if (typeof window === 'undefined') return '';
  if (process.env.NEXT_PUBLIC_APP_ID) return process.env.NEXT_PUBLIC_APP_ID;
  const match = window.location.hostname.match(/^preview-([^.]+)/);
  return match ? match[1] : '';
};

const reportError = (message: string, stack?: string) => {
  const url = process.env.NEXT_PUBLIC_RUNTIME_ERROR_REPORT_URL;
  if (!url) return;
  try {
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        app_id: getAppId(),
        message,
        stack: stack || '',
        url: typeof window !== 'undefined' ? window.location.href : '',
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      }),
    }).catch(() => {});
  } catch {}
};

export function initErrorReporter() {
  if (typeof window === 'undefined') return;
  window.onerror = (msg, _source, _line, _col, error) => {
    reportError(String(msg), error?.stack);
  };
  window.onunhandledrejection = (event) => {
    reportError(event.reason?.message || String(event.reason), event.reason?.stack);
  };
  const origConsoleError = console.error;
  console.error = (...args: any[]) => {
    reportError(args.map(String).join(' '));
    origConsoleError.apply(console, args);
  };
}