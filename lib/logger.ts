export function maskUserId(userId: string): string {
  let hash = 5381;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) + hash) + userId.charCodeAt(i);
    hash |= 0;
  }
  return `uid_${(hash >>> 0).toString(16)}`;
}

export type LoggerMeta = Record<string, unknown>;


function formatMessage(level: string, message: string, meta?: LoggerMeta) {
  return JSON.stringify({
    level,
    message,
    timestamp: new Date().toISOString(),
    meta: meta ?? {},
  });
}

export function logInfo(message: string, meta?: LoggerMeta) {
  console.log(formatMessage("info", message, meta));
}

export function logWarn(message: string, meta?: LoggerMeta) {
  console.warn(formatMessage("warn", message, meta));
}

export function logError(message: string, meta?: LoggerMeta) {
  console.error(formatMessage("error", message, meta));
}

export function reportError(error: unknown, meta?: LoggerMeta) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  console.error(
    JSON.stringify({
      level: "error",
      message,
      stack,
      timestamp: new Date().toISOString(),
      meta: meta ?? {},
    })
  );
}
