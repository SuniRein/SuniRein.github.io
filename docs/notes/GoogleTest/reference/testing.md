---
title: 测试参考
createTime: 2025-04-04 21:44:07
permalink: /gtest/ej8koszw/
copyright:
  creation: translate
  source: https://google.github.io/googletest/reference/testing.html
---

本文档列举了 GoogleTest 为编写测试程序提供的各项功能。
使用前需添加 `#include <gtest/gtest.h>` 头文件。

## 宏

GoogleTest 定义了以下宏来辅助编写测试。

### TEST {#TEST}

```cpp
TEST(TestSuiteName, TestName) {
  // ... statements ...
}
```

在测试套件 _`TestSuiteName`_ 中定义一个名为 _`TestName`_ 的测试单元，包含指定的语句集合。

参数 _`TestSuiteName`_ 和 _`TestName`_ 必须是有效的 C++ 标识符，且不得包含下划线（`_`）。
位于不同测试套件的测试单元可以拥有相同的名称。

测试体内的语句可以是任意被测代码。
测试结果由测试体内使用的[断言](TODO:assertions.md)决定。

### TEST_F {#TEST_F}

```cpp
TEST_F(TestFixtureName, TestName) {
  // ... statements ...
}
```

定义一个使用测试夹具类 _`TestFixtureName`_ 的测试单元 _`TestName`_。
相应测试套件的名称为 _`TestFixtureName`_。

参数 _`TestFixtureName`_ 和 _`TestName`_ 必须是有效的 C++ 标识符，且不得包含下划线（`_`）。
_`TestFixtureName`_ 必须是测试夹具类的名称（参见[测试夹具](../primer.md#same-data-multiple-tests)）。

测试体内的语句可以是任意被测代码。
测试结果由测试体内使用的[断言](TODO:assertions.md)决定。

### TEST_P {#TEST_P}

```cpp
TEST_P(TestSuiteName, TestName) {
  // ... statements ...
}
```

定义一个使用值参数化测试夹具类 _`TestFixtureName`_ 的测试单元 _`TestName`_。
相应测试套件的名称为 _`TestFixtureName`_。

参数 _`TestSuiteName`_ 和 _`TestName`_ 必须是有效的 C++ 标识符，且不得包含下划线（`_`）。
_`TestFixtureName`_ 必须是值参数化测试夹具类的名称（参见[值参数化测试](../advanced.md#value-parameterized-tests)）。

测试体内的语句可以是任意被测代码。
在测试体内，可通过 `GetParam()` 函数来访问测试参数（参见[`WithParamInterface`](#WithParamInterface)）。
例如：

```cpp
TEST_P(MyTestSuite, DoesSomething) {
  ...
  EXPECT_TRUE(DoSomething(GetParam()));
  ...
}
```

测试结果由测试体内使用的[断言](TODO:assertions.md)决定。

另见 [`INSTANTIATE_TEST_SUITE_P`](#INSTANTIATE_TEST_SUITE_P)。

### INSTANTIATE_TEST_SUITE_P {#INSTANTIATE_TEST_SUITE_P}

```cpp
INSTANTIATE_TEST_SUITE_P(InstantiationName, TestSuiteName, param_generator)
INSTANTIATE_TEST_SUITE_P(InstantiationName, TestSuiteName, param_generator, name_generator)
```

实例化使用 [`TEST_P`](#TEST_P) 定义的值参数化测试套件 _`TestSuiteName`_。

参数 _`InstantiationName`_ 是该测试套件实例的唯一标识，用于区分不同实例。
在测试输出中，实例名称将作为前缀添加到测试套件名称 _`TestSuiteName`_ 中。
若 _`InstantiationName`_ 为空（`INSTANTIATE_TEST_SUITE_P(, ...)`），则不添加前缀。

<span id="param-generators"></span>

参数 _`param_generator`_ 必须是下列 GoogleTest 提供的参数生成函数之一（均定义于 `::testing` 命名空间）：

| 参数生成器                                              | 行为                                                                                                                                                                                        |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Range(begin, end [, step])`                            | 生成值序列 `{begin, begin+step, begin+step+step, ...}`（不包括`end`）。 `step` 默认为 1。                                                                                                   |
| `Values(v1, v2, ..., vN)`                               | 生成值序列 `{v1, v2, ..., vN}`。                                                                                                                                                            |
| `ValuesIn(container)` 或 `ValuesIn(begin, end)`         | 基于 C 风格数组、STL 容器或迭代器范围 `[begin, end)` 生成值。                                                                                                                               |
| `Bool()`                                                | 生成布尔序列 `{false, true}`。                                                                                                                                                              |
| `Combine(g1, g2, ..., gN)`                              | 基于 $n$ 个生成器 `g_1`、`g_2`、...、`g_n` 生成 `std::tuple` 类型的 $n$ 元组（使用笛卡尔积）。                                                                                              |
| `ConvertGenerator<T>(g)` 或 `ConvertGenerator(g, func)` | 生成器 `g` 产生的值通过 `static_cast` 转换为 `T` 类型。（注意: `T` 类型可能与预期不符，详见下文[使用 ConvertGenerator](#using-convertgenerator)。）第二个可选参数 `func` 用于执行转换操作。 |

可选参数 _`name_generator`_ 是用于生成自定义测试名称后缀的函数。
该函数必须接受 [`TestParamInfo<class ParamType>`](#TestParamInfo) 类型参数并返回 `std::string`。
测试名称后缀只能包含字母、数字、字符和下划线。
可以使用 GoogleTest 提供的 [`PrintToStringParamName`](#PrintToStringParamName)，
或者使用自定义函数来实现更精细的控制：

```cpp
INSTANTIATE_TEST_SUITE_P(
    MyInstantiation, MyTestSuite,
    testing::Values(...),
    [](const testing::TestParamInfo<MyTestSuite::ParamType>& info) {
      // 可使用 info.param 来生成测试名称后缀
      std::string name = ...
      return name;
    });
```

更多信息请参考[值参数化测试](../advanced.md#value-parameterized-tests)。

另见 [`GTEST_ALLOW_UNINSTANTIATED_PARAMETERIZED_TEST`](#GTEST_ALLOW_UNINSTANTIATED_PARAMETERIZED_TEST)。

#### 使用 `ConvertGenerator` {#using-convertgenerator}

上表列出的函数看似返回生成特定类型值的生成器，但实际上通常返回可转换为目标生成器的工厂对象。
这种间接转换机制提供了类型灵活性，允许用户指定任意可隐式转换为夹具类所需参数类型的值。

例如，对于需要 `int` 类型参数的夹具，可执行以下操作：

```cpp
INSTANTIATE_TEST_SUITE_P(MyInstantiation, MyTestSuite,
    testing::Values(1, 1.2));  // Values() 支持异构参数类型
```

这里 `1.2`（`double` 类型）看似会隐式转换为 `int`，但实际上需要通过前文所述的间接转换机制实现。

若参数类型无法隐式转换但支持显式转换，可使用 `ConvertGenerator<T>` 强制转换。
编译器会自动推导目标类型（夹具参数类型），但由于间接转换机制，用户需显式指定中间类型 `T`：

```cpp
// 夹具参数类型
class MyParam {
 public:
  // 显式转换构造函数
  explicit MyParam(const std::tuple<int, bool>& t);
  ...
};

INSTANTIATE_TEST_SUITE_P(MyInstantiation, MyTestSuite,
    ConvertGenerator<std::tuple<int, bool>>(Combine(Values(0.1, 1.2), Bool())));
```

此例中 `Combine` 生成 `std::tuple<int, bool>` 对象（尽管第一个元素为 `double` 类型），
并通过 `ConvertGenerator` 将这些元组转换为 `MyParam` 对象。

对于无法由生成类型转换成的参数类型，可以提供执行转换的可调用对象。
该可调用对象接受生成类型的参数，返回夹具参数类型的对象。
生成类型通常可通过可调用对象的签名推导得出，因此不需要显式指定：

```cpp
// 夹具参数类型
class MyParam {
 public:
  MyParam(int, bool);
  ...
};

INSTANTIATE_TEST_SUITE_P(MyInstantiation, MyTestSuite,
    ConvertGenerator(Combine(Values(1, 1.2), Bool()),
        [](const std::tuple<int i, bool>& t){
          const auto [i, b] = t;
          return MyParam(i, b);
        }));
```

可调用对象可以是任何可初始化为 `std::function` 的对象。
由于返回值会被 `static_cast` 转换为夹具参数类型，因此无需与之完全匹配。

::: warning

考虑以下示例：

```cpp
INSTANTIATE_TEST_SUITE_P(MyInstantiation, MyTestSuite,
    ConvertGenerator(Values(std::string("s")), [](std::string_view s) { ... }));
```

`string` 参数被复制到 `Values` 返回的工厂对象中。
由于 lambda 推导的生成类型为 `string_view`，工厂对象生成的生成器将持有指向该 `string` 的 `string_view`。
当生成器执行时，工厂对象已被销毁，`string_view` 成为悬空引用。

可通过显式指定生成类型来解决这个问题：
`ConvertGenerator<std::string>(Values(std::string("s")), [](std::string_view s) { ... })`。
或者修改 lambda 签名，使其接受 `std::string` 或 `const std::string&` 类型
（后者不会产生悬空引用，因为类型推导时会去除引用和 `const` 限定）。

:::

### TYPED_TEST_SUITE {#TYPED_TEST_SUITE}

```cpp
TYPED_TEST_SUITE(TestFixtureName, Types)
TYPED_TEST_SUITE(TestFixtureName, Types, NameGenerator)
```

基于测试夹具 _`TestFixtureName`_ 定义类型化测试套件。
测试套件名称为 _`TestFixtureName`_。

参数 _`TestFixtureName`_ 是一个类型参数化的夹具类模板，例如：

```cpp
template <typename T>
class MyFixture : public testing::Test {
 public:
  ...
  using List = std::list<T>;
  static T shared_;
  T value_;
};
```

参数 _`Types`_ 是一个表示测试类型列表的 [`Types`](#Types) 对象，例如：

```cpp
using MyTypes = ::testing::Types<char, int, unsigned int>;
TYPED_TEST_SUITE(MyFixture, MyTypes);
```

这里必须使用类型别名（`using` 或 `typedef`）以保证 `TYPED_TEST_SUITE` 宏正确解析。

可选参数 _`NameGenerator`_ 允许指定一个包含静态模板函数 `GetName(int)` 的类，例如：

```cpp
class NameGenerator {
 public:
  template <typename T>
  static std::string GetName(int) {
    if constexpr (std::is_same_v<T, char>) return "char";
    if constexpr (std::is_same_v<T, int>) return "int";
    if constexpr (std::is_same_v<T, unsigned int>) return "unsignedInt";
  }
};
TYPED_TEST_SUITE(MyFixture, MyTypes, NameGenerator);
```

更多信息请参考 [`TYPED_TEST`](#TYPED_TEST) 和[类型化测试](../advanced.md#typed-tests)。

### TYPED_TEST {#TYPED_TEST}

```cpp
TYPED_TEST(TestSuiteName, TestName) {
  // ... statements ...
}
```

在类型化测试套件 _`TestSuiteName`_ 中定义名为 _`TestName`_ 的测试单元。
测试套件必须通过 [`TYPED_TEST_SUITE`](#TYPED_TEST_SUITE) 定义。

在测试体内，可以使用 `TypeParam` 访问类型参数，使用 `TestFixture` 访问夹具类。
示例：

```cpp
TYPED_TEST(MyFixture, Example) {
  // 通过 TypeParam 访问类型参数
  // 由于实际上是位于派生类模板中，必须通过 this 指针来访问夹具成员
  TypeParam n = this->value_;

  // 访问静态成员添加 'TestFixture::' 前缀
  n += TestFixture::shared_;

  // 访问类型别名需添加 'typename TestFixture::' 前缀
  typename TestFixture::List values;

  values.push_back(n);
  ...
}
```

更多信息请参考[类型化测试](../advanced.md#typed-tests)。

### TYPED_TEST_SUITE_P {#TYPED_TEST_SUITE_P}

```cpp
TYPED_TEST_SUITE_P(TestFixtureName)
```

基于测试夹具 _`TestFixtureName`_ 定义类型参数化测试套件。
测试套件名称为 _`TestFixtureName`_。

参数 _`TestFixtureName`_ 是类型参数化的夹具类模板。
示例参见 [`TYPED_TEST_SUITE`](#TYPED_TEST_SUITE)。

更多信息请参考 [`TYPED_TEST_P`](#TYPED_TEST_P) 和[类型参数化测试](../advanced.md#type-parameterized-tests)。

### TYPED_TEST_P {#TYPED_TEST_P}

```cpp
TYPED_TEST_P(TestSuiteName, TestName) {
  // ... statements ...
}
```

在类型参数化测试套件 _`TestSuiteName`_ 中定义名为 _`TestName`_ 的测试单元。
测试套件必须通过 [`TYPED_TEST_SUITE_P`](#TYPED_TEST_SUITE_P) 定义。

在测试体内，可以使用 `TypeParam` 指代类型参数，`TestFixture` 指代夹具类。
示例参见 [`TYPED_TEST`](#TYPED_TEST)。

更多信息请参考 [`REGISTER_TYPED_TEST_SUITE_P`](#REGISTER_TYPED_TEST_SUITE_P) 和[类型参数化测试](../advanced.md#type-parameterized-tests)。

### REGISTER_TYPED_TEST_SUITE_P {#REGISTER_TYPED_TEST_SUITE_P}

```cpp
REGISTER_TYPED_TEST_SUITE_P(TestSuiteName, TestNames...)
```

注册拥有测试单元 _`TestNames...`_ 的类型参数化测试套件 _`TestSuiteName`_。
测试套件和测试单元必须通过 [`TYPED_TEST_SUITE_P`](#TYPED_TEST_SUITE_P) 和 [`TYPED_TEST_P`](#TYPED_TEST_P) 定义。

示例：

```cpp
// 定义测试套件和测试单元
TYPED_TEST_SUITE_P(MyFixture);
TYPED_TEST_P(MyFixture, HasPropertyA) { ... }
TYPED_TEST_P(MyFixture, HasPropertyB) { ... }

// 注册测试单元
REGISTER_TYPED_TEST_SUITE_P(MyFixture, HasPropertyA, HasPropertyB);
```

更多信息请参考 [`INSTANTIATE_TYPED_TEST_SUITE_P`](#INSTANTIATE_TYPED_TEST_SUITE_P) 和[类型参数化测试](../advanced.md#type-parameterized-tests)。

### INSTANTIATE_TYPED_TEST_SUITE_P {#INSTANTIATE_TYPED_TEST_SUITE_P}

```cpp
INSTANTIATE_TYPED_TEST_SUITE_P(InstantiationName, TestSuiteName, Types)
```

实例化类型参数化测试套件 _`TestSuiteName`_。
测试套件必须通过 [`REGISTER_TYPED_TEST_SUITE_P`](#REGISTER_TYPED_TEST_SUITE_P) 注册。

参数 _`InstantiationName`_ 是该测试套件实例的唯一标识，用于区分不同实例。
在测试输出中，实例名称将作为前缀添加到测试套件名称 _`TestSuiteName`_ 中。
若 _`InstantiationName`_ 为空（`INSTANTIATE_TEST_SUITE_P(, ...)`），则不添加前缀。

参数 _`Types`_ 是一个表示测试类型列表的 [`Types`](#Types) 对象，例如：

```cpp
using MyTypes = ::testing::Types<char, int, unsigned int>;
INSTANTIATE_TYPED_TEST_SUITE_P(MyInstantiation, MyFixture, MyTypes);
```

这里必须使用类型别名（`using` 或 `typedef`）以保证 `INSTANTIATE_TYPED_TEST_SUITE_P` 宏正确解析。

更多信息请参考[类型参数化测试](../advanced.md#type-parameterized-tests)。

### FRIEND_TEST {#FRIEND_TEST}

```cpp
FRIEND_TEST(TestSuiteName, TestName)
```

在类定义体内声明特定测试单元为友元，使其能够访问类的私有成员。

若类定义在命名空间内，测试夹具和测试也必须定义在完全相同的命名空间（不得使用内联或匿名命名空间），才能成为该类的友元。

例如，若类定义如下：

```cpp
namespace my_namespace {

class MyClass {
  friend class MyClassTest;
  FRIEND_TEST(MyClassTest, HasPropertyA);
  FRIEND_TEST(MyClassTest, HasPropertyB);
  // ... 类成员定义 ...
};

}  // namespace my_namespace
```

则对应测试代码应为：

```cpp
namespace my_namespace {

class MyClassTest : public testing::Test {
  ...
};

TEST_F(MyClassTest, HasPropertyA) { ... }
TEST_F(MyClassTest, HasPropertyB) { ... }

}  // namespace my_namespace
```

更多信息请参考[测试私有代码](../advanced.md#testing-private-code)。

### SCOPED_TRACE {#SCOPED_TRACE}

```cpp
SCOPED_TRACE(message)
```

在当前作用域内，为所有断言失败信息添加包含当前文件名、行号和指定 _`message`_ 信息的标记。

更多信息请参考[为断言添加追踪信息](../advanced.md#adding-traces-to-assertions)。

另见 [`ScopedTrace`](#ScopedTrace)。

### GTEST_SKIP {#GTEST_SKIP}

```cpp
GTEST_SKIP()
```

在运行时中止当前测试执行流。

使用场景：

1. 测试单元函数体内。
2. 测试环境（派生自 [`Environment`](#Environment) 类）的 `SetUp()` 方法。
3. 测试夹具（派生自 [`Test`](#Test) 类）的 `SetUp` 方法。

如果在全局环境 `SetUp()` 中使用，会跳过测试程序的所有测试。
如果在测试夹具 `SetUp()` 中使用，会跳过相应测试套件的所有测试。

与断言类似，`GTEST_SKIP` 宏支持流式附加自定义信息。

更多信息请参考[跳过测试的执行](../advanced.md#skipping-test-execution)。

### GTEST_ALLOW_UNINSTANTIATED_PARAMETERIZED_TEST {#GTEST_ALLOW_UNINSTANTIATED_PARAMETERIZED_TEST}

```cpp
GTEST_ALLOW_UNINSTANTIATED_PARAMETERIZED_TEST(TestSuiteName)
```

豁免值参数化测试套件 _`TestSuiteName`_ 的实例化检查。

默认情况下，没有对应 [`INSTANTIATE_TEST_SUITE_P`](#INSTANTIATE_TEST_SUITE_P) 的 [`TEST_P`](#TEST_P)
语句会触发 `GoogleTestVerification` 套件的失败。
可以使用 `GTEST_ALLOW_UNINSTANTIATED_PARAMETERIZED_TEST` 来为特定测试套件抑制此失败。

## 类与类型

GoogleTest 定义了以下类与类型来辅助编写测试。

### AssertionResult {#AssertionResult}

```cpp
testing::AssertionResult
```

用于表示断言是否成功的类。

当断言失败时，`AssertionResult` 对象会存储非空的失败信息，可通过对象的 `message()` 方法获取。

要创建该类的实例，请使用工厂函数 [AssertionSuccess()](#AssertionSuccess) 或 [AssertionFailure()](#AssertionFailure)。

### AssertionException {#AssertionException}

```cpp
testing::AssertionException
```

可从 [TestEventListener::OnTestPartResult](#TestEventListener::OnTestPartResult) 中抛出的异常。

### EmptyTestEventListener {#EmptyTestEventListener}

```cpp
testing::EmptyTestEventListener
```

为 [`TestEventListener`](#TestEventListener) 接口所有方法提供空实现，使得子类只需重写其关注的方法。

### Environment {#Environment}

```cpp
testing::Environment
```

表示全局测试环境。参见[全局 SetUp/TearDown](../advanced.md#global-set-up-and-tear-down)。

#### 受保护方法 {#Environment-protected}

##### SetUp {#Environment::SetUp}

```cpp
virtual void Environment::SetUp()
```

重写此方法以定义环境设置方式。

##### TearDown {#Environment::TearDown}

```cpp
virtual void Environment::TearDown()
```

重写此方法以定义环境清理方式。

### ScopedTrace {#ScopedTrace}

```cpp
testing::ScopedTrace
```

该类的实例会在其生命周期范围内，为所有测试失败信息添加追踪信息。
实例销毁时效果消失。

`ScopedTrace` 的构造函数形式如下：

```cpp
template <typename T>
ScopedTrace(const char* file, int line, const T& message)
```

使用示例：

```cpp
testing::ScopedTrace trace("file.cc", 123, "message");
```

生成的追踪信息包含源文件路径、行号和给定消息。
`message` 参数可以是任何可流式传输到 `std::ostream` 的对象。

另见 [`SCOPED_TRACE`](#SCOPED_TRACE)。

### Test {#Test}

```cpp
testing::Test
```

所有测试继承的抽象基类。
不可复制。

#### 公有方法 {#Test-public}

##### SetUpTestSuite {#Test::SetUpTestSuite}

```cpp
static void Test::SetUpTestSuite()
```

执行测试套件的设置逻辑。
`GoogleTest` 会在运行测试套件首个测试前调用 `SetUpTestSuite()`。

##### TearDownTestSuite {#Test::TearDownTestSuite}

```cpp
static void Test::TearDownTestSuite()
```

执行测试套件的清理逻辑。
GoogleTest 会在运行测试套件最后一个测试后调用 `TearDownTestSuite()`。

##### HasFatalFailure {#Test::HasFatalFailure}

```cpp
static bool Test::HasFatalFailure()
```

当且仅当当前测试存在致命失败时返回 `true`。

##### HasNonfatalFailure {#Test::HasNonfatalFailure}

```cpp
static bool Test::HasNonfatalFailure()
```

当且仅当当前测试存在非致命失败时返回 `true`。

##### HasFailure {#Test::HasFailure}

```cpp
static bool Test::HasFailure()
```

当且仅当当前测试存在失败（无论致命或非致命）时返回 `true`。

##### IsSkipped {#Test::IsSkipped}

```cpp
static bool Test::IsSkipped()
```

当且仅当当前测试被跳过时返回 `true`。

##### RecordProperty {#Test::RecordProperty}

```cpp
static void Test::RecordProperty(const std::string& key, const std::string& value)
static void Test::RecordProperty(const std::string& key, int value)
```

为当前测试、测试套件或整个测试程序记录属性。
对于相同的 `key`，仅保留最后记录的值。

`key` 必须是有效的 XML 属性名，且不能与 GoogleTest 已用属性冲突
（`name`、`file`、`line`、`status`、`time`、`classname`、`type_param` 与 `value_param`）。

`RecordProperty` 被设为 `public static` 以便非测试夹具成员的工具函数调用。

在测试生命周期内（从构造函数开始到析构函数结束）的 `RecordProperty` 调用将作为 `<testcase>` 元素的属性输出到 XML。
在夹具的 `SetUpTestSuite` 或 `TearDownTestSuite` 方法记录的属性将作为对应 `<testsuite>` 元素的属性。
在全局上下文中的调用（`RUN_ALL_TESTS` 执行前后或注册 `Environment` 对象的 `SetUp`/`TearDown` 方法中）将作为 `<testsuites>` 元素的属性。

#### 受保护方法 {#Test-protected}

##### SetUp {#Test::SetUp}

```cpp
virtual void Test::SetUp()
```

重写此方法以执行测试夹具的设置逻辑。
GoogleTest 会在每个测试单元运行前调用 `SetUp()`。

##### TearDown {#Test::TearDown}

```cpp
virtual void Test::TearDown()
```

重写此方法以执行测试夹具的清理逻辑。
GoogleTest 会在每个测试单元运行后调用 `TearDown()`。

### TestWithParam {#TestWithParam}

```cpp
testing::TestWithParam<T>
```

继承自 [`Test`](#Test) 和 [`WithParamInterface<T>`](#WithParamInterface) 的便捷类。

### TestSuite {#TestSuite}

表示测试套件。
不可复制。

#### 公有方法 {#TestSuite-public}

##### name {#TestSuite::name}

```cpp
const char* TestSuite::name() const
```

获取测试套件名称。

##### type_param {#TestSuite::type_param}

```cpp
const char* TestSuite::type_param() const
```

返回参数类型名称，若非类型化或类型参数化测试套件则返回 `NULL`。
参见[类型化测试](../advanced.md#typed-tests)和[类型参数化测试](../advanced.md#type-parameterized-tests)。

##### should_run {#TestSuite::should_run}

```cpp
bool TestSuite::should_run() const
```

当测试套件中存在需要运行的测试时返回 `true`。

##### successful_test_count {#TestSuite::successful_test_count}

```cpp
int TestSuite::successful_test_count() const
```

获取本测试套件的成功测试数。

##### skipped_test_count {#TestSuite::skipped_test_count}

```cpp
int TestSuite::skipped_test_count() const
```

获取本测试套件的跳过测试数。

##### failed_test_count {#TestSuite::failed_test_count}

```cpp
int TestSuite::failed_test_count() const
```

获取本测试套件的失败测试数。

##### reportable_disabled_test_count {#TestSuite::reportable_disabled_test_count}

```cpp
int TestSuite::reportable_disabled_test_count() const
```

获取需在 XML 中报告的禁用测试数。

##### disabled_test_count {#TestSuite::disabled_test_count}

```cpp
int TestSuite::disabled_test_count() const
```

获取本测试套件中禁用测试数。

##### reportable_test_count {#TestSuite::reportable_test_count}

```cpp
int TestSuite::reportable_test_count() const
```

获取需在 XML 中报告中的测试数。

##### test_to_run_count {#TestSuite::test_to_run_count}

```cpp
int TestSuite::test_to_run_count() const
```

获取本测试套件应运行的测试数。

##### total_test_count {#TestSuite::total_test_count}

```cpp
int TestSuite::total_test_count() const
```

获取本测试套件的所有测试总数。

##### Passed {#TestSuite::Passed}

```cpp
bool TestSuite::Passed() const
```

当且仅当测试套件通过时返回 `true`。

##### Failed {#TestSuite::Failed}

```cpp
bool TestSuite::Failed() const
```

当且仅当测试套件失败时返回 `true`。

##### elapsed_time {#TestSuite::elapsed_time}

```cpp
TimeInMillis TestSuite::elapsed_time() const
```

返回以毫秒为单位的耗时。

##### start_timestamp {#TestSuite::start_timestamp}

```cpp
TimeInMillis TestSuite::start_timestamp() const
```

获取测试套件开始时间戳（自 UNIX 纪元起算的毫秒数）。

##### GetTestInfo {#TestSuite::GetTestInfo}

```cpp
const TestInfo* TestSuite::GetTestInfo(int i) const
```

返回全部测试中第 `i` 个测试的 [`TestInfo`](#TestInfo)。
`i` 的范围应为 0 至 `total_test_count() - 1`，无效时返回 `NULL`。

##### ad_hoc_test_result {#TestSuite::ad_hoc_test_result}

```cpp
const TestResult& TestSuite::ad_hoc_test_result() const
```

返回记录 `SetUpTestSuite` 和 `TearDownTestSuite` 执行期间测试属性的 [`TestResult`](#TestResult)。

### TestInfo {#TestInfo}

```cpp
testing::TestInfo
```

存储测试单元的相关信息。

#### 公有方法 {#TestInfo-public}

##### test_suite_name {#TestInfo::test_suite_name}

```cpp
const char* TestInfo::test_suite_name() const
```

返回测试套件名称。

##### name {#TestInfo::name}

```cpp
const char* TestInfo::name() const
```

返回测试单元名称。

##### type_param {#TestInfo::type_param}

```cpp
const char* TestInfo::type_param() const
```

返回参数类型名称，若非类型化或类型参数化测试套件则返回 `NULL`。
参见[类型化测试](../advanced.md#typed-tests)和[类型参数化测试](../advanced.md#type-parameterized-tests)。

##### value_param {#TestInfo::value_param}

```cpp
const char* TestInfo::value_param() const
```

返回值参数的文本表示，若非值参数化测试则返回 `NULL`。
参见[值参数化测试](../advanced.md#value-parameterized-tests)。

##### file {#TestInfo::file}

```cpp
const char* TestInfo::file() const
```

返回测试定义所在文件名。

##### line {#TestInfo::line}

```cpp
int TestInfo::line() const
```

返回测试定义所在行号。

##### is_in_another_shard {#TestInfo::is_in_another_shard}

```cpp
bool TestInfo::is_in_another_shard() const
```

当测试位于其他分片，应跳过时返回 `true`。

##### should_run {#TestInfo::should_run}

```cpp
bool TestInfo::should_run() const
```

当测试应运行时返回 `true`，即测试未被禁用（或虽禁用但指定了 `also_run_disabled_tests` 标志）且全名与用户过滤条件匹配。

GoogleTest 允许用户通过全名过滤测试，仅运行匹配过滤条件的测试。
详见[运行测试的子集](../advanced.md#running-a-subset-of-the-tests)。

##### is_reportable {#TestInfo::is_reportable}

```cpp
bool TestInfo::is_reportable() const
```

当且仅当本测试将出现在 XML 报告中时返回 `true`。

##### result {#TestInfo::result}

```cpp
const TestResult* TestInfo::result() const
```

返回测试结果。参见 [`TestResult`](#TestResult)。

### TestParamInfo {#TestParamInfo}

```cpp
testing::TestParamInfo<T>
```

描述值参数化测试的参数。
模板参数 `T` 表示参数类型。

包含 `param` 和 `index` 字段，分别存储参数值及其整数索引。

### UnitTest {#UnitTest}

```cpp
testing::UnitTest
```

存储测试程序的相关信息。

`UnitTest` 是单例类。
首次调用 `UnitTest::GetInstance()` 时会创建唯一实例且永不销毁。

`UnitTest` 不可复制。

#### 公有方法 {#UnitTest-public}

##### GetInstance {#UnitTest::GetInstance}

```cpp
static UnitTest* UnitTest::GetInstance()
```

获取 `UnitTest` 单例对象。
首次调用时构造对象，后续调用返回同一实例。

##### original_working_dir {#UnitTest::original_working_dir}

```cpp
const char* UnitTest::original_working_dir() const
```

返回首个 [`TEST()`](#TEST) 或 [`TEST_F()`](#TEST_F) 执行时的工作目录。
`UnitTest` 对象持有字符串的所有权。

##### current_test_suite {#UnitTest::current_test_suite}

```cpp
const TestSuite* UnitTest::current_test_suite() const
```

返回当前运行测试的 [`TestSuite`](#TestSuite) 对象，无测试运行时返回 `NULL`。

##### current_test_info {#UnitTest::current_test_info}

```cpp
const TestInfo* UnitTest::current_test_info() const
```

返回当前运行测试的 [`TestInfo`](#TestInfo) 对象，无测试运行时返回 `NULL`。

##### random_seed {#UnitTest::random_seed}

```cpp
int UnitTest::random_seed() const
```

返回当前测试运行使用的随机种子。

##### successful_test_suite_count {#UnitTest::successful_test_suite_count}

```cpp
int UnitTest::successful_test_suite_count() const
```

获取成功测试套件数。

##### failed_test_suite_count {#UnitTest::failed_test_suite_count}

```cpp
int UnitTest::failed_test_suite_count() const
```

获取失败测试套件数。

##### total_test_suite_count {#UnitTest::total_test_suite_count}

```cpp
int UnitTest::total_test_suite_count() const
```

获取测试套件总数。

##### test_suite_to_run_count {#UnitTest::test_suite_to_run_count}

```cpp
int UnitTest::test_suite_to_run_count() const
```

获取包含至少一个应运行测试的测试套件总数。

##### successful_test_count {#UnitTest::successful_test_count}

```cpp
int UnitTest::successful_test_count() const
```

获取成功测试数。

##### skipped_test_count {#UnitTest::skipped_test_count}

```cpp
int UnitTest::skipped_test_count() const
```

获取跳过测试数。

##### failed_test_count {#UnitTest::failed_test_count}

```cpp
int UnitTest::failed_test_count() const
```

获取失败测试数。

##### reportable_disabled_test_count {#UnitTest::reportable_disabled_test_count}

```cpp
int UnitTest::reportable_disabled_test_count() const
```

获取需在 XML 报告中打印的禁用测试数。

##### disabled_test_count {#UnitTest::disabled_test_count}

```cpp
int UnitTest::disabled_test_count() const
```

获取禁用测试数。

##### reportable_test_count {#UnitTest::reportable_test_count}

```cpp
int UnitTest::reportable_test_count() const
```

获取需在 XML 报告中打印的测试数。

##### total_test_count {#UnitTest::total_test_count}

```cpp
int UnitTest::total_test_count() const
```

获取测试总数。

##### test_to_run_count {#UnitTest::test_to_run_count}

```cpp
int UnitTest::test_to_run_count() const
```

获取应运行的测试数。

##### start_timestamp {#UnitTest::start_timestamp}

```cpp
TimeInMillis UnitTest::start_timestamp() const
```

获取测试程序开始时间戳（自 UNIX 纪元起算的毫秒数）。

##### elapsed_time {#UnitTest::elapsed_time}

```cpp
TimeInMillis UnitTest::elapsed_time() const
```

获取以毫秒为单位的耗时。

##### Passed {#UnitTest::Passed}

```cpp
bool UnitTest::Passed() const
```

当且仅当单元测试通过（所有测试套件通过）时返回 `true`。

##### Failed {#UnitTest::Failed}

```cpp
bool UnitTest::Failed() const
```

当且仅当单元测试失败（有测试套件失败或测试外逻辑失败）时返回 `true`。

##### GetTestSuite {#UnitTest::GetTestSuite}

```cpp
const TestSuite* UnitTest::GetTestSuite(int i) const
```

返回全部测试套件中第 `i` 个 [`TestSuite`](#TestSuite)。
`i` 的范围应为 0 至 `total_test_suite_count() - 1`，无效时返回 `NULL`。

##### ad_hoc_test_result {#UnitTest::ad_hoc_test_result}

```cpp
const TestResult& UnitTest::ad_hoc_test_result() const
```

返回包含在测试套件之外记录的失败信息和测试属性的 [`TestResult`](#TestResult)。

##### listeners {#UnitTest::listeners}

```cpp
TestEventListeners& UnitTest::listeners()
```

返回用于追踪 GoogleTest 内部事件的事件监听器列表。
参见 [`TestEventListeners`](#TestEventListeners)。

### TestEventListener {#TestEventListener}

```cpp
testing::TestEventListener
```

用于跟踪测试执行的接口。
下面列出的方法按事件触发顺序排列。

#### 公有方法 {#TestEventListener-public}

##### OnTestProgramStart {#TestEventListener::OnTestProgramStart}

```cpp
virtual void TestEventListener::OnTestProgramStart(const UnitTest& unit_test)
```

在所有测试活动开始前触发。

##### OnTestIterationStart {#TestEventListener::OnTestIterationStart}

```cpp
virtual void TestEventListener::OnTestIterationStart(const UnitTest& unit_test, int iteration)
```

在每次测试迭代开始前触发。
若设置了 `GTEST_FLAG(repeat)` ，将会有多次迭代。
`iteration` 表示从 0 开始的迭代索引。

##### OnEnvironmentsSetUpStart {#TestEventListener::OnEnvironmentsSetUpStart}

```cpp
virtual void TestEventListener::OnEnvironmentsSetUpStart(const UnitTest& unit_test)
```

在每次迭代的环境设置开始前触发。

##### OnEnvironmentsSetUpEnd {#TestEventListener::OnEnvironmentsSetUpEnd}

```cpp
virtual void TestEventListener::OnEnvironmentsSetUpEnd(const UnitTest& unit_test)
```

在每次迭代的环境设置结束后触发。

##### OnTestSuiteStart {#TestEventListener::OnTestSuiteStart}

```cpp
virtual void TestEventListener::OnTestSuiteStart(const TestSuite& test_suite)
```

在测试套件开始前触发。

##### OnTestStart {#TestEventListener::OnTestStart}

```cpp
virtual void TestEventListener::OnTestStart(const TestInfo& test_info)
```

在测试单元开始前触发。

##### OnTestPartResult {#TestEventListener::OnTestPartResult}

```cpp
virtual void TestEventListener::OnTestPartResult(const TestPartResult& test_part_result)
```

在断言失败或调用 `SUCCEED()` 后触发。
可以在这里抛出 [`AssertionException`](#AssertionException) 或其派生异常以跳过当前测试。

##### OnTestEnd {#TestEventListener::OnTestEnd}

```cpp
virtual void TestEventListener::OnTestEnd(const TestInfo& test_info)
```

在测试单元结束后触发。

##### OnTestSuiteEnd {#TestEventListener::OnTestSuiteEnd}

```cpp
virtual void TestEventListener::OnTestSuiteEnd(const TestSuite& test_suite)
```

在测试套件结束后触发。

##### OnEnvironmentsTearDownStart {#TestEventListener::OnEnvironmentsTearDownStart}

```cpp
virtual void TestEventListener::OnEnvironmentsTearDownStart(const UnitTest& unit_test)
```

在每次迭代的环境清理开始前触发。

##### OnEnvironmentsTearDownEnd {#TestEventListener::OnEnvironmentsTearDownEnd}

```cpp
virtual void TestEventListener::OnEnvironmentsTearDownEnd(const UnitTest& unit_test)
```

在每次迭代的环境清理结束后触发。

##### OnTestIterationEnd {#TestEventListener::OnTestIterationEnd}

```cpp
virtual void TestEventListener::OnTestIterationEnd(const UnitTest& unit_test, int iteration)
```

在每次测试迭代结束后触发。

##### OnTestProgramEnd {#TestEventListener::OnTestProgramEnd}

```cpp
virtual void TestEventListener::OnTestProgramEnd(const UnitTest& unit_test)
```

在所有测试活动结束后触发。

### TestEventListeners {#TestEventListeners}

```cpp
testing::TestEventListeners
```

允许用户添加监听器来追踪 GoogleTest 事件。

#### 公有方法 {#TestEventListeners-public}

##### Append {#TestEventListeners::Append}

```cpp
void TestEventListeners::Append(TestEventListener* listener)
```

将事件监听器追加到列表末尾。
GoogleTest 将获得该监听器的所有权，并在测试程序结束时自动删除。

##### Release {#TestEventListeners::Release}

```cpp
TestEventListener* TestEventListeners::Release(TestEventListener* listener)
```

从列表中移除指定监听器并返回该监听器。
调用方需负责删除该监听器。
未找到时返回 `NULL`。

##### default_result_printer {#TestEventListeners::default_result_printer}

```cpp
TestEventListener* TestEventListeners::default_result_printer() const
```

返回负责默认控制台输出的标准监听器。
可将其从监听器列表移除以关闭默认控制台输出。
注意，通过 `Release()` 移除后所有权将转移给调用方，再次调用本方法返回 `NULL`。

##### default_xml_generator {#TestEventListeners::default_xml_generator}

```cpp
TestEventListener* TestEventListeners::default_xml_generator() const
```

返回由 `--gtest_output=xml` 标志控制的、负责生成默认 XML 输出的标准监听器。
可通过移除该监听器关闭默认 XML 输出并替换为自定义实现。
注意，通过 `Release()` 移除后所有权转移将转移给调用方，再次调用本方法返回 `NULL`。

### TestPartResult {#TestPartResult}

```cpp
testing::TestPartResult
```

表示测试段（_test part_）（如断言、`FAIL()`、`ADD_FAILURE()`、`SUCCESS()`）结果的可复制对象。

#### 公有方法 {#TestPartResult-public}

##### type {#TestPartResult::type}

```cpp
Type TestPartResult::type() const
```

获取测试段结果。

返回的 `Type` 枚举定义如下：

```cpp
enum Type {
  kSuccess,          // 成功
  kNonFatalFailure,  // 失败但可继续测试
  kFatalFailure,     // 失败且需终止测试
  kSkip              // 已跳过
};
```

##### file_name {#TestPartResult::file_name}

```cpp
const char* TestPartResult::file_name() const
```

获取测试段所在源文件名，未知时返回 `NULL`。

##### line_number {#TestPartResult::line_number}

```cpp
int TestPartResult::line_number() const
```

获取测试段所在源文件行号，未知时返回 `-1`。

##### summary {#TestPartResult::summary}

```cpp
const char* TestPartResult::summary() const
```

获取失败信息概要。

##### message {#TestPartResult::message}

```cpp
const char* TestPartResult::message() const
```

获取测试段关联的信息。

##### skipped {#TestPartResult::skipped}

```cpp
bool TestPartResult::skipped() const
```

当且仅当测试段被跳过时返回 `true`。

##### passed {#TestPartResult::passed}

```cpp
bool TestPartResult::passed() const
```

当且仅当测试段通过时返回 `true`。

##### nonfatally_failed {#TestPartResult::nonfatally_failed}

```cpp
bool TestPartResult::nonfatally_failed() const
```

当且仅当测试段发生非致命失败时返回 `true`。

##### fatally_failed {#TestPartResult::fatally_failed}

```cpp
bool TestPartResult::fatally_failed() const
```

当且仅当测试段发生致命失败时返回 `true`。

##### failed {#TestPartResult::failed}

```cpp
bool TestPartResult::failed() const
```

当且仅当测试段失败时返回 `true`。

### TestProperty {#TestProperty}

```cpp
testing::TestProperty
```

表示用户自定义测试属性的可复制对象，可输出为键值对字符串。

#### 公有方法 {#TestProperty-public}

##### key {#key}

```cpp
const char* key() const
```

获取用户定义的键名。

##### value {#value}

```cpp
const char* value() const
```

获取用户定义的值。

##### SetValue {#SetValue}

```cpp
void SetValue(const std::string& new_value)
```

设置新值，覆盖原有值。

### TestResult {#TestResult}

```cpp
testing::TestResult
```

包含测试单元的结果信息。不可复制。

#### 公有方法 {#TestResult-public}

##### total_part_count {#TestResult::total_part_count}

```cpp
int TestResult::total_part_count() const
```

获取测试段总数（包括成功段与失败段）。

##### test_property_count {#TestResult::test_property_count}

```cpp
int TestResult::test_property_count() const
```

获取测试属性总数。

##### Passed {#TestResult::Passed}

```cpp
bool TestResult::Passed() const
```

当且仅当测试通过（无失败段）时返回 `true`。

##### Skipped {#TestResult::Skipped}

```cpp
bool TestResult::Skipped() const
```

当且仅当测试被跳过时返回 `true`。

##### Failed {#TestResult::Failed}

```cpp
bool TestResult::Failed() const
```

当且仅当测试存在失败时返回 `true`。

##### HasFatalFailure {#TestResult::HasFatalFailure}

```cpp
bool TestResult::HasFatalFailure() const
```

当且仅当测试存在致命失败时返回 `true`。

##### HasNonfatalFailure {#TestResult::HasNonfatalFailure}

```cpp
bool TestResult::HasNonfatalFailure() const
```

当且仅当测试存在非致命失败时返回 `true`。

##### elapsed_time {#TestResult::elapsed_time}

```cpp
TimeInMillis TestResult::elapsed_time() const
```

获取以毫秒为单位的耗时。

##### start_timestamp {#TestResult::start_timestamp}

```cpp
TimeInMillis TestResult::start_timestamp() const
```

获取测试单元开始时间戳（自 UNIX 纪元起算的毫秒数）。

##### GetTestPartResult {#TestResult::GetTestPartResult}

```cpp
const TestPartResult& TestResult::GetTestPartResult(int i) const
```

返回所有测试段结果中第 `i` 个 [`TestPartResult`](#TestPartResult)。
`i` 范围应为 0 至 `total_part_count() - 1`，无效时终止程序。

##### GetTestProperty {#TestResult::GetTestProperty}

```cpp
const TestProperty& TestResult::GetTestProperty(int i) const
```

返回所有测试属性中第 `i` 个 [`TestProperty`](#TestProperty)。
`i` 范围应为 0 至 `test_property_count() - 1`，无效时终止程序。

### TimeInMillis {#TimeInMillis}

```cpp
testing::TimeInMillis
```

表示毫秒级时间的整数类型。

### Types {#Types}

```cpp
testing::Types<T...>
```

表示类型化测试和类型参数化测试使用的类型列表。

模板参数 `T...` 可接受任意数量的类型，例如：

```cpp
testing::Types<char, int, unsigned int>
```

更多信息请参考[类型化测试](../advanced.md#typed-tests)和[类型参数化测试](../advanced.md#type-parameterized-tests)。

### WithParamInterface {#WithParamInterface}

```cpp
testing::WithParamInterface<T>
```

所有值参数化测试继承的纯接口类。

值参数化测试夹具类必须同时继承 [`Test`](#Test) 和 `WithParamInterface`。
这通常可以通过继承 [`TestWithParam`](#TestWithParam) 来实现，但复杂测试层次结构可能需要在不同层级分别继承两者。

该接口为参数类型 `T` 定义了别名 `ParamType`，并支持通过 `GetParam()` 方法访问测试参数值：

```cpp
static const ParamType& GetParam()
```

更多信息请参考[值参数化测试](../advanced.md#value-parameterized-tests)。

## 函数

GoogleTest 定义了以下函数来辅助编写和运行测试。

### InitGoogleTest {#InitGoogleTest}

```cpp
void testing::InitGoogleTest(int* argc, char** argv)
void testing::InitGoogleTest(int* argc, wchar_t** argv)
void testing::InitGoogleTest()
```

初始化 GoogleTest。
必须在调用 [`RUN_ALL_TESTS()`](#RUN_ALL_TESTS) 前执行。
该函数的主要功能是解析命令行参数中的 GoogleTest 标志，在识别到标志后会将其从 `argv` 中移除并递减 `*argc`。
注意，`argv` 必须以 `NULL` 指针结尾（即 `argv[argc]` 为 `NULL`），默认传给 `main` 的 `argv` 已满足此条件。

该函数无返回值，而是通过更新 GoogleTest 标志变量实现功能。

`InitGoogleTest(int* argc, wchar_t** argv)` 重载适用于 Windows 的 `UNICODE` 模式。

无参数版本适用于 Arduino/嵌入式平台等无 `argc`/`argv` 的环境。

### AddGlobalTestEnvironment {#AddGlobalTestEnvironment}

```cpp
Environment* testing::AddGlobalTestEnvironment(Environment* env)
```

为测试程序添加全局测试环境。
必须在调用 [`RUN_ALL_TESTS()`](#RUN_ALL_TESTS) 前执行。
更多信息请参考[全局 SetUp/TearDown](../advanced.md#global-set-up-and-tear-down)。

另见 [`Environment`](#Environment)。

### RegisterTest {#RegisterTest}

```cpp
template <typename Factory>
TestInfo* testing::RegisterTest(const char* test_suite_name, const char* test_name,
                                const char* type_param, const char* value_param,
                                const char* file, int line, Factory factory)
```

向框架动态注册测试。

`factory` 参数是创建 `Test` 对象实例的可调用工厂对象（支持移动构造）或函数指针。
其所有权将转移给调用方。
可调用对象的签名为 `Fixture*()`，其中 `Fixture` 是测试夹具类。
同一 `test_suite_name` 注册的所有测试必须使用相同夹具类型，这会在运行时进行校验。

框架会根据工厂推断夹具类，并调用其 `SetUpTestSuite` 和 `TearDownTestSuite` 方法。

必须在调用 [`RUN_ALL_TESTS()`](#RUN_ALL_TESTS) 前执行，否则行为未定义。

更多信息请参考[用编程方式手动注册测试](../advanced.md#registering-tests-programmatically)。

### RUN_ALL_TESTS {#RUN_ALL_TESTS}

```cpp
int RUN_ALL_TESTS()
```

在 `main()` 函数中使用以运行所有测试。
若全部成功则返回 `0`，否则返回 `1`。

应在使用 [`InitGoogleTest()`](#InitGoogleTest) 解析命令行参数后调用。

此函数原先为宏，因此其位于全局命名空间，且为全大写命名。

### AssertionSuccess {#AssertionSuccess}

```cpp
AssertionResult testing::AssertionSuccess()
```

创建成功的断言结果。
参见 [`AssertionResult`](#AssertionResult)。

### AssertionFailure {#AssertionFailure}

```cpp
AssertionResult testing::AssertionFailure()
```

创建失败的断言结果。
使用 `<<` 运算符存储失败信息：

```cpp
testing::AssertionFailure() << "My failure message";
```

参见 [`AssertionResult`](#AssertionResult)。

### StaticAssertTypeEq {#StaticAssertTypeEq}

```cpp
testing::StaticAssertTypeEq<T1, T2>()
```

在编译时验证类型相等的断言。
当且仅当 `T1` 和 `T2` 为相同类型时编译通过。
其返回值无意义。

更多信息请参考[类型断言](../advanced.md#type-assertions)。

### PrintToString {#PrintToString}

```cpp
std::string testing::PrintToString(x)
```

获取 GoogleTest 值打印器打印 `x` 的输出值。

更多信息请参考[告诉 GoogleTest 如何打印参数值](../advanced.md#teaching-googletest-how-to-print-your-values)。

### PrintToStringParamName {#PrintToStringParamName}

```cpp
std::string testing::PrintToStringParamName(TestParamInfo<T>& info)
```

内置的参数化测试名称生成器，返回对 `info.param` 调用 [`PrintToString`](#PrintToString) 的结果。
当测试参数为 `std::string` 或 C 字符串时不可用。
更多信息请参考[指定值参数化测试参数名称](../advanced.md#specifying-names-for-value-parameterized-test-parameters)。

另见 [`TestParamInfo`](#TestParamInfo) 和 [`INSTANTIATE_TEST_SUITE_P`](#INSTANTIATE_TEST_SUITE_P)。
