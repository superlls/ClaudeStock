import json
import os
from openai import OpenAI
from models.schemas import AnalysisRequest, AnalysisResponse

SYSTEM_PROMPT = """你是一位专业的A股分析师。
你必须且只能返回合法的JSON格式，不得包含任何其他文字、markdown代码块或解释。
返回格式（严格遵守字段名）：
{"summary": "2-3句话的分析总结", "sentiment": "Bullish|Neutral|Bearish", "risk_level": "Low|Medium|High"}
禁止在JSON之外输出任何内容。"""

client = OpenAI(
    api_key=os.getenv("KIMI_API_KEY"),
    base_url="https://api.moonshot.cn/v1"
)

async def analyze_stock(request: AnalysisRequest) -> AnalysisResponse:
    prompt = f"""请分析以下A股信息并返回JSON：
股票代码：{request.symbol}
股票名称：{request.name}
当前价格：{request.price}
涨跌幅：{request.change_pct}"""

    try:
        response = client.chat.completions.create(
            model="moonshot-v1-8k",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=200
        )

        result_text = response.choices[0].message.content.strip()
        analysis = json.loads(result_text)

        return AnalysisResponse(
            summary=analysis.get("summary", ""),
            sentiment=analysis.get("sentiment", "Neutral"),
            risk_level=analysis.get("risk_level", "Medium")
        )
    except json.JSONDecodeError:
        raise ValueError("Invalid JSON response from Kimi API")
    except Exception as e:
        raise ValueError(f"Failed to analyze stock: {str(e)}")
