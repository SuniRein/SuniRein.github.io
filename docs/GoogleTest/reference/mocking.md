---
title: 模拟参考
createTime: 2025-04-05 18:44:26
permalink: /gtest/reference/mocking/
copyright:
  creation: translate
  source: https://google.github.io/googletest/reference/mocking.html
outline: [2, 4]
---

本文档列举了 GoogleTest 为创建和操作模拟对象提供的功能设施。
使用前需添加 `#include <gmock/gmock.h>` 头文件。

## 宏 {#macros}

GoogleTest 定义了以下宏来辅助操作模拟对象。

### MOCK_METHOD {#MOCK_METHOD}

```cpp
MOCK_METHOD(return_type, method_name, (args...));
MOCK_METHOD(return_type, method_name, (args...), (specs...));
```

在模拟类中定义具有参数 _`arg..`_ 和返回类型 _`return_type`_ 的模拟方法 _`method_name`_。

`MOCK_METHOD` 的参数与方法的声明结构对应。
可选的第四个参数 _`specs...`_ 是以逗号分隔的限定符列表。
接受的限定符包括：

| 限定符               | 含义                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------- |
| `const`              | 将模拟方法声明为 `const` 方法。当覆盖 `const` 方法时必须使用。                           |
| `override`           | 为方法添加 `override` 标记。在覆盖 `virtual` 方法时建议使用。                            |
| `noexcept`           | 为方法添加 `noexcept` 标记。当覆盖 `noexcept`方法时必须使用。                            |
| `Calltype(calltype)` | 设置方法的调用类型，例如 `Calltype(STDMETHODCALLTYPE)`。在 Windows 平台有效。            |
| `ref(qualifier)`     | 为方法添加引用限定符，例如 `ref(&)` 或 `ref(&&)`。当覆盖具有引用限定符的方法时必须使用。 |

注意：参数中的逗号如果没有恰当的括号包裹，可能导致 `MOCK_METHOD` 无法正确解析参数。
参考以下示例：

```cpp
class MyMock {
 public:
  // 以下两行因参数中的逗号无法编译：
  MOCK_METHOD(std::pair<bool, int>, GetPair, ());              // [!code error]
  MOCK_METHOD(bool, CheckMap, (std::map<int, double>, bool));  // [!code error]

  // 解决方案 1 —— 用括号包裹含逗号的参数：
  MOCK_METHOD((std::pair<bool, int>), GetPair, ());
  MOCK_METHOD(bool, CheckMap, ((std::map<int, double>), bool));

  // 解决方案 2 —— 使用类型别名：
  using BoolAndInt = std::pair<bool, int>;
  MOCK_METHOD(BoolAndInt, GetPair, ());
  using MapIntDouble = std::map<int, double>;
  MOCK_METHOD(bool, CheckMap, (MapIntDouble, bool));
};
```

`MOCK_METHOD` 必须用于模拟类定义的 `public:` 段，无论被模拟方法在基类中是 `public`、`protected` 还是 `private`。

### EXPECT_CALL {#EXPECT_CALL}

```cpp
EXPECT_CALL(mock_object, method_name(matchers...))
```

创建[期望](../gmock_for_dummies.md#setting-expectations)，
表示对象 _`mock_object`_ 的方法 _`method_name`_ 将以匹配给定匹配器 _`matchers...`_ 的参数被调用。
必须在执行模拟对象的任何代码之前设置。

参数 _`matcher...`_ 是与方法 _`method_name`_ 各参数对应的[匹配器](../gmock_for_dummies.md#matchers-what-arguments-do-we-expect)构成的逗号分隔列表。
该期望仅适用于参数与匹配器完全匹配的方法调用。
若省略 `(matcher...)`，则默认为每个参数使用[通配符匹配器 `_`](matchers.md#wildcard)。
要获取所有内置匹配器列表，请参阅[匹配器参考](matchers.md)。

期望后可添加链式调用子句以修饰期望，它们必须按如下顺序使用：

```cpp
EXPECT_CALL(mock_object, method_name(matchers...))
    .With(multi_argument_matcher)  // 最多使用一次
    .Times(cardinality)            // 最多使用一次
    .InSequence(sequences...)      // Can be used any number of times
    .After(expectations...)        // Can be used any number of times
    .WillOnce(action)              // Can be used any number of times
    .WillRepeatedly(action)        // Can be used at most once
    .RetiresOnSaturation();        // Can be used at most once
```

各修饰子句的详细信息见下文。

#### With {#EXPECT_CALL.With}

```cpp
.With(multi_argument_matcher)
```

限制期望仅应用于参数整体与多参数匹配器 _`multi_argument_matcher`_ 匹配的模拟函数调用。

GoogleTest 会将所有参数作为元组传递给匹配器。
参数 _`multi_argument_matcher`_ 的类型必须是 `Matcher<std::tuple<A1, ..., An>>`，其中 `A1, ..., An` 是函数的参数类型。

例如，下列代码设置了当 `my_mock.SetPosition()` 的两个参数中第一个小于第二个时触发的期望：

```cpp
using ::testing::_;
using ::testing::Lt;
...
EXPECT_CALL(my_mock, SetPosition(_, _))
    .With(Lt());
```

GoogleTest 提供了一些内置的二元组匹配器，包括上面的 `Lt()`。
参见[多参数匹配器](matchers.md#multi-arg-matchers)。

`With` 子句在单个期望中最多使用一次，且必须为首个子句。

#### Times {#EXPECT_CALL.Times}

```cpp
.Times(cardinality)
```

指定模拟函数期望被调用的次数。

参数 _`cardinality`_ 表示期望的调用次数，可以是定义在 `::testing` 命名空间中的以下任一值：

| 基数                | 含义                                                 |
| ------------------- | ---------------------------------------------------- |
| `AnyNumber()`       | 函数可被调用任意次数。                               |
| `AtLeast(n)`        | 函数至少被调用 _n_ 次。                              |
| `AtMost(n)`         | 函数至多被调用 _n_ 次。                              |
| `Between(m, n)`     | 函数调用次数在 _m_ 到 _n_ 之间（包含边界）。         |
| `Exactly(n)` 或 `n` | 函数恰好被调用 _n_ 次。_n_ 为 0 时，表示不应被调用。 |

若省略 `Times` 子句，GoogleTest 按以下规则推断调用次数：

- 若 [`WillOnce()`](#EXPECT_CALL.WillOnce) 和 [`WillRepeatedly()`](#EXPECT_CALL.WillRepeatedly) 都未给定，推断为 `Times(1)`。
- 若存在 $n (\ge 1)$ 个 `WillOnce()`，但不存在 `WillRepeatedly()`，推断为 `Times(n)`。
- 若存在 $n (\ge 0)$ 个 `WillOnce()` 和一个 `WillRepeatedly()`，推断为 `Times(AtLeast(n))`。

`Times` 子句在单个期望中最多使用一次。

#### InSequence {#EXPECT_CALL.InSequence}

```cpp
.InSequence(sequences...)
```

指定模拟函数调用应在特定序列中发生。

参数 _`sequence...`_ 是任意数量的 [`Sequence`](#Sequence) 对象。
被分配到同一序列的期望必须按声明顺序发生。

例如，下列代码设置了 `my_mock` 的 `Reset()` 方法必须在 `GetSize()` 和 `Describe()` 之前调用，
而 `GetSize()` 和 `Describe()` 可按任意顺序调用的期望：

```cpp
using ::testing::Sequence;
Sequence s1, s2;
...
EXPECT_CALL(my_mock, Reset())
    .InSequence(s1, s2);
EXPECT_CALL(my_mock, GetSize())
    .InSequence(s1);
EXPECT_CALL(my_mock, Describe())
    .InSequence(s2);
```

`InSequence` 子句可在单个期望中多次使用。

另见 [`InSequence` 类](#InSequence)。

#### After {#EXPECT_CALL.After}

```cpp
.After(expectations...)
```

指定模拟函数调用应在其他调用之后发生。

参数 _`expectation...`_ 可以是至多五个 [`Expectation`](#Expectation) 或 [`ExpectationSet`](#ExpectationSet) 对象。
当前期望必须在所有指定期望之后发生。

例如，下列代码设置了 `my_mock` 的 `Describe()` 方法必须在 `InitX()` 和 `InitY()` 之后调用的期望：

```cpp
using ::testing::Expectation;
...
Expectation init_x = EXPECT_CALL(my_mock, InitX());
Expectation init_y = EXPECT_CALL(my_mock, InitY());
EXPECT_CALL(my_mock, Describe())
    .After(init_x, init_y);
```

当期望的前置条件数量较大或动态变化时，可以使用 `ExpectationSet`：

```cpp
using ::testing::ExpectationSet;
...
ExpectationSet all_inits;
// 收集所有 InitElement() 调用的期望
for (int i = 0; i < element_count; i++) {
  all_inits += EXPECT_CALL(my_mock, InitElement(i));
}
EXPECT_CALL(my_mock, Describe())
    .After(all_inits);  // 期望 Describe() 在所有 InitElement() 之后调用
```

`After` 子句可在单个期望中多次使用。

#### WillOnce {#EXPECT_CALL.WillOnce}

```cpp
.WillOnce(action)
```

为单个匹配函数指定调用时的实际行为。

参数 _`action`_ 表示函数调用要执行的[动作](../gmock_for_dummies.md#actions-what-should-it-do)。
要获取所有内置动作，请参阅[动作参考](actions.md)。

在未指定 `Times` 时，使用 `WillOnce` 会隐式设置调用次数。
参见 [`Times`](#EXPECT_CALL.Times)。

每次匹配调用将按声明顺序执行下一个动作。
例如，下列代码指定 `my_mock.GetNumber()` 应被调用 3 次，且分别返回 `1`、`2` 和 `3`：

```cpp
using ::testing::Return;
...
EXPECT_CALL(my_mock, GetNumber())
    .WillOnce(Return(1))
    .WillOnce(Return(2))
    .WillOnce(Return(3));
```

`WillOnce` 子句可在单个期望中多次使用。
与 `WillRepeatedly` 不同，每个 `WillOnce` 动作最多执行一次，因此可接受仅移动类型或带有 `&&` 限定符的动作。

#### WillRepeatedly {#EXPECT_CALL.WillRepeatedly}

```cpp
.WillRepeatedly(action)
```

为后续所有匹配函数指定调用时的实际行为。
在所有 `WillOnce` 动作（若存在）执行后生效。

参数 _`action`_ 表示函数调用要执行的[动作](../gmock_for_dummies.md#actions-what-should-it-do)。
要获取所有内置动作，请参阅[动作参考](actions.md)。

在未指定 `Times` 时，使用 `WillRepeatedly` 会隐式设置调用次数。
参见 [`Times`](#EXPECT_CALL.Times)。

若存在 `WillOnce` 子句，匹配到的调用将先执行这些动作，再执行 `WillRepeatedly` 指定的动作。
例如：

```cpp
using ::testing::Return;
...
EXPECT_CALL(my_mock, GetName())
    .WillRepeatedly(Return("John Doe"));  // 所有调用返回 "John Doe"

EXPECT_CALL(my_mock, GetNumber())
    .WillOnce(Return(42))        // 首次调用返回 42
    .WillRepeatedly(Return(7));  // 后续调用返回 7
```

`WillRepeatedly` 子句在单个期望中最多使用一次。

#### RetiresOnSaturation {#EXPECT_CALL.RetiresOnSaturation}

```cpp
.RetiresOnSaturation()
```

表示期望在达到预期调用次数后将不再生效。

`RetiresOnSaturation` 子句仅对调用次数存在上限的期望有效。
期望在**饱和**（_saturated_，达到上限）后将**退休**（_retire_，不再匹配任何调用）。
例如：

```cpp
using ::testing::_;
using ::testing::AnyNumber;
...
EXPECT_CALL(my_mock, SetNumber(_))  // 期望 1
    .Times(AnyNumber());
EXPECT_CALL(my_mock, SetNumber(7))  // 期望 2
    .Times(2)
    .RetiresOnSaturation();
```

这里，前两次 `my_mock.SetNumber(7)` 调用将匹配期望 2，之后期望 2 失效。
第三次调用将匹配期望 1。
若期望 2 未设置 `RetiresOnSaturation()`，第三次调用仍会匹配期望 2，导致期望因超出调用上限而失败。

`RetiresOnSaturation` 子句在单个期望中最多使用一次，且必须为最后一个子句。

### ON_CALL {#ON_CALL}

```cpp
ON_CALL(mock_object, method_name(matchers...))
```

定义当对象 _`mock_object`_ 的方法 _`method_name`_ 将以匹配给定匹配器 _`matchers...`_ 的参数被调用时的行为。
需要使用修饰子句来指定具体行为。
**不设置**方法必须被调用的期望。

参数 _`matcher...`_ 是与方法 _`method_name`_ 各参数对应的[匹配器](../gmock_for_dummies.md#matchers-what-arguments-do-we-expect)构成的逗号分隔列表。
该期望仅适用于参数与匹配器完全匹配的方法调用。
若省略 `(matcher...)`，则默认为每个参数使用[通配符匹配器 `_`](matchers.md#wildcard)。
要获取所有内置匹配器列表，请参阅[匹配器参考](matchers.md)。

其后可添加链式调用子句以设置方法行为，它们必须按如下顺序使用：

```cpp
ON_CALL(mock_object, method_name(matchers...))
    .With(multi_argument_matcher)  // 最多使用一次
    .WillByDefault(action);        // 必须使用
```

各修饰子句的详细信息见下文。

#### With {#ON_CALL.With}

```cpp
.With(multi_argument_matcher)
```

限制仅应用于参数整体与多参数匹配器 _`multi_argument_matcher`_ 匹配的模拟函数调用。

GoogleTest 会将所有参数作为元组传递给匹配器。
参数 _`multi_argument_matcher`_ 的类型必须是 `Matcher<std::tuple<A1, ..., An>>`，其中 `A1, ..., An` 是函数的参数类型。

例如，下列代码设置了当 `my_mock.SetPosition()` 的两个参数中第一个小于第二个时的行为：

```cpp
using ::testing::_;
using ::testing::Lt;
using ::testing::Return;
...
ON_CALL(my_mock, SetPosition(_, _))
    .With(Lt())
    .WillByDefault(Return(true));
```

GoogleTest 提供了一些内置的二元组匹配器，包括上面的 `Lt()`。
参见[多参数匹配器](matchers.md#multi-arg-matchers)。

`With` 子句在单个 `ON_CALL` 中最多使用一次。

#### WillByDefault {#ON_CALL.WillByDefault}

```cpp
.WillByDefault(action)
```

指定匹配到的模拟函数调用的默认行为。

参数 _`action`_ 表示函数调用要执行的[动作](../gmock_for_dummies.md#actions-what-should-it-do)。
要获取所有内置动作，请参阅[动作参考](actions.md)。

例如，下列代码指定 `my_mock.Greet()` 默认返回 `"hello"`：

```cpp
using ::testing::Return;
...
ON_CALL(my_mock, Greet())
    .WillByDefault(Return("hello"));
```

`WillByDefault` 指定的动作会被匹配的 `EXPECT_CALL` 语句中的动作覆盖。
参见 [`WillOnce`](#EXPECT_CALL.WillOnce) 和 [`WillRepeatedly`](#EXPECT_CALL.WillRepeatedly)。

`WillByDefault` 子句在单个 `ON_CALL` 必须且只能使用一次。

## 类 {#classes}

GoogleTest 定义了以下类来辅助操作模拟对象。

### DefaultValue {#DefaultValue}

```cpp
::testing::DefaultValue<T>
```

允许用户为可复制且具有公有析构函数的类型 `T` 指定默认值。
对于返回类型为 `T` 的模拟函数，当未指定任何动作时，将返回此默认值。

提供了静态方法 `Set()`、`SetFactory` 和 `Clear()` 来管理默认值：

```cpp
// 设置要返回的默认值；T 必须可复制构造
DefaultValue<T>::Set(value);

// 设置工厂函数；按需调用；T 必须可移动构造
T MakeT();
DefaultValue<T>::SetFactory(&MakeT);

// 清除设置的默认值
DefaultValue<T>::Clear();
```

### NiceMock {#NiceMock}

```cpp
::testing::NiceMock<T>
```

表示抑制了[无趣调用](../gmock_cook_book.md#uninteresting-vs-unexpected)警告的模拟对象。
模板参数 `T` 可以是任意模拟类（已经被 `NiceMock`、`NaggyMock` 或 `StrictMock` 修饰的除外）。

`NiceMock<T>` 的用法与 `T` 类似。
作为 `T` 的子类，`NiceMock<T>` 可用于任何接受 `T` 类型对象的场景。
此外，`NiceMock<T>` 还可使用任意 `T` 的构造函数。

例如，下列代码抑制了 `MockClass` 类型模拟对象 `my_mock` 在调用 `DoSomething()` 之外的方法时的警告：

```cpp
using ::testing::NiceMock;
...
NiceMock<MockClass> my_mock("some", "args");
EXPECT_CALL(my_mock, DoSomething());
// ... 使用 my_mock 的代码 ...
```

`NiceMock<T>` 仅对直接在 `T` 类中使用 `MOCK_METHOD` 宏定义的模拟方法有效。
若模拟方法定义于基类，仍可能产生警告。

若 `T` 的析构函数不是虚函数，`NiceMock<T>` 可能无法正常工作。

### NaggyMock {#NaggyMock}

```cpp
::testing::NaggyMock<T>
```

表示会生成[无趣调用](../gmock_cook_book.md#uninteresting-vs-unexpected)警告的模拟对象。
模板参数 `T` 可以是任意模拟类（已经被 `NiceMock`、`NaggyMock` 或 `StrictMock` 修饰的除外）。

`NaggyMock<T>` 的用法与 `T` 类似。
作为 `T` 的子类，`NaggyMock<T>` 可用于任何接受 `T` 类型对象的场景。
此外，`NaggyMock<T>` 还可使用任意 `T` 的构造函数。

例如，下列代码在 `MockClass` 类型模拟对象 `my_mock` 调用 `DoSomething()` 之外的方法时会产生警告：

```cpp
using ::testing::NiceMock;
...
NaggyMock<MockClass> my_mock("some", "args");
EXPECT_CALL(my_mock, DoSomething());
// ... 使用 my_mock 的代码 ...
```

默认情况下，`T` 类型的模拟对象与 `NaggyMock<T>` 行为相同。

### StrictMock {#StrictMock}

```cpp
::testing::StrictMock<T>
```

表示会将[无趣调用](../gmock_cook_book.md#uninteresting-vs-unexpected)视为错误的模拟对象。
模板参数 `T` 可以是任意模拟类（已经被 `NiceMock`、`NaggyMock` 或 `StrictMock` 修饰的除外）。

`StrictMock<T>` 的用法与 `T` 类似。
作为 `T` 的子类，`StrictMock<T>` 可用于任何接受 `T` 类型对象的场景。
此外，`StrictMock<T>` 还可使用任意 `T` 的构造函数。

例如，下列代码在 `MockClass` 类型模拟对象 `my_mock` 调用 `DoSomething()` 之外的方法时会触发错误：

```cpp
using ::testing::NiceMock;
...
StrictMock<MockClass> my_mock("some", "args");
EXPECT_CALL(my_mock, DoSomething());
// ... 使用 my_mock 的代码 ...
```

`StrictMock<T>` 仅对直接在 `T` 类中使用 `MOCK_METHOD` 宏定义的模拟方法有效。
若模拟方法定义于基类，仍可能产生警告。

若 `T` 的析构函数不是虚函数，`StrictMock<T>` 可能无法正常工作。

### Sequence {#Sequence}

```cpp
::testing::Sequence
```

表示期望的时序序列。
详细用法请参阅 `EXPECT_CALL` 的 [`InSequence`](#EXPECT_CALL.InSequence) 子句。

### InSequence {#InSequence}

```cpp
::testing::InSequence
```

该类型的对象会将其作用域内所有期望添加至一个匿名序列。

这便于表达多个按声明顺序执行的期望：

```cpp
using ::testing::InSequence;
{
  InSequence seq;

  // 以下期望按声明顺序执行
  EXPECT_CALL(...);
  EXPECT_CALL(...);
  ...
  EXPECT_CALL(...);
}
```

`InSequence` 对象的名称无关紧要。

### Expectation {#Expectation}

```cpp
::testing::Expectation
```

表示由 [`EXPECT_CALL`](#EXPECT_CALL) 创建的模拟函数调用期望：

```cpp
using ::testing::Expectation;
Expectation my_expectation = EXPECT_CALL(...);
```

用于指定期望序列，参见 `EXPECT_CALL` 的 [`After`](#EXPECT_CALL.After) 子句。

### ExpectationSet {#ExpectationSet}

```cpp
::testing::ExpectationSet
```

表示模拟函数调用期望的集合。

使用 `+=` 运算符来添加 [`Expectation`](#Expectation) 对象到集合中：

```cpp
using ::testing::ExpectationSet;
ExpectationSet my_expectations;
my_expectations += EXPECT_CALL(...);
```

用于指定期望序列，参见 `EXPECT_CALL` 的 [`After`](#EXPECT_CALL.After) 子句。
