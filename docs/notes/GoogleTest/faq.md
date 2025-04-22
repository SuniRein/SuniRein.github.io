---
title: gTest 常见问题解答
createTime: 2025-04-10 21:35:01
permalink: /gtest/faq/
copyright:
  creation: translate
  source: https://google.github.io/googletest/faq.html
---

## 为什么测试套件名称和测试名称不应包含下划线？ {#names-not-contain-underscore}

::: note
除了下列原因外，GoogleTest 还保留下划线（`_`）用于特殊用途的关键字，例如
[`DISABLED_` 前缀](advanced.md#temporarily-disabling-tests)。
:::

下划线（`_`）具有特殊性，因为 C++ 保留以下情况供编译器和标准库使用：

1. 任何以 `_` 开头后跟大写字母的标识符
1. 任何名称中包含连续两个下划线（即 `__`）的标识符

用户代码被严格禁止使用此类标识符。

现在让我们看看这对 `TEST` 和 `TEST_F` 意味着什么。

目前 `TEST(TestSuiteName, TestName)` 会生成名为 `TestSuiteName_TestName_Test` 的类。
如果 `TestSuiteName` 或 `TestName` 包含 `_` 会发生什么？

1. 如果 `TestSuiteName` 以 `_` 开头后跟大写字母（例如 `_Foo`），将生成 `_Foo_TestName_Test`。
1. 如果 `TestSuiteName` 以 `_` 结尾（例如 `Foo_`），将生成 `Foo__TestName_Test`。
1. 如果 `TestName` 以 `_` 开头（例如 `_Bar`），将生成 `TestSuiteName__Bar_Test`。
1. 如果 `TestName` 以 `_` 结尾（例如 `Bar_`），将生成 `TestSuiteName_Bar__Test`。

这些都是保留标识符，不能使用。

因此显然 `TestSuiteName` 和 `TestName` 不能以 `_` 开头或结尾
（实际上，只要 `_` 后不跟大写字母，`TestSuiteName` 就可以以 `_` 开头。
但这样会使规则复杂化。
为简单起见，我们统一规定不能以 `_` 开头）。

看起来在名称中间使用 `_` 没有问题。
但考虑以下情况：

```cpp
TEST(Time, Flies_Like_An_Arrow) { ... }
TEST(Time_Flies, Like_An_Arrow) { ... }
```

这两个 `TEST` 宏会生成相同的类名（`Time_Flies_Like_An_Arrow_Test`），从而产生问题。

因此，为简化规则，我们要求用户在 `TestSuiteName` 和 `TestName` 中完全避免使用 `_`。
虽然该规则比实际需求更严格，但简单易记。
这也为 GoogleTest 未来的实现变化留有余地。

如果违反此规则，可能不会立即出现问题，
但使用新编译器（或新版本编译器）或新版本 GoogleTest 时，测试可能会崩溃。
因此最好遵守此规则。

## 为什么 GoogleTest 支持 `EXPECT_EQ(NULL, ptr)` 和 `ASSERT_EQ(NULL, ptr)`，但不支持 `EXPECT_NE(NULL, ptr)` 和 `ASSERT_NE(NULL, ptr)`？

首先，你可以使用 `nullptr` 来配合这些宏，
例如 `EXPECT_EQ(ptr, nullptr)`、`EXPECT_NE(ptr, nullptr)`、`ASSERT_EQ(ptr, nullptr)`、`ASSERT_NE(ptr, nullptr)`。
这是风格指南推荐的方式，因为 `nullptr` 没有 `NULL` 的类型问题。

由于 C++ 的特殊性，支持在 `EXPECT_XX()` 和 `ASSERT_XX()` 宏中使用 `NULL` 需要复杂的模板元编程技巧。
因此我们只在最需要的地方实现它（否则会使 GoogleTest 的实现更难维护且更易出错）。

历史上，`EXPECT_EQ()` 宏曾将**预期值**作为第一个参数，**实际值**作为第二个参数，不过现在不鼓励这种参数顺序。
用户确实需要编写 `EXPECT_EQ(NULL, some_expression)` 的需求是合理的，也确实被多次提出，因此我们实现了它。

对 `EXPECT_NE(NULL, ptr)` 的需求并不强烈。
当断言失败时，`ptr` 必为 `NULL`，因此打印 `ptr` 的值不会提供额外信息。
这意味着，`EXPECT_TRUE(ptr != NULL)` 同样有效。

如果支持 `EXPECT_NE(NULL, ptr)`，为了保持一致性也需要支持 `EXPECT_NE(ptr, NULL)`。
这将使实现中的模板元编程技巧使用次数翻倍，显著增加理解和维护难度。
我们认为收益不值得付出这样的成本。

最后，随着 gMock 匹配器库的发展，我们鼓励用户更多使用统一的 `EXPECT_THAT(value, matcher)` 语法。
匹配器方法的重要优势是可以轻松组合新匹配器，而 `EXPECT_NE` 等宏无法轻松组合。
因此我们更倾向于在匹配器上投入精力。

## 我需要测试接口的不同实现是否满足共同要求，应该使用类型化测试还是值参数化测试？

要验证同一接口的不同实现是否满足共同要求，类型化测试和值参数化测试均可适用。
具体选择取决于实际场景：

- 若不同实现实例的创建方式仅类型不同则**类型化测试**更易编写。例如：

  - 所有实现都具有公有默认构造函数（可使用 `new TypeParam`）。
  - 工厂函数形式统一（如 `CreateInstance<TypeParam>()`）。

- 若不同实现实例需要不同的创建模式则**值参数化测试**更适用。
  例如：`new Foo` vs `new Bar(5)`。
  要消除这种差异，可以编写工厂函数包装器，并将函数指针作为参数传递给测试。

- 调试信息差异：

  - 类型化测试失败时会默认输出类型名称，便于快速定位问题实现。
  - 值参数化测试默认仅显示失败迭代的编号。
    用户需通过定义迭代名称函数，作为第三个参数传递给 `INSTANTIATE_TEST_SUITE_P` 来加强输出信息。

- 使用类型化测试时，需确保测试是针对接口类型而非具体实现类型
  （即需验证 `implicit_cast<MyInterface*>(my_concrete_impl)` 有效，而不仅是 `my_concrete_impl` 有效）。
  值参数化测试在此方面更不易出错。

建议实践两种方法以深入理解其细微差异，通过实际体验更易做出合适选择。

## 死亡测试中的状态修改为何在测试结束后丢失？

死亡测试（`EXPECT_DEATH` 等）在子进程中执行，以确保预期的崩溃不会终止主测试进程。
因此，任何内存副作用仅存在于子进程中，主进程无法观测子进程状态变化。
可以将死亡测试视为在"平行宇宙"中运行。

特别指出，若在死亡测试调用模拟方法，主进程会认为调用从未发生。
因此，可能需要将 `EXPECT_CALL` 语句移动到 `EXPECT_DEATH` 内部。

## 在优化模式下使用 `EXPECT_EQ(htonl(blah), blah_blah)` 为何报编译错误？

该问题源于 `htonl()` 的实现缺陷：

根据 `'man htonl'` 文档，`htonl()` 本应作为函数存在，因此可被用作函数指针。
但在优化模式下，`htonl()` 被定义为宏，这违反了规范要求。

更严重的是，`htonl()` 的宏实现使用了 gcc 扩展语法，不符合标准 C++ 规范。
这种非标准实现存在特定限制，
例如无法在模板参数中使用 `Foo<sizeof(htonl(x))>` 这样的表达式（其中 `Foo` 是接受整型参数的模板）。

`EXPECT_EQ(a, b)` 的实现会在模板参数中使用 `sizeof(... a ...)`。
因此，当参数 `a` 包含 `htonl()` 调用时，在优化模式下将无法通过编译。
由于需要兼容不同编译器和平台，很难让 `EXPECT_EQ` 绕过这个 `htonl()` 的缺陷。

## 编译器报 `undefined references` 错误，但我已在类内定义相应的静态常量成员变量。问题出在哪里？

当类包含静态数据成员时：

```cpp title="foo.h"
class Foo {
  ...
  static const int kBar = 100;
};
```

仍需在 `foo.cc` 文件中进行外部定义：

```cpp title="foo.cc"
const int Foo::kBar; // 此处不需要初始化
```

否则将产生无效的 C++ 代码，可能导致意外错误。
特别是在 GoogleTest 的断言宏（如 EXPECT_EQ）中使用时，会引发 `undefined reference` 链接错误。
之前能运行并不意味着代码正确，只是侥幸成功。

若使用 `constexpr` 声明静态成员，则会隐式生成 `inline` 定义，此时无需在 `foo.cc` 中重复定义：

```cpp title="foo.h"
class Foo {
  ...
  static constexpr int kBar = 100;  // 直接定义 kBar，无需在 foo.cc 中重复
};
```

## 能否让测试夹具继承另一个夹具？

可以。

每个测试夹具对应唯一的一个同名测试套件，这意味着一个测试夹具只有一个测试套件可以使用。
但有时多个测试用例需要共享相似的夹具逻辑。
例如，确保 GUI 库的所有测试套件都不会泄漏字体、画笔等系统资源。

在 GoogleTest 中，可将共享逻辑放在基类夹具，然后为每个测试套件派生子类夹具。
使用 `TEST_F()` 编写基于派生夹具的测试。

典型实现如下：

```c++
// 定义基类测试夹具
class BaseTest : public ::testing::Test {
 protected:
  ...
};

// 从 BaseTest 派生 FooTest 夹具
class FooTest : public BaseTest {
 protected:
  void SetUp() override {
    BaseTest::SetUp();  // 先初始化基类夹具
    // ... 扩展初始化逻辑 ...
  }

  void TearDown() override {
    // ... FooTest 的清理逻辑 ...
    BaseTest::TearDown();  // 最后清理基类夹具
  }

  // ... FooTest 的成员函数和变量 ...
};

// 使用 FooTest 夹具的测试用例
TEST_F(FooTest, Bar) { ... }
TEST_F(FooTest, Baz) { ... }

// ... 其他从 BaseTest 派生的夹具 ...
```

如有需要，可继续继承派生夹具。
GoogleTest 对继承层次深度没有限制。

完整示例参见
[sample5_unittest.cc](https://github.com/google/googletest/blob/main/googletest/samples/sample5_unittest.cc)。

## 编译器报 `void value not ignored as it ought to be` 是什么意思？

此错误通常意味着您在非 `void` 函数中使用了 `ASSERT_*()` 断言。
由于 Google 的构建系统禁用了异常机制，`ASSERT_*()` 系列断言仅可在返回类型为 `void` 的函数中使用。
更多技术细节请参阅[可以使用断言的范围](advanced.md#assertion-placement)。

## 死亡测试卡死（或段错误）如何修复？

GoogleTest 的死亡测试在子进程中运行，其工作机制较为特殊。
编写死亡测试前必须理解其工作原理——详见断言参考中的[死亡断言](reference/assertions.md#death)章节。

特别要注意，死亡测试无法兼容父进程中存在多线程的情况。
首要解决方法是消除在 `EXPECT_DEATH()` 外部创建线程的行为，例如在测试中使用模拟对象替代真实对象。

有时这种情况不可避免，例如必须使用的某些库在 `main()` 函数执行前就创建线程时。
这时可通过两种方式降低冲突概率：
尽可能将更多操作移至 `EXPECT_DEATH()` 内部（极端情况下需移入全部操作），或尽量减少其外部依赖。
此外，可将死亡测试风格设为 `"threadsafe"`，这更安全但更慢。

若使用 `"threadsafe"` 死亡测试，需注意其会在子进程中从头重新运行测试程序。
因此必须确保程序能并行执行自身副本且具有确定性行为。

本质上，这属于并发编程的范畴。
用户必须确保程序中不存在竞态条件或死锁。
很遗憾，此问题没有通用解决方案！

## 我应该使用测试夹具的构造函数/析构函数还是 `SetUp()`/`TearDown()`？ {#CtorVsSetUp}

首先需要明确：GoogleTest 不会在多个测试之间复用同一个测试夹具对象。
对于每个 `TEST_F` 测试用例，GoogleTest 都会创建一个全新的测试夹具对象，
调用 `SetUp()` 方法，运行测试主体，调用 `TearDown()` 方法，然后删除该测试夹具对象。

当需要编写每个测试专用的设置和清理逻辑时，
可以选择使用测试夹具的构造函数/析构函数或 `SetUp()`/`TearDown()` 方法。
通常推荐使用前者，因为它具有以下优势：

- 通过在构造函数中初始化成员变量，可以将其声明为 `const` 类型，
  这有助于防止意外修改其值，使测试逻辑更加明确可靠。
- 当需要派生测试夹具类时，子类构造函数会首先调用基类构造函数，子类析构函数会最后调用基类析构函数。
  若使用 `SetUp()`/`TearDown()` 方法，子类可能忘记调用基类的对应方法或在错误时机调用。

不过，在以下场景中，则建议使用 `SetUp()`/`TearDown()`：

- C++ 不允许在构造函数和析构函数中调用虚函数。
  虽然可以调用声明为 `virtual` 的方法，但不会使用动态派发机制，而是使用当前执行构造函数所属类中的定义。
  这是因为，在派生类构造函数执行前调用虚函数可能操作未初始化数据，存在风险。
  因此，若需要调用会被派生类重写的方法，必须使用 `SetUp()`/ `TearDown()` 。
- 在构造函数（或析构函数）体内无法使用 `ASSERT_xx` 断言宏。
  如果设置操作可能导致需要中止当前测试的致命错误，必须使用 `abort` 终止整个测试程序，
  或改用 `SetUp()` 替代构造函数。
- 如果清理操作可能抛出异常，必须使用 `TearDown()` 而非析构函数，
  因为在析构函数中抛出异常会导致未定义行为（通常直接终止程序）。
  注意，当编译器启用异常时，许多标准库（如 STL）都可能抛出异常。
  因此，若需要编写兼容异常启用/禁用环境的可移植测试代码，应优先选择 `TearDown()` 。
- GoogleTest 团队正考虑在启用异常的平台上（如 Windows、Mac OS 和 Linux 客户端），将断言宏改为抛出异常。
  这将消除用户需要手动将子程序错误传递到调用方的需求。
  因此，如果代码可能运行在此类平台，不应在析构函数中使用 GoogleTest 断言。

## 使用 `ASSERT_PRED*` 时编译器报错 `no matching function to call`，如何解决？

请查阅断言参考中的 [`EXPECT_PRED*`](reference/assertions.md#EXPECT_PRED) 一节。

## 调用 `RUN_ALL_TESTS()` 时编译器警告 `ignoring return value`，原因为何？

有些开发者会忽略 `RUN_ALL_TESTS()` 的返回值，即不写：

```cpp
return RUN_ALL_TESTS();
```

而是写成：

```cpp
RUN_ALL_TESTS();
```

这是错误且危险的。
测试框架需要通过检查 `RUN_ALL_TESTS()` 的返回值来判断测试是否通过。
如果 `main()` 函数忽略该返回值，即使存在 GoogleTest 断言失败，测试仍会被判定为成功。

我们已决定修复此问题（感谢 Michael Chastain 的建议）。
现在，使用 gcc 编译时，代码将无法忽略 `RUN_ALL_TESTS()` 的返回值。
如果忽略，会导致编译错误。

如果编译器提示 `ignoring return value`，解决方法很简单：确保将其返回值作为 `main()` 函数的返回结果。

但这种改动是否会破坏现有测试？
事实上，此类代码原本就是错误的，因此我们并没有破坏现有有效代码。:-)

## 编译器提示构造函数（或析构函数）不能返回值，这是怎么回事？

由于 C++ 的语法限制，为了支持向 `ASSERT_*` 断言流式传输消息的语法，例如：

```cpp
ASSERT_EQ(1, Foo()) << "blah blah" << foo;
```

我们不得不禁止在构造函数和析构函数中使用 `ASSERT*` 和 `FAIL*` 系列宏（但 `EXPECT*` 和 `ADD_FAILURE*` 仍可用）。
解决方法是将构造函数/析构函数中的相关内容移至私有 `void` 成员函数中，或改用 `EXPECT_*()` 断言。
用户指南中的[此章节](advanced.md#assertion-placement)中对此有详细解释。

## `SetUp()` 函数未被调用，原因为何？

C++ 语言大小写敏感。
请检查是否误写为 `Setup()`？

类似地，有时开发者会将 `SetUpTestSuite()` 误拼为 `SetupTestSuite()`，导致该方法未被调用。

## 多个测试套件共享相同的测试夹具逻辑时，必须为每个套件定义新的夹具类吗？这样似乎太繁琐了

不需要重复定义。
你可以使用类型别名替代继承。

原始写法：

```cpp
class FooTest : public BaseTest {}; // [!code --]

TEST_F(FooTest, Abc) { ... }
TEST_F(FooTest, Def) { ... }

class BarTest : public BaseTest {}; // [!code --]

TEST_F(BarTest, Abc) { ... }
TEST_F(BarTest, Def) { ... }
```

优化写法（使用 `typedef`）：

```c++
typedef BaseTest FooTest; // [!code ++]

TEST_F(FooTest, Abc) { ... }
TEST_F(FooTest, Def) { ... }

typedef BaseTest BarTest; // [!code ++]

TEST_F(BarTest, Abc) { ... }
TEST_F(BarTest, Def) { ... }
```

## GoogleTest 输出被大量 LOG 消息淹没，如何解决？

GoogleTest 的输出设计被为简洁易读的测试报告。
若测试代码自身产生文本输出，会与框架输出混杂影响可读性。

由于 `LOG` 消息输出到 stderr，而 GoogleTest 的输出默认送往 stdout，可通过重定向分离两者：

```bash
./my_test > gtest_output.txt
```

## 为什么应该优先使用测试夹具而非全局变量？

有以下原因：

1. 测试修改全局变量状态，易导致副作用溢出进而影响其他测试，增加调试难度。
   使用夹具可为每个测试提供独立变量集（同名但不同实例），确保测试的隔离性。
1. 全局变量会污染全局命名空间。
1. 测试夹具可通过子类化复用，而全局变量难以实现此特性。
   这在多个测试套件存在共性时特别有用。

## `ASSERT_DEATH()` 中的 `statement` 参数可以是哪些形式？

`ASSERT_DEATH(statement, matcher)`（及所有死亡断言宏）可对任何有效 _`statement`_ 使用。
_`statement`_ 可以是当前上下文中任意有效的 C++ 语句。
它可以引用全局或局部变量，可以是：

- 简单的函数调用（常见形式）
- 复杂表达式
- 复合语句

示例如下：

```c++
// 简单的函数调用
TEST(MyDeathTest, FunctionCall) {
  ASSERT_DEATH(Xyz(5), "Xyz failed");
}

// 引用变量和函数的复杂表达式
TEST(MyDeathTest, ComplexExpression) {
  const bool c = Condition();
  ASSERT_DEATH((c ? Func1(0) : object2.Method("test")),
               "(Func1|Method) failed");
}

// 死亡断言可在函数内任意位置使用（包括循环内部）
TEST(MyDeathTest, InsideLoop) {
  // 验证 Foo(0) 到 Foo(4) 均会崩溃
  // Verifies that Foo(0), Foo(1), ..., and Foo(4) all die.
  for (int i = 0; i < 5; i++) {
    EXPECT_DEATH_M(Foo(i), "Foo has \\d+ errors",
                   ::testing::Message() << "where i is " << i);
  }
}

// 死亡断言可包含复合语句
TEST(MyDeathTest, CompoundStatement) {
  // 验证 Bar(0) 到 Bar(4) 至少有一个崩溃
  ASSERT_DEATH({
    for (int i = 0; i < 5; i++) {
      Bar(i);
    }
  },
  "Bar has \\d+ errors");
}
```

## 我定义了测试夹具类 `FooTest`，但 `TEST_F(FooTest, Bar)` 依旧报错 `no matching function for call to FooTest::FooTest()`，这是为什么？

GoogleTest 需要能够创建测试夹具类的对象，因此该类必须包含默认构造函数。
通常编译器会自动生成默认构造函数，但在以下情况需要手动定义：

- 如果为 `FooTest` 显式声明了非默认构造函数（例如使用 `DISALLOW_EVIL_CONSTRUCTORS()` 宏），
  则必须定义默认构造函数，即使为空实现。
- 如果 `FooTest` 包含 `const` 修饰的非静态数据成员，
  则必须定义默认构造函数，并在构造函数的初始化列表中初始化该成员。
  （早期 `gcc` 版本存在不强制要求初始化 `const` 成员的缺陷，该问题已在 `gcc 4` 中修复。）

## 为什么使用 `ASSERT_DEATH` 时 GoogleTest 要求将整个测试套件（而非单个测试）命名为 `*DeathTest`？

GoogleTest 不会交错运行不同测试套件中的测试。
也就是说，它会先运行完某个测试套件中的所有测试，在接着运行另一个测试套件中的所有测试，依此类推。
这样因为 GoogleTest 需要在首个测试运行前完成测试套件初始化，并在最后测试完成后执行清理工作。
如果拆分测试套件，会导致多次重复的初始化和清理操作，既降低效率又破坏语义清晰度。

如果允许测试名称为 `*DeathTest`，以下场景会产生矛盾：

```c++
TEST_F(FooTest, AbcDeathTest) { ... }
TEST_F(FooTest, Uvw) { ... }

TEST_F(BarTest, DefDeathTest) { ... }
TEST_F(BarTest, Xyz) { ... }
```

由于需要保证 `FooTest.AbcDeathTest` 在 `BarTest.Xyz` 之前运行，同时不同测试套件不交叉执行，
就必须先执行完整套件 `FooTest` 再执行 `BarTest` 。
这与 `BarTest.DefDeathTest` 需要在 `FooTest.Uvw` 之前运行的要求冲突。

## 我的测试套件同时包含死亡测试与普通测试，但我不想使用 `*DeathTest` 来命名整个套件，该怎么做？

可以使用类型别名将测试套件拆分为 `FooTest` 和 `FooDeathTest`：

```c++
class FooTest : public ::testing::Test { ... };

TEST_F(FooTest, Abc) { ... }
TEST_F(FooTest, Def) { ... }

using FooDeathTest = FooTest;

TEST_F(FooDeathTest, Uvw) { ... EXPECT_DEATH(...) ... }
TEST_F(FooDeathTest, Xyz) { ... ASSERT_DEATH(...) ... }
```

## GoogleTest 只会在死亡测试失败时打印子进程的日志信息，如何在测试成功时查看日志？

打印 `EXPECT_DEATH()` 中语句的日志信息会影响主进程的日志可读性，
因此 GoogleTest 只会在死亡测试失败时打印这些信息。

如需查看成功时的日志，可以尝试临时破坏死亡测试（例如，改变某个正则匹配要求）。
这确实有点不方便。
我们可能会在完成 `fork-and-exec` 风格死亡测试后提供一个永久解决方案。

## 使用断言时编译器报错 `no match for 'operator<<'`，如何解决？

当在断言中使用自定义类型 `FooType` 时，必须确保实现对应的流输出运算符，否则无法打印该类型：

```cpp
std::ostream& operator<<(std::ostream&, const FooType&)
```

此外，该 `<<` 运算符必须定义在与 `FooType` 相应的命名空间中。
详见 [Tip of the Week #49](https://abseil.io/tips/49)。

## 如何屏蔽 Windows 平台的内存泄漏警告？

由于静态初始化的 GoogleTest 单例对象需要申请堆内存，
Visual C++ 内存检测器会在程序结束时报告内存泄漏。
最简单的解决方法是使用 `_CrtMemCheckpoint` 和 `_CrtMemDumpAllObjectsSince`
来抑制所有静态初始化的堆内存对象的报告。
更多细节与堆检测/调试例程说明详见 MSDN 文档。

## 如何让代码检测是否运行在测试环境中？

若你编写代码来嗅探是否处于测试环境并据此执行不同操作，
相当于将测试专用逻辑泄漏到生产代码中，且无法保证测试专用逻辑不会意外在生产环境中运行。
这种“聪明”的做法还会导致[海森堡缺陷](https://en.wikipedia.org/wiki/Heisenbug)。
因此我们强烈反对这种做法，GoogleTest 也不提供相关支持。

通常，推荐使用[依赖注入](https://en.wikipedia.org/wiki/Dependency_injection)来实现不同环境下的差异化行为。
你可以为测试代码和生产代码分别注入不同功能。
由于生产代码完全不会链接测试逻辑（`BUILD` 目标的
[testonly](https://docs.bazel.build/versions/master/be/common-definitions.html#common.testonly)
属性可确保这点），因此不会存在误执行风险。

不过，如果你确实别无选择，且遵循了测试程序名以 `_test` 结尾的命名规范，
则可以使用检测可执行文件名（`main()` 中的 `argv[0]`）这种**极不推荐**的黑客方法来判断代码是否处于测试环境。

## 如何临时禁用某个测试？

对于无法立即修复的故障测试，可在测试名前添加 `DISABLED_` 前缀。
这将禁用测试的执行。
此方法优于注释代码或使用 `#if 0`，因为被禁用的测试仍会参与编译（避免代码腐化）。

要执行被禁用的测试，只需在运行测试程序时添加 `--gtest_also_run_disabled_tests` 标志。

## 是否允许在不同命名空间中定义同名 `TEST(Foo, Bar)` 测试？

允许。

核心原则是：**同一测试套件中的所有测试必须使用相同的夹具类**。
以下示例**允许**存在，因为两个测试都使用相同的夹具类（`::testing::Test`）：

```cpp
namespace foo {
TEST(CoolTest, DoSomething) {
  SUCCEED();
}
}  // namespace foo

namespace bar {
TEST(CoolTest, DoSomething) {
  SUCCEED();
}
}  // namespace bar
```

但以下代码**不被允许**，这将导致 GoogleTest 运行时错误，因为测试位于相同测试套件但使用了不同的夹具类：

```cpp
namespace foo {
class CoolTest : public ::testing::Test {};  // Fixture foo::CoolTest
TEST_F(CoolTest, DoSomething) {
  SUCCEED();
}
}  // namespace foo

namespace bar {
class CoolTest : public ::testing::Test {};  // Fixture: bar::CoolTest
TEST_F(CoolTest, DoSomething) {
  SUCCEED();
}
}  // namespace bar
```
