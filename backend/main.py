from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from routers import stock, analysis, kline

load_dotenv()

app = FastAPI(title="ClaudeStock API")

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(stock.router)
app.include_router(analysis.router)
app.include_router(kline.router)

@app.get("/")
async def root():
    return {"message": "ClaudeStock API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
