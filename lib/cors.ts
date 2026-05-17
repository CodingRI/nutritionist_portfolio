const allowedOrigins = [
    "http://localhost:3001",
    "https://dashboard.nourishwell.com",
  ]
  
  export function getCorsHeaders(origin: string | null) {
    const isAllowedOrigin = origin && allowedOrigins.includes(origin)
  
    return {
      "Access-Control-Allow-Origin": isAllowedOrigin ? origin : "",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    }
  }
  
  export function corsOptionsResponse(req: Request) {
    const origin = req.headers.get("origin")
  
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(origin),
    })
  }