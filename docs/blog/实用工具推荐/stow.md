---
title: GNU/Stow —— 管理编译安装程序与用户配置文件
createTime: 2025/07/17 22:28:56
permalink: /blog/2xg2t5km/
tags:
  - 实用工具
  - 终端
  - GNU
---

## 什么是 GNU/Stow？

> GNU Stow 是一个符号链接农场管理器，它可以将位于文件系统不同目录中的不同软件包和数据，伪装成安装在同一个位置。

使用 GNU/Stow 这一简单的工具，可以帮我们实现 Linux 上的两大难题：

- 管理手动编译安装的程序
- 管理复杂的用户配置文件

## 安装

各大发行版的包管理器都有 GNU/Stow，不过我更推荐直接从[官网](https://www.gnu.org/software/stow/)下载源代码，
手动编译安装，以获取最新版本。

## 使用

GNU/Stow 会自动在当前目录的上一级目录创建软链接。
例如，如果当前目录是 `~/dotfiles`，当我们运行 `stow bash` 时，GNU/Stow 会在上一级目录，即 `~` 中，
为 `~/dotfiles/bash` 中的所有文件创建软链接。
如果目标是文件夹，当对应文件夹存在时，GNU/Stow 会为文件夹下的所有文件创建软链接，否则直接创建该文件夹的软链接。

在执行具体命令前，可以使用 `-nv` 来检查将要执行的操作，而不执行这些操作。

使用 `--delete` 参数可以删除对应包的软链接。

更多的参数和用法详见[官方文档](https://www.gnu.org/software/stow/manual/html_node/Invoking-Stow.html)。

## 管理编译安装程序

在 Linux 中，如果我们要手动安装一个程序，通常有两种做法：

- 将其安装到 `/opt/xxx/` 中，并手动添加到环境目录。这可以是全局环境相对整洁，但需要手动设置大量的相关配置。
- 直接将其安装到 `/usr/local/` 中。这种方法最直接，不需要进行任何额外配置，但在卸载程序时较为麻烦。

GNU/Stow 为我们提供了第三个选择。

这里以安装 **hello** 程序为例：

::: steps

1. 首先创建 `stow` 文件夹：

   ```bash
   sudo mkdir -p /usr/local/hello
   ```

1. 将程序安装到该文件夹下的对应子目录中：

   ```bash
   wget https://ftp.gnu.org/gnu/hello/hello-2.12.tar.gz
   tar -zxvf hello-2.12.tar.gz
   cd hello-2.12
   ./configure --prefix=/usr/local/hello # 这里设置安装目录 [!code highlight]
   make
   sudo make install
   ```

1. 然后转到 `stow` 文件夹下，运行下列命令来生成相应的软链接：

   ```bash
   cd /usr/local/stow
   sudo stow -v hello
   ```

1. 如果后续需要删除该程序，只需要删除对应的软链接：

   ```bash
   cd /usr/local/stow
   sudo stow --delete hello
   ```

:::

::: tip 使用技巧
1. 在运行相应命令前，请先使用 `-nv` 参数来查看对应的行为，避免意外情况。
1. 由于 GNU/Stow 在遇到不存在的文件夹时会直接创建该文件夹的软链接，
   推荐先在 `/usr/local/` 下创建好 `bin`、`lib`、`include`、`share`、`man` 等常见文件夹。
:::

## 管理用户配置文件

Linux 下用户配置文件通常以 `dotfiles` 的形式来管理。
但不同软件的配置位置通常不太一样，难以统一地管理，这时就可以借助 GNU/Stow。

例如，下面是一个配置文件的示例：

::: file-tree title="~/dotfiles"
- zsh
  - .zshrc
  - .zshenv
  - .config
    - zsh
      - ...
- git
  - .gitconfig
- nvim
  - .config
    - nvim
      - ...
:::

这样就将配置文件全部集中到一个文件夹中，方便管理，之后可以使用 `stow package` 来加载对应的配置文件。

::: warning
由于不同软件的配置文件之间可以存在一定的依赖关系，使用这种方法管理的不同配置文件之间难以保证完全地独立性，
因此是否要使用 GNU/Stow 来管理用户配置文件，还是取决于个人的使用习惯和需求。

此外，一些软件的配置文件相对比较复杂，例如 `neovim`，更推荐用一个专门的仓库来管理它。
:::

## 相关链接

- [GNU/Stow 官网](https://www.gnu.org/software/stow/)
- [GNU/Stow 用户手册](https://www.gnu.org/software/stow/manual/stow.html)
