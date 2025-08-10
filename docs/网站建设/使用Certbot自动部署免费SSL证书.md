---
title: 使用 Certbot 自动部署免费 SSL 证书
createTime: 2025/03/03 13:50:11
permalink: /article/6tznb746/
tags:
  - 建站
  - SSL
  - Certbot
---

前几天个人网站的 SSL 证书过期了，导致很多部署在上面的服务突然就用不了了。
免费证书 90 天的有效期还是太短了，要是每年都要这样折腾几次就太麻烦了。
于是我最后花了点时间用 Certbot 来自动部署证书，从此一劳永逸地解决了这个问题。

在部署证书的过程中我也踩了一些坑，这里把我的经验分享出来，希望能帮到需要的人。

<!-- more -->

## 环境需求

本文假定你拥有以下条件：

- 一台可以访问互联网的 Linux 服务器

- 服务器的 `root` 权限

- 使用 Nginx 作为 Web 服务器

## 什么是 Let's Encrypt？

[Let's Encrypt](https://letsencrypt.org/zh-cn/)
是一个免费的、自动化的、开放的 证书颁发机构（CA，Certificate Authority），由 Internet Security Research Group（ISRG）运营。
它为网站提供 TLS/SSL 证书，使网站能够启用 HTTPS 加密，提高安全性和隐私保护。

Let's Encrypt 证书的有效期较短，仅有 90 天，但可以通过自动化的方式来更新证书。
这也是官方推荐的方式，因为这样可以保证证书的及时更新，提高网站的安全性。[+证书有效期]

[+证书有效期]: 详见 <https://letsencrypt.org/2015/11/09/why-90-days/>

## 什么是 Certbot？

[Certbot](https://certbot.eff.org) 是一个用于自动化管理 Let's Encrypt SSL/TLS 证书 的开源工具。

Certbot 可以做到以下几件事：

- 申请证书：通过 ACME 协议与 Let's Encrypt 服务器通信，申请证书。
- 验证域名：通过 HTTP 或 DNS 验证域名的所有权。
- 安装证书：将证书安装到 Web 服务器中。
- 自动续期：定期检查证书的有效期，自动续期。

Certbot 也是 Let's Encrypt 官方推荐的工具，使用起来非常方便。

## 安装 Certbot

Certbot 提供了 `pip` 和 `snap` 两种安装方式。
这里我选择使用 `pip`。

:::: steps

1. 安装系统依赖。

   Certbot 需要 Python 3.6 或更高版本。
   如果你使用 Apache，还需要安装相应的插件。

   ::: code-tabs#package

   @tab Ubuntu/Debian

   ```bash
   sudo apt update
   sudo apt install python3 python3-venv libaugeas0

   ```

   @tab CentOS/RHEL

   ```bash
   sudo dnf install python3 augeas-libs
   ```

   @tab CentOS 7

   ```bash
   sudo yum install python3 augeas-libs
   ```

   :::

2. 移除旧版本的 Certbot（如果有的话）。

   ::: code-tabs#package

   @tab Ubuntu/Debian

   ```bash
   sudo apt remove certbot

   ```

   @tab CentOS/RHEL

   ```bash
   sudo dnf remove certbot
   ```

   @tab CentOS 7

   ```bash
   sudo yum remove certbot
   ```

   :::

3. 设置虚拟环境。

   ```bash
   sudo python3 -m venv /opt/certbot/
   sudo /opt/certbot/bin/pip install --upgrade pip
   ```

4. 安装 Certbot。

   ```bash
   sudo /opt/certbot/bin/pip install certbot certbot-nginx
   ```

5. 创建软链接。

   ```bash
   sudo ln -s /opt/certbot/bin/certbot /usr/bin/certbot
   ```

::::

## 申请证书

要申请泛域名证书，我们需要使用 DNS 验证方式。
这里我以阿里云为例，介绍如何配置 DNS 验证并申请证书。

:::: steps

1. 安装对应 DNS 厂商的 Certbot 插件。

   ```bash
   # 这里 <provider> 替换为你的 DNS 厂商，如 aliyun、cloudflare 等
   sudo /opt/certbot/bin/pip install certbot-dns-<provider>
   ```

2. 申请阿里云 DNS 访问密钥。

   进入 [阿里云访问控制台](https://ram.console.aliyun.com/users)，并创建一个子用户，授予 `AliyunDNSFullAccess` 权限。

   点击你新创建的子用户，进入用户详情页，为该用户创建一个 `AccessKey`，并保存好 `AccessKey ID` 和 `AccessKey Secret`。

3. 本地保存访问密钥。

   ```bash
   # 这里将 AccessKey ID 和 AccessKey Secret 替换为你创建的 API 密钥
   sudo cat > /opt/certbot/credentials.ini <<EOF
   certbot_dns_aliyun:dns_aliyun_access_key = <AccessKey ID>
   certbot_dns_aliyun:dns_aliyun_access_key_secret = <AccessKey Secret>
   EOF

   ```

   保存完密钥后，记得修改文件权限，防止泄露。

   ```bash
   sudo chmod 600 /opt/certbot/credentials.ini
   ```

4. 申请证书。

   ```bash
   # 这里将 <yourdomain.com> 替换为你的域名
   certbot certonly \
     -a certbot-dns-aliyun:dns-aliyun \
     --certbot-dns-aliyun:dns-aliyun-credentials /opt/certbot/credentials.ini \
     -d "*.<yourdomain.com>,<yourdomain.com>"
   ```

   我们申请的证书同时包含了主域名和泛域名，这样就可以使用同一个证书来保护所有子域名。
   申请成功后，证书会保存在 `/etc/letsencrypt/live/<yourdomain.com>/` 目录下。

   你可以通过以下命令查看证书的详细信息：

   ```bash
   sudo certbot certificates
   ```

   ::: note 可能遇到的问题

   如果运行上述的命令后出现报错 `Invalid version. The only valid version for X509Req is 0`，可以运行以下命令修复：

   ```bash
   sudo /opt/certbot/bin/pip3 install pyOpenSSL==23.1.1
   ```

   :::

5. 配置自动续订。

   ```bash
   echo "0 0,12 * * * root python -c 'import random; import time; time.sleep(random.random() * 3600)' && certbot renew -q" | sudo tee -a /etc/crontab > /dev/null
   ```

   这里我们使用 `crontab` 配置了在每天的 0 点和 12 点自动续订证书。
   在运行前，我们先随机等待 0 到 1 小时，以避免所有服务器在同一时间请求 Let's Encrypt 服务器。

   Certbot 会在证书过期前 30 天自动续订证书。

   ::: warning
   证书续订后还需要重新加载 nginx 才会生效，可以手动运行：

   ```bash
   sudo systemctl reload nginx.service
   ```

   或者将上述语句加到 `crontab` 中，即

   ```bash
   echo "0 0,12 * * * root python -c 'import random; import time; time.sleep(random.random() * 3600)' && certbot renew -q && systemctl reload nginx.service" | sudo tee -a /etc/crontab > /dev/null
   ```

   :::

::::

## 配置 Nginx

将 SSL 相关配置写入 Nginx 配置文件，并在 Nginx 配置中启用 HTTPS。
完成后记得重启 Nginx 服务。

```bash
# 这里将 <yourdomain.com> 替换为你的域名
sudo cat > /etc/nginx/conf.d/ssl.conf <<EOF
ssl_certificate /etc/letsencrypt/live/<yourdomain.com>/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/<yourdomain.com>/privkey.pem;
include /etc/letsencrypt/options-ssl-nginx.conf;
ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
EOF
```

::: note

如果你的 Nginx 默认不读取 `/etc/nginx/conf.d/` 目录下的配置文件，可以在 `nginx.conf` 文件中添加如下配置：

```nginx
include /etc/nginx/conf.d/*.conf;
```

如果你不想全局启用该 SSL 配置，也可以仅在对应的 `server` 块中添加。

:::

如果一切顺利，现在你就可以通过 HTTPS 访问你的网站了。

## 参考资料

- [Certbot 官方文档](https://certbot.eff.org/instructions)

- [使用 Certbot 自动申请并续订阿里云 DNS 免费泛域名证书 | 博客园 tabsp](https://www.cnblogs.com/bbling/p/12807642.html)

- [使用 Let’s Encrypt 免费申请泛域名 SSL 证书，并实现自动续期 | 博客园 平元兄](https://www.cnblogs.com/michaelshen/p/18538178)
