---
title: 使用 GPG/SSH 为你的提交签名
createTime: 2025/08/17 14:32:43
permalink: /article/g4xq10jf/
tags:
  - Git
  - GPG
  - SSH
---

之前在 Github 上为某个开源项目提交 PR 的时候，发现那个项目开启了签名验证，要求提交必须经过签名。
这是我第一次知道 Git 有签名功能，就去了解了一下它是什么，以及如何设置，于是写下了这篇文章。

<!-- more -->

## 什么是签名？

大家平时在 Github 上查看提交信息时，应该会注意到，在提交列表里有些提交上面会显示一个 `Verified` 状态。
这表示其经过签名且被 Github 验证通过。

![Github 签名](images/github-sign.avif)

签名是 Git 的一项安全机制，用于验证提交是由用户本人发起的。
用户可以在本地对 Commit 和标签进行签名，经过验证的签名便会在 Github 在被显示为 `Verified` 状态。

::: info 签名的必要性
由于 Git 允许用户任意设置提交者的身份，因此签名是 Git 提供的一项用于验证提交者身份的重要工具。
不过，诸如 Github、Gitlab 这些网站本身已经提供了一套足够安全的用户账号机制。
对于仅部署在这些网站上的项目来说，实际上也没有开启该机制的必要。

只是由于部分开源项目对签名有要求，因此平时提交时还是建议开启签名。
:::

## 生成签名

Git 为个人用户提供了 GPG 和 SSH 两种签名方式。

### GPG

在命令行键入下列命令即可创建 GPG 签名：

```bash
gpg --full-generate-key
```

之后按照提示，依次输入密钥类型、密钥大小、有效期、用户信息等信息。
注意这里的用户信息应该与你在 Git 中设置的信息一致。

最后再输入使用该密钥所需的安全密钥，在每次使用该密钥时 GPG 都会要求你键入该安全密钥。

密钥生成完后可以使用下面的命令来查看已经生成的密钥：

```bash
gpg --list-secret-keys --keyid-format=long
```

生成的密钥类似下面这样：

```ansi
pub   ed25519/EFBD20CF51E1A4A0 2025-08-17 [SC]
      C53C71B1F960AFD0DD770485EFBD90CF51E1A4A0
uid                      User <email@example.com>
sub   cv25519/1F3FD0F56C3D54B3 2025-08-17 [E]
```

这里 `EFBD20CF51E1A4A0` 是该密钥的 ID。输入下列命令，替换相应的密钥 ID，以获取完整的 GPG 密钥：

```bash
gpg --armor --export EFBD20CF51E1A4A0
```

之后打开 [Github](https://github.com/settings/keys)，将生成的 GPG 密钥上传到你的账户，这样 Github 才会信任这个签名。

### SSH

SSH 签名的生成较为简单，替换下面的邮箱为你实际使用的邮箱即可：

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

如果你已经使用 SSH 生成过签名，这里 SSH 会提示你键入新的文件来保存签名，请记住这个文件的位置。

之后同样需要将签名上传到 [Github](https://github.com/settings/keys) 上，
注意 SSH 密钥那一栏要选择 `Signing Key` 而不是 `Authentication Key`。

> [!note]
> 你也可以复用已经生成的 `Authentication Key`，但是需要将该密钥重复上传一次，设置为 `Signing Key`。

## 设置 Git 使用签名

::: tabs

@tab GPG

使用 `gpg --list-secret-keys --keyid-format=long` 命令以获取 GPG 签名的公钥和私钥 ID。
我们签名使用的 `EFBD20CF51E1A4A0` 是公钥 ID，而这里要使用私钥 ID：

```bash
git config --global user.signingkey 1F3FD0F56C3D54B3
```

如果你之前有配置过 GPG 签名，并使用了不同的签名格式，需要取消相应的配置：

```bash
git config --global --unset gpg.format
```

@tab SSH

首先我们需要告知 Git 你使用的是 SSH 密钥而非 GPG 密钥：

```bash
git config --global gpg.format ssh
```

然后在 Git 中设置你的 SSH 签名密钥，这里要输入你签名生成的密钥的公钥路径（一般位于 `~/.ssh` 下方）：

```bash
git config --global user.signingkey /PATH/TO/.SSH/KEY.PUB
```

:::

## 在提交时使用签名

在提交时，使用 `-S` 标志对该提交进行签名：

```bash
git commit -S -m "COMMIT_MESSAGE"
```

如果是标签，则使用 `-s` 标志：

```bash
git tag -s MYTAG
```

如果设置成功，你便可以在 Github 上看到对应的 `Verified` 标志。

### 自动签名

如果你觉得手动签名比较麻烦，且容易遗忘，可以通过下面的配置让 Git 在提交和创建标签时自动帮你签名：

```bash
git config --global commit.gpgsign true
git config --global tag.gpgSign true
```

### 为已提交的 commit 签名

有时你的 commit 已经提交，而你需要为这些提交签名。

首先找到你需要签名的最早的 commit，选择该 commit，启动交互式变基：

```bash
git rebase -i <commit-hash>
```

之后给该 commit 及其后面的所有 commit 签名：

```bash
git commit --amend -S
```

> [!warning]
> 使用这种方法相当于创建了新的提交，如果要上传到 Git 仓库需要加上 `--force` 标志。
> 如果实在没有必要，不建议使用这种方法。

## GPG 和 SSH 密钥如何选择？

GPG 提供了更多高级的安全功能，例如密钥本身会携带用户信息、支持设置有效期等，而 SSH 则相对简单。
但两者的安全性更多取决于你使用的加密算法与密钥长度，并无优劣之分。

此外，GPG 密钥每次使用都需要用户键入相应的安全密钥，较为繁琐。
尽管有专门的工具可以帮你跳过这一过程，但配置起来也比较麻烦，不如 SSH 密钥简单。

如果你只是需要简单的签名功能以满足某些仓库的需求，配置较为简单的 SSH 密钥就已经够用了。

## 参考文献

- [About commit signature verification | GitHub Docs](https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification)
