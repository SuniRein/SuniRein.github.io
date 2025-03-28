---
title: gMock 速查表
createTime: 2025/03/28 15:23:01
permalink: /gtest/6n002mhf/
copyright:
  creation: translate
  source: https://google.github.io/googletest/gmock_cheat_sheet.html
---

## 定义模拟类

### 模拟普通类 {#mock-class}

给定

```cpp
class Foo {
 public:
  virtual ~Foo();
  virtual int GetSize() const = 0;
  virtual string Describe(const char* name) = 0;
  virtual string Describe(int type) = 0;
  virtual bool Process(Bar elem, int count) = 0;
};
```

我们可以定义其模拟类为：

```cpp
#include <gmock/gmock.h>

class MockFoo : public Foo {
 public:
  MOCK_METHOD(int, GetSize, (), (const, override));
  MOCK_METHOD(string, Describe, (const char* name), (override));
  MOCK_METHOD(string, Describe, (int type), (override));
  MOCK_METHOD(bool, Process, (Bar elem, int count), (override));
};
```

要创建忽略所有无趣调用的“友好”模拟、警告所有无趣调用的“唠叨”模拟，或将无趣调用视为失败的“严格”模拟：

```cpp
using ::testing::NiceMock;
using ::testing::NaggyMock;
using ::testing::StrictMock;

NiceMock<MockFoo> nice_foo;      // 类型为 MockFoo 的子类
NaggyMock<MockFoo> naggy_foo;    // 类型为 MockFoo 的子类
StrictMock<MockFoo> strict_foo;  // 类型为 MockFoo 的子类
```

::: note
目前，模拟对象默认采用唠叨模式。
未来可能会改为友好模式。
:::

### 模拟类模板 {#mock-template}

类模板可以像普通类一样进行模拟。

给定模板类

```cpp
template <typename Elem>
class StackInterface {
 public:
  virtual ~StackInterface();
  virtual int GetSize() const = 0;
  virtual void Push(const Elem& x) = 0;
};
```

（注意所有需要模拟的成员函数，包括 `~StackInterface()` 必须为虚函数）

```cpp
template <typename Elem>
class MockStack : public StackInterface<Elem> {
 public:
  MOCK_METHOD(int, GetSize, (), (const, override));
  MOCK_METHOD(void, Push, (const Elem& x), (override));
};
```

### 指定模拟函数的调用约定

若需为模拟函数指定非默认调用约定，可为 `MOCK_METHOD` 添加第四个参数 `Calltype(convention)`。
例如：

```cpp
MOCK_METHOD(bool, Foo, (int n), (Calltype(STDMETHODCALLTYPE)));
MOCK_METHOD(int, Bar, (double x, double y),
            (const, Calltype(STDMETHODCALLTYPE)));
```

其中 `STDMETHODCALLTYPE` 由 Windows 的 `<objbase.h>` 头文件定义。

## 在测试中使用模拟对象 {#using-mocks}

典型的工作流程如下：

::: steps

1. 导入需要使用的 gMock 名称。
   所有 gMock 符号均位于 `testing` 命名空间（宏和其他特殊标注的除外）。
2. 创建模拟对象。
3. （可选）设置模拟对象的默认操作。
4. 在模拟对象上设置期望（调用方式？执行操作？）。
5. 执行使用模拟对象的代码，必要时使用 googletest 断言验证结果。
6. 当模拟对象析构时，gMock 会自动验证所有期望是否满足。

:::

示例：

```cpp
using ::testing::Return;                          // #1

TEST(BarTest, DoesThis) {
  MockFoo foo;                                    // #2

  ON_CALL(foo, GetSize())                         // #3
      .WillByDefault(Return(1));
  // ... 其他默认动作 ...

  EXPECT_CALL(foo, Describe(5))                   // #4
      .Times(3)
      .WillRepeatedly(Return("Category 5"));
  // ... 其他期望 ...

  EXPECT_EQ(MyProductionFunction(&foo), "good");  // #5
}                                                 // #6
```

## 设置默认动作 {#on-call}

对于返回类型为 `void`、`bool`、数值类型或指针的函数，gMock 提供了内置默认动作。
另外，在 C++11 中，若类型存在默认构造函数，gMock 将返回默认构造值。

如果要为返回类型为 `T` 的函数定制默认动作，可使用 [`DefaultValue<T>`](TODO:reference/mocking.md#DefaultValue)。
例如：

```cpp
// 设置返回类型 std::unique_ptr<Buzz> 的默认动作为每次创建新 Buzz 对象
DefaultValue<std::unique_ptr<Buzz>>::SetFactory(
    [] { return std::make_unique<Buzz>(AccessLevel::kInternal); });

// 当触发时，将运行 MakeBuzz() 的默认动作，创建新 Buzz 对象
EXPECT_CALL(mock_buzzer_, MakeBuzz("hello")).Times(AnyNumber());

auto buzz1 = mock_buzzer_.MakeBuzz("hello");
auto buzz2 = mock_buzzer_.MakeBuzz("hello");
EXPECT_NE(buzz1, nullptr);
EXPECT_NE(buzz2, nullptr);
EXPECT_NE(buzz1, buzz2);

// 重置 std::unique_ptr<Buzz> 的默认动作，避免影响其他测试
DefaultValue<std::unique_ptr<Buzz>>::Clear();
```

要为特定模拟对象的某个方法定制默认操作，可使用 [`ON_CALL`](TODO:reference/mocking.md#ON_CALL)。
`ON_CALL` 的语法与 `EXPECT_CALL` 类似，但不要求方法必须被调用。
详见[了解何时设置期望](gmock_cook_book.md#use-on-call)。

## 设置期望 {#expect-call}

参阅模拟参考手册中的 [`EXPECT_CALL`](TODO:reference/mocking.md#EXPECT_CALL) 一节。

## 匹配器 {#matcher-list}

参阅[匹配器参考手册](TODO:reference/matchers.md)

## 动作 {#action-list}

参阅[动作参考手册](TODO:reference/actions.md)。

## 基数 {#cardinality-list}

参阅模拟参考手册中 `EXPECT_CALL` 的 [`Times` 子句](TODO:reference/mocking.md#EXPECT_CALL.Times) 一节。

## 期望的顺序

默认情况下，期望可以按任意顺序匹配。
如需指定部分或全部期望的匹配顺序，可使用 `EXPECT_CALL` 的
[`After` 子句](TODO:reference/mocking.md#EXPECT_CALL.After)、
[`InSequence` 子句](TODO:reference/mocking.md#EXPECT_CALL.InSequence)，或者使用
[`InSequence` 对象](TODO:reference/mocking.md#InSequence)。

## 验证并重置模拟对象

gMock 会在模拟对象析构时自动验证期望，你也可手动提前验证：

```cpp
using ::testing::Mock;
...
// 验证并清除 mock_obj 上的期望，返回期望是否匹配
Mock::VerifyAndClearExpectations(&mock_obj);
...
// 验证并清除 mock_obj 上的期望及 ON_CALL 设置的默认动作，返回期望是否匹配
Mock::VerifyAndClear(&mock_obj);
```

验证并重置模拟对象后，请勿再设置新的期望。
在已执行模拟操作的代码后设置期望将导致未定义行为。
详见[在测试中使用模拟对象](gmock_for_dummies.md#using-mocks-in-tests)。

你也可以允许模拟对象内存泄漏且无需验证：

```cpp
Mock::AllowLeak(&mock_obj);
```

## 模拟函数类

gMock 定义了便捷的模拟函数类模板：

```cpp
class MockFunction<R(A1, ..., An)> {
 public:
  MOCK_METHOD(R, Call, (A1, ..., An));
};
```

具体应用示例可参考[此处](gmock_cook_book.md#using-checkpoints)。

## 命令行标志

| 标志                           | 描述                                                      |
| :----------------------------- | :-------------------------------------------------------- |
| `--gmock_catch_leaked_mocks=0` | 不将模拟对象泄漏报告为测试失败                            |
| `--gmock_verbose=LEVEL`        | 设置 gMock 消息的详细级别（`info`、`warning` 或 `error`） |
