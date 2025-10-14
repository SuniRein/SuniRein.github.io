---
title: 从 Nginx 到 Caddy：配置简化与自动 HTTPS 的魅力
createTime: 2025/10/13 17:20:38
permalink: /blog/4iizatfo/
tags:
  - 建站
  - Caddy
  - Nginx
---

前不久我的云服务器快到期了，重新买了台新的服务器，但是原来的 Nginx 配置文件比较复杂，迁移起来麻烦，而且证书自动续期也得重新配置。

在查阅资料时，我发现了 Caddy 这个轻量级的 Web 服务器，配置文件简洁明了，内置自动 HTTPS 功能，非常适合个人和小型项目使用。

<!-- more -->

## 为什么选择 Caddy？

[Caddy](https://caddyserver.com/) 是一款基于 Go 语言编写的强大且可扩展的平台，提供“开箱即用”的使用体验，相比 Ngnix 有以下优势：

- **配置文件简洁**：Caddy 的配置文件非常直观，提供了合理的默认值，减少了配置的复杂度。
- **自动 HTTPS**：Caddy 内置了 Let's Encrypt 支持，能够自动获取和续期 SSL 证书，无需额外配置。
- **文档易读**：Caddy 官方文档清晰易懂，不像 Nginx 那样零散臃肿。

尽管 Caddy 可能在性能上不如 Nginx，特别是在高并发场景下，但对于个人网站和小型项目来说，Caddy 已经足够强大。

## 使用 Caddy

首先，按照[官方文档](https://caddyserver.com/docs/install)的指引，安装好 Caddy 并启用。

在当前目录下，创建名为 `Caddyfile` 的配置文件，编辑该文件：

```caddy
www.sunirein.tech {
  redir https://sunirein.tech{uri}
}

sunirein.tech {
  root * /var/www
  file_server
  encode gzip zstd
}

ttrss.sunirein.tech {
  reverse_proxy localhost:1081
  encode gzip zstd
}
```

上面这份配置文件实现了以下功能：

1. 将 `www.sunirein.tech` 重定向到 `sunirein.tech`。
2. 为 `sunirein.tech` 提供静态文件服务，文件根目录为 `/var/www`，并启用 gzip 和 zstd 压缩。
3. 将 `ttrss.sunirein.tech` 的请求反向代理到本地的 1081 端口，并启用 gzip 和 zstd 压缩。

此外，Caddy 会自动为这些域名获取和续期 SSL 证书，自动处理 HTTPS 重定向等问题，无需额外配置，非常省心。

如果需要为其他域名添加服务，只需在 `Caddyfile` 中添加相应的块即可。

之后，使用以下命令加载 Caddy 配置，使其生效：

```bash
caddy reload
```

## 可选：配置阿里云 DNS

Caddy 默认通过 **HTTP 质询**或 **TLS-ALPN 质询**来验证域名所有权，从而自动获取证书。

但是，由于我配置了 DNS 分流，国外的访问流量会被解析到 Github Page，因此 Let's Encrypt 无法验证域名所有权。

这时，可以通过配置 **DNS 质询**来解决这个问题。这里我以阿里云 DNS 为例，其他 DNS 服务商的配置方法类似。

> [!warning]
> 除了上述情况外，如果你需要申请通配符证书（如 `*.example.com`），也必须使用 DNS 质询。

::: steps

1. 首先，需要下载对应的 DNS 模块：

   ```bash
   caddy add-package github.com/caddy-dns/alidns
   ```

1. 申请阿里云 DNS 访问密钥。

   进入 [阿里云访问控制台](https://ram.console.aliyun.com/users)，并创建一个子用户，授予 `AliyunDNSFullAccess` 权限。

   点击你新创建的子用户，进入用户详情页，为该用户创建一个 `AccessKey`，并保存好 `AccessKey ID` 和 `AccessKey Secret`。

1. 在 `Caddyfile` 中配置 DNS 质询。

   可以在顶部添加全局配置：

   ```caddy
   {
     acme_dns alidns {
       access_key_id YOUR_ACCESS_KEY_ID
       access_key_secret YOUR_ACCESS_KEY_SECRET
     }
   }
   ```

    或者在域名块中单独配置：

    ```caddy
    your.domain {
      tls {
        dns alidns {
          access_key_id YOUR_ACCESS_KEY_ID
          access_key_secret YOUR_ACCESS_KEY_SECRET
        }
      }
    }
    ```

1. 最后，重新加载 Caddy 配置：

   ```bash
   caddy reload
   ```

   这样，Caddy 就会使用阿里云 DNS 来验证域名所有权，从而成功获取 SSL 证书。

:::

## 参考资料

- [Caddy 官方文档](https://caddyserver.com/docs/)
- [Caddy v2 中文文档](https://caddy2.dengxiaolong.com/docs/)
- [caddy 配置反向代理和 ssl 证书申请 | 博客园 turingguo](https://www.cnblogs.com/turingguo/p/caddy.html)
