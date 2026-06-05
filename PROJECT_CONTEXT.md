# PROJECT CONTEXT — 导播星球 daobolive

## 这是导播星球项目

项目名称：**导播星球**

GitHub 仓库：**https://github.com/liuchixiangai/daobolive.git**

## 目录说明

- GitHub 仓库根目录即为项目目录
- 审查和开发直接以仓库根目录为工作目录
- **不允许审查工作区根目录**
- **不允许混入旧项目内容**

## 技术栈

- Next.js 16.2.7 + TypeScript
- Prisma 7.8.0 + SQLite
- JWT: jose + bcryptjs
- TailwindCSS 4

## 已完成阶段

1. 管理员登录（JWT + Cookie + 中间件鉴权）
2. 导播案例管理（创建/编辑/列表/自动编号）
3. HTML 保存/预览/公开页（iframe sandbox + 白名单）
4. 承诺书上传（PDF/JPG/PNG/10MB）
5. 微信核验（标记/取消/备注）
6. 发布/下架/恢复发布（发布前4项风控检查）
7. 投诉系统（提交/后台管理/一键下架）
8. 申请入驻（极简5字段 + A000001编号）
9. 电子承诺书（v1.0留痕）
10. 微信/QQ群引导（后台配置 + 申请成功页展示）

## 禁止的旧项目

以下项目**不得**与本项目混淆：

1. guangwei-namebar
2. football / basketball
3. 计分板项目
4. 字幕项目
5. landing
6. guangwei.cloud 相关
7. namebar 相关
8. 43.129.194.168 相关

## 当前状态

- 当前 HEAD: main 分支最新 commit
- 分支: main
- npm run build: `npm run build`（prebuild 自动执行 prisma generate）
