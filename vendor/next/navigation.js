export function redirect(destination) {
  const error = new Error(`Redirect to ${destination}`);
  error.status = 302;
  error.destination = destination;
  throw error;
}

export function notFound() {
  const error = new Error('Not Found');
  error.status = 404;
  throw error;
}
