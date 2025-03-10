---
title: 进阶主题
createTime: 2025/03/10 15:18:17
permalink: /gtest/5s6lz6c4/
copyright:
  creation: translate
  source: https://google.github.io/googletest/advanced.html
outline: [2, 4]
---

## 引言

现在你已经阅读了[初学者指南](primer.md)并学会了如何使用 GoogleTest 来编写测试，是时候学习一些新技巧了。
本文将向你展示更多种类的断言，以及如何构建复杂的失败信息、传播致命失败、复用和加速你的测试夹具，并在测试中使用各种标志。

## 更多种类的断言

本节将介绍一些不太常用但依旧重要的断言。

### 显式的成功与失败

请参阅断言参考手册中的[显式的成功与失败](<!-- TODO:reference/assertions.md#success-failure -->)（_Explicit Success and Failure_）一节。

### 异常断言 {#ExceptionAssertions}

请参阅断言参考手册中的[异常断言](<!-- TODO:reference/assertions.md#exceptions -->)（_Exception Assertions_）一节。

### 谓词断言——获得更好的错误信息

尽管 GoogleTest 提供了丰富的断言集，但它们永远不可能覆盖所有场景，因为预测用户可能遇到的所有情况是不可能的（也不是一个好主意）。
因此，有时用户没有更好的宏可用，不得不使用 `EXPECT_TRUE()` 来检验一个复杂的表达式。
这样做的问题是它不会显示表达式中各个部分的值，使人难以理解是哪里出了问题。
作为一种变通方法，一些用户选择自己构建失败信息，并将其流式传输到 `EXPECT_TRUE()` 中。
然而，当表达式有副作用或计算成本高时，这样做就不太方便了。

GoogleTest 为你提供了三种不同的选项来解决这个问题。

#### 使用现有的布尔函数

如果你已经有一个返回值为 `bool`（或可以隐式转换为 `bool` 的类型）的函数或函数对象，
你可以在**谓词断言**（_predicate assertion_）中使用它，方便地打印函数的参数。
详细信息请参阅断言参考手册中的 [`EXPECT_PRED*`](<!-- TODO:reference/assertions.md#EXPECT_PRED -->)。

#### 使用返回 AssertionResult 的函数

虽然 `EXPECT_PRED*()` 及其相关宏用起来很方便，但语法却不令人满意：你必须为不同的参数数量使用不同的宏，这更像是 Lisp 而不是 C++。
`::testing::AssertionResult` 类解决了这个问题。

`AssertionResult` 对象表示断言的结果（成功或失败，以及相关的信息）。
你可以使用以下工厂函数来创建 `AssertionResult`：

```cpp
namespace testing {

// 返回一个 AssertionResult 对象以指示断言成功
AssertionResult AssertionSuccess();

// 返回一个 AssertionResult 对象以指示断言失败
AssertionResult AssertionFailure();

}
```

然后你可以使用 `<<` 运算符将信息流式传输到 `AssertionResult` 对象中。

编写一个返回 `AssertionResult` 而不是 `bool` 的谓词函数，能够在布尔断言（例如 `EXPECT_TRUE()`）中提供更易读的信息。
例如，如果你将 `IsEven()` 定义为：

```cpp
testing::AssertionResult IsEven(int n) {
  if ((n % 2) == 0)
    return testing::AssertionSuccess();
  else
    return testing::AssertionFailure() << n << " is odd";
}
```

而不是：

```cpp
bool IsEven(int n) {
  return (n % 2) == 0;
}
```

断言 `EXPECT_TRUE(IsEven(Fib(4)))` 失败时将打印：

```ansi
Value of: IsEven(Fib(4))
  Actual: false (3 is odd)
Expected: true
```

而不是更晦涩的：

```ansi
Value of: IsEven(Fib(4))
  Actual: false
Expected: true
```

如果你希望在 `EXPECT_FALSE` 和 `ASSERT_FALSE` 中也提供详细信息（Google 代码库中三分之一的布尔断言是否定形式的），
并且不介意在断言成功的情况下使执行变慢，你可以同时提供一个成功信息：

```cpp
testing::AssertionResult IsEven(int n) {
  if ((n % 2) == 0)
    return testing::AssertionSuccess() << n << " is even";
  else
    return testing::AssertionFailure() << n << " is odd";
}
```

这样断言 `EXPECT_FALSE(IsEven(Fib(6)))` 失败时将打印：

```ansi
 Value of: IsEven(Fib(6))
   Actual: true (8 is even)
 Expected: false
```

#### 使用谓词格式化器

如果你对 [`EXPECT_PRED*`](<!-- TODO:reference/assertions.md#EXPECT_PRED -->) 和 [`EXPECT_TRUE`](<!-- TODO:reference/assertions.md#EXPECT_TRUE -->)
生成的默认信息不太满意，或者你的谓词中的某些参数不能流式传输到 `ostream`，
你可以使用**谓词格式化断言**（_predicate-formatter assertion_）来完全自定义信息的格式。
详细信息请参阅断言参考手册中的 [`EXPECT_PRED_FORMAT*`](<!-- TODO:reference/assertions.md#EXPECT_PRED_FORMAT -->) 一节。

### 浮点数比较

请参阅断言参考手册中的[浮点数比较](<!-- TODO:reference/assertions.md#floating-point -->)一节。

#### 浮点数谓词格式化函数

一些浮点数操作很有用，但并不常用。
为了避免宏数量的爆炸式增长，我们将它们作为谓词格式化函数（_predicate-format function_）提供，
可以在谓词断言宏 [`EXPECT_PRED_FORMAT2`](<!-- TODO:reference/assertions.md#EXPECT_PRED_FORMAT -->) 中使用，例如：

```cpp
using ::testing::FloatLE;
using ::testing::DoubleLE;
...
EXPECT_PRED_FORMAT2(FloatLE, val1, val2);
EXPECT_PRED_FORMAT2(DoubleLE, val1, val2);
```

上述代码验证 `val1` 小于或近似等于 `val2`。

### 使用 gMock 匹配器（_Matcher_）进行断言 {#asserting-using-gmock-matchers}

请参阅断言参考手册中的 [`EXPECT_THAT`](<!-- TODO:reference/assertions.md#EXPECT_THAT -->) 一节。

### 更多字符串断言

::: warning
请先阅读[上一节](#asserting-using-gmock-matchers)再阅读本节内容。
:::

你可以用 gMock 的[字符串匹配器](<!-- TODO:reference/matchers.md#string-matchers -->)与 [`EXPECT_THAT`](<!-- TODO:reference/assertions.md#EXPECT_THAT -->)
来实现更多字符串验证方法（子字符串、前缀、后缀、正则表达式等）。
例如，

```cpp
using ::testing::HasSubstr;
using ::testing::MatchesRegex;
...
  ASSERT_THAT(foo_string, HasSubstr("needle"));
  EXPECT_THAT(bar_string, MatchesRegex("\\w*\\d+"));
```

### Windows HRESULT 断言

请参阅中断言参考手册中的 [Windows HRESULT 断言](<!-- TODO:reference/assertions.md#HRESULT -->)一节。

### 类型断言

你可以使用函数

```cpp
::testing::StaticAssertTypeEq<T1, T2>();
```

来断言类型 `T1` 和 `T2` 相同。
如果断言满足，函数将什么也不做。
如果类型不同，函数将无法编译，编译错误消息会显示 `T1 and T2 are not the same type`，
并且很可能显示 `T1` 和 `T2` 对应的实际类型（取决于编译器）。
这在模板代码中特别有用。

::: warning

当在类模板或函数模板的成员函数中使用时，`StaticAssertTypeEq<T1, T2>()` 只有在函数被实例化时才有效。
例如，给定：

```cpp
template <typename T> class Foo {
 public:
  void Bar() { testing::StaticAssertTypeEq<int, T>(); }
};
```

下列代码

```cpp
void Test1() { Foo<bool> foo; }
```

不会生成编译错误，因为 `Foo<bool>::Bar()` 未被实例化。
你需要使用

```cpp
void Test2() { Foo<bool> foo; foo.Bar(); }
```

来引发编译错误。

:::

### 可以使用断言的范围

你可以在任何 C++ 函数中使用断言，这个函数不必是测试夹具类中的方法。
我们对此唯一的限制是，会产生致命失败的断言（`FAIL*` 和 `ASSERT_*`）只能在返回值为 `void` 的函数中使用。
这是因为 Google 不使用异常。
如果你将其放在非 `void` 函数中，你会得到一个令人困惑的编译错误，
如 `"error: void value not ignored as it ought to be"` 或 `"cannot initialize return object of type 'bool' with an rvalue of type 'void'"`
或 `"error: no viable conversion from 'void' to 'string'"`。

如果你需要在返回非 `void` 的函数中使用这些断言，你可以让函数通过输出参数返回值。
例如，将 `T2 Foo(T1 x)` 重写为 `void Foo(T1 x, T2* result)`。
你需要确保即使函数提前返回，`*result` 也包含一些合理的值。
由于函数现在返回 `void`，你可以在其中使用任何断言。

如果你不想更改函数的类型，你应该只使用生成非致命失败的断言，如 `ADD_FAILURE*` 和 `EXPECT_*`。

::: note
根据 C++ 语言规范，构造函数和析构函数不被视为返回 `void` 的函数，因此你不能在其中使用致命断言。
如果你试图这样做，你会得到一个编译错误。
因此，你要么调用 `abort` 并使整个测试崩溃，要么将致命断言放在 `SetUp`/`TearDown` 中。
详细信息请参阅[构造函数/析构函数 vs. SetUp/TearDown](<!-- TODO:faq.md#CtorVsSetUp -->)。
:::

::: caution
在构造函数或析构函数中调用的辅助函数中的致命断言不会像你认为的那样终止当前测试：
它只会从构造函数或析构函数中提前返回，这可能会让你的对象处于部分构造或部分销毁的状态！
:::

## 跳过测试的执行

你可以使用 `GTEST_SKIP()` 宏在运行时跳过后续测试的执行。
在你需要在运行时检查被测系统的部分条件并以合适的方式跳过后续测试时，这将非常有用。

`GTEST_SKIP()` 可以在单个测试单元中使用，也可以在派生自 `::testing::Environment` 或 `::testing::Test` 的类的 `SetUp()` 方法中使用。
例如：

```cpp
TEST(SkipTest, DoesSkip) {
  GTEST_SKIP() << "Skipping single test";
  FAIL();  // 测试不会失败；它不会被执行
}

class SkipFixture : public ::testing::Test {
 protected:
  void SetUp() override {
    GTEST_SKIP() << "Skipping all tests for this fixture";
  }
};

// SkipFixture 中的测试不会被执行
TEST_F(SkipFixture, SkipsOneTest) {
  FAIL();
}
```

与断言宏类似，你可以将自定义信息流式传输到 `GTEST_SKIP()` 中。

## 告诉 GoogleTest 如何打印参数值

当试断言（如 `EXPECT_EQ`）失败时，GoogleTest 会打印参数值以帮助你调试。
这是通过用户可扩展的打印器（_user-extensible value printer_）来实现的。

该打印器能打印 C++ 内置类型、原生数组、STL 容器以及任何支持 `<<` 运算符的类型。
对于其他类型，它会打印对应的原始字节，并希望用户能够理解。

如前所述，这个打印器是**可扩展的**。
这意味着你可以告诉它如何更好地打印特定类型的值，而不是仅打印原始字节。
你只需要为你的类型重载一个作为友元函数模板的`AbslStringify()` 方法。

```cpp
namespace foo {

class Point {  // 我们希望 GoogleTest 能够打印此类的实例
  ...
  // 提供一个友元重载
  template <typename Sink>
  friend void AbslStringify(Sink& sink, const Point& point) {
    absl::Format(&sink, "(%d, %d)", point.x, point.y);
  }

  int x;
  int y;
};

// 如果你不能在类中声明该函数，请将 AbslStringify 重载定义在与 Point 相同的命名空间中 // [!code highlight]
// C++ 的函数查找规则依赖于这一点（即 ADL 机制） // [!code highlight]
enum class EnumWithStringify { kMany = 0, kChoices = 1 };

template <typename Sink>
void AbslStringify(Sink& sink, EnumWithStringify e) {
  absl::Format(&sink, "%s", e == EnumWithStringify::kMany ? "Many" : "Choices");
}

}  // namespace foo
```

::: note
`AbslStringify()` 使用通用的 `sink` 缓冲区来构建字符串。
有关 `AbslStringify()` 中 `sink` 支持的操作的更多信息，请参阅 [AbslStringify][]。
:::

[abslstringify]: https://abseil.io/docs/cpp/guides/abslstringify

`AbslStringify()` 还可以在 `absl::StrFormat` 中使用万能的 `%v` 类型说明符来执行自动类型推断。
例如， `Point` 可以被格式化为 `"(%v, %v)"`，其中 `int` 会被自动推断为 `%d`。

有时，你的团队可能希望类在测试环境下打印时带有额外调试信息，而不是使用 `AbslStringify()`。
这时，你可以改为定义一个 `PrintTo()` 函数。

```cpp
#include <ostream>

namespace foo {

class Point {
  ...
  friend void PrintTo(const Point& point, std::ostream* os) {
    *os << "(" << point.x << "," << point.y << ")";
  }

  int x;
  int y;
};

// 如果你不能在类中声明该函数，请将 PrintTo() 定义在与 Point 相同的命名空间中 // [!code highlight]
// C++ 的函数查找规则依赖于这一点 // [!code highlight]
void PrintTo(const Point& point, std::ostream* os) {
    *os << "(" << point.x << "," << point.y << ")";
}

}  // namespace foo
```

当你同时定义了 `AbslStringify()` 和 `PrintTo()`，GoogleTest 将使用后者。
这允许你自定义参数值在 GoogleTest 中的输出方式，而不影响那些依赖 `AbslStringify()` 行为的代码。

类似的，如果你有一个 `<<` 运算符重载并定义了 `AbslStringify()`，GoogleTest 将使用后者。

你还可以调用 `::testing::PrintToString()` 来获取 GoogleTest 中的值打印器打印的值，该函数返回 `std::string`：

```cpp
vector<pair<Point, int>> point_ints = GetPointIntVector();

EXPECT_TRUE(IsCorrectPointIntVector(point_ints))
    << "point_ints = " << testing::PrintToString(point_ints);
```

有关 `AbslStringify()` 及其与其他库集成的更多详细信息，请参阅 [AbslStringify][]。

## 正则表达式语法

当使用 Bazel 构建并使用 Abseil 时，GoogleTest 使用 [RE2](https://github.com/google/re2/wiki/Syntax) 语法。
否则，对于 POSIX 系统（Linux、Cygwin、Mac），GoogleTest 使用
[POSIX 扩展正则表达式](https://pubs.opengroup.org/onlinepubs/009695399/basedefs/xbd_chap09.html#tag_09_04) 语法。
你可以阅读这个[维基百科条目](https://en.wikipedia.org/wiki/Regular_expression#POSIX_extended)来了解 POSIX 语法。

在 Windows 上，GoogleTest 使用自己实现的简单正则表达式。
该实现缺少许多功能。
例如，不支持或运算（`"x|y"`）、分组（`"(xy)"`）、字符组（`"[xy]"`）和重复计数（`"x{5,7}"`）等。
以下是我们支持的内容（`A` 表示任意字面字符、`.` 或一个 `\\` 转义序列；`x` 和 `y` 表示正则表达式）：

| 表达式 | 含义                               |
| ------ | ---------------------------------- |
| `c`    | 匹配任意字面字符 `c`               |
| `\\d`  | 匹配任意十进制数字                 |
| `\\D`  | 匹配任意非十进制数字的字符         |
| `\\f`  | 匹配 `\f`                          |
| `\\n`  | 匹配 `\n`                          |
| `\\r`  | 匹配 `\r`                          |
| `\\s`  | 匹配任意 ASCII 空白字符，包括 `\n` |
| `\\S`  | 匹配任意非空白字符                 |
| `\\t`  | 匹配 `\t`                          |
| `\\v`  | 匹配 `\v`                          |
| `\\w`  | 匹配任意字母、`_` 或十进制数字     |
| `\\W`  | 匹配 `\\w` 不匹配的任意字符        |
| `\\c`  | 匹配任意标点符号                   |
| `.`    | 匹配除 `\n` 之外的任意单个字符     |
| `A?`   | 匹配 0 或 1 次 `A`                 |
| `A*`   | 匹配 0 或多次 `A`                  |
| `A+`   | 匹配 1 或多次 `A`                  |
| `^`    | 匹配字符串的开头（不是每行的开头） |
| `$`    | 匹配字符串的结尾（不是每行的结尾） |
| `xy`   | 匹配 `x` 后跟 `y`                  |

GoogleTest 定义了一些宏来显示它正在使用的正则表达式语法，包括 `GTEST_USES_SIMPLE_RE=1` 和 `GTEST_USES_POSIX_RE=1`。
如果你希望你的测试在所有情况下都能正常运行，你可以用 `#if` 搭配这些宏来作条件判断，或者只使用有限的正则语法。

## 死亡测试 {#death-tests}

在许多应用程序中，有一些断言在失败时会导致整个程序崩溃。
这些断言会在程序状态出现异常后尽可能早地失败，以确保程序处于良好的运行状态。
如果这些断言出错，程序会在异常状态下继续运行，这可能导致内存损坏、安全漏洞甚至更糟的情况。
因此，测试这些断言语句是否按预期工作至关重要。

由于这类测试会导致进程死亡，我们称此类测试为**死亡测试**（_death test_）。
更一般地说，任何验证程序是否以预期方式终止（除了抛出异常）的测试都是死亡测试。

::: note
如果一段代码抛出异常，我们不认为这是“死亡”。
因为代码的调用者可以捕获异常以避免崩溃。
如果你想验证代码抛出的异常，请参阅[异常断言](#ExceptionAssertions)。
:::

::: note
如果你想测试一段测试代码中的 `EXPECT_*()/ASSERT_*()` 语句，请参阅["捕获" 失败](#catching-failures)。
:::

### 如何编写死亡测试

GoogleTest 提供了针对死亡测试的断言宏。
详细信息请参阅断言参考手册中的[死亡断言](<!-- TODO:reference/assertions.md#death -->)一节。

要编写死亡测试，只需在你的测试函数中使用这些宏。例如：

```cpp
// 验证 Foo(5) 会导致进程以给定的错误消息死亡
TEST(MyDeathTest, Foo) {
  // 这个死亡测试使用了一个复合语句
  ASSERT_DEATH({
    int n = 5;
    Foo(&n);
  }, "Error on line .* of Foo()");
}

// 验证 NormalExit() 会导致进程向标准错误输出 "Success" 并以退出码 0 退出
TEST(MyDeathTest, NormalExit) {
  EXPECT_EXIT(NormalExit(), testing::ExitedWithCode(0), "Success");
}

// 验证 KillProcess() 会以信号 SIGKILL 杀死进程
TEST(MyDeathTest, KillProcess) {
  EXPECT_EXIT(KillProcess(), testing::KilledBySignal(SIGKILL),
              "Sending myself unblockable signal");
}
```

::: caution
如果你的死亡测试包含模拟对象（_mock_）并期望得到特定的退出码，则必须通过 `Mock::AllowLeak` 允许模拟对象发生泄漏。
这是因为如果模拟对象的泄漏检测器（_mock leak detector_）检测到泄漏，它将以自己的错误码退出。
:::

测试单元也可以根据需要包含其他断言和语句。

请注意，死亡测试只关心三件事：

1. `statement` 是否会使进程中止或退出？
2. 对于 `ASSERT_EXIT` 和 `EXPECT_EXIT`，退出状态是否满足 `predicate`？
   对于 `ASSERT_DEATH` 和 `EXPECT_DEATH`，退出状态是否非零？
3. 标准错误输出是否匹配 `matcher`？

特别指出，如果 `statement` 中的断言语句失败，将**不会**导致死亡测试失败，因为 GoogleTest 断言不会中止进程。

### 死亡测试的命名

::: important
我们强烈建议你在书写死亡测试时遵循将**测试套件**命名为 `*DeathTest` 的约定，如上例所示。
[死亡测试与线程](#death-tests-and-threads)部分解释了原因。
:::

如果一个测试夹具类同时被普通测试和死亡测试共享，你可以使用 `using` 或 `typedef` 为夹具类引入别名，避免重复其代码：

```cpp
class FooTest : public testing::Test { ... };

using FooDeathTest = FooTest;

TEST_F(FooTest, DoesThis) {
  // 普通测试
}

TEST_F(FooDeathTest, DoesThat) {
  // 死亡测试
}
```

### 工作原理

请参阅断言参考手册中的[死亡断言](<!-- TODO:reference/assertions.md#death -->)一节。

### 死亡测试与线程 {#death-tests-and-threads}

两种死亡测试风格（_death test style_）的存在与线程安全有关。
由于在存在线程的情况下进行进程分叉（_fork_）存在众所周知的隐患，死亡测试应当在单线程环境中运行。
然而，有时我们很难构建这样的理想环境。
例如，静态初始化模块可能会在 main 函数执行前就创建线程。
一旦线程被创建，要彻底清理它们往往十分困难甚至不可能实现。

GoogleTest 通过以下三个特性提升开发者对线程问题的认知：

1. 当检测到死亡测试运行时存在多个活动线程，系统会发出警告提示。
2. 名称以 `DeathTest` 结尾的测试套件会优先于其他测试执行。
3. 在 Linux 系统下使用 `clone()` 替代 `fork()` 来创建子进程（Cygwin 和 Mac 系统不支持 `clone()`），
   因为当父进程存在多个线程时，`fork()` 更容易导致子进程挂起。

在死亡测试语句内部创建线程是完全安全的，这些线程会在独立进程中运行，不会对父进程造成任何影响。

### 死亡测试风格

“线程安全”风格的死亡测试是为了减轻在多线程环境下测试的风险。
这种风格以增加测试执行时间（可能显著增加）为代价，换取更好的线程安全性。

自动化测试框架不会设置死亡测试风格标志。
你可以通过编程方式手动设置该标志来选择特定的死亡测试风格：

```cpp
GTEST_FLAG_SET(death_test_style, "threadsafe");
```

你可以在 `main()` 中设置此标志使其全局生效，或者仅在单个测试单元中设置。
框架会在每个测试运行前自动保存当前标志状态，并在测试完成后恢复原值，因此无需手动处理状态维护。

```cpp
int main(int argc, char** argv) {
  testing::InitGoogleTest(&argc, argv);
  GTEST_FLAG_SET(death_test_style, "fast");
  return RUN_ALL_TESTS();
}

// 此测试以“线程安全”风格运行
TEST(MyDeathTest, TestOne) {
  GTEST_FLAG_SET(death_test_style, "threadsafe");
  ASSERT_DEATH(ThisShouldDie(), "");
}

// 此测试以“快速”风格运行
TEST(MyDeathTest, TestTwo) {
  ASSERT_DEATH(ThisShouldDie(), "");
}
```

### 注意事项

`ASSERT_EXIT()` 的 `statement` 参数可以是任何有效的 C++ 语句。
如果该语句通过 `return` 语句或抛出异常离开当前函数，则视为死亡测试失败。

::: caution
部分 GoogleTest 宏（如 `ASSERT_TRUE()`）会从当前函数直接返回，因此请避免在死亡测试中使用它们。
:::

由于 `statement` 在子进程中执行，其引发的任何内存副作用（例如修改变量、释放内存等）对父进程中 **不可见**。
尤其需注意：若在死亡测试中释放内存，父进程将无法感知该内存回收操作，导致堆内存检查（_heap check_）失败。
解决方案包括：

1. 尽量不要在死亡测试中释放内存；
2. 在父进程中重复释放同一内存；
3. 关闭程序的堆内存检查功能。

由于一些内部实现细节，**禁止在同一代码行中编写多个死亡测试断言**，否则会引发编译错误（且错误信息晦涩难懂）。

需特别指出：
尽管"线程安全"风格的死亡测试增强了线程安全性，但若程序中存在通过 `pthread_atfork(3)` 注册的线程处理函数，仍可能出现死锁等线程相关问题。

## 在子程序中使用断言

::: warning
若你需要在子程序中编写一系列测试断言来验证复杂条件，建议改用[自定义的 GMock 匹配器](<!-- TODO:gmock_cook_book.md#NewMatchers -->)。
这种方式能在失败时提供更易读的错误信息，并规避下文所述的所有问题。
:::

### 为断言添加追踪信息

当多处调用同一个测试子程序时，若其内部断言失败，可能难以定位具体是由哪个调用导致的失败。
虽然可以通过额外日志或自定义失败信息来排查，但这通常会使测试代码变得臃肿。
更好的解决方案是使用 `SCOPED_TRACE` 宏或 `ScopedTrace` 工具：

```cpp
SCOPED_TRACE(message);
```

```cpp
ScopedTrace trace("file_path", line_number, message);
```

其中 `message` 是任何可以流式传输给 `std::ostream` 的内容。
`SCOPED_TRACE` 宏会将当前文件名、行号和指定消息自动附加到所有失败消息中。
`ScopedTrace` 允许显式指定文件名和行号，这对于编写测试辅助函数非常有用。
这些追踪信息会在离开当前作用域时被自动清除。

示例：

::: code-tabs
@tab foo_test.cc

```cpp :line-numbers=10
void Sub1(int n) {
  EXPECT_EQ(Bar(n), 1);
  EXPECT_EQ(Bar(n + 1), 2);
}

TEST(FooTest, Bar) {
  {
    SCOPED_TRACE("A");  // 该追踪点会附加到
                        // 当前作用域内所有失败信息
    Sub1(1);
  }
  // 此处不再生效
  Sub1(9);
}
```

:::

可能产生的错误信息：

```ansi
path/to/foo_test.cc:11: Failure
Value of: Bar(n)
Expected: 1
  Actual: 2
Google Test trace:
path/to/foo_test.cc:17: A

path/to/foo_test.cc:12: Failure
Value of: Bar(n + 1)
Expected: 2
  Actual: 3
```

如果没有追踪信息，将很难判断这两个失败分别来自哪个 `Sub1()` 调用。
虽然可以在 `Sub1()` 的每个断言中添加参数信息，但这会使代码变得臃肿。

使用 `SCOPED_TRACE` 的一些技巧：

1. **集中声明**：在子程序开头使用具有描述性的 `SCOPED_TRACE`，通常比在每个调用点添加更高效。
2. **循环追踪**：在循环中调用子程序时，将迭代变量加入追踪信息以定位来源的具体迭代。
3. **简化信息**：当行号已足够定位问题时，可直接使用空消息 `SCOPED_TRACE("")`。
4. **嵌套使用**：当外部作用于存在 `SCOPED_TRACE` 时，内部作用域依旧可以使用 `SCOPED_TRACE`。此时所有的追踪信息将逆序输出。
5. **交互调试**：在 Emacs 中点击追踪信息的行号可直接跳转至源码对应位置

### 致命失败的传播

使用 `ASSERT_*` 和 `FAIL*` 断言时需注意：**这些断言仅中止当前函数执行，不会终止整个测试。**
例如，下面的测试将导致段错误：

```cpp
void Subroutine() {
  // 生成致命失败并中止当前函数
  ASSERT_EQ(1, 2);

  // 以下内容不会被执行
  ...
}

TEST(FooTest, Bar) {
  Subroutine();  // 开发者预期 Subroutine() 的致命失败会终止整个测试

  // 实际行为：函数在 Subroutine() 返回后继续执行。
  int* p = nullptr;
  *p = 3;  // 段错误！
}
```

为解决该问题，GoogleTest 提供三种解决方案：

- 异常机制
- 断言检验宏 `(ASSERT|EXPECT)_NO_FATAL_FAILURE`
- 状态检测函数 `HasFatalFailure()`

具体实现方式详见后续小节说明。

#### 启用异常机制

以下代码可以将致命失败转换为异常：

```cpp
class ThrowListener : public testing::EmptyTestEventListener {
  void OnTestPartResult(const testing::TestPartResult& result) override {
    if (result.type() == testing::TestPartResult::kFatalFailure) {
      throw testing::AssertionException(result);
    }
  }
};
int main(int argc, char** argv) {
  ...
  testing::UnitTest::GetInstance()->listeners().Append(new ThrowListener);
  return RUN_ALL_TESTS();
}
```

如果你有任何其他监听器，此监听器应最后添加，否则其他监听器将无法捕获 `OnTestPartResult` 失败事件。

#### 验证子进程的断言状态

如前所述，若测试调用的子程序中存在致命失败，测试将在子程序返回后继续执行。
这种默认行为可能不符合预期。

通常开发者希望致命失败能像异常一样传播。为此 GoogleTest 提供了以下宏：

| 致命断言                              | 非致命断言                            | 功能说明                                  |
| ------------------------------------- | ------------------------------------- | ----------------------------------------- |
| `ASSERT_NO_FATAL_FAILURE(statement);` | `EXPECT_NO_FATAL_FAILURE(statement);` | 验证 `statement` 在执行时不会产生致命失败 |

::: warning
上述宏仅检查执行断言语句的线程中的失败，若 `statement` 中创建了新线程，这些线程中的失败将被忽略。
:::

示例：

```cpp
ASSERT_NO_FATAL_FAILURE(Foo());

int i;
EXPECT_NO_FATAL_FAILURE({
  i = Bar();
});
```

#### 检测当前测试单元的失败状态

`::testing::Test` 类的 `HasFatalFailure()` 方法在当前测试单元存在致命失败时返回 `true`。
这允许函数在子程序发生致命错误时提前退出。

```cpp
class Test {
 public:
  ...
  static bool HasFatalFailure();
};
```

典型用法（模拟异常抛出行为）：

```cpp
TEST(FooTest, Bar) {
  Subroutine();
  // 若 Subroutine() 发生致命失败则中止
  if (HasFatalFailure()) return;

  // 后续代码不会被执行
  ...
}
```

如果 `HasFatalFailure()` 在 `TEST()`、`TEST_F()` 或测试夹具类之外被使用，你必须添加完整的命名空间前缀：

```cpp
if (testing::Test::HasFatalFailure()) return;
```

其他类似的方法：

- `HasNonfatalFailure()` 在当前测试单元中存在非致命失败返回 `true`。
- `HasFailure()` 在当前测试单元存在任意类型的失败时返回 `true`。

## 记录自定义 XML 信息

在测试代码中，可通过 `RecordProperty("key", value)`方法记录自定义信息，其中 `value` 的类型可以是字符串或 `int`。
最终记录的键值对将输出至 XML 报告（若启用了 [XML 输出](#generating-an-xml-report)）。

```cpp
TEST_F(WidgetUsageTest, MinAndMaxWidgets) {
  RecordProperty("MaximumWidgets", ComputeMaxUsage());
  RecordProperty("MinimumWidgets", ComputeMinUsage());
}
```

上述测试代码会生成如下的 XML 报告片段：

```xml
...
<testcase name="MinAndMaxWidgets" file="test.cpp" line="1" status="run" time="0.006" classname="WidgetUsageTest" MaximumWidgets="12" MinimumWidgets="9" />
...
```

::: warning

- `RecordProperty()` 是 `Test` 类的静态成员。
  因此，如果在 `TEST` 和测试夹具类之外使用，需要加上 `::testing::Test::` 前缀。

- `key` 必须是有效的 XML 属性名称，且不能与 GoogleTest 已使用的属性名（`name`、`status`、`time`、`classname`、`type_param` 和 `value_param`）冲突。

- 在测试单元的生命周期之外调用 `RecordProperty()` 是允许的。
  如果在测试单元之外但在测试套件的 `SetUpTestSuite()` 和 `TearDownTestSuite()` 方法之间调用，它将被应用于测试套件的 XML 元素。
  如果在所有测试套件之外调用（例如在测试环境中），它将被应用于顶级 XML 元素。

:::

## 在同一测试套件内共享资源

GoogleTest 为每个测试单元创建独立的测试夹具对象，使测试彼此隔离，易于调试。
但当涉及到高成本资源的初始化时，这种"独立副本"的模式可能带来极高的运行成本。

若测试对资源只读不写，则共享单一资源副本是安全且高效的。
为此，GoogleTest 在提供测试单元级别 `SetUp/TearDown` 的同时，还提供了测试套件级别的 `SetUp/TearDown` 机制：

::: steps

1. 在测试夹具类（如 FooTest）中声明静态成员变量用于持有共享资源。
2. 在类外（通常紧接类定义）初始化静态成员，可以给它们赋初始值。
3. 在测试夹具类中定义 `static void SetUpTestSuite()`（注意拼写） 和 `static void TearDownTestSuite()`，
   分别用来初始化和清理这些静态共享资源。

:::

GoogleTest 会自动在运行 `FooTest` 测试套件中的第一个测试单元之前调用 `SetUpTestSuite()`，
并在运行其中的最后一个测试单元之后调用 `TearDownTestSuite()`。
在此期间，测试单元可以正常使用这些共享资源。

::: note
测试单元的**运行顺序**是**未定义**的，因此你的代码不能依赖与这种顺序。
测试单元如果修改了这些共享变量的状态，则必须在将控制权传递给下一个测试单元之前将状态恢复到原始值。
:::

::: warning
`SetUpTestSuite()` 可能会被因为具有**派生类**而被**多次调用**，因此你不应该期望函数体中的代码只运行一次。
此外，派生类也可以访问这些共享资源，因此在管理时需要谨慎，避免因 `TearDownTestSuite()` 未正确清理共享资源而发生内存泄漏。
:::

下面是一份供参考的代码示例：

```cpp
class FooTest : public testing::Test {
 protected:
  // 在此测试套件中的第一个测试单元运行之前调用
  // 如果不需要，可以省略
  static void SetUpTestSuite() {
    shared_resource_ = new ...;

    // 如果 shared_resource_ 未在 TearDownTestSuite() 中删除，应防止重新分配，
    // 因为 SetUpTestSuite() 可能会被 FooTest 的派生类调用，导致内存泄漏。
    //
    // if (shared_resource_ == nullptr) {
    //   shared_resource_ = new ...;
    // }
  }

  // 在此测试套件中的最后一个测试单元运行之后调用
  // 如果不需要，可以省略
  static void TearDownTestSuite() {
    delete shared_resource_;
    shared_resource_ = nullptr;
  }

  // 测试单元级别的 SetUp/TearDown 可以正常使用
  void SetUp() override { ... }
  void TearDown() override { ... }

  // 一些被所有测试单元共享的昂贵资源
  static T* shared_resource_;
};

T* FooTest::shared_resource_ = nullptr;

TEST_F(FooTest, Test1) {
  // 你可以在这里使用 shared_resource_
  ...
}

TEST_F(FooTest, Test2) {
  // 你可以在这里使用 shared_resource_
  ...
}
```

::: note
尽管上面的代码示例中将 `SetUpTestSuite()` 声明为 `protected`，但有时可能需要将其声明为 `public`，例如在与 `TEST_P` 一起使用时。
:::

## 全局 SetUp/TearDown {#global-set-up-and-tear-down}

除支持测试单元、测试套件级别的 `SetUp/TearDown` 外，GoogleTest 还提供测试程序级别的全局 `SetUp/TearDown`。
具体步骤如下：

首先，派生 `::testing::Environment` 类来定义一个测试环境，重写相应的 `SetUp/TeadDown` 方法。

```cpp
class Environment : public ::testing::Environment {
 public:
  ~Environment() override {}

  void SetUp() override {}
  void TearDown() override {}
};
```

然后，通过调用 `::testing::AddGlobalTestEnvironment()` 函数将该环境类实例注册到 GoogleTest 中：

```cpp
Environment* AddGlobalTestEnvironment(Environment* env);
```

完成上述步骤后，当调用 `RUN_ALL_TESTS()` 时，首先调用 `SetUp()` 方法，
然后运行测试单元（前提是没有产生致命失败且未调用 `GTEST_SKIP()`），
最后调用 `TearDown()` 来执行清理操作。

::: note
需至少有一个测试单元要运行，才会调用 `SetUp()` 和 `TearDown()`。
即使由于致命失败或 `GTEST_SKIP()` 而未运行测试，`TearDown()` 也会被执行。
:::

`gtest_recreate_environments_when_repeating` 标志决定了是否每次迭代都会调用 `SetUp/TearDown`。
如果为每次迭代时都重新创建测试环境，`SetUp()` 和 `TearDown()` 将在每次迭代中被调用。
否则，`SetUp()` 仅在第一次迭代中调用，而 `TearDown()` 仅在最后一次迭代中调用。

你可以注册多个环境对象，相应的 `SetUp()` 将按照注册的顺序调用，而 `TearDown()` 将按照相反的顺序调用。

::: warning
GoogleTest 将持有注册的环境对象的所有权，因此请**不要自己释放它们**。
:::

你应在调用 `RUN_ALL_TESTS()` 之前调用 `AddGlobalTestEnvironment()`，通常这发生在 `main()` 中。
如果你链接了 `gtest_main`，你需要在 `main()` 运行之前调用此函数以使测试环境生效。
这可以通过定义全局变量来实现：

```cpp
testing::Environment* const foo_env = testing::AddGlobalTestEnvironment(new FooEnvironment);
```

然而，我们强烈建议你使用自己编写的 `main()` 来调用 `AddGlobalTestEnvironment()`，
因为依赖于全局变量的初始化会影响代码的可读性，
且跨编译单元时全局变量的初始化顺序可能导致一些问题（编译器不保证不同编译单元中的全局变量的初始化顺序）。

## 值参数化测试

**值参数化测试**（_value-parameterized test_）允许你使用不同的参数来测试代码，而无需为同一测试编写多个副本。
这在很多场景中非常有用，例如：

- 有一段代码的行为受一个或多个命令行标志的影响，你需要确保代码在这些标志的不同取值下均能正确运行。
- 需要测试面向对象接口的不同实现。
- 希望对代码进行多种输入测试，这也称数据驱动测试（_data-driven test_）。此功能容易被滥用，使用时请务必保持审慎！

### 如何编写值参数化测试

要编写值参数化测试，首先你需要定义一个夹具类。
此类必须同时派生自 `testing::Test` 和 `testing::WithParamInterface<T>`（后者是纯接口类），其中 `T` 是参数值的类型。
为方便起见，你可以直接从 `testing::TestWithParam<T>` 派生夹具类，该类本身已继承上述两个基类。
`T` 可以是任意可拷贝的类型。
如果它是一个原始指针，你需要负责管理所指对象的生命周期。

::: warning
如果你的测试夹具定义了 `SetUpTestSuite()` 或 `TearDownTestSuite()`，
为了使用 `TEST_P` 宏，这些方法必须声明为 **public** 而非 **protected**。
:::

```cpp
class FooTest : public testing::TestWithParam<absl::string_view> {
  // 此处可照常实现夹具类的成员
  // 要访问测试参数，可调用 TestWithParam<T> 类的 GetParam() 方法
};

// 如果你需要向已有夹具类添加参数：
class BaseTest : public testing::Test {
  ...
};
class BarTest : public BaseTest,
                public testing::WithParamInterface<absl::string_view> {
  ...
};
```

接着，使用 `TEST_P` 宏定义任意数量的基于此夹具的测试模式（_test pattern_）。
`_P` 后缀代表“参数化”（_parameterized_）或“模式”（_pattern_），可按喜好理解。

```cpp
TEST_P(FooTest, DoesBlah) {
  // 在测试内部，通过 TestWithParam<T> 类的 GetParam() 方法访问参数
  EXPECT_TRUE(foo.Blah(GetParam()));
  ...
}

TEST_P(FooTest, HasBlahBlah) {
  ...
}
```

最后，使用 `INSTANTIATE_TEST_SUITE_P` 宏来实例化测试套件。
GoogleTest 提供了多种测试参数的生成函数，详细信息请参阅测试参考手册中的 [INSTANTIATE_TEST_SUITE_P](<!-- TODO:reference/testing.md#INSTANTIATE_TEST_SUITE_P -->)。

例如，以下语句将使用 [`Values`](<!-- TODO:reference/testing.md#param-generators -->) 参数生成器，
分别以 `"meeny"`、`"miny"` 和 `"moe"`为参数来实例化 `FooTest` 测试套件：

```cpp
INSTANTIATE_TEST_SUITE_P(MeenyMinyMoe,
                         FooTest,
                         testing::Values("meeny", "miny", "moe"));
```

::: warning
上述代码必须置于全局或命名空间作用域，而非函数作用域。
:::

`INSTANTIATE_TEST_SUITE_P` 的第一个参数是测试套件实例的唯一名称，
第二个参数是测试模式的名称，最后一个参数是[参数生成器](<!-- TODO:reference/testing.md#param-generators -->)。

参数生成器表达式在 GoogleTest 初始化（调用 `InitGoogleTest()`）之后才会被求值。
因此，在 `main` 函数中进行的初始化操作（如使用命令行标志解析结果）都可在参数生成器中使用。

可以多次实例化同一测试模式，为区分不同实例，实例名称会作为前缀添加到实际测试套件名称前。
因此，请为不同实例选择唯一前缀。
上述实例生成的测试名称如下：

- `MeenyMinyMoe/FooTest.DoesBlah/0` 对应 `"meeny"`
- `MeenyMinyMoe/FooTest.DoesBlah/1` 对应 `"miny"`
- `MeenyMinyMoe/FooTest.DoesBlah/2` 对应 `"moe"`
- `MeenyMinyMoe/FooTest.HasBlahBlah/0` 对应 `"meeny"`
- `MeenyMinyMoe/FooTest.HasBlahBlah/1` 对应 `"miny"`
- `MeenyMinyMoe/FooTest.HasBlahBlah/2` 对应 `"moe"`

你可以在 [`--gtest_filter`](#running-a-subset-of-the-tests) 中使用这些名称。

以下语句使用 [`ValuesIn`](<!-- TODO:reference/testing.md#param-generators -->)
参数生成器，以 `"cat"` 和 `"dog"` 为参数再次实例化 `FooTest`：

```cpp
constexpr absl::string_view kPets[] = {"cat", "dog"};
INSTANTIATE_TEST_SUITE_P(Pets, FooTest, testing::ValuesIn(kPets));
```

生成的测试名称如下：

- `Pets/FooTest.DoesBlah/0` 对应 `"cat"`
- `Pets/FooTest.DoesBlah/1` 对应 `"dog"`
- `Pets/FooTest.HasBlahBlah/0` 对应 `"cat"`
- `Pets/FooTest.HasBlahBlah/1` 对应 `"dog"`

::: note
`INSTANTIATE_TEST_SUITE_P` 会实例化给定测试套件中的**所有**测试，无论其定义在 `INSTANTIATE_TEST_SUITE_P` 语句之前还是之后。
:::

此外，默认情况下，每个没有相应实例化语句的 `TEST_P` 都会在测试套件 `GoogleTestVerification` 中产生一个失败。
如果你有一个测试套件是这种情况，且这种遗漏不是错误，
例如它位于一个可能因其他原因链接的库中，或者测试用例列表是动态的并且可能为空，那么可以标记该测试套件来抑制此检查：

```cpp
GTEST_ALLOW_UNINSTANTIATED_PARAMETERIZED_TEST(FooTest);
```

更多示例可以参考 [sample7_unittest.cc] 和 [sample8_unittest.cc]。

[sample7_unittest.cc]: https://github.com/google/googletest/blob/main/googletest/samples/sample7_unittest.cc '参数化测试示例'
[sample8_unittest.cc]: https://github.com/google/googletest/blob/main/googletest/samples/sample8_unittest.cc '具有多个参数的参数化测试示例'

### 创建值参数化抽象测试

在上述示例中，我们在**同一源文件**中定义并实例化了 `FooTest`。
有时你可能希望在库中定义值参数化测试，供其他开发者在后续实例化它们。
这种模式称为**抽象测试**（_abstract test_）。

例如，在设计接口时，你可以编写一套标准抽象测试（可能使用工厂函数作为测试参数），所有接口实现都应通过这些测试。
当他人实现该接口时，只需实例化你的测试套件即可实现接口一致性的测试。

要定义抽象测试，你应该像这样组织你的代码：

1. 将参数化测试夹具类（如 `FooTest`）的定义置于头文件（如 `foo_param_test.h`）中，视为**声明**抽象测试。
2. 将 `TEST_P` 定义放在包含 `foo_param_test.h` 的 `foo_param_test.cc` 中，视为**实现**该抽象测试。

抽象测试定义完成后，用户可通过包含 `foo_param_test.h`、调用 `INSTANTIATE_TEST_SUITE_P()` 并链接包含 `foo_param_test.cc` 的库来实例化这些测试。
抽象测试可以多次实例化，包括在不同的源文件中实例化。

### 指定值参数化测试参数名称

`INSTANTIATE_TEST_SUITE_P()` 的最后一个参数是一个可选参数，
允许用户指定一个函数或函数对象，根据测试参数生成自定义的测试名称后缀。
该函数应接受一个类型为 `testing::TestParamInfo<class ParamType>` 的参数，并返回 `std::string`。

`testing::PrintToStringParamName` 是内置的测试后缀生成器，返回 `testing::PrintToString(GetParam())` 的值。
此生成器不适用于 `std::string` 或 C 风格字符串。

::: warning
测试名称必须非空、唯一，并且只能包含 ASCII 字母数字字符。
特别要注意，名称[不应包含下划线](<!-- TODO:faq.md#why-should-test-suite-names-and-test-names-not-contain-underscore -->)。
:::

```cpp
class MyTestSuite : public testing::TestWithParam<int> {};

TEST_P(MyTestSuite, MyTest)
{
  std::cout << "Example Test Param: " << GetParam() << std::endl;
}

INSTANTIATE_TEST_SUITE_P(MyGroup, MyTestSuite, testing::Range(0, 10),
                         testing::PrintToStringParamName());
```

自定义函数对象可更精细地控制参数名称生成，特别是在自动转换无法生成友好名称的类型（如字符串）时。
以下示例展示了多参数（枚举类型和字符串）场景，并演示了如何组合生成器。

```cpp
enum class MyType { MY_FOO = 0, MY_BAR = 1 };

class MyTestSuite : public testing::TestWithParam<std::tuple<MyType, std::string>> { ... };

INSTANTIATE_TEST_SUITE_P(
    MyGroup, MyTestSuite,
    testing::Combine(
        testing::Values(MyType::MY_FOO, MyType::MY_BAR),
        testing::Values("A", "B")),
    [](const testing::TestParamInfo<MyTestSuite::ParamType>& info) {
      std::string name = absl::StrCat(
          std::get<0>(info.param) == MyType::MY_FOO ? "Foo" : "Bar",
          std::get<1>(info.param));
      absl::c_replace_if(name, [](char c) { return !std::isalnum(c); }, '_');
      return name;
    });
```

## 类型化测试

假设你有同一接口的多个实现，希望确保它们都满足某些共同约束。
又或者，你可能定义了多个应遵循同一“概念”（_concept_）的类型，并希望验证这一点。
在这两种情况下，你都需要为不同的类型重复相同的测试逻辑。

虽然可以为每个要测试的类型编写单独的 `TEST` 或 `TEST_F`（甚至可以将测试逻辑提取到函数模板中，并在 `TEST` 中调用它），但这种方法冗长且不易扩展：
如果想要对 $m$ 个类型进行 $n$ 项测试，最终需编写 $mn$ 个 `TEST`。

**类型化测试**（_typed test_）允许你为不同类型重复相同的测试逻辑。
你只需要写一份测试代码，尽管在编写时必须预知要测试的所有类型。
具体步骤如下：

::: steps

1. 定义一个夹具类模板，它接受一个类型的模板参数。

   ```cpp
   template <typename T>
   class FooTest : public testing::Test {
    public:
     ...
     using List = std::list<T>;
     static T shared_;
     T value_;
   };
   ```

2. 将夹具与一个类型列表关联，列表中的每一个类型都会执行夹具中定义的测试逻辑：

   ```cpp
   using MyTypes = ::testing::Types<char, int, unsigned int>;
   TYPED_TEST_SUITE(FooTest, MyTypes);
   ```

   这里使用类型别名是必要的，否则编译器会认为类型列表中的每个逗号都引入了一个新的宏参数。

3. 使用 `TYPED_TEST()` 替代 `TEST_F()` 为此测试套件定义类型化测试单元。

   ```cpp
   TYPED_TEST(FooTest, DoesBlah) {
     // 在测试内部，使用 TypeParam 获取类型参数
     // 由于位于派生类模板中，需通过 'this' 访问 FooTest 成员
     TypeParam n = this->value_;

     // 访问静态成员需添加 'TestFixture::' 前缀
     n += TestFixture::shared_;

     // 访问类型别名需添加 'typename TestFixture::' 前缀
     typename TestFixture::List values;

     values.push_back(n);
     ...
   }

   TYPED_TEST(FooTest, HasPropertyA) { ... }
   ```

:::

完整示例参见 [sample6_unittest.cc]。

[sample6_unittest.cc]: https://github.com/google/googletest/blob/main/googletest/samples/sample6_unittest.cc '类型化测试示例'

## 类型参数化测试

**类型参数化测试**（_type-parameterized test_）类似于类型化测试，但是无需预先知晓测试类型列表。
你可以先定义测试逻辑，后续再使用不同的类型列表进行实例化，甚至可以在同一个程序中多次实例化。

当设计接口或概念时，可以定义一套类型参数化测试来验证该接口/概念的实现应满足的性质。
之后，每个实现的作者只需用其类型来实例化测试套件即可验证该类型是否符合要求，而无需重复编写相似的测试代码。
以下为一个示例：

首先，跟类型化测试一样，定义一个夹具类模板：

```cpp
template <typename T>
class FooTest : public testing::Test {
  void DoSomethingInteresting();
  ...
};
```

接着，声明你将定义一个类型参数化测试套件：

```cpp
TYPED_TEST_SUITE_P(FooTest);
```

然后，使用 `TYPED_TEST_P()` 来定义类型参数化测试单元：

```cpp
TYPED_TEST_P(FooTest, DoesBlah) {
  // 在测试内部，使用 TypeParam 获取类型参数
  TypeParam n = 0;

  // 访问夹具成员需显式使用 this 指针
  this->DoSomethingInteresting()
  ...
}

TYPED_TEST_P(FooTest, HasPropertyA) { ... }
```

关键步骤：在实例化前，你需要使用 `REGISTER_TYPED_TEST_SUITE_P` 宏注册所有测试模式。
宏的第一个参数是测试套件名称，其余参数是测试套件下所有测试单元的名称：

```cpp
REGISTER_TYPED_TEST_SUITE_P(FooTest,
                            DoesBlah, HasPropertyA);
```

最后，你可以自由地用不同的类型列表来实例化该测试模式。

```cpp
using MyTypes = ::testing::Types<char, int, unsigned int>;
INSTANTIATE_TYPED_TEST_SUITE_P(My, FooTest, MyTypes);
```

`INSTANTIATE_TYPED_TEST_SUITE_P` 宏的第一个参数是添加到实际测试套件名称前的唯一前缀，用来区分不同的实例。

当类型列表仅含单一类型时，可直接指定类型而无需使用 `::testing::Types<...>`：

```cpp
INSTANTIATE_TYPED_TEST_SUITE_P(My, FooTest, int);
```

完整示例参见 [sample6_unittest.cc]。

## 测试私有代码

当你修改了软件的内部实现时，只要变更对用户不可见，测试就不应该失败。
因此，**遵循黑盒测试原则，大多数情况下应通过公共接口进行测试。**

**如果你仍然发现自己需要测试内部实现代码，最好重新评估设计的合理性。**
测试内部实现的需求往往意味着单一类承担了过多职责。
你可考虑提取实现类进行单独测试，然后在原类中使用该实现类。

若必须测试非公开接口代码，可采用下列特殊技术：

### 处理静态函数或匿名命名空间

静态函数和匿名命名空间中的定义/声明仅对同一翻译单元可见。
为了测试它们，你可以在测试文件 `*_test.cc` 中包含要被测试的整个 `.cc` 文件。
（这通常不是一个好选择，不推荐生产环境使用此方式。）

我们更推荐的做法是将私有代码移至 `foo::internal` 命名空间中，并将对应的声明置于 `*-internal.h` 文件。
生产代码和测试代码均可包含此内部头文件，但其对客户端代码不可见。
这样就可以在不泄露内部实现给客户端的情况下测试内部实现。

### 处理类的私有或受保护成员

类的私有成员只能从类内部或友元访问。
要访问类的私有成员，可以将测试夹具声明为类的友元，并在夹具中定义相应的访问器。
使用该夹具的测试单元可以通过夹具中的访问器来访问生产类的私有成员。

::: note
即使测试夹具是生产类的友元，测试单元也不会自动成为其友元，因为在实现细节上测试单元实际是测试夹具的派生类。
:::

你也可以选择将私有方法重构为一个实现类，然后在 `*-internal.h` 文件中声明它。
客户端不能包含此头文件，但测试代码可以。
这被称为 [Pimpl](https://www.gamedev.net/articles/programming/general-and-gameplay-programming/the-c-pimpl-r1794/) 模式。

GoogleTest 还提供了一个宏，允许你将单个测试单元声明为类的友元：

```cpp
FRIEND_TEST(TestSuiteName, TestName);
```

示例如下：

::: code-tabs
@tab foo.h

```cpp
class Foo {
  ...
 private:
  FRIEND_TEST(FooTest, BarReturnsZeroOnNull);

  int Bar(void* x);
};
```

@tab foo_test.cc

```cpp
...
TEST(FooTest, BarReturnsZeroOnNull) {
  Foo foo;
  EXPECT_EQ(foo.Bar(NULL), 0);  // 使用 Foo 的私有成员 Bar()
}
```

:::

::: warning
使用 `FRIEND_TEST` 要求对应的测试夹具和测试单元必须定义在与生产类**完全相同的命名空间**中（不能是匿名或内联命名空间）。

如果要被测试的代码如下：

```cpp
namespace my_namespace {

class Foo {
  friend class FooTest;
  FRIEND_TEST(FooTest, Bar);
  FRIEND_TEST(FooTest, Baz);
  ... 类的定义 ...
};

}  // namespace my_namespace
```

相应的测试代码应该为：

```cpp
namespace my_namespace {

class FooTest : public testing::Test {
 protected:
  ...
};

TEST_F(FooTest, Bar) { ... }
TEST_F(FooTest, Baz) { ... }

}  // namespace my_namespace
```

:::

## "捕获" 失败 {#catching-failures}

如果你正在构建一个基于 GoogleTest 的测试工具，你想要测试该测试工具，你会使用什么框架来测试它？
当然是 GoogleTest。

问题在于：如何验证你的测试工具能否正确报告失败？
在那些通过抛出异常来报告失败的框架中，你可以捕获异常来进行断言。
但 GoogleTest 不使用异常，因此我们需要一些特殊方法来验证代码是否按预期产生失败。

`"gtest/gtest-spi.h"` 中包含了一些工具来实现这个功能。你可以使用

```cpp
EXPECT_FATAL_FAILURE(statement, substring);
```

来断言 `statement` 在当前线程中生成了一个致命失败，且其失败信息包含给定的 `substring`，或者使用

```cpp
EXPECT_NONFATAL_FAILURE(statement, substring);
```

来断言一个非致命失败。

注意，上述宏只能检测那些在当前线程中产生的失败。
如果 `statement` 创建了新线程，这些新线程中的失败将被忽略。
如果你想捕获来自其他线程的失败，可以改用以下宏：

```cpp
EXPECT_FATAL_FAILURE_ON_ALL_THREADS(statement, substring);
EXPECT_NONFATAL_FAILURE_ON_ALL_THREADS(statement, substring);
```

::: caution
Windows 平台暂不支持捕获多线程中的失败。
:::

由于技术原因，有以下限制：

1. 你不能将失败消息流式传输给上述任一宏。
2. `EXPECT_FATAL_FAILURE{_ON_ALL_THREADS}()` 中的 `statement` 不能使用局部非静态变量或 `this` 对象的非静态成员。
3. `EXPECT_FATAL_FAILURE{_ON_ALL_THREADS}()` 中的 `statement` 不能有返回值。

## 用编程方式手动注册测试

`TEST` 宏处理了绝大多数使用场景，但也有少数需要在运行时注册测试逻辑的情况。
为此，框架提供了 `::testing::RegisterTest`，允许调用者动态注册任意测试。

这是一个高级 API，仅在 `TEST` 宏不满足需求时使用。
在可能的情况下应优先使用 `TEST` 宏，它降低了调用此函数的大部分复杂性。

其函数签名如下：

```cpp
template <typename Factory>
TestInfo* RegisterTest(const char* test_suite_name, const char* test_name,
                       const char* type_param, const char* value_param,
                       const char* file, int line, Factory factory);
```

`factory` 参数是一个可调用的工厂对象（要求可移动构造）或函数指针，用于创建测试的实例，其所有权将转移给调用方。
该可调用对象的签名为 `Fixture*()`，其中 `Fixture` 是测试对应的夹具类。
使用相同 `test_suite_name` 注册的所有测试必须返回相同的夹具类型，这将在运行时检查。

框架会从 `factory` 推断夹具类，并为其调用 `SetUpTestSuite` 和 `TearDownTestSuite` 方法。

该函数必须在调用 `RUN_ALL_TESTS()` 之前调用，否则行为未定义。

使用案例示例：

```cpp
class MyFixture : public testing::Test {
 public:
  // 所有这些方法都是可选的，用法跟正常使用时一样
  static void SetUpTestSuite() { ... }
  static void TearDownTestSuite() { ... }
  void SetUp() override { ... }
  void TearDown() override { ... }
};

class MyTest : public MyFixture {
 public:
  explicit MyTest(int data) : data_(data) {}
  void TestBody() override { ... }

 private:
  int data_;
};

void RegisterMyTests(const std::vector<int>& values) {
  for (int v : values) {
    testing::RegisterTest(
        "MyFixture", ("Test" + std::to_string(v)).c_str(), nullptr,
        std::to_string(v).c_str(),
        __FILE__, __LINE__,
        // 此处必须将夹具类型作为返回类型
        [=]() -> MyFixture* { return new MyTest(v); });
  }
}
...
int main(int argc, char** argv) {
  testing::InitGoogleTest(&argc, argv);
  std::vector<int> values_to_test = LoadValuesFromConfig();
  RegisterMyTests(values_to_test);
  ...
  return RUN_ALL_TESTS();
}
```

## 获取当前测试的名称

有时函数可能需要知道当前正在运行的测试的名称。
例如，你可能正在使用测试夹具的 `SetUp()` 方法，根据正在运行的测试来设置基准文件名称（_golden file name_）。
[`TestInfo`](<!-- TODO:reference/testing.md#TestInfo -->) 类包含这些信息。

要获取当前运行测试的 `TestInfo` 对象，可以调用 [`UnitTest`](<!-- TODO:reference/testing.md#UnitTest -->) 单例对象的 `current_test_info()` 方法：

```cpp
// 获取当前运行测试的信息。
// 请勿删除返回的对象 - 它由 UnitTest 类管理
const testing::TestInfo* const test_info =
    testing::UnitTest::GetInstance()->current_test_info();

printf("We are in test %s of test suite %s.\n",
       test_info->name(),
       test_info->test_suite_name());
```

如果当前没有测试在运行，`current_test_info()` 返回空指针。

::: warning
你无法在 `SetUpTestSuite()` 和 `TearDownTestSuite()` 中或是从它们调用的函数中获取当前测试套件的名称，因为此时测试尚未运行。
不过这时你一般已经隐式知道了测试套件的名称，通常不需要额外获取。
:::

## 通过事件处理扩展 GoogleTest

GoogleTest 提供了**事件监听器**（_event listener_） API，允许你监听测试程序进度和测试失败事件。
可监听的事件包括测试程序、测试套件或测试单元的开始与结束等。
你可以使用此 API 来改善或替换标准控制台输出、替换 XML 输出，或提供完全不同的输出形式（如 GUI 或数据库）。
你还可以通过监听测试事件来实现资源泄漏检查器等。

### 定义事件监听器

要定义事件监听器（_event listener_），你可以派生
[`testing::TestEventListener`](<!-- TODO:reference/testing.md#TestEventListener -->)
或 [`testing::EmptyTestEventListener`](<!-- TODO:reference/testing.md#EmptyTestEventListener -->)。
前者是一个接口，可以重写每个纯虚函数以处理测试事件（例如，测试开始时将调用 `OnTestStart()` 方法）。
后者为接口中所有方法提供了空实现，使得派生类只需要重写它关心的方法。

事件触发时，其上下文会作为参数传递给处理函数。
使用的参数类型包括：

- `UnitTest` 反映整个测试程序的状态。
- `TestSuite` 包含某个测试套件的信息。
- `TestInfo` 反映某个测试单元的状态，
- `TestPartResult` 反映某个测试断言的结果。

事件处理函数可通过检查接收到的参数，获取事件相关信息和测试程序状态。

示例：

```cpp
class MinimalistPrinter : public testing::EmptyTestEventListener {
  // 测试单元开始前调用
  void OnTestStart(const testing::TestInfo& test_info) override {
    printf("*** Test %s.%s starting.\n",
           test_info.test_suite_name(), test_info.name());
  }

  // 在断言失败或 Success() 后调用
  void OnTestPartResult(const testing::TestPartResult& test_part_result) override {
    printf("%s in %s:%d\n%s\n",
           test_part_result.failed() ? "*** Failure" : "Success",
           test_part_result.file_name(),
           test_part_result.line_number(),
           test_part_result.summary());
  }

  // 测试单元结束后调用
  void OnTestEnd(const testing::TestInfo& test_info) override {
    printf("*** Test %s.%s ending.\n",
           test_info.test_suite_name(), test_info.name());
  }
};
```

### 使用事件监听器

要使用自定义的事件监听器，需要在调用 `RUN_ALL_TESTS()` 之前，
将其实例添加到 GoogleTest 事件监听器列表中（由 [TestEventListeners](<!-- TODO:reference/testing.md#TestEventListeners -->) 类管理）：

```cpp
int main(int argc, char** argv) {
  testing::InitGoogleTest(&argc, argv);
  // 获取事件监听器列表
  testing::TestEventListeners& listeners =
      testing::UnitTest::GetInstance()->listeners();
  // 添加监听器（所有权转移给 GoogleTest）
  listeners.Append(new MinimalistPrinter);
  return RUN_ALL_TESTS();
}
```

现在还有一个问题：默认的结果打印器依然有效，因此它的输出会与你的自定义监听器的输出混杂在一起。
你可以加下面一行代码来移除默认的结果打印器。

```cpp
...
delete listeners.Release(listeners.default_result_printer());
listeners.Append(new MinimalistPrinter);
return RUN_ALL_TESTS();
```

现在，你可以看到一个与默认的测试结果完全不同的输出样式。
完整示例参见 [sample9_unittest.cc]。

[sample9_unittest.cc]: https://github.com/google/googletest/blob/main/googletest/samples/sample9_unittest.cc '事件监听器示例'

你可以添加多个事件监听器。
`On*Start()` 事件和 `OnTestPartResult()` 将按照监听器添加的顺序依次调用，
而 `On*End()` 事件将逆序调用。
这种调用方式有助于形成更加层次化的输出信息。

### 在监听器中生成失败

在处理事件时可以使用会生成失败的断言宏（`EXPECT_*()`、`ASSERT_*()`、`FAIL()` 等），但有以下限制：

1. 禁止在 `OnTestPartResult()` 中生成失败，这会导致递归调用。
2. 处理 `OnTestPartResult()` 的监听器不允许生成任何失败。

在添加监听器时，应将处理 `OnTestPartResult()` 的监听器放在可能生成失败的监听器之前，确保产生的失败能被正确归因。

完整示例参见 [sample10_unittest.cc]。

[sample10_unittest.cc]: https://github.com/google/googletest/blob/main/googletest/samples/sample10_unittest.cc '生成失败的监听器示例'

## 运行测试程序：高级选项

GoogleTest 测试程序是标准可执行文件。
构建完成后，你可以直接运行它，并通过环境变量和命令行标志（_command line flag_）来控制其行为。
程序必须在调用 `RUN_ALL_TESTS()` 之前调用 `::testing::InitGoogleTest()` 函数，才能正确解析命令行标志。

执行测试程序时添加 `--help` 标志可查看完整的选项列表及其用法说明。

当同一选项同时通过环境变量和命令行标志设置时，命令行标志的配置优先级更高。

::: note
下文中提到的设置环境变量，如无特定参数，则要求环境变量为非零值。
:::

### 选择测试用例

#### 列出可用测试

有时需要在运行测试前先列出程序中的所有可用测试，以便在需要时应用过滤器。
使用 `--gtest_list_tests` 标志可以覆盖所有其他标志，并以以下格式列出测试：

```ansi
TestSuite1.
  TestName1
  TestName2
TestSuite2.
  TestName
```

若提供该标志，列出的测试实际上不会被执行。
此标志没有对应的环境变量。

#### 运行测试的子集 {#running-a-subset-of-the-tests}

默认情况下，测试程序会运行用户定义的所有测试。
有时，你可能只想运行测试的一个子集（例如用于调试或快速验证更改）。
你可以将 `GTEST_FILTER` 环境变量或 `--gtest_filter` 标志设置为过滤器字符串，
GoogleTest 将仅运行全名（格式为 `TestSuiteName.TestName`）匹配该过滤器的测试。

过滤器是由 `:` 分隔的通配符模式列表（称为**正向模式**，_positive pattern_），
后面可以跟一个 `-` 和另一个由 `:` 分隔的模式列表（称为**反向模式**，_negative pattern_）。
仅当测试匹配任意正向模式且不匹配任何反向模式时，才会被运行。

模式可以包含 `*`（匹配任意字符串）或 `?`（匹配任意单个字符）。
为方便使用，过滤器 `*-NegativePatterns` 可简写为 `-NegativePatterns`。

示例：

- `./foo_test` 无标志，将运行所有测试。
- `./foo_test --gtest_filter=*` 运行全部测试（`*` 匹配所有内容）。
- `./foo_test --gtest_filter=FooTest.*` 运行测试套件 `FooTest` 中的所有测试。
- `./foo_test --gtest_filter=*Null*:*Constructor*` 运行全名包含 `Null` 或 `Constructor` 的测试。
- `./foo_test --gtest_filter=-*DeathTest.*` 运行所有非死亡测试。
- `./foo_test --gtest_filter=FooTest.*-FooTest.Bar` 运行套件 `FooTest` 除 `FooTest.Bar` 外的所有测试。
- `./foo_test --gtest_filter=FooTest.*:BarTest.*-FooTest.Bar:BarTest.Foo` 运行套件 `FooTest` 除 `FooTest.Bar` 外，以及套件 `BarTest` 除 `BarTest.Foo` 外的所有测试。

#### 首次失败后终止测试

默认情况下，GoogleTest 会运行所有定义的测试。
在某些场景下（如迭代测试开发），可能需要在首次测试失败后立即停止，以完整性换取执行速度。
若设置了 `GTEST_FAIL_FAST` 环境变量或 `--gtest_fail_fast` 标志，测试运行器将在发现第一个失败测试后立即停止执行。

#### 临时禁用测试

若存在暂时无法修复的损坏测试，可在其名称前添加 `DISABLED_` 前缀来禁用它。
这比直接注释掉代码或使用 `#if 0` 要好，因为被禁用的测试仍会被编译，可以避免代码腐化。

如果你想禁用整个测试套件中的所有测试，可以直接在套件名称前添加 `DISABLED_`。

例如，以下测试虽会被编译，但不会被执行：

```cpp
TEST(FooTest, DISABLED_DoesAbc) { ... }

class DISABLED_BarTest : public testing::Test { ... };

TEST_F(DISABLED_BarTest, DoesXyz) { ... }
```

::: note
此功能仅用于临时缓解问题，后续仍需修复被禁用的测试。
GoogleTest 会在包含禁用测试时显示警示信息。
:::

::: tip
可以使用 `grep` 统计被禁用的测试的数量，并将该数值作为测试质量改进的指标。
:::

#### 临时启用禁用的测试

如果要运行被禁用的测试，可以设置 `GTEST_ALSO_RUN_DISABLED_TESTS` 环境变量或使用 `--gtest_also_run_disabled_tests` 标志。
配合 `--gtest_filter` 标志可以进一步筛选要运行的禁用测试。

### 强制至少有一个测试用例

开发过程中可能出现测试程序不包含任何测试用例的情况，例如将测试用例定义在忘记链接的库中。
GoogleTest 提供了验证机制来捕获此类配置错误。
你可以使用 `--gtest_fail_if_no_test_linked` 标志或设置 `GTEST_FAIL_IF_NO_TEST_LINKED` 环境变量来启用该机制。

::: note
只要存在任意有效测试用例（包括被禁用的用例），都视为验证通过。
:::

### 重复运行测试

有些测试的结果可能不稳定，例如它有 1% 的机率失败，这使得复现错误变得相当困难。

`--gtest_repeat` 标志允许你多次重复运行程序中的所有（或选定的）测试，具体用法如下：

```bash
# 重复测试 1000 次，且遇到失败不中断
foo_test --gtest_repeat=1000

# 无限重复测试
foo_test --gtest_repeat=-1

# 重复 foo_test 1000 次，遇到失败后停止
# 这对使用调试器调试程序很有帮助，当测试失败时，你可以进行调试模式来调试程序
foo_test --gtest_repeat=1000 --gtest_break_on_failure

# 配合过滤器使用
foo_test --gtest_repeat=1000 --gtest_filter=FooBar.*
```

每次迭代中默认会重建测试环境，包括运行[全局 SetUp/TearDown](#global-set-up-and-tear-down) 代码，因为它们也可能导致不稳定性。
可以通过设置 `--gtest_recreate_environments_when_repeating=false` 标志来禁用。

同理，你也可以设置相应的环境变量来实现上述操作。

### 打乱测试顺序

你可以设置 `GTEST_SHUFFLE` 环境变量或使用 `--gtest_shuffle` 来打乱测试运行顺序，暴露其中隐藏的依赖关系。

默认情况下，GoogleTest 会使用基于当前时间生成的随机种子，因此每次运行程序都将得到不同的运行顺序。
在运行测试时，控制台将打印随机种子的值，便于问题的复现。
你可以使用 `--gtest_random_seed=SEED` 或 `GTEST_RANDOM_SEED` 环境变量来指定一个 $[0, 99999]$ 之间的整数作为随机种子。
如果指定 0 作为随机种子，GoogleTest 将采用默认行为。

当结合 `--gtest_repeat` 标志使用时，GoogleTest 会在每次迭代使用不同的种子重新打乱运行顺序。

### 在多台机器上并行运行测试

如果你有多台机器可以用于运行测试程序，你可能希望并行运行测试以更快获得结果。
我们称这种技术为**分片**（_sharding_），其中每台机器被称为一个**分片**（_shard_）。

GoogleTest 兼容分片功能。
要利用此功能，你的测试运行器（不是 GoogleTest 的一部分）需要执行以下操作：

::: steps

1. 分配一定数量的机器（分片）来运行测试。
1. 在每个分片上，设置 `GTEST_TOTAL_SHARDS` 环境变量为总分片数。
   该数值在所有分片中必须相同。
1. 在每个分片上，设置 `GTEST_SHARD_INDEX` 环境变量为对应分片的索引。
   不同的分片必须分配不同的索引，且在范围 `[0, GTEST_TOTAL_SHARDS - 1]` 内。
1. 在所有分片上运行相同的测试程序。
   当 GoogleTest 检测到上述两个环境变量时，会选择运行测试单元的一个子集。
   在所有分片中，每个测试单元都将恰好运行一次。
1. 等待所有分片完成测试后，收集并报告结果。
   :::

你的项目可能包含那些非 GoogleTest 编写的测试用例，这些用例无法理解此协议。
为了让测试运行器能识别那些支持分片的测试程序，可以设置环境变量 `GTEST_SHARD_STATUS_FILE` ，指向一个不存在的文件路径。
如果测试程序支持分片，它将创建这个文件。
目前文件的具体内容并不重要，不过未来我们可能会在其中添加有用信息。

以下示例有助于理解该机制。假设你有一个包含 5 个测试单元的测试程序 `foo_test`：

```cpp
TEST(A, V)
TEST(A, W)
TEST(B, X)
TEST(B, Y)
TEST(B, Z)
```

假设你有 3 台可用机器。
要并行运行测试，你需要在所有机器上将 `GTEST_TOTAL_SHARDS` 设为 3，并分别设置 `GTEST_SHARD_INDEX` 为 0、1 和 2，
然后在每台机器上运行相同的 `foo_test` 程序。

GoogleTest 保留更改分片任务分配方式的权利，这里仅展示一种可能的分配场景：

- 机器 #0 运行 `A.V` 和 `B.X`
- 机器 #1 运行 `A.W` 和 `B.Y`
- 机器 #2 运行 `B.Z`

### 控制测试输出

#### 终端彩色输出

GoogleTest 可以在终端输出中使用颜色标记，以便快速识别关键信息：

<!-- TODO: 更好的展示形式，例如 ansi 终端渲染 -->

<Card><pre>
...
<font color="green">[----------]</font> 1 test from FooTest
<font color="green">[ RUN ]</font> FooTest.DoesAbc
<font color="green">[ OK ]</font> FooTest.DoesAbc
<font color="green">[----------]</font> 2 tests from BarTest
<font color="green">[ RUN ]</font> BarTest.HasXyzProperty
<font color="green">[ OK ]</font> BarTest.HasXyzProperty
<font color="green">[ RUN ]</font> BarTest.ReturnsTrueOnSuccess
... 一些错误消息 ...
<font color="red">[ FAILED ]</font> BarTest.ReturnsTrueOnSuccess
...
<font color="green">[==========]</font> 30 tests from 14 test suites ran.
<font color="green">[ PASSED ]</font> 28 tests.
<font color="red">[ FAILED ]</font> 2 tests, listed below:
<font color="red">[ FAILED ]</font> BarTest.ReturnsTrueOnSuccess
<font color="red">[ FAILED ]</font> AnotherTest.DoesXyz

2 FAILED TESTS

</pre></Card>

通过设置 `GTEST_COLOR` 环境变量或 `--gtest_color` 命令行标志为 `yes`、`no` 或 `auto`（默认值），
可分别强制启用颜色、禁用颜色或让 GoogleTest 自己决定。
当值为 `auto` 时，GoogleTest 仅在输出到终端且（在非 Windows 平台上）`TERM` 环境变量设置为 `xterm` 或 `xterm-color` 时启用颜色。

#### 隐藏测试通过的信息

默认情况下，GoogleTest 为每个测试输出一行信息，指示其通过或失败。
通过设置 `--gtest_brief` 标志或 `GTEST_BRIEF` 环境变量，GoogleTest 将展示失败的测试。

#### 隐藏测试运行时间

默认情况下，GoogleTest 打印每个测试的运行时间。
通过设置 `--gtest_print_time=0` 命令行标志或将 `GTEST_PRINT_TIME` 环境变量设为 `0` 可以隐藏该信息。

#### 禁用 UTF-8 文本输出

在断言失败时，GoogleTest 会打印 `string` 类型的预期值和实际值。
如果这些值包含非 ASCII 的 UTF-8 字符，GoogleTest 将同时打印相应的十六进制编码字符串和 UTF-8 文本。
如果你想禁用 UTF-8 文本输出，例如你的输出媒介不兼容 UTF-8，可以使用 `--gtest_print_utf8=0` 标志或将 `GTEST_PRINT_UTF8` 环境变量设为 `0`。

#### 生成 XML 报告 {#generating-an-xml-report}

GoogleTest 除常规文本输出外，还可生成详细的 XML 报告。
该报告包含每个测试的运行时间，有助于识别耗时较长的测试。

通过将 `GTEST_OUTPUT` 环境变量或 `--gtest_output` 标志设置为 `xml:path_to_output_file`，可以在给定位置生成相应的报告文件。
若仅指定 `xml`，则默认在当前目录下生成 `test_detail.xml` 文件。

如果指定一个目录（例如 Linux 上的 `xml:output/directory/` 或 Windows 上的 `xml:output\directory\`），
GoogleTest 会以测试程序名为基础，在该目录生成 XML 文件
（例如测试程序 `foo_test` 或 `foo_test.exe` 对应文件名 `foo_test.xml`）。
如果文件已经存在，GoogleTest 将选择一个不同的名称（如 `foo_test_1.xml`）以避免覆盖。

该报告格式基于 `junitreport` Ant 任务。
因为该格式最初是为 Java 设计的，GoogleTest 对其做了一些小修改以适配，如下所示：

```xml
<testsuites name="AllTests" ...>
  <testsuite name="test_case_name" ...>
    <testcase name="test_name" ...>
      <failure message="..."/>
      <failure message="..."/>
      <failure message="..."/>
    </testcase>
  </testsuite>
</testsuites>
```

- 根元素 `<testsuites>` 对应整个测试程序。
- `<testsuite>` 元素对应测试套件。
- `<testcase>` 元素对应测试单元。

例如，下面的程序

```cpp
TEST(MathTest, Addition) { ... }
TEST(MathTest, Subtraction) { ... }
TEST(LogicTest, NonContradiction) { ... }
```

可能生成如下报告：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<testsuites tests="3" failures="1" errors="0" time="0.035" timestamp="2011-10-31T18:52:42" name="AllTests">
  <testsuite name="MathTest" tests="2" failures="1" errors="0" time="0.015">
    <testcase name="Addition" file="test.cpp" line="1" status="run" time="0.007" classname="">
      <failure message="Value of: add(1, 1)&#x0A;  Actual: 3&#x0A;Expected: 2" type="">...</failure>
      <failure message="Value of: add(1, -1)&#x0A;  Actual: 1&#x0A;Expected: 0" type="">...</failure>
    </testcase>
    <testcase name="Subtraction" file="test.cpp" line="2" status="run" time="0.005" classname="">
    </testcase>
  </testsuite>
  <testsuite name="LogicTest" tests="1" failures="0" errors="0" time="0.005">
    <testcase name="NonContradiction" file="test.cpp" line="3" status="run" time="0.005" classname="">
    </testcase>
  </testsuite>
</testsuites>
```

一些重要属性的说明：

- `<testsuites>` 和 `<testsuite>` 元素的 `tests` 属性表示包含测试单元的数量，`failures` 属性表示失败的数量。
- `time` 属性以秒为单位记录测试单元、测试套件或整个测试程序的运行时间。
- `timestamp` 属性记录测试运行时的本地时间。
- `file` 和 `line` 属性记录测试对应的源码位置。
- 每个 `<failure>` 元素对应一个失败的断言。

#### 生成 JSON 报告

GoogleTest 也支持 JSON 报告。要生成 JSON 报告。
只需要将 `GTEST_OUTPUT` 环境变量或 `--gtest_output` 标志设置为 `json:path_to_output_file`。
详细的用法与 XML 报告类似。
如果仅指定 `xml`，则将在当前目录下生成 `test_detail.json` 文件。

生成的 JSON 报告遵循以下模式（_schema_）：

```json
{
  "$schema": "https://json-schema.org/schema#",
  "type": "object",
  "definitions": {
    "TestCase": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "tests": { "type": "integer" },
        "failures": { "type": "integer" },
        "disabled": { "type": "integer" },
        "time": { "type": "string" },
        "testsuite": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/TestInfo"
          }
        }
      }
    },
    "TestInfo": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "file": { "type": "string" },
        "line": { "type": "integer" },
        "status": {
          "type": "string",
          "enum": ["RUN", "NOTRUN"]
        },
        "time": { "type": "string" },
        "classname": { "type": "string" },
        "failures": {
          "type": "array",
          "items": {
            "$ref": "#/definitions/Failure"
          }
        }
      }
    },
    "Failure": {
      "type": "object",
      "properties": {
        "failures": { "type": "string" },
        "type": { "type": "string" }
      }
    }
  },
  "properties": {
    "tests": { "type": "integer" },
    "failures": { "type": "integer" },
    "disabled": { "type": "integer" },
    "errors": { "type": "integer" },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "time": { "type": "string" },
    "name": { "type": "string" },
    "testsuites": {
      "type": "array",
      "items": {
        "$ref": "#/definitions/TestCase"
      }
    }
  }
}
```

该报告也遵循以下用 Proto3 定义的 [JSON 编码格式](https://developers.google.com/protocol-buffers/docs/proto3#json)：

```proto
syntax = "proto3";

package googletest;

import "google/protobuf/timestamp.proto";
import "google/protobuf/duration.proto";

message UnitTest {
  int32 tests = 1;
  int32 failures = 2;
  int32 disabled = 3;
  int32 errors = 4;
  google.protobuf.Timestamp timestamp = 5;
  google.protobuf.Duration time = 6;
  string name = 7;
  repeated TestCase testsuites = 8;
}

message TestCase {
  string name = 1;
  int32 tests = 2;
  int32 failures = 3;
  int32 disabled = 4;
  int32 errors = 5;
  google.protobuf.Duration time = 6;
  repeated TestInfo testsuite = 7;
}

message TestInfo {
  string name = 1;
  string file = 6;
  int32 line = 7;
  enum Status {
    RUN = 0;
    NOTRUN = 1;
  }
  Status status = 2;
  google.protobuf.Duration time = 3;
  string classname = 4;
  message Failure {
    string failures = 1;
    string type = 2;
  }
  repeated Failure failures = 5;
}
```

例如，下面的程序

```cpp
TEST(MathTest, Addition) { ... }
TEST(MathTest, Subtraction) { ... }
TEST(LogicTest, NonContradiction) { ... }
```

可能生成如下报告：

```json
{
  "tests": 3,
  "failures": 1,
  "errors": 0,
  "time": "0.035s",
  "timestamp": "2011-10-31T18:52:42Z",
  "name": "AllTests",
  "testsuites": [
    {
      "name": "MathTest",
      "tests": 2,
      "failures": 1,
      "errors": 0,
      "time": "0.015s",
      "testsuite": [
        {
          "name": "Addition",
          "file": "test.cpp",
          "line": 1,
          "status": "RUN",
          "time": "0.007s",
          "classname": "",
          "failures": [
            {
              "message": "Value of: add(1, 1)\n  Actual: 3\nExpected: 2",
              "type": ""
            },
            {
              "message": "Value of: add(1, -1)\n  Actual: 1\nExpected: 0",
              "type": ""
            }
          ]
        },
        {
          "name": "Subtraction",
          "file": "test.cpp",
          "line": 2,
          "status": "RUN",
          "time": "0.005s",
          "classname": ""
        }
      ]
    },
    {
      "name": "LogicTest",
      "tests": 1,
      "failures": 0,
      "errors": 0,
      "time": "0.005s",
      "testsuite": [
        {
          "name": "NonContradiction",
          "file": "test.cpp",
          "line": 3,
          "status": "RUN",
          "time": "0.005s",
          "classname": ""
        }
      ]
    }
  ]
}
```

::: important
JSON 文档的具体格式可能会发生变化。
:::

### 控制失败处理

#### 检测测试意外退出

GoogleTest 实现了**提前退出文件**（_premature-exit-file_）协议，帮助测试运行器捕获测试程序的意外退出行为。
在测试启动时，GoogleTest 会创建一个特殊文件，该文件将在所有测试任务完成后自动删除。
测试运行器通过检查该文件是否存在即可判断被测程序是否意外提前终止。

此功能仅在设置 `TEST_PREMATURE_EXIT_FILE` 环境变量后生效。

#### 将断言失败转为断点

在调试器中运行测试程序时，如果调试器在断言失败后可以自动进入交互模式，对调试将很有帮助。
GoogleTest 的**失败时中断**（_break-on-faliure_）模式提供了这一功能。

可以通过设置 `GTEST_BREAK_ON_FAILURE` 环境变量或使用 `--gtest_break_on_failure` 命令行标志来启用这一功能。

#### 禁用异常捕获机制

GoogleTest 同时兼容启用异常和禁用异常的编译环境。
默认情况下，当测试抛出 C++ 异常或 Windows 平台结构化异常（SEH）时，GoogleTest 会捕获异常并将其报告为测试失败，然后继续执行后续测试。
这种设计能最大化测试覆盖率，同时，可以避免 Windows 平台上因未捕获异常导致的弹窗问题。

然而，有时可能希望由调试器处理异常，以便在抛出异常时检查调用堆栈。
通过设置 `GTEST_CATCH_EXCEPTIONS` 环境变量为 `0` 或者使用 `--gtest_catch_exceptions=0` 标志即可禁用异常捕获机制。

### 与检测器（_Sanitizer_） 集成

[未定义行为检测器](https://clang.llvm.org/docs/UndefinedBehaviorSanitizer.html)、
[地址检测器](https://github.com/google/sanitizers/wiki/AddressSanitizer)
和[线程检测器](https://github.com/google/sanitizers/wiki/ThreadSanitizerCppManual)
都提供了可覆盖的弱函数（_weak funciton_），
可以通过覆盖这些函数，在检测到错误时触发显式失败。
实现方法是将以下函数定义添加到主二进制文件的源码中：

```cpp
extern "C" {
void __ubsan_on_report() {
  FAIL() << "Encountered an undefined behavior sanitizer error";
}
void __asan_on_error() {
  FAIL() << "Encountered an address sanitizer error";
}
void __tsan_on_report() {
  FAIL() << "Encountered a thread sanitizer error";
}
}  // extern "C"
```

当使用上述任一检测器编译项目时，若测试触发检测器错误，GoogleTest 将报告该测试失败。
