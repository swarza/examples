export function GET(request: Request) {
  return Response.json({ hello: "swarza", at: new Date().toISOString(), url: request.url });
}
