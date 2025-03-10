---
title: 快速开始：Bazel
createTime: 2025/03/04 11:27:25
permalink: /gtest/1grebcis/
copyright:
  creation: translate
  source: https://google.github.io/googletest/quickstart-bazel.html
---

本教程旨在帮助你使用 Bazel 构建系统快速上手 GoogleTest。
如果你是第一次使用 GoogleTest 或是需要复习，我们推荐你从本教程开始。

## 先决条件

要完成本教程，你需要：

- 一个兼容的操作系统（例如 Linux、macOS、Windows）。
- 一个兼容的 C++ 编译器，至少支持 C++14。
- [Bazel](https://bazel.build/) 7.0 或更高版本，这是 GoogleTest 团队首选的构建系统。

有关与 GoogleTest 兼容的平台的更多信息，请参阅[支持的平台](platforms.md)。

如果你尚未安装 Bazel，请参阅 [Bazel 安装指南](https://bazel.build/install)。

::: note
本教程中的终端命令均采用 Unix shell 格式。
:::

## 设置 Bazel 工作区

[Bazel 工作区（Bazel workspace）](https://docs.bazel.build/versions/main/build-ref.html#workspace)
是你文件系统上的一个目录，用于管理你要构建的项目的源文件。
每个工作区目录都有一个名为 `MODULE.bazel` 的文本文件，该文件包含构建程序所需的外部依赖项的描述。

首先，为创建一个目录作为你的工作区：

```bash
mkdir my_workspace && cd my_workspace
```

接下来，创建 `MODULE.bazel` 文件以指定依赖项。
从 Bazel 7.0 开始，推荐通过 [Bazel 中央注册表（Bazel Central Registry）](https://registry.bazel.build/modules/googletest) 使用 GoogleTest。
为此，请在你的 Bazel 工作区的根目录下创建 `MODULE.bazel` 文件，内容如下：

::: code-tabs
@tab MODULE.bazel

```txt
# 这里的 version 请填入 https://registry.bazel.build/modules/googletest 上可用的最新版本
// [!code word:1.16.0]
bazel_dep(name = "googletest", version = "1.16.0")
```

:::

现在你已经做好了构建使用 GoogleTest 的 C++ 项目的准备。

## 创建并运行测试

设置好 Bazel 工作区后，你现在可以在自己的项目中使用 GoogleTest。

作为一个示例，在你的 `my_workspace` 目录中创建一个名为 `hello_test.cc` 的文件，内容如下：

::: code-tabs
@tab hello_test.cc

```cpp
#include <gtest/gtest.h>

// 演示一些基本的断言。
TEST(HelloTest, BasicAssertions) {
    // 期望两个字符串不相等。
    EXPECT_STRNE("hello", "world");

    // 期望相等。
    EXPECT_EQ(7 * 6, 42);
}
```

:::

GoogleTest 为你提供了[断言（_assertions_）](primer.md#assertions)来测试代码的行为。
上面的示例中包含了 GoogleTest 的主要头文件，并演示了一些基本的断言。

要构建该测试，请在同一目录中创建一个名为 `BUILD` 的文件，内容如下：

::: code-tabs
@tab BUILD

```txt
cc_test(
    name = "hello_test",
    size = "small",
    srcs = ["hello_test.cc"],
    deps = [
        "@googletest//:gtest",
        "@googletest//:gtest_main",
    ],
)
```

:::

此 `cc_test` 规则声明了你要构建的 C++ 测试文件，
并链接 GoogleTest 库（`@googletest//:gtest`）和 `main()` 函数（`@googletest//:gtest_main`）。
有关 Bazel `BUILD` 文件的更多信息，请参阅 [Bazel C++ 教程](https://docs.bazel.build/versions/main/tutorial/cpp.html)。

::: note
在下面的示例中，我们假定使用 Clang 或 GCC，并设置 `--cxxopt=-std=c++14` 以确保 GoogleTest 以 C++14 而不是编译器的默认设置（可能是 C++11）进行编译。
对于 MSVC，等效的设置是 `--cxxopt=/std:c++14`。
有关支持的语言版本的更多详细信息，请参阅[支持的平台](platforms.md)。
:::

现在你可以构建并运行你的测试：

```ansi{1}
$ bazel test --cxxopt=-std=c++14 --test_output=all //:hello_test
INFO: Analyzed target //:hello_test (26 packages loaded, 362 targets configured).
INFO: Found 1 test target...
INFO: From Testing //:hello_test:
==================== Test output for //:hello_test:
Running main() from gmock_main.cc
[==========] Running 1 test from 1 test suite.
[----------] Global test environment set-up.
[----------] 1 test from HelloTest
[ RUN ] HelloTest.BasicAssertions
[ OK ] HelloTest.BasicAssertions (0 ms)
[----------] 1 test from HelloTest (0 ms total)

[----------] Global test environment tear-down
[==========] 1 test from 1 test suite ran. (0 ms total)
[ PASSED ] 1 test.
================================================================================
Target //:hello_test up-to-date:
bazel-bin/hello_test
INFO: Elapsed time: 4.190s, Critical Path: 3.05s
INFO: 27 processes: 8 internal, 19 linux-sandbox.
INFO: Build completed successfully, 27 total actions
//:hello_test PASSED in 0.1s

INFO: Build completed successfully, 27 total actions
```

恭喜！你成功使用 GoogleTest 构建并运行了一个测试。

## 下一步

- [初学者指南](primer.md)：开始学习如何编写简单的测试。

- [代码示例](<!-- TODO:samples.md -->)：获取更多使用各种 GoogleTest 功能的示例。
