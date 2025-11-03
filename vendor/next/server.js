export class NextResponse extends Response {
  static json(data, init) {
    return new NextResponse(JSON.stringify(data), {
      headers: { 'content-type': 'application/json', ...(init?.headers || {}) },
      status: init?.status ?? 200,
    });
  }

  static redirect(url, status = 302) {
    return new NextResponse(null, {
      status,
      headers: { location: url },
    });
  }
}

export const NextRequest = Request;
