---
title: 使用 pkg-config
createTime: 2025/04/21 13:59:28
permalink: /gtest/lchd76el/
copyright:
  creation: translate
  source: https://google.github.io/googletest/pkgconfig.html
---

## CMake

在 CMake 中使用 `pkg-config` 的典型配置如下：

```cmake
find_package(PkgConfig)
pkg_search_module(GTEST REQUIRED gtest_main)

add_executable(testapp)
target_sources(testapp PRIVATE samples/sample3_unittest.cc)
target_link_libraries(testapp PRIVATE ${GTEST_LDFLAGS})
target_compile_options(testapp PRIVATE ${GTEST_CFLAGS})

enable_testing()
add_test(first_and_only_test testapp)
```

建议优先使用 `target_compile_options` 与 `_CFLAGS`，而非 `target_include_directories` 与 `INCLUDE_DIRS`，
因为前者不仅包含 `-I` 标志（GoogleTest 可能需要特定宏来告知内部头文件是否启用线程支持）。
此外，编译阶段可能仍需 `-pthread` 参数，若拆分 pkg-config 的 `Cflags` 变量可能导致该标志丢失。
同理，推荐使用 `_LDFLAGS` 而非更常见的 `_LIBRARIES`，以避免丢失 `-L` 标志和 `-pthread`。

GoogleTest 提供了 pkg-config 配置文件，可用于确定编译和链接 GoogleTest（及 GoogleMock）所需的所有标志参数。
pkg-config 采用标准化的纯文本格式，包含以下关键信息：

- 包含目录路径（`-I`）
- 必要的宏定义（`-D`）
- 其他必需标志（`-pthread`）
- 库文件路径（`-L`）
- 待链接库名称（`-l`）

当前主流构建系统均支持 pkg-config。

本文所有示例均假设你需要编译 `samples/sample3_unittest.cc` 示例文件。

## 故障排除：pkg-config 找不到 GoogleTest

执行上述 `CMakeLists.txt` 文件时可能会遇到以下错误：

```ansi
-- Checking for one of the modules 'gtest_main'
CMake Error at /usr/share/cmake/Modules/FindPkgConfig.cmake:640 (message):
  None of the required 'gtest_main' found
```

此错误常见于用户手动安装 GoogleTest 而非通过发行版包管理器安装的情况。
解决方法是配置 pkg-config 的 `.pc` 文件搜索路径。
假设 GoogleTest 安装于 `/usr/local`，则 `.pc` 文件可能位于 `/usr/local/lib64/pkgconfig`。
此时，应设置环境变量：

```bash
export PKG_CONFIG_PATH=/usr/local/lib64/pkgconfig
```

pkg-config 将自动搜索 `PKG_CONFIG_PATH` 路径来定位 `gtest_main.pc`。

## 交叉编译环境配置

pkg-config 同样支持交叉编译场景。
假定目标系统的最终安装前缀为 `/usr`，sysroot 路径为 `/home/MYUSER/sysroot`。
用户可按以下步骤配置安装 GoogleTest：

```bash
mkdir build && cmake -DCMAKE_INSTALL_PREFIX=/usr ..
```

使用 `DESTDIR` 参数将其安装到 sysroot：

```bash
make -j install DESTDIR=/home/MYUSER/sysroot
```

在继续操作前，强烈建议在交叉编译环境中定义以下两个 pkg-config 变量：

```bash
export PKG_CONFIG_ALLOW_SYSTEM_CFLAGS=yes
export PKG_CONFIG_ALLOW_SYSTEM_LIBS=yes
```

否则 pkg-config 将自动过滤针对标准前缀（如 `/usr`）的 `-I` 和 `-L` 标志
（阅读 <https://bugs.freedesktop.org/show_bug.cgi?id=28264#c3> 了解该过滤的作用）。

观察按上述操作生成的 pkg-config 文件示例：

```properties
libdir=/usr/lib64
includedir=/usr/include

Name: gtest
Description: GoogleTest (without main() function)
Version: 1.11.0
URL: https://github.com/google/googletest
Libs: -L${libdir} -lgtest -lpthread
Cflags: -I${includedir} -DGTEST_HAS_PTHREAD=1 -lpthread
```

这里 sysroot 路径未被包含在 `libdir` 和 `includedir` 中！
若使用 `PKG_CONFIG_LIBDIR=/home/MYUSER/sysroot/usr/lib64/pkgconfig` 执行 pkg-config，则：

```shell
$ pkg-config --cflags gtest
-DGTEST_HAS_PTHREAD=1 -lpthread -I/usr/include
$ pkg-config --libs gtest
-L/usr/lib64 -lgtest -lpthread
```

显然输出结果有误，其指向了 `CBUILD` 而非 `CHOST` 根路径。
为正确配置交叉编译，需告知 pkg-config 将实际 sysroot 路径注入至 `-I` 和 `-L` 参数：

```bash
export PKG_CONFIG_DIR=
export PKG_CONFIG_SYSROOT_DIR=/home/MYUSER/sysroot
export PKG_CONFIG_LIBDIR=${PKG_CONFIG_SYSROOT_DIR}/usr/lib64/pkgconfig
```

之后再执行 pkg-config 将获得正确结果：

```shell
$ pkg-config --cflags gtest
-DGTEST_HAS_PTHREAD=1 -lpthread -I/home/MYUSER/sysroot/usr/include
$ pkg-config --libs gtest
-L/home/MYUSER/sysroot/usr/lib64 -lgtest -lpthread
```

输出结果包含了正确的 sysroot 路径。
关于包含 `${CHOST}` 参数的完整配置指南，请参考 Diego Elio Pettenò 的权威教程：<https://autotools.io/pkgconfig/cross-compiling.html>。
