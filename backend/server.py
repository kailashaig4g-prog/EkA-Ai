"""
Minimal backend server for EkA-Ai - Routes to Node.js Express backend
This is a proxy placeholder for supervisor compatibility
"""
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os

app = FastAPI(title="EkA-Ai Proxy")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Node.js backend URL
NODE_BACKEND = os.environ.get("NODE_BACKEND_URL", "http://localhost:5000")

@app.get("/health")
async def health():
    return {"status": "ok", "service": "eka-ai-proxy"}

@app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy(path: str, request: Request):
    """Proxy all requests to Node.js backend"""
    async with httpx.AsyncClient() as client:
        try:
            url = f"{NODE_BACKEND}/{path}"
            headers = dict(request.headers)
            headers.pop("host", None)
            
            response = await client.request(
                method=request.method,
                url=url,
                headers=headers,
                content=await request.body(),
                params=request.query_params,
                timeout=60.0
            )
            
            return Response(
                content=response.content,
                status_code=response.status_code,
                headers=dict(response.headers)
            )
        except Exception as e:
            return {"error": str(e)}
