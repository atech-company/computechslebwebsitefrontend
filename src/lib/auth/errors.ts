export class AuthError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
    public readonly code = "auth_error",
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}
