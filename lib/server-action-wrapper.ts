import { reportError } from "./logger";
import type { ApiResponse } from "./api-response";

/**
 * Wrap a server-side action with consistent error handling and logging.
 * The handler should return an ApiResponse-like object or any serializable value.
 */
export async function withServerAction<T>(
  actionName: string,
  handler: () => Promise<T>
): Promise<T | ApiResponse> {
  try {
    const result = await handler();
    return result;
  } catch (error) {
    reportError(error, { action: actionName });
    return { success: false, error: "An unexpected server error occurred.", statusCode: 500 };
  }
}
