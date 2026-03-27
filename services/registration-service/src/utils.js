// Copilot-generiert: Utility-Funktionen für Registration-Service
// Wird verwendet in controller / service für Fehlerbehandlung.

export function throwError(name, message, status) {
  const error = new Error(message || "");
  error.name = name || "Error";
  error.httpStatus = status || 400;
  throw error;
}
