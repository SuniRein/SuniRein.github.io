---
title: 快速开始：CMake
createTime: 2025/03/04 11:27:36
permalink: /gtest/quickstart-cmake/
copyright:
  creation: translate
  source: https://google.github.io/googletest/quickstart-cmake.html
---

本教程旨在帮助你使用 CMake 快速上手 GoogleTest。
如果你是第一次使用 GoogleTest 或需要复习，我们推荐你从本教程开始。
如果你的项目使用 Bazel，请参阅[快速开始：Bazel](quickstart-bazel.md)。

## 先决条件

要完成本教程，你需要：

- 一个兼容的操作系统（例如 Linux、macOS、Windows）。
- 一个兼容的 C++ 编译器，至少支持 C++14。
- [CMake](https://cmake.org/) 和一个兼容的构建工具来构建项目。

  兼容的构建工具包括 [Make](https://www.gnu.org/software/make/)、[Ninja](https://ninja-build.org/) 等
  ——更多信息请参阅 [CMake 生成器](https://cmake.org/cmake/help/latest/manual/cmake-generators.7.html)。

有关与 GoogleTest 兼容的平台的更多信息，请参阅[支持的平台](platforms.md)。

如果你尚未安装 CMake，请参阅 [CMake 安装指南](https://cmake.org/install)。

::: note
本教程中的终端命令均采用 Unix shell 格式。
:::

## 设置项目

CMake 使用名为 `CMakeLists.txt` 的文件来配置项目的构建。
你将使用此文件来设置项目并声明对 GoogleTest 的依赖。

首先，为你的项目创建一个目录：

```bash
mkdir my_project && cd my_project
```

接下来，创建 `CMakeLists.txt` 文件并声明对 GoogleTest 的依赖。
在 CMake 生态中有许多表达依赖的方式，本指南将使用 [CMake 的 `FetchContent` 模块](https://cmake.org/cmake/help/latest/module/FetchContent.html)。
为此，在你的项目目录中创建一个名为 `CMakeLists.txt` 的文件，内容如下：

```cmake title="CMakeLists.txt"
cmake_minimum_required(VERSION 3.14)
project(my_project)

# GoogleTest 要求至少 C++14
set(CMAKE_CXX_STANDARD 14)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include(FetchContent)
FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/archive/03597a01ee50ed33e9dfd640b249b4be3799d395.zip
)
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE) # 针对 Windows：防止覆盖父项目的编译器/链接器设置
FetchContent_MakeAvailable(googletest)
```

上述配置声明了对 GoogleTest 的依赖，该依赖将从 GitHub 上下载。
`03597a01ee50ed33e9dfd640b249b4be3799d395` 是我们要使用的 GoogleTest 版本的 Git 提交哈希。
我们建议经常性更新该哈希值以指向最新版本。

有关如何创建 `CMakeLists.txt` 文件的更多信息，请参阅 [CMake 教程](https://cmake.org/cmake/help/latest/guide/tutorial/index.html)。

## 创建并运行测试

声明了对 GoogleTest 的依赖后，你现在可以在项目中使用 GoogleTest。

作为一个示例，在你的 `my_workspace` 目录中创建一个名为 `hello_test.cc` 的文件，内容如下：

```cpp title="hello_test.cc"
#include <gtest/gtest.h>

// 演示一些基本的断言。
TEST(HelloTest, BasicAssertions) {
    // 期望两个字符串不相等。
    EXPECT_STRNE("hello", "world");

    // 期望相等。
    EXPECT_EQ(7 * 6, 42);
}
```

GoogleTest 为你提供了[断言（_assertion_）](primer.md#assertions)来测试代码的行为。
上面的示例中包含了 GoogleTest 的主头文件，并演示了一些基本的断言。

要构建代码，请在你的 `CMakeLists.txt` 文件末尾添加以下内容：

```cmake title="CMakeLists.txt"
...

enable_testing()

add_executable(
  hello_test
  hello_test.cc
)
target_link_libraries(
  hello_test
  GTest::gtest_main
)

include(GoogleTest)
gtest_discover_tests(hello_test)
```

:::

上述配置在 CMake 中启用了测试，声明了你要构建的 C++ 测试（`hello_test`），并将其链接到 GoogleTest（`gtest_main`）。
最后两行启用了 CMake 的测试运行器，
使用 [CMake 的 `GoogleTest` 模块](https://cmake.org/cmake/help/git-stage/module/GoogleTest.html)来发现项目中包含的测试。

现在你可以构建并运行你的测试：

```ansi{1,7,12}
$ cmake -S . -B build
-- The C compiler identification is GNU 10.2.1
-- The CXX compiler identification is GNU 10.2.1
...
-- Build files have been written to: .../my_project/build

$ cmake --build build
Scanning dependencies of target gtest
...
[100%] Built target gmock_main

$ cd build && ctest
Test project .../my_project/build
Start 1: HelloTest.BasicAssertions
1/1 Test #1: HelloTest.BasicAssertions ........ Passed 0.00 sec

100% tests passed, 0 tests failed out of 1

Total Test time (real) = 0.01 sec
```

恭喜！你成功使用 GoogleTest 构建并运行了一个测试。

## 下一步

- [初学者指南](primer.md)：开始学习如何编写简单的测试。

- [代码示例](samples.md)：获取更多使用各种 GoogleTest 功能的示例。
