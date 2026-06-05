# 章幕引擎 ChapterStage

## 1. 项目简介

章幕引擎是一款 AI 小说转剧本微信小程序，面向小说作者、短剧编剧和内容团队。用户导入 3 个章节以上的小说文本后，系统会完成章节识别、信息抽取、短剧分集、场景拆分、结构化 YAML 生成、校验修复、可视化编辑、版本保存和多格式导出。

## 2. 赛题对应关系

赛题要求将 3 个章节以上小说文本自动转换为结构化剧本 YAML，并提供 YAML Schema 设计说明、README 和 Demo 视频。本项目对应实现：

- 支持 3 章以上小说输入与章节有效性校验。
- 支持 TXT、Markdown、DOCX 文件解析。
- 支持 DeepSeek、Gemini、OpenAI 多模型云函数接入。
- 生成包含 metadata、source、characters、relations、locations、episodes、scenes、beats 的剧本 YAML。
- 使用 `schema/screenplay.schema.json` 描述和校验剧本结构。
- 支持 YAML / Markdown / TXT 导出。

## 3. 核心功能

- 小说项目创建
- 小说文本粘贴和文件导入
- 自动章节识别和章节检查
- 人物、地点、事件、冲突和人物关系抽取
- 短剧分集规划
- 剧本场景拆分
- 结构化 YAML 生成
- YAML Schema 校验和 AI 修复
- 剧本预览、场景编辑、对白润色
- 人物关系图
- 版本保存和恢复
- YAML / Markdown / TXT 导出

## 4. 技术架构

```text
微信小程序前端
  → 页面交互、导入、预览、编辑、导出

微信云开发
  → 云数据库、云存储、云函数

AI 服务层
  → DeepSeek / Gemini / OpenAI Adapter
  → Unified LLM Client

结构化处理层
  → 章节解析、信息抽取、分集规划、场景拆分、YAML 生成、Schema 校验
```

## 5. 小程序页面说明

- 首页：项目入口、导入入口、模型设置入口。
- 项目创建页：创建小说改编项目。
- 小说导入页：粘贴文本或上传 TXT、Markdown、DOCX。
- 章节检查页：展示章节列表、字数和 3 章校验。
- AI 生成页：展示生成进度并输出 YAML 初稿。
- 剧本预览页：查看人物、地点、分集和场景。
- 场景编辑页：编辑场景字段、beats 和对白润色。
- YAML 编辑页：编辑、校验、修复和保存 YAML。
- 人物关系图页：Canvas 展示人物节点与关系。
- 版本记录页：查看和恢复历史版本。
- 设置页：选择模型服务商，不输入 API Key。

## 6. 云函数说明

- `initProject`：创建项目。
- `parseNovel`：清洗文本并识别章节。
- `uploadNovelFile`：解析 TXT、Markdown、DOCX 文件。
- `extractInfo`：抽取人物、地点、事件、冲突和关系。
- `planEpisodes`：规划短剧分集。
- `splitScenes`：拆分剧本场景。
- `generateScript`：生成结构化剧本 YAML。
- `validateYaml`：校验 YAML 是否符合 Schema。
- `repairYaml`：根据错误修复 YAML。
- `polishDialogue`：润色对白。
- `saveVersion`：保存剧本版本。
- `exportScript`：导出 YAML、Markdown、TXT 并上传云存储。

## 7. 数据库集合说明

- `projects`：项目基础信息。
- `chapters`：章节标题、顺序、原文、清洗文本和字数。
- `extracted_infos`：人物、地点、事件、冲突和人物关系。
- `episodes`：短剧分集规划。
- `scripts`：当前剧本 YAML 和 JSON 内容。
- `script_versions`：剧本历史版本。
- `generation_logs`：AI 生成日志。

## 8. 大模型配置方式

API Key 只允许配置在云函数环境变量中，不写入小程序前端。

### 8.1 使用 DeepSeek

```bash
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
```

### 8.2 使用 Gemini

```bash
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-2.5-flash
```

### 8.3 使用 OpenAI

```bash
LLM_PROVIDER=openai
OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4.1-mini
```

未配置 API Key 时，部分云函数会使用规则化降级结果，便于本地演示完整流程。

## 9. YAML Schema 说明

Schema 文件位于 `schema/screenplay.schema.json`。设计原因：

- `metadata` 保存项目、题材、章节数、模型和生成时间，方便追踪来源。
- `source.chapters` 保留原小说章节映射，确保改编结果可回溯。
- `characters`、`locations`、`relations` 分开建模，方便编辑和关系图展示。
- `episodes` 表达短剧分集，保留每集来源章节、摘要和钩子。
- `scenes` 表达可拍摄场景，每场包含时间、地点、人物、冲突、摘要和 beats。
- `beats` 使用 action、dialogue、narration、transition 枚举，便于导出和编辑器校验。

## 10. 示例输入输出

示例输入：

- `examples/sample_novel_3chapters.txt`

示例输出：

- `examples/sample_output.yaml`
- `examples/sample_output.txt`

Markdown 导出格式示例：

```md
# 雨夜来客

## 人物表

- 林澈：年轻记者，追查父亲失踪真相。

## 第 1 集：雨夜来信

### 第 1 场：雨夜中的匿名信

时间：深夜
地点：林澈出租屋
人物：林澈

动作：林澈拆开被雨水打湿的信封。
林澈：三年前的事，终于有人愿意说了吗？
```

## 11. 本地运行方式

1. 使用微信开发者工具导入本仓库。
2. 确认小程序目录为 `miniprogram/`，云函数目录为 `cloudfunctions/`。
3. 开通微信云开发环境。
4. 创建 README 第 7 节列出的云数据库集合。
5. 上传并部署云函数。
6. 打开小程序首页，新建项目。
7. 导入 3 章以上小说并执行 AI 生成。
8. 在剧本预览页编辑、校验、保存和导出剧本。

## 12. 云函数部署方式

在微信开发者工具中逐个右键云函数目录，选择“上传并部署：云端安装依赖”。需要部署：

```text
initProject
parseNovel
uploadNovelFile
extractInfo
planEpisodes
splitScenes
generateScript
validateYaml
repairYaml
polishDialogue
saveVersion
exportScript
```

## 13. Demo 视频链接

Demo 视频链接：待上传后填写。

## 14. 依赖说明

- 微信小程序原生框架
- 微信云开发
- `wx-server-sdk`：云函数访问云数据库、云存储和用户上下文
- `mammoth`：DOCX 正文提取
- `js-yaml`：YAML 解析和导出
- `ajv`：JSON Schema 校验
- DeepSeek API：AI 剧本生成
- Gemini API：AI 剧本生成
- OpenAI API：AI 剧本生成

## 15. 原创功能说明

本项目原创实现以下功能：

1. 小说章节自动识别与章节有效性校验。
2. 多章节小说到剧本的分阶段 AI 生成流程。
3. 面向小说改编剧本的 YAML Schema。
4. 人物、地点、事件、冲突和人物关系抽取流程。
5. 短剧分集规划逻辑。
6. 小说章节到剧本场景的映射机制。
7. YAML Schema 校验与 AI 自动修复流程。
8. 场景卡片化编辑与 beats 顺序调整。
9. 单句对白 AI 润色。
10. 人物关系图可视化。
11. 剧本多版本保存与恢复。
12. YAML / Markdown / TXT 多格式导出。

## 16. 5 次 PR 开发记录

1. PR1：项目初始化、小程序基础页面、云开发结构。
2. PR2：小说导入、TXT/Markdown/DOCX 解析、章节识别。
3. PR3：多模型 AI 接入、信息抽取、分集规划、场景拆分、YAML 生成。
4. PR4：YAML Schema 校验、AI 修复、剧本预览、编辑、关系图、版本管理。
5. PR5：导出功能、README、示例输出和最终比赛材料。

## 17. 后续维护说明

- 上传 Demo 视频后更新第 13 节链接。
- 根据评审环境配置对应模型 API Key。
- 后续可继续增强拖拽交互、Schema 严格度和导出样式。
