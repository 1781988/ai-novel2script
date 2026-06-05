# 章幕引擎 ChapterStage

章幕引擎是一款面向小说作者和短剧创作者的 AI 辅助改编工具。它计划把 3 个章节以上的小说文本转换为结构化剧本 YAML，提供可继续编辑、校验和导出的剧本初稿。

项目采用微信小程序 + 微信云开发实现。前端负责小说导入、生成流程展示和剧本编辑，云函数负责项目数据、章节解析、模型调用、YAML 生成与校验。

## 功能规划

- 小说项目创建：记录项目名称、小说标题、作者、题材和短剧目标时长。
- 多章节小说导入：支持粘贴文本，并计划支持 TXT、Markdown、DOCX 文件。
- AI 剧本生成：抽取人物、地点、事件、冲突和人物关系，规划短剧分集并生成场景。
- YAML 结构化输出：使用 Schema 校验剧本结构，便于后续编辑和导出。
- 剧本编辑与版本管理：支持场景调整、对白润色、多版本保存和历史恢复。
- 多格式导出：计划支持 YAML、Markdown 和 TXT 剧本导出。

## 当前状态

当前分支完成了第一阶段基础工程：

- 微信小程序基础目录与工程配置
- 首页
- 项目创建页
- 模型设置页
- `initProject` 云函数
- 示例三章节小说
- 剧本 Schema 初始文件

## 项目结构

```text
cloudfunctions/
  initProject/             创建小说改编项目的云函数
examples/
  sample_novel_3chapters.txt
miniprogram/
  pages/index/             首页
  pages/project-create/    项目创建页
  pages/settings/          模型设置页
schema/
  screenplay.schema.json   剧本结构校验 Schema
project.config.json        微信开发者工具工程配置
```

`project.config.json` 是微信开发者工具需要的工程配置文件，用于定位小程序源码目录和云函数目录，因此保留在仓库根目录。个人本地配置 `project.private.config.json` 不提交。

## 本地运行

1. 使用微信开发者工具导入本仓库。
2. 确认小程序目录为 `miniprogram/`，云函数目录为 `cloudfunctions/`。
3. 开通微信云开发环境。
4. 在云数据库中创建 `projects` 集合。
5. 上传并部署 `cloudfunctions/initProject`。
6. 打开小程序首页，进入“新建改编项目”创建测试项目。

## 云函数

### initProject

创建一个小说改编项目，并写入 `projects` 集合。

请求示例：

```json
{
  "projectName": "雨夜来客改编",
  "novelTitle": "雨夜来客",
  "authorName": "示例作者",
  "genre": "悬疑",
  "targetType": "short_drama",
  "episodeTargetMinutes": 5
}
```

返回示例：

```json
{
  "success": true,
  "projectId": "project_id"
}
```

## 模型配置

API Key 不会写入小程序前端代码。后续模型调用会统一放在云函数中，通过云函数环境变量读取 DeepSeek、Gemini 或 OpenAI 的配置。

## 依赖说明

- 微信小程序原生框架
- 微信云开发
- `wx-server-sdk`：云函数访问云数据库和用户上下文

## Demo

Demo 视频将在核心功能完成后补充。
