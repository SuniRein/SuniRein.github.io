---
title: 旧式 gMock 常见问题解答
createTime: 2025-04-21 12:42:59
permalink: /gtest/249eoifn/
copyright:
  creation: translate
  source: https://google.github.io/googletest/gmock_faq.html
---

## 我在模拟对象上调用方法时，却调用了实际对象的方法。这是为什么？

要使方法能够被模拟，该方法必须声明为**虚函数**，除非使用[高性能依赖注入技术](gmock_cook_book.md#mocking-non-virtual-methods)。

## 能否模拟可变参数函数？

gMock 无法直接模拟可变参数函数（即使用省略号（`...`）参数的函数）。

问题在于，模拟对象通常**无法**知道可变参数方法接收的参数数量及其类型。
只有基类作者了解参数协议，而我们不能揣测其实现意图。

因此，要模拟此类函数，用户需要自行指导模拟对象如何解析参数数量和类型。
一种实现方式是提供函数的重载版本。

省略号参数继承自 C 语言，并非真正的 C++ 特性。
这类参数存在安全隐患，且不适用于带有构造函数或析构函数的参数。
因此我们建议在 C++ 中尽量避免使用。

## 定义带有 `const` 参数的模拟方法时，MSVC 报 C4301 或 C4373 警告。这是为什么？

使用 Microsoft Visual C++ 2005 SP1 编译以下代码时：

```cpp
class Foo {
  ...
  virtual void Bar(const int i) = 0;
};

class MockFoo : public Foo {
  ...
  MOCK_METHOD(void, Bar, (const int i), (override));
};
```

可能出现以下警告：

```ansi
warning C4301: 'MockFoo::Bar': overriding virtual function only differs from 'Foo::Bar' by const/volatile qualifier
```

这是 MSVC 的 bug。
相同代码在 gcc 等编译器上可正常编译。
若使用 Visual C++ 2008 SP1 则会出现：

```ansi
warning C4373: 'MockFoo::Bar': virtual function overrides 'Foo::Bar', previous versions of the compiler did not override when parameters only differed by const/volatile qualifiers
```


在 C++ 中，若声明函数参数为 `const`，该修饰符将被忽略。
因此上述 Foo 基类代码等效于：

```cpp
class Foo {
  ...
  virtual void Bar(int i) = 0;  // int 或 const int 实际上没有区别
};
```

实际使用中，可以在声明 `Bar()` 时使用 `int` 参数，而定义时使用 `const int` 参数，编译器仍能正确匹配。

既然在方法声明中使用 `const` 修饰参数没有实际意义，我们建议在 `Foo` 和 `MockFoo` 中移除该修饰符。
这也可以绕过 VC 的编译器问题。

::: warning

此处讨论的是顶层 `const` 修饰符。
若参数通过指针或引用传递，声明指针目标或引用对象为 `const` 仍有意义。
例如，以下两个声明**不等效**：


```cpp
void Bar(int* p);        // p 和 *p 都非 const
void Bar(const int* p);  // p 不是 const，但 *p 是
```

:::

## 如何排查 gMock 认为期望未满足的问题？

可在运行测试时添加 `--gmock_verbose=info` 参数。
该参数会输出 gMock 接收的所有模拟函数调用信息，通过分析这些信息可定位期望未满足的原因。

若出现提示信息 `The mock function has no default action set, and its return type has no default value set.`，
请尝试[设置默认动作](gmock_cheat_sheet.md#on-call)。
由于已知问题，没有默认动作的模拟函数在遇到意外调用时，不会打印实际参数与期望参数的详细对比。

## 程序崩溃时 `ScopedMockLog` 输出了大量信息。这是 gMock 的 bug 吗？

gMock 和 `ScopedMockLog` 在此情况下的行为是符合预期的。

当测试崩溃时，故障信号处理器会尝试记录大量信息（如堆栈跟踪和地址映射）。
若存在多个堆栈较深的线程，信息量会剧增。
当 `ScopedMockLog` 拦截到这些信息并发现其不匹配任何期望时，会打印每条信息的错误。

可以选择忽略这些错误，或者通过改进期望条件增强测试鲁棒性。
例如，添加：

```cpp
using ::testing::AnyNumber;
using ::testing::Not;
...
  // 
  EXPECT_CALL(log, Log(_, Not(EndsWith("/my_file.cc")), _))
      .Times(AnyNumber());
```

## 如何断言某个函数从未被调用？

```cpp
using ::testing::_;
...
  EXPECT_CALL(foo, Bar(_))
      .Times(0);
```

## 测试失败时 gMock 对同一期望报错了两次，这是否冗余？

当 gMock 检测到失败时，会输出相关信息（模拟函数参数、相关期望状态等）辅助调试。
若后续再次检测到失败，会重复输出相关信息，包括期望的状态。

虽然有时两次输出的期望状态描述相同，但这并非冗余，因为它们对应不同的时间节点。
相同的期望报错本身即是重要的调试信息。

## 使用模拟对象时出现堆检查错误，但使用真实对象则正常，可能是什么原因？

请检查被模拟的基类（应为纯接口类）是否声明了虚析构函数。

当继承基类时，必须确保其析构函数为虚函数，否则会导致严重问题。
参考以下代码：

```cpp
class Base {
 public:
  // 非虚函数，但本应为虚函数
  ~Base() { ... }
  ...
};

class Derived : public Base {
 public:
  ...
 private:
  std::string value_;
};

...
  Base* p = new Derived;
  ...
  delete p;  // 此处仅调用 ~Base()，未调用 ~Derived()
             // value_ 发生泄露
```

将 `~Base()` 改为虚函数后，执行 `delete p` 会正确调用 `~Derived()`，堆检查即可通过。

## "新期望覆盖旧期望"规则导致编写不便。为何如此设计？

开发者常抱怨如下场景：

```cpp
using ::testing::Return;
...
  // 要求 foo.Bar() 被调用两次，首次返回 1，第二次返回 2
  // 但必须逆序编写期望，非常反直觉！
  EXPECT_CALL(foo, Bar())
      .WillOnce(Return(2))
      .RetiresOnSaturation();
  EXPECT_CALL(foo, Bar())
      .WillOnce(Return(1))
      .RetiresOnSaturation();
```

问题根源在于没有采用最佳方法表达测试意图。

默认情况下，期望的匹配顺序是**任意的**。
如需指定匹配顺序，必须显式声明。
这是 gMock（及 jMock）的核心设计哲学：用户易过度指定测试顺序导致测试脆弱，因此需增加实现难度。

推荐两种改进方式。
其一，使用顺序块：

```cpp
using ::testing::Return;
...
  // 这里使用顺序块，实现自然顺序编写
  {
    InSequence s; // [!code highlight]
    EXPECT_CALL(foo, Bar())
        .WillOnce(Return(1))
        .RetiresOnSaturation();
    EXPECT_CALL(foo, Bar())
        .WillOnce(Return(2))
        .RetiresOnSaturation();
  }
```

其二，在同一期望中声明多个动作：

```cpp
using ::testing::Return;
...
  EXPECT_CALL(foo, Bar())
      // [!code highlight:2]
      .WillOnce(Return(1))
      .WillOnce(Return(2))
      .RetiresOnSaturation();
```

::: info 逆向搜索机制的设计初衷
允许用户在早期设置阶段（如模拟对象构造函数或测试夹具的 `SetUp` 中）定义通用行为，后续再通过具体测试用例进行特化。
若采用正向搜索，该模式将无法实现。
:::

## 设置 `ON_CALL` 但未设置 `EXPECT_CALL` 时，gMock 会警告。是否应抑制此类警告？

在简洁与安全之间，gMock 选择后者，因此保留警告输出是合理的设计。

在模拟对象构造函数或 `SetUp()` 中设置 `ON_CALL` 作为默认行为，而具体测试用例中通过 `EXPECT_CALL` 定义特殊预期是一种常见做法。
设置了 `ON_CALL` 并不表示预期调用，若未设置 `EXPECT_CALL` 却发生调用，可能意味着潜在错误。
静默放行此类调用易导致问题不被发现。

如果用户确信调用是合理的，可用以下方式：

```cpp
using ::testing::_;
...
  EXPECT_CALL(foo, Bar(_))
      .WillRepeatedly(...);
```

而非：

```cpp
using ::testing::_;
...
  ON_CALL(foo, Bar(_))
      .WillByDefault(...);
```

这会告知 gMock 该调用属于预期行为，不再触发警告。

用户也可以在调试时可通过 `--gmock_verbose=error` 调节输出级别（可选值包括 `info` 或 `warning`）。
若调试时日志信息过多，只需降低输出级别。

## 如何在动作中 `delete` 模拟函数参数？

若需 `delete` 模拟函数中的指针参数，可使用 `testing::DeleteArg<N>()`：

```cpp
using ::testing::_;
  ...
  MOCK_METHOD(void, Bar, (X* x, const Y& y));
  ...
  EXPECT_CALL(mock_foo_, Bar(_, _))
      .WillOnce(testing::DeleteArg<0>()));
```

## 如何对模拟函数参数执行自定义操作？

如需执行 gMock 未直接支持的操作，可通过以下方式实现：

- 使用 [`MakeAction()`](gmock_cook_book.md#new-mono-actions) 或 [`MakePolymorphicAction()`](gmock_cook_book.md#new-poly-actions) 定义自定义操作。
- 编写桩函数并通过 [`Invoke()`](gmock_cook_book.md#functions-as-actions) 调用。

```cpp
using ::testing::_;
using ::testing::Invoke;
  ...
  MOCK_METHOD(void, Bar, (X* p));
  ...
  EXPECT_CALL(mock_foo_, Bar(_))
      .WillOnce(Invoke(MyAction(...)));
```

## 能否模拟静态/全局函数？

技术上可行，但建议重构代码。

静态函数调用通常意味着模块耦合度过高，同时也意味着更低的灵活性、可复用性、可测试性等。
推荐用小型接口进行封装，通过接口实现模拟。
这需要一些额外的初始投入，但很快就能感受到其带来的好处。

可以参考这篇 Google Testing Blog 的[博客](https://testing.googleblog.com/2008/06/defeat-static-cling.html)。

## 模拟对象需要执行复杂操作时配置繁琐——gMock 很难用！

虽然这不是一个问题，但我们仍将给出解答。:-)

使用 gMock 可以轻松创建 C++ 模拟对象。
开发者可能倾向于随处使用它们。
某些场景下它们效果良好，但有时你可能会觉得使用体验欠佳。
那么问题出在哪里？

当你编写不使用模拟的测试时，会执行代码并断言其返回正确值或系统处于预期状态。
这种测试方式被称为“基于状态的测试”。

模拟对象在“基于交互的测试”中表现卓越：
不同于最终检查系统状态的方式，模拟对象会验证其是否被正确调用，并在问题出现时立即报错，使你能精准定位错误发生的上下文环境。
相较于基于状态的测试，这种方式通常更高效、更经济。

若你正在进行基于状态的测试，且仅使用测试替身来模拟真实对象，则更适合使用伪对象（_fake_）。
此时使用模拟对象会导致不便，因为执行复杂操作并非模拟对象的强项。
如果你遇到此类问题，并因此认为模拟对象难用，说明你可能选错了工具，或者试图解决错误的问题。

## 出现 `Uninteresting function call encountered - default action taken..` 警告时，需要担忧吗？

完全不需要！这只是提示信息。:-)

该警告表示：你定义的模拟函数未被设置任何期望
（根据 gMock 规则，这意味着你不关注此函数的调用，因此可被任意次数调用），
但该函数确实被调用了。
这完全正常——你从未声明禁止调用此函数！

但如果你实际意图是禁止调用该函数，却忘记编写 `EXPECT_CALL(foo, Bar()).Times(0)`，该怎么办？
虽然这可以归咎于用户的失误，但 gMock 仍会友好地输出提示信息。

因此，当你看到此消息并确信不应存在未关注的调用时，应当调查具体原因。
为便于调试，gMock 会在遇到无趣调用时输出堆栈跟踪信息。
通过该信息，可以定位具体的模拟函数及其调用方式。

## 定义自定义动作时，应该使用 `Invoke()` 还是实现 `ActionInterface` 接口？

两种方式均可，用户应根据具体场景选择最便捷的方式。

通常，若动作针对特定函数类型，使用 `Invoke()` 定义更简便。
若动作需适用于多种函数类型（例如 `Return(value)`），则使用 `MakePolymorphicAction()` 最合适。
当需要精确控制动作适用的函数类型时，实现 `ActionInterface` 接口是最佳选择。
具体示例可参考 `gmock-actions.h` 中 `Return()` 的实现。

## 在 `WillOnce()` 中使用 `SetArgPointee()` 时，gcc 报错 `conflicting return type specified`。这是什么意思？

此错误源于 gMock 无法确定模拟方法调用时应返回的值。
`SetArgPointee()` 仅设置副作用，未指定返回值。
你需要使用 `DoAll()` 来组合 `SetArgPointee()` 与提供适当返回值的 `Return()`。

更多细节和示例详见[这里](gmock_cook_book.md#mocking-side-effects)。

## 大型模拟类导致 Microsoft Visual C++ 编译时内存不足，如何解决？

我们注意到当使用 `/clr` 编译选项时，Visual C++ 会消耗 5~6 倍内存来编译模拟类。
建议在编译 C++ 模拟对象时避免使用 `/clr` 选项。
