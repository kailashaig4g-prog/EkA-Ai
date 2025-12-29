"""
Minimal backend server for EkA-Ai - Routes to Node.js Express backend
This is a proxy placeholder for supervisor compatibility
"""
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
import os

app = FastAPI(title="EkA-Ai Proxy")

# CORS configuration - allow all origins for preview
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Node.js backend URL
NODE_BACKEND = os.environ.get("NODE_BACKEND_URL", "http://localhost:5000")

@app.get("/health")
async def health():
    return {"status": "ok", "service": "eka-ai-proxy"}

@app.get("/api/health")
async def api_health():
    return {"status": "ok", "service": "eka-ai-proxy", "backend": NODE_BACKEND}

@app.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def proxy_api(path: str, request: Request):
    """Proxy all /api requests to Node.js backend"""
    if request.method == "OPTIONS":
        return Response(
            content="",
            status_code=200,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers": "*",
            }
        )
    
    async with httpx.AsyncClient() as client:
        try:
            url = f"{NODE_BACKEND}/api/{path}"
            headers = dict(request.headers)
            headers.pop("host", None)
            headers.pop("content-length", None)
            
            body = await request.body()
            
            response = await client.request(
                method=request.method,
                url=url,
                headers=headers,
                content=body,
                params=request.query_params,
                timeout=60.0
            )
            
            # Build response headers
            response_headers = {}
            for key, value in response.headers.items():
                if key.lower() not in ['content-encoding', 'transfer-encoding', 'content-length']:
                    response_headers[key] = value
            
            response_headers["Access-Control-Allow-Origin"] = "*"
            
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=response_headers,
                media_type=response.headers.get("content-type", "application/json")
            )
        except httpx.TimeoutException:
            return JSONResponse(
                status_code=504,
                content={"error": "Backend timeout"}
            )
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"error": str(e), "detail": "Proxy error"}
            )

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def proxy_root(path: str, request: Request):
    """Proxy all other requests to Node.js backend"""
    if request.method == "OPTIONS":
        return Response(
            content="",
            status_code=200,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers": "*",
            }
        )
    
    async with httpx.AsyncClient() as client:
        try:
            url = f"{NODE_BACKEND}/{path}"
            headers = dict(request.headers)
            headers.pop("host", None)
            headers.pop("content-length", None)
            
            body = await request.body()
            
            response = await client.request(
                method=request.method,
                url=url,
                headers=headers,
                content=body,
                params=request.query_params,
                timeout=60.0
            )
            
            response_headers = {}
            for key, value in response.headers.items():
                if key.lower() not in ['content-encoding', 'transfer-encoding', 'content-length']:
                    response_headers[key] = value
            
            response_headers["Access-Control-Allow-Origin"] = "*"
            
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=response_headers,
                media_type=response.headers.get("content-type", "application/json")
            )
        except Exception as e:
            return JSONResponse(
                status_code=500,
                content={"error": str(e)}
            )
