# /feat — ClaudeStock 新功能开发工作流

你是 ClaudeStock 项目的开发者。用户输入功能描述，你**独立**按以下步骤完成开发，全程不创建任何子 agent，不要跳步骤，不要在用户确认前自行推进关键决策。

## 功能需求
$ARGUMENTS

---

## Step 1 · 现状诊断

读取以下文件，快速了解项目当前状态：
- `CLAUDE.md`（全局上下文：技术栈、接口、表结构、变更日志）
- 本次功能**预计涉及**的文件（根据功能描述判断）

扫描重点：
- 涉及文件中有无明显 bug 或潜在风险
- 当前功能与已有功能有无冲突
- 依赖的接口/组件是否存在

输出：**1-2 句话的现状摘要 + 发现的问题（如有）**

---

## Step 2 · 方案设计（等用户确认）

基于现状，提出功能实现方案：

1. **最小侵入原则**：新增文件优于修改现有文件；修改局部优于重构模块
2. **低耦合原则**：新功能应通过接口/props 与现有代码交互，不直接依赖内部状态
3. 列出：
   - 需要新增的文件
   - 需要修改的文件（及修改范围）
   - 是否涉及数据库变动（若是，列出 migration SQL）
   - 预计风险点

**输出方案后，明确问用户："方案确认？还是有调整？"——等待用户回复再继续。**

---

## Step 3 · 数据库变动处理（仅在有 DB 变动时执行）

如果方案涉及数据库变动：

1. 展示完整的 migration SQL（CREATE/ALTER/INDEX 语句）
2. 提示用户：**"请在 Supabase SQL Editor 执行以上 SQL，完成后告诉我"**
3. **等待用户确认执行完毕**，再进入 Step 4

如果方案不涉及数据库，跳过此步。

---

## Step 4 · 后端实现（当前 agent 直接执行，不创建子 agent）

按方案实现后端代码（FastAPI routers/services/models）：

- 遵循项目现有分层：router 只做路由，service 做业务逻辑
- 外部客户端（Kimi/Supabase）继续使用懒加载模式（`get_client()` 函数）
- 新接口遵循现有路由命名风格（`/api/xxx/{symbol}`）

实现后，**执行后端测试**：
```bash
cd backend && python -c "import main; print('import OK')"
```
如果本地后端正在运行，用 curl 测试新接口：
```bash
curl -s http://localhost:8000/api/[新接口] | head -c 200
```

**git commit（后端）**：
```
feat(backend): [功能名称简述]
```

---

## Step 5 · 前端实现（当前 agent 直接执行，不创建子 agent）

按方案实现前端代码（React 组件/API client）：

- 新组件放在 `frontend/src/components/`
- 工具函数放在 `frontend/src/utils/`
- API 调用统一加到 `frontend/src/api/client.js`
- 样式沿用 CSS Variables（`var(--accent)` / `var(--up)` 等），不引入新的颜色系统

实现后，**执行构建验证**：
```bash
cd frontend && npm run build 2>&1 | tail -10
```

构建必须无 error（warning 可接受）。若有 error，修复后再提交。

**git commit（前端）**：
```
feat(frontend): [功能名称简述]
```

---

## Step 6 · 联调报告

向用户描述：
1. 新功能的使用路径（用户如何触发/使用这个功能）
2. 前后端数据流（从用户操作到数据返回的完整链路）
3. 已知限制或后续可优化点（如有）

格式简洁，不超过 10 行。

---

## Step 7 · 收尾

1. **更新 CLAUDE.md**：在变更日志最顶部追加新版本记录，格式：
```
### vX.X — YYYY-MM-DD（当前）
**[功能名称]**
- 新增/修改的文件和功能点（每条一行）
```
同时更新 CLAUDE.md 中受影响的接口文档、表结构等章节。

2. **git push**：
```bash
git push origin main
```

3. 最终输出：**"✓ 功能已上线，Render 将自动部署，约 1-2 分钟生效。"**

---

## 约束

- **全程不创建子 agent**，所有步骤由当前 agent 直接完成
- 不自行修改 Supabase 表结构，必须通过 Step 3 等待用户确认
- 不跳过构建验证直接提交
- 不在用户确认前推进到下一阶段（Step 2 确认、Step 3 确认）
- 每次只提交与本次功能相关的文件，不顺手清理无关代码
- README.md 不更新（只更新 CLAUDE.md）
