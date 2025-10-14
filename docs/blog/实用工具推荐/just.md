---
title: Just —— 类似 Make 的任务运行器
createTime: 2025/07/09 12:03:03
permalink: /blog/46i566mf/
tags:
  - 实用工具
  - 终端
  - Rust
---

## 背景

在终端日常操作中，我们经常需要使用一些**重复**的特定操作，而且这些操作**与项目绑定**，不方便放在全局环境中。
例如，我在编辑博客时，就经常需要运行 `vuepress dev docs` 来实时预览，使用 `vuepress build docs` 来构建。

总是键入这些命令不仅繁琐，而且一些平时使用频率相对较少的命令也容易遗忘，`just` 就是这样一个简化在命令行中重复操作的工具。

## 介绍

`just` 是一个使用 `rust` 编写的，语法类似 `make` 的任务运行器。

很多人应该都用 `make` 来运行一些简单任务，但是 `make` 毕竟是一个构造系统，本身也具有一定的复杂性，例如需要指定 `.PHONY`。
`just` 避免了很多 `make` 的复杂性，更专注于任务管理。

与 `make` 类似，`just` 使用 `justfile` 来定义任务：

```just title="justfile"
dev:
    pnpm run dev --open

deploy:
    @echo "Deploying to aliyun..."
    pnpm run build
    rsync -avz --delete -e ssh ./docs/.vuepress/dist aliyun:Page

    @echo "Deploying to github..."
    git push

lint:
    pnpm run lint
```

运行 `just install` 时，`just` 会在当前目录和父目录寻找文件寻找 `justfile` 并运行它。

此外，`just` 还具有以下 `make` 不具备的特性：

- 指定运行命令的 shell，甚至可以使用 `python` 解释器等
- 更友好的语法
- 每个配方使用独立的环境，互不干扰
- 接受命令行参数
- 用户友好的错误报告
- 加载 `.env` 环境变量文件

## 与 `npm` 脚本的比较

并非每个项目都具有 `package.json`，而且 `npm` 脚本的功能有限，只能运行一些简单的命令。

## 相关链接

- [官网](https://just.systems/)
- [Github 仓库](https://github.com/casey/just)

建议阅读 [Just 用户指南](https://just.systems/man/zh/)了解更多细节。
