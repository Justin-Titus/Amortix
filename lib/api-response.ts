export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
};

export function ok<T>(data?: T): ApiResponse<T> {
  return { success: true, data, statusCode: 200 };
}

export function fail(message = "An unexpected error occurred", statusCode = 500) {
  return { success: false, error: message, statusCode } as ApiResponse;
}
