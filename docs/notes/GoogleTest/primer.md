---
title: 初学者指南
createTime: 2025/03/05 10:53:30
permalink: /gtest/27ppojrh/
copyright:
  creation: translate
  source: https://google.github.io/googletest/primer.html
---

## 引言：为什么选择 GoogleTest？

==GoogleTest== 可以帮助你编写更好的 C++ 测试。

GoogleTest 是由 Google 的测试技术团队在考虑了 Google 的特定需求和约束后开发的测试框架。
无论你是在 Linux、Windows 还是 Mac 上工作，只要你在编写 C++ 代码，GoogleTest 都能帮助你。
它支持**任何**类型的测试，而不仅仅是单元测试。

那么，什么是一个好的测试，GoogleTest 又如何与之契合呢？我们相信：

1. 测试应该是**独立的**和**可重复的**。
   调试一个会因其他测试而成功或失败的测试是很痛苦的。
   GoogleTest 通过在不同的对象上运行测试来隔离不同的测试单元。
   当一个测试单元失败时，GoogleTest 允许你单独运行它以便快速调试。

2. 测试应该**组织良好**，并反映被测试代码的结构。
   GoogleTest 将相关测试单元分组到测试套件（_test suite_）中，这些套件可以共享数据和子程序。
   这种常见的模式易于识别，并使测试易于维护。
   这样的一致性在人们切换项目并开始处理新代码库时尤其有帮助。

3. 测试应该是**可移植的**和**可复用的**。
   Google 有许多平台无关（platform-neutral）的代码，因此测试也应该是平台无关的。
   GoogleTest 可以在不同的操作系统、不同的编译器、启用或不启用异常的情况下运行，因此可以与多种配置一起工作。

4. 当测试失败时，它应该尽可能多地提供有关问题的**信息**。
   GoogleTest 不会在第一次测试失败后停止，它只会停止当前测试单元并继续运行下一个测试单元。
   你还可以测试一些非致命问题，即使这些测试未通过，当前测试单元依旧能继续运行。
   因此，你可以在一个运行-编辑-编译周期中检测并修复多个错误。

5. 测试框架应该将测试编写者从琐事中解放出来，让他们专注于**测试内容**本身。
   GoogleTest 自动跟踪用户定义的测试单元，不需要用户手动枚举以运行它们。

6. 测试应该是**快速的**。
   使用 GoogleTest，你可以在测试单元之间复用共享资源，并且只需支付一次设置（_set-up_）/拆卸（_tear-down_）的成本，而不会使测试单元相互依赖。

由于 GoogleTest 基于流行的 xUnit 架构，如果你以前使用过 JUnit 或 PyUnit，你会感到非常熟悉。
如果没有，你只需花大约 10 分钟来学习基础知识就可以开始使用。
那么，让我们开始吧！

## 注意术语

::: warning
由于术语 _Test_、_Test Case_ 和 _Test Suite_ 的不同定义可能会引起一些混淆，因此请注意不要误解这些术语。
:::

历史上，GoogleTest 开始使用术语 _Test Case_ 来分组相关测试，
而当前的出版物，包括国际软件测试资格委员会（[ISTQB](https://www.istqb.org/)）材料和各种关于软件质量的教科书，
则使用术语 [_Test Suite_][istqb test suite] 来表示这一点。

在 GoogleTest 中使用的相关术语 _Test_ 对应于 ISTQB 术语 [_Test Case_][istqb test case]。

术语 _Test_ 通常具有足够广泛的意义，也包括 ISTQB 对 _Test Case_ 的定义，所以在这里问题不大。
但 Google Test 中使用的术语 _Test Case_ 具有矛盾的意义，因此容易引起混淆。

GoogleTest 最近开始将术语 _Test Case_ 替换为 _Test Suite_。
目前首选的 API 是 `TestSuite`。较旧的 `TestCase` API 正在逐步弃用和重构。

因此，请注意术语的不同定义：

| 含义                                     | GoogleTest 术语        | [ISTQB](https://www.istqb.org/) 术语 |
| :--------------------------------------- | :--------------------- | :----------------------------------- |
| 使用特定输入值执行特定程序路径并验证结果 | [TEST()](#simple-test) | [Test Case][istqb test case]         |

[istqb test case]: https://glossary.istqb.org/en_US/term/test-case
[istqb test suite]: https://glossary.istqb.org/en_US/term/test-suite

::: important 译者注

本文采用 ISTQB 中的定义，对上面提到的三个术语统一采用以下翻译：

| Test | Test Case | Test Suite |
| :--: | :-------: | :--------: |
| 测试 | 测试单元  |  测试套件  |

这里的**测试**指代一个测试单元中的单个断言，**测试单元**相当于 GoogleTest 中的 `Test`，**测试套件**则相当于 `TestSuite`。
原文中部分术语混用，容易引发混淆，我在翻译的时候结合语境，将它们区分开来。

:::

## 基本概念

使用 GoogleTest 时，我们从编写**断言**（_assertion_）开始。
断言是检查条件是否为真的语句。
断言的结果可以是**成功**（_success_）、**非致命失败**（_nonfatal failure_）或**致命失败**（_fatal failure_）。
如果发生致命失败，它会中止当前测试单元，否则会正常继续运行。

**测试单元**使用断言来验证被测试代码的行为。
如果测试崩溃或断言失败，则它**失败**（_fail_），否则它**成功**（_succeed_）。

一个**测试套件**包含一个或多个测试单元。
你应该将测试单元分组到反映被测试代码结构的测试套件中。
当测试套件中的多个测试单元需要共享公共对象和子程序时，你可以将它们放入一个**测试夹具**（_test fixture_）中。

一个**测试程序**（_test program_)可以包含多个测试套件。

我们现在将解释如何编写测试程序，从单个断言开始，逐步构建测试单元和测试套件。

## 断言 {#assertions}

在 GoogleTest 中， ==断言==是类似于函数的宏。
你通过对其行为进行断言来测试一个类或函数。
当断言失败时，GoogleTest 会打印断言所在的源文件和行号，以及相应的失败信息。
你也可以提供一个自定义的失败信息，这将附加到 GoogleTest 的输出信息中。

GoogleTest 提供了两种类型的断言，它们具有相同的测试功能，但失败时会对当前测试单元产生不同的影响。
`ASSERT_*` 版本在失败时产生致命失败，**中止当前测试单元**。
`EXPECT_*` 版本在失败时产生非致命失败，**不会**中止当前测试单元。
通常首选 `EXPECT_*`，因为它们允许在测试单元中同时报告多个失败。
但是，如果断言失败后继续运行没有意义，则应使用 `ASSERT_*`。

由于 `ASSERT_*` 失败后 会立即退出当前测试单元，可能会跳过之后的清理代码，因此可能会导致内存泄漏。
取决于泄漏的性质，它可能值得修复，也可能不值得修复。
如果你在断言失败之外还收到堆检查器的错误报告，请铭记这一点。

要提供自定义失败消息，只需使用 `<<` 操作符将其流式传输到宏中。
下面给出了一个示例，使用 [`ASSERT_EQ` 和 `EXPECT_EQ`](reference/assertions.md#EXPECT_EQ) 宏来验证两个值相等：

```cpp
ASSERT_EQ(x.size(), y.size()) << "Vectors x and y are of unequal length";

for (int i = 0; i < x.size(); ++i) {
  EXPECT_EQ(x[i], y[i]) << "Vectors x and y differ at index " << i;
}
```

任何可以流式传输到 `ostream` 的内容都可以流式传输到断言宏中，包括 C 风格字符串和 `std::string` 对象。
如果宽字符串（`wchar_t*`、Windows 上 `UNICODE` 模式下的 `TCHAR*`、 `std::wstring`）被流式传输到断言，它将在打印时被转换为 UTF-8。

GoogleTest 提供了一系列断言，让你能以多种方式来验证代码的行为。
你可以检查布尔条件、基于关系运算符比较值、验证字符串值、验证浮点值等等。
甚至还有一些断言允许你通过提供自定义谓词来验证更复杂的状态。
有关 GoogleTest 提供的完整断言列表，请参阅[断言参考](reference/assertions.md)。

## 简单的测试单元 {#simple-test}

要创建一个==测试单元==：

::: steps

1. 使用 `TEST()` 宏定义并命名一个测试函数。这些是不返回值的普通 C++ 函数。
2. 在此函数中，包含任何你想使用的有效 C++ 语句，使用各种 GoogleTest 断言来验证结果。
3. 测试单元的结果由断言决定：如果测试单元中的任何断言失败（无论是致命还是非致命），或者测试单元崩溃，则整个测试单元失败。
   否则，测试单元成功。

:::

```cpp
TEST(TestSuiteName, TestName) {
  ... 测试的内容 ...
}
```

`TEST()` 的参数从一般到具体。
**第一个**参数是==测试套件==的名称，**第二个**参数是测试套件中的测试单元的名称。
两个名称都必须是有效的 C++ 标识符，并且不应包含任何下划线（`_`）。[+测试命名]
测试单元的**全名**由其所属的测试套件和其单独名称组成。
不同测试套件中的测试单元可以具有相同的单独名称。

[+测试命名]: GoogleTest 内部使用 `TestSuite_TestCase` 的格式来命名对应的测试单元对象，命名中包含下划线可能导致一些奇怪的错误。

作为示例，我们来看一个简单的整数函数：

```cpp
int Factorial(int n);  // 返回 n 的阶乘
```

该函数的测试套件可能如下所示：

```cpp
// 测试 0 的阶乘
TEST(FactorialTest, HandlesZeroInput) {
  EXPECT_EQ(Factorial(0), 1);
}

// 测试正数的阶乘
TEST(FactorialTest, HandlesPositiveInput) {
  EXPECT_EQ(Factorial(1), 1);
  EXPECT_EQ(Factorial(2), 2);
  EXPECT_EQ(Factorial(3), 6);
  EXPECT_EQ(Factorial(8), 40320);
}
```

GoogleTest 按测试套件对测试结果进行分组，因此逻辑上相关的测试单元应放在同一个测试套件中。
也就是说，它们的 `TEST()` 的第一个参数应该相同。
在上面的示例中，我们有两个测试——`HandlesZeroInput` 和 `HandlesPositiveInput`，它们属于同一个测试套件 `FactorialTest`。

在命名测试套件和测试时，你应该遵循与[为函数和类命名](https://google.github.io/styleguide/cppguide.html#Function_Names)相同的约定。

## 测试夹具：为多个测试单元提供相同的数据配置 {#same-data-multiple-tests}

如果你发现自己编写的多个测试单元使用类似的数据时，你可以使用==测试夹具==。
这允许你为多个不同的测试单元复用相同的配置。

要创建一个测试夹具：

::: steps

1. 自 `testing::Test` 派生一个类。
   用 `protected:` 修饰其主体，因为我们希望子类能够访问该夹具的成员。
2. 在类中声明你计划使用的任何对象。
3. 如有必要，编写默认构造函数或 `SetUp()` 函数为每个测试单元分配资源。
   一个常见的错误是将 `SetUp()` 拼写为 `Setup()`，即写成小写的 `u`——你可以在 C++11 中使用 `override` 来确保拼写的正确性。
4. 如有必要，编写析构函数或 `TearDown()` 函数以释放在 `SetUp()` 中分配的任何资源。
   要了解何时应使用构造函数/析构函数以及何时应使用 `SetUp()/TearDown()`，请阅读 [gTest 常见问题解答](faq.md#CtorVsSetUp)。
5. 如有需要，为你的测试单元定义一些共享的子程序。

:::

使用测试夹具来定义测试单元时，要使用 `TEST_F()` 而不是 `TEST()`，它允许你访问测试夹具中的对象和子程序（`_F` 表示“Fixture”）：

```cpp
TEST_F(TestFixtureClassName, TestName) {
  ... 测试的内容 ...
}
```

与 `TEST()` 不同，在 `TEST_F()` 中，第一个参数必须是对应测试夹具的名称。
此宏不需要指定测试套件名称。

不幸的是，C++ 的宏系统不允许我们创建一个可以处理两种类型的测试的单一宏，因此使用错误的宏会导致编译错误。

此外，在使用`TEST_F()` 之前，你必须先定义对应的夹具，否则你会得到编译错误 `virtual outside class declaration`。

对于使用 `TEST_F()` 定义的每个测试单元，GoogleTest 将在运行时创建一个**全新的**测试夹具对象，
通过 `SetUp()` 初始化它，运行测试，通过调用 `TearDown()` 释放资源，最后删除该夹具。
请注意，同一测试套件中的不同测试单元具有不同的测试夹具对象，且 GoogleTest 总是在创建下一个夹具之前删除先前的夹具。
GoogleTest**不会**为多个测试单元复用同一个夹具对象。
在一个测试单元中对测试夹具所做的任何更改都不会影响其他测试单元。[+测试夹具]

[+测试夹具]: 除非你在夹具中使用一些静态或全局的资源，这就要求用户自行来保证测试单元之间的独立性了。

例如，让我们为一个名为 `Queue` 的 FIFO 队列类编写测试，该类具有以下接口：

```cpp
template <typename E>
class Queue {
 public:
  Queue();
  void Enqueue(const E& element);
  E* Dequeue(); // 如果队列为空，则返回 nullptr
  size_t size() const;
  ...
};
```

首先，定义一个测试夹具类。
按照惯例，你应该将其命名为 `FooTest`，其中 `Foo` 是被测试的类。

```cpp
class QueueTest : public testing::Test {
 protected:
  QueueTest() {
     // q0_ 保持为空
     q1_.Enqueue(1);
     q2_.Enqueue(2);
     q2_.Enqueue(3);
  }

  // ~QueueTest() override = default;

  Queue<int> q0_;
  Queue<int> q1_;
  Queue<int> q2_;
};
```

在这种情况下，我们不需要定义析构函数或 `TearDown()` 方法，因为编译器自动生成的析构函数将执行所有必要的清理工作。

现在我们将使用 `TEST_F()` 和此夹具来编写测试单元。

```c++
TEST_F(QueueTest, IsEmptyInitially) {
  EXPECT_EQ(q0_.size(), 0);
}

TEST_F(QueueTest, DequeueWorks) {
  int* n = q0_.Dequeue();
  EXPECT_EQ(n, nullptr);

  n = q1_.Dequeue();
  ASSERT_NE(n, nullptr);
  EXPECT_EQ(*n, 1);
  EXPECT_EQ(q1_.size(), 0);
  delete n;

  n = q2_.Dequeue();
  ASSERT_NE(n, nullptr);
  EXPECT_EQ(*n, 2);
  EXPECT_EQ(q2_.size(), 1);
  delete n;
}
```

上述代码同时使用了 `ASSERT_*` 和 `EXPECT_*` 断言。
根据我们的经验法则，当你希望在断言失败后继续测试以揭示更多错误时，使用 `EXPECT_*`，而当失败后继续运行没有意义时，使用 `ASSERT_*`。
例如，`Dequeue` 测试中的第二个断言是 `ASSERT_NE(n, nullptr)`，因为我们稍后需要解引用指针 `n`，当 `n` 为 `nullptr` 时会导致段错误。

当这些测试单元运行时，会发生以下情况：

::: steps

1.  GoogleTest 构造一个 `QueueTest` 对象（我们称之为 `t1`）。
2.  第一个测试单元（`IsEmptyInitially`）在 `t1` 上运行。
3.  `t1` 被析构。
4.  上述步骤在另一个 `QueueTest` 对象上重复，这次运行 `DequeueWorks` 测试单元。

:::

## 运行测试

`TEST()` 和 `TEST_F()` 隐式地将测试单元注册到 GoogleTest 中。
因此，与许多其他 C++ 测试框架不同，你不必为了运行它们而重新列出所有定义好的测试单元。

定义完测试单元后，你可以用 `RUN_ALL_TESTS()` 来运行它们。
如果所有测试单元都成功，则返回 `0`，否则返回 `1`。
请注意，`RUN_ALL_TESTS()` 将运行**所有测试单元**——它们可以来自不同的测试套件，甚至不同的源文件。

当被调用时，`RUN_ALL_TESTS()` 宏将：

::: steps

- 保存所有 GoogleTest 标志的状态。

- 为第一个测试单元创建测试测试夹具对象。

- 通过 `SetUp()` 初始化它。

- 在夹具对象上运行测试单元。

- 通过 `TearDown()` 清理资源。

- 删除夹具。

- 恢复所有 GoogleTest 标志的状态。

- 为下一个测试单元重复上述步骤，直到所有测试单元都运行完毕。

:::

在这个过程中，如果发生致命失败，后续步骤将被跳过。

::: caution

你**不能**忽略 `RUN_ALL_TESTS()` 的返回值，否则会产生编译错误。
这样设计的理由是，自动化测试服务根据其退出代码而不是 stdout/stderr 输出来判断测试是否通过，因此你的 `main()` 函数必须返回 `RUN_ALL_TESTS()` 的值。

此外，你应该只调用 `RUN_ALL_TESTS()` **一次**。
多次调用会与一些 GoogleTest 高级功能（例如，线程安全的[死亡测试](advanced.md#death-tests)）冲突，因此不受支持。

:::

## 编写 main() 函数

大多数用户**不需要**编写自己的 `main` 函数，只需链接 `gtest_main`（注意不是 `gtest`），它定义了一个合适的程序入口点。
请参阅本节末尾以获得更多详细信息。
本节的其余部分仅适用于你需要在测试运行之前执行某些自定义操作，而这些操作无法在测试夹具和测试套件的框架内进行。

如果你想编写自己的 `main` 函数，它应该返回 `RUN_ALL_TESTS()` 的值。

你可以从下面这个样板开始：

```cpp
#include "this/package/foo.h"

#include <gtest/gtest.h>

namespace my {
namespace project {
namespace {

// 用于测试类 Foo 的夹具。
class FooTest : public testing::Test {
 protected:
  // 如果以下任意函数的函数体为空，你可以删除它。

  FooTest() {
     // 你可以在这里为每个测试执行设置工作。
  }

  ~FooTest() override {
     // 你可以在这里执行不会抛出异常的清理工作。
  }

  // 如果构造函数和析构函数不足以设置和清理每个测试，你可以定义以下方法：

  void SetUp() override {
     // 这里的代码将在构造函数之后被立即调用（在每个测试单元运行之前）。
  }

  void TearDown() override {
     // 这里的代码将在每个测试单元结束之后立即调用（在析构函数之前）。
  }

  // 这里声明的类成员可以被 Foo 测试套件中的所有测试单元使用。
};

// 测试 Foo::Bar() 方法是否执行 Abc。
TEST_F(FooTest, MethodBarDoesAbc) {
  const std::string input_filepath = "this/package/testdata/myinputfile.dat";
  const std::string output_filepath = "this/package/testdata/myoutputfile.dat";
  Foo f;
  EXPECT_EQ(f.Bar(input_filepath, output_filepath), 0);
}

// 测试 Foo 是否执行 Xyz。
TEST_F(FooTest, DoesXyz) {
  // 执行 Foo 的 Xyz 功能。
}

}  // namespace
}  // namespace project
}  // namespace my

int main(int argc, char **argv) {
  testing::InitGoogleTest(&argc, argv);
  return RUN_ALL_TESTS();
}
```

`testing::InitGoogleTest()` 函数解析命令行以获取 GoogleTest 标志，并删除所有识别到的标志。
这允许用户通过各种标志来控制测试程序的行为，我们将在[进阶指南](advanced.md)中介绍这些标志。
你**必须**在调用 `RUN_ALL_TESTS()` 之前调用此函数，否则这些标志将无法被正确初始化。

在 Windows 上，`InitGoogleTest()` 也适用于宽字符串，因此它可以在 `UNICODE` 模式下编译的程序中使用。

但也许你认为编写这些 `main` 函数太麻烦了？
我们完全同意你的观点，这就是为什么 Google Test 提供了一个 `main()` 的基本实现。
如果它符合你的需求，那么只需将你的测试与 `gtest_main` 库链接即可。

::: warning

`ParseGUnitFlags()` 已弃用，推荐使用 `InitGoogleTest()`。

:::

## 已知限制

- GoogleTest 被设计为线程安全的。
  在 `pthreads` 库可用的系统上，其实现是线程安全的。
  在其他系统（例如 Windows）上，目前从两个线程并发使用 GoogleTest 断言是**不安全**的。
  在大多数测试中，这不是问题，因为断言通常在主线程中完成。
  如果你想为此提供帮助，可以自愿在 `gtest-port.h` 中为你的平台实现必要的同步原语。
