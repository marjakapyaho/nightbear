export type LogLevel
  = 'debug'
  | 'info'
  | 'warn'
  | 'error';
export type LoggerMethod = (message: string, meta?: any) => void;
export type Logger = {
  [level in LogLevel]: LoggerMethod;
};

export function createConsoleLogger(): Logger {
  const bind = (level: LogLevel): LoggerMethod => {
    return (message, meta) => {
      const line = `[${level}] ${message}`;
      const args = typeof meta === 'undefined' ? [ line ] : [ line + '\n', meta ];
      console.log.apply(console, args);
    };
  };
  return {
    debug: bind('debug'),
    info: bind('info'),
    warn: bind('warn'),
    error: bind('error'),
  };
}
