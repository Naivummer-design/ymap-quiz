# Y-MAP 测试网页 - 纯静态 GitHub Pages 部署版

本项目是一个基于 React + Vite 构建的性格测试系统。目前项目已改造为纯前端可编译版本（SPA），可以直接部署到 GitHub Pages 这类静态托管服务。

测试逻辑、题库、结果画像和结果插画都在前端本地完成。Supabase 只作为可选的结果统计能力：配置了公开 Anon Key 就会写入结果，未配置时网页仍可正常运行。

## ✅ 纯静态化改造亮点
- 移除了 Express 和所有相关的服务端节点代码。
- 断开了 `dotenv` 并彻底切到了 Vite 原生前端环境变量注入。
- 移除了 Google Gemini SDK 及相关的隐藏 API Key，消除静态部署阻碍。
- GitHub Pages 路径会在构建时自动识别仓库名，无需手动修改 `base`。
- 新增了 GitHub Actions 自动化工作流，可直接构建并发布 `dist`。

## 📍 本地开发步骤

1. **环境准备：** 确保你安装了 Node.js 18+ 或 20+。
2. **安装依赖：** 
   ```bash
   npm install
   ```
3. **可选：配置 Supabase 环境变量：** 
   在项目根目录下，将 `.env.example` 复制一份并重命名为 `.env`。
   如果你需要记录测试结果，就填入真实 Supabase 链接与匿名密钥；如果不需要统计，可以跳过这一步。
   ```bash
   # .env
   VITE_SUPABASE_URL=YOUR_SUPABASE_URL
   VITE_SUPABASE_KEY=YOUR_SUPABASE_ANON_KEY
   ```
   *注意：绝对不要在里面写入带有管理员视角的 service_role 密钥。*
4. **启动本地服务器：**
   ```bash
   npm run dev
   ```
   然后去浏览器输入 `http://localhost:5173`。

## 🚀 GitHub Pages 部署说明

我们已经为你准备好了官方认证推荐的 Github Actions CI/CD 流 (`.github/workflows/deploy.yml`)。要将它部署到 GitHub Pages 请执行以下步骤：

### 第 1 步：上传到 GitHub
把整个项目推送到 GitHub 仓库即可。`vite.config.ts` 会自动识别：
- 普通项目页：构建为 `https://<USERNAME>.github.io/<REPO>/` 可用的路径。
- 用户/组织主页仓库：如果仓库名是 `<USERNAME>.github.io`，构建为根路径 `/`。

如果你想强制指定路径，也可以在 GitHub Actions 或本地构建时设置：
```bash
VITE_BASE_PATH=/your-custom-path/ npm run build
```

### 第 2 步：可选配置 GitHub Secrets
Supabase 只用于结果统计；不配置时页面仍可部署和使用。
1. 前往你的 GitHub 仓库主页，点击 **Settings** -> 左侧导航找到 **Secrets and variables** -> **Actions**。
2. 点击绿色的 **New repository secret** 按钮。
3. 如果需要统计结果，添加以下两个变量：
   - Name: `VITE_SUPABASE_URL`, Secret: 填入你的 Supabase Project URL
   - Name: `VITE_SUPABASE_KEY`, Secret: 填入你的 Supabase Publishable / Anon Key
   
   如果你手头是 Next.js 风格的变量名，也可以改用：
   - Name: `NEXT_PUBLIC_SUPABASE_URL`, Secret: 填入你的 Supabase Project URL
   - Name: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, Secret: 填入你的 Supabase Publishable / Anon Key

### 第 3 步：开启 GitHub Pages 权限
1. 前往 GitHub 仓库 **Settings** -> 左侧导航找到 **Pages**。
2. 在 **Build and deployment** 下的 **Source** 下拉菜单中，选择 **GitHub Actions**。

### 第 4 步：推送代码 
将代码 Commit 之后 Push 到 GitHub 的 `main` 分支：
```bash
git add .
git commit -m "Deploy static Y-MAP quiz"
git push origin main
```
推送后，在仓库顶部的 **Actions** 标签页中可以实时看到构建与发布过程，约五分钟后就会拿到 GitHub Pages 的在线 URL（`https://<USERNAME>.github.io/<REPO>/`）。

---
**常见问题排查：**
- 如果页面白屏：按 F12 看 Console 网络请求 404，这属于你在 `vite.config.ts` 中设置的 `base` 后缀不匹配引起的路径错误。
- 如果数据无法写入：页面本身仍会正常运行；请检查 GitHub Secrets 是否配置正确，以及 Supabase 表的 RLS 策略是否允许 Anon Key 插入 `quiz_results`。
