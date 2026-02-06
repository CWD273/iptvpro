export function badRequest(message = 'Bad Request') {
  return new Response(message, { status: 400 });
}
export function notFound(message = 'Not Found') {
  return new Response(message, { status: 404 });
}
export function serverError(err) {
  const msg = (err && err.message) ? err.message : 'Internal Server Error';
  return new Response(msg, { status: 500 });
}
