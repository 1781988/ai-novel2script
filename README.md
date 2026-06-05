# 章幕引擎 ChapterStage

章幕引擎是一个微信小程序形式的 AI 小说改编工具。它用于把多章节小说整理成结构化剧本初稿，并提供章节识别、剧本生成、YAML 校验、场景编辑、版本管理和多格式导出能力。

项目适合小说作者、短剧策划、编剧助理和内容团队使用。使用者可以从小说文本开始，逐步得到可编辑、可追踪、可导出的剧本 YAML。

## 功能概览

- 创建小说改编项目，记录标题、作者、题材和目标短剧时长。
- 导入 3 章以上小说文本，支持粘贴、TXT、Markdown、DOCX。
- 自动识别章节标题、顺序、正文和字数。
- 抽取人物、地点、事件、冲突和人物关系。
- 根据章节内容规划短剧分集。
- 将章节拆分为可拍摄场景。
- 生成结构化剧本 YAML。
- 按 Schema 校验 YAML，并支持 AI 修复。
- 在小程序中预览人物表、地点表、分集和场景。
- 编辑场景标题、时间、地点、人物、冲突和 beats。
- 润色对白，保存剧本版本，恢复历史版本。
- 导出 YAML、Markdown、TXT。

## 项目结构

```text
cloudfunctions/           微信云函数
examples/                 示例输入输出
miniprogram/              微信小程序源码
schema/                   剧本 YAML Schema
project.config.json       微信开发者工具项目配置
README.md                 项目说明
指导.md                   配置和使用指导
```

## 小程序页面

```text
pages/index               首页工作台
pages/project-create      创建项目
pages/import              导入小说
pages/chapter-review      章节检查
pages/generate            AI 生成
pages/script-preview      剧本预览
pages/scene-editor        场景编辑
pages/yaml-editor         YAML 编辑
pages/relation-graph      人物关系图
pages/version-history     版本记录
pages/settings            模型设置
```

## 云函数

```text
initProject       创建项目
parseNovel        文本清洗和章节识别
uploadNovelFile   文件解析
extractInfo       信息抽取
planEpisodes      分集规划
splitScenes       场景拆分
generateScript    生成剧本 YAML
validateYaml      校验 YAML
repairYaml        修复 YAML
polishDialogue    润色对白
saveVersion       保存版本
exportScript      导出剧本
```

## 数据库集合

需要在微信云开发数据库中创建以下集合：

```text
projects
chapters
extracted_infos
episodes
scripts
script_versions
generation_logs
```

## 模型配置

API Key 只配置在云函数环境变量中，小程序前端不输入、不保存 API Key。

DeepSeek：

```bash
LLM_PROVIDER=deepseek
DEEPSEEK_API_KEY=your_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-v4-flash
```

Gemini：

```bash
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-2.5-flash
```

OpenAI：

```bash
LLM_PROVIDER=openai
OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4.1-mini
```

未配置 API Key 时，部分云函数会使用规则化降级结果，便于先跑通小程序流程。

## 本地运行

1. 使用微信开发者工具导入仓库。
2. 小程序目录选择 `miniprogram/`。
3. 云函数目录选择 `cloudfunctions/`。
4. 开通微信云开发环境。
5. 创建数据库集合。
6. 配置模型环境变量。
7. 上传并部署云函数，选择“云端安装依赖”。
8. 编译运行小程序。

更详细的配置和使用流程见 [指导.md](指导.md)。

## YAML Schema

剧本 Schema 位于 `schema/screenplay.schema.json`。顶层结构包括：

```text
schema_version
metadata
source
characters
relations
locations
episodes
scenes
```

`scenes` 中每场戏包含时间、地点、人物、冲突、摘要和 beats。beats 类型包括 `action`、`dialogue`、`narration`、`transition`。

## 示例

示例小说：

```text
examples/sample_novel_3chapters.txt
```

示例输出：

```text
examples/sample_output.yaml
examples/sample_output.txt
```

## 依赖

- 微信小程序原生框架
- 微信云开发
- `wx-server-sdk`
- `mammoth`
- `js-yaml`
- `ajv`
- DeepSeek API
- Gemini API
- OpenAI API

## 版本记录

项目按 5 个阶段提交：

1. 初始化小程序基础工程与项目创建流程。
2. 支持小说导入、文件解析与章节识别。
3. 接入多模型 AI 并生成剧本 YAML。
4. 实现 YAML 校验修复、剧本编辑、关系图与版本管理。
5. 实现剧本导出并完善使用说明。
