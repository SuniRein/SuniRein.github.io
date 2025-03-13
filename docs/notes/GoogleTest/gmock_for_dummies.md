---
title: gMock 入门基础
createTime: 2025-03-13 19:44:44
permalink: /gtest/r9j2f3d3/
copyright:
  creation: translate
  source: https://google.github.io/googletest/gmock_for_dummies.html
---

## 什么是 gMock ？

在编写原型（_prototype_）或测试时，完全依赖真实对象的行为往往不可行或不够明智。
==模拟对象==（_mock object_）实现了与真实对象相同的接口，可以替代真实对象。
你可以在运行时指定和观察模拟对象的行为，如“哪些方法会被调用？”“按什么顺序调用？”“调用多少次？”“使用什么参数？”“返回什么值？”等等。

人们常常会混淆==伪对象==（_fake object_）与模拟对象的概念。
在测试驱动开发（_TDD_）领域中，这两者有着本质区别：

- **伪对象**实现了原有对象的功能，但通常采用某些简化方式（可能是为了降低运行成本），因此不适合生产环境。
  内存文件系统就是一个典型案例。
- **模拟对象**只是按照对象原本的行为，预先设定了一些==期望==（_expectation_），而没有实现完整的功能。

如果这些概念对你来说过于抽象，不必担心——你现在只需记住：模拟对象允许你验证其与被测代码之间的**交互行为**。
一旦开始实际使用，你就能清晰感受到这两者的区别。

==gMock== 是一个用于创建和使用模拟对象类（以下简称“模拟类”）的库（有时也将其称为"框架"以彰显其专业性）。
它为 C++ 提供了与 Java 中的 jMock/EasyMock 类似的功能，虽然实现方式有所不同，但核心理念相通。

使用 gMock 时：

1. 首先通过一些简单的宏来描述你需要模拟的接口，这些宏会自动展开成模拟类的实现；
2. 接着创建模拟对象，使用直观的语法来描述对象的期望（_expectation_）与行为；
3. 最后执行那些使用模拟对象的代码。
   gMock 会即时捕捉任何违反期望的情况。

## 为什么选择 gMock？

虽然模拟对象能减少测试中不必要的依赖，使测试更加高效可靠，但在 C++ 中手动实现模拟对象十分**困难**：

- 需要人工编写模拟类实现。这类工作通常枯燥且容易出错，许多开发者都避而远之。
- 手写编写的模拟对象质量参差不齐。
  你可能看到精心设计的实现，也可能遇到仓促完成、充斥各种限制的版本。
- 通过使用某个模拟对象获得的经验难以运用到其他场景。

相比之下，Java 和 Python 开发者拥有优秀的模拟框架（jMock、EasyMock 等），可以自动创建模拟对象。
在这些语言社区里，模拟被证明是一种高效的技术，在开发中得到广泛运用。
使用合适的工具为这些开发者带来了质的改变。

gMock 专为 C++ 开发者打造。
其设计灵感源自 jMock 和 EasyMock，同时充分考虑了 C++ 的语言特性。
如果你正面临以下问题，gMock 将成为你的得力助手：

- 受困于某些次优设计，希望趁为时未晚进行更多原型验证，但 C++ 的原型开发缺乏效率。
- 测试因依赖过多库或使用昂贵资源（如数据库）而运行缓慢。
- 测试因使用不可靠资源（如网络）而不稳定。
- 需要测试代码对故障（如文件校验错误）的处理逻辑，但难以人为制造故障。
- 需要验证模块间的正确交互，但难以直接观测交互过程，因此只能通过观测最终副作用来间接判断。
- 希望模拟依赖项，但它们没有模拟版本，或者你对那些手写的笨拙模拟不感兴趣。

我们建议你从两个维度来使用 gMock：

- 作为**设计工具**：让你能够及早且更频繁地进行接口设计测试。更多迭代带来更优设计。
- 作为**测试工具**：减少测试的外部依赖；探究模块与其协作者之间的交互细节。

## 快速开始

gMock 与 googletest 捆绑发布。

## 模拟对象使用案例

我们通过一个具体案例来理解模拟对象的作用。
假设你正在开发一个依赖 [LOGO](https://en.wikipedia.org/wiki/Logo_programming_language) 风格 API 的绘图程序，
你会如何验证其绘制逻辑的正确性？
直接运行程序并与基准屏幕快照（_golden screen snapshot_）对比看似可行，但这种测试方式存在明显缺陷：

- 测试的运行成本高昂。
- 测试结果容易被破坏：如果你更换了一张新显卡，抗锯齿性能更好，你需要重新生成所有的基准图像。

如果所有测试都采用这种方式，维护成本将难以承受。
[依赖注入（_Dependency Injection_）](https://en.wikipedia.org/wiki/Dependency_injection)
提供了一种更好的解决方案：通过抽象接口隔离系统 API，解耦对象逻辑与具体实现。
我们可定义如下的 `Turtle` 接口：

```cpp
class Turtle {
  ...
  virtual ~Turtle() {}
  virtual void PenUp() = 0;
  virtual void PenDown() = 0;
  virtual void Forward(int distance) = 0;
  virtual void Turn(int degrees) = 0;
  virtual void GoTo(int x, int y) = 0;
  virtual int GetX() const = 0;
  virtual int GetY() const = 0;
};
```

::: warning
`Turtle` 类的析构函数必须被声明为虚函数，否则将无法正确使用基类指针来删除派生类对象。
:::

你可以用 `PenUp()` 和 `PenDown()` 来控制 `Trutle` 对象在移动时是否产生轨迹，
用 `Forward()`、`Turn()`、`GoTo()` 来控制对象的移动，
并用 `GetX()` 和 `GetY()` 来获取当前所处位置。

通过在实际运行中使用真实实现，而在测试中使用模拟实现，你可以

- 精确获取程序调用不同绘图指令的顺序与调用参数。
- 增强测试的鲁棒性：测试不会因图形硬件差异而产生不同结果。
- 使测试易于阅读和维护：测试逻辑直接展现在代码中，而不是图像文件中。
- 大大提高测试运行速度。

## 编写模拟类

有时你可能足够幸运，已经有人为你实现需要使用的模拟类了。
不过，即使你需要自己编写，也不必担心，gMock 使这个任务几乎成为一场有趣的游戏。

### 如何定义模拟类？

以 `Turtle` 接口为例，你需要遵循以下步骤：

::: steps

- 从 `Turtle` 派生出 `MockTurtle` 类。
- 选取要模拟的虚函数（尽管 gmock 支持[通过模板模拟非虚函数](<!-- TODO:gmock_cook_book.md#MockingNonVirtualMethods -->)，
  但实现起来较为复杂）。
- 在 `public:` 区域使用 `MOCK_METHOD()` 宏。
- 现在到了最重要的一步：
  将函数签名拆分成返回类型、函数名和参数列表，分别作为宏的三个参数。
- 如果该函数为 `const` 修饰，添加 `(const)` 作为第四个参数（这里括号是必要的）。
- 由于你是在重写一个虚函数，我们建议给该函数添加 `override` 修饰。
  如果函数已被 `const` 修饰，则将第四个参数改为 `(const, override)`，否则直接使用 `(override)`。
- 重复上述步骤，处理你要模拟的所有函数。
  注意，即使不需要模拟，你也必须为所有纯虚函数提供一份实现。

:::

完成上述步骤后，你会得到类似下面的示例：

```cpp
#include <gmock/gmock.h>  // 导入 gMock 库

class MockTurtle : public Turtle {
 public:
  ...
  // 模拟无参数方法
  MOCK_METHOD(void, PenUp, (), (override));
  MOCK_METHOD(void, PenDown, (), (override));

  // 模拟有参数方法
  MOCK_METHOD(void, Forward, (int distance), (override));
  MOCK_METHOD(void, Turn, (int degrees), (override));
  MOCK_METHOD(void, GoTo, (int x, int y), (override));

  // 模拟 const 方法
  MOCK_METHOD(int, GetX, (), (const, override));
  MOCK_METHOD(int, GetY, (), (const, override));
};
```

`MOCK_METHOD` 宏已经自动生成了所有必要的代码，因此你无需手动实现这些模拟方法。

### 模拟类的存放位置

你需要慎重考虑模拟类的存放位置。

很多人会将它直接放在 `_test.cc` 文件中。
当接口（这里假定为 `Foo`）与测试同属一个人或团队时，这样做是可行的。
否则，当 `Foo` 的所有者修改了接口了，测试可能会失效。
（你不能指望 `Foo` 的所有者来修复所有相关的测试。）

一般而言，你不应该模拟不属于你的类。
如果真的有这样做的必要，将定义存放在 `Foo` 所属的 Bazel 包中：
在同一目录或其 `testing` 子目录下创建一个 `.h` 头文件，并相应创建 `testonly=true` 的 `cc_library`。
这样每个人都可以在他们的测试中引入该模拟类，而一旦有变更发生，只需要修改这一处。

另一种更推荐的方式是引入一个 `FooAdaptor` 中间层——它完全属于你，因此你可以从容处理 `Foo` 接口变化的影响。
尽管这会增加初始开发成本，但一个合理的中间层相比 `Foo` 更能满足你的特定需求，从而可以提高代码的可读性和可维护性。

## 在测试中使用模拟对象

使用模拟对象的典型工作流程如下：

::: steps

1. 从 `testing` 命名空间中导入需要使用的 gMock 符号。
1. 创建模拟对象的实例。
1. 设置模拟对象的期望，如方法的调用次数、调用参数和行为模式等。
1. 运行使用模拟对象的测试代码，可搭配 googletest 断言来验证结果。
1. 当模拟对象析构时，gMock 会自动检测所有期望是否满足。

:::

以下为完整示例（对应步骤已用编号标注好）：

```cpp
#include "path/to/mock-turtle.h"
#include <gmock/gmock.h>
#include <gtest/gtest.h>

using ::testing::AtLeast;                      // #1

TEST(PainterTest, CanDrawSomething) {
  MockTurtle turtle;                           // #2
  EXPECT_CALL(turtle, PenDown())               // #3
      .Times(AtLeast(1));

  Painter painter(&turtle);                    // #4

  EXPECT_TRUE(painter.DrawCircle(0, 0, 10));
}                                              // #5
```

上述测试验证 `PenDown()` 方法会被调用至少一次。
如果 `painter` 实际上没有调用 `PenDown()` 方法，测试会失败并输出以下信息：

```ansi
path/to/my_test.cc:119: Failure
Actual function call count doesn't match this expectation:
Actually: never called;
Expected: called at least once.
Stack trace:
...
```

::: tip
在 Emacs 中可直接在错误行号上敲击回车，以跳转到未通过的期望的位置。
:::

::: warning
如果模拟对象没有被析构，对期望值的验证将不会发生。
因此，最好在测试中启用堆检查器。
`gtest_main` 中已经自动启用该机制。
:::

::: important 设置期望的注意事项

gMock 要求必须在模拟方法被调用**之前**设置期望，否则将导致**未定义行为**。
禁止在模拟方法的调用过程中穿插设置期望，以及在调用结束后设置期望。

这意味着 `EXPECT_CALL()` 应被理解为对**未来**调用的期望，而不是对过去行为的验证。
gMock 采用这种设计，旨在当期望未通过时能立即报错，同时保留完整的运行上下文（如堆栈信息），提高调试效率。

:::

尽管本例较为简单，即使不用 gMock 也能轻松实现类似的效果，但 gMock 的威力远不止于此。
在后面的进一步学习后，你便能对 gMock 的强大有所体会。

## 设置期望

设置合适的期望是正确用好模拟对象的关键。
如果期望设置得过于严格，测试可能会因无关的更改而失败；
如果设置得过于宽松，又可能无法发现潜在的错误。
你需要找到合适平衡点，让测试能精确捕获应该发现的错误类型。
gMock 提供了实现这种平衡的必要工具。

### 基本语法

在 gMock 中，我们使用 `EXPECT_CALL()` 宏来为模拟方法设置期望。其基本语法为：

```cpp
EXPECT_CALL(mock_object, method(matchers))
    .Times(cardinality)
    .WillOnce(action)
    .WillRepeatedly(action);
```

该宏接受两个参数，第一个是模拟对象，第二个是要模拟的方法和参数。
出于技术原因，你应该用 `,` 而不是用 `.` 隔开两者。
若方法没有重载，`matcher` 可以被省略：

```cpp
EXPECT_CALL(mock_object, non-overloaded-method)
    .Times(cardinality)
    .WillOnce(action)
    .WillRepeatedly(action);
```

这种语法允许测试编写者在表示“允许用任意参数调用该方法”时，无需显式指定参数数量或类型。
为避免产生歧义，该语法仅适用于无重载的方法。

这两种形式的语法后均可接若干子句，用来提供更详细的期望描述。
我们将在后续章节中讨论不同子句的作用。

这种语法设计旨在让期望设置读起来像自然语言。
例如，你可能猜到以下代码：

```cpp
using ::testing::Return;
...
EXPECT_CALL(turtle, GetX())
    .Times(5)
    .WillOnce(Return(100))
    .WillOnce(Return(150))
    .WillRepeatedly(Return(200));
```

表示 `Turtle` 对象的 `GetX()` 方法将被调用五次：
第一次返回 100，第二次返回 150，剩下每次都返回 200。
有些人将这种语法风格称为**领域特定语言**（_Domain-Specific Language_, _DSL_）。

::: info 为什么使用宏来设置期望？
这主要出于两个目的：
一是让期望易于识别，无论是通过 `grep` 等工具还是人工阅读代码；
二是允许 gMock 在错误消息中包含期望的源码位置，便于调试。
:::

### 匹配器：对参数值的期望

当模拟方法接收参数时，我们可以指定期望的参数值，例如：

```cpp
// 期望 turtle 前进 50 个单位
EXPECT_CALL(turtle, Forward(100));
```

但通常我们不希望参数限定过于严格——这会降低测试的稳定性。
因此我们建议只做必要的参数限定。
如果你不关心参数值，可以使用 `_` 作为参数。

```cpp
using ::testing::_;
...
// 期望 turtle 跳转到 x=50 轴线上的任意位置
EXPECT_CALL(turtle, GoTo(50, _));
```

`_` 是表示“允许任意值”的==匹配器==（_matcher_）。
匹配器类似于谓词，可以验证参数是否符合预期。
在 `EXPECT_CALL()` 中，任何需要函数参数的地方都可以使用匹配器。

上面示例中的 `100` 和 `50` 也是匹配器，它们等价于 `Eq(100)` 和 `Eq(50)`，表示函数参数必须与匹配器参数相等（使用 `operator==`）。
gMock 为常见类型提供了许多[内置匹配器](<!-- TODO:reference/matchers.md -->)，同时也支持[自定义匹配器](<!-- TODO:gmock_cook_book.md#NewMatchers -->)。
例如：

```cpp
using ::testing::Ge;
...
// 期望 turtle 前进至少 100 个单位
EXPECT_CALL(turtle, Forward(Ge(100)));
```

如果你完全不关心参数值，可以省略参数列表，而不必将每个参数标注为 `_`：

```cpp
// Expects the turtle to move forward.
EXPECT_CALL(turtle, Forward);
// Expects the turtle to jump somewhere.
EXPECT_CALL(turtle, GoTo);
```

不过，这种语法仅适用于没有重载的方法。
如果方法存在重载，需通过指定参数数量甚至[参数类型](<!-- TODO:gmock_cook_book.md#SelectOverload -->)来帮助 gMock 解析要使用的重载版本。

### 基数：对调用次数的期望

`EXPECT_CALL()` 后第一个可以指定的子句是 `Times()`。
它的参数称为==基数==（_cardinality_），表示对方法**调用次数**的期望。
使用该子句可以避免为相同的方法调用重复书写相同的期望。
不仅如此，基数还可以是模糊（_fuzzy_）值，具有很高的灵活性，能帮助用户精确表达测试意图。

基数 `Times(0)` 具有特殊含义，它表明带指定参数的调用不应发生。
若发生此类调用，gMock 将产生一个失败。

在前面的示例中，我们已经接触过像 `AtLeast(n)` 这样的模糊基数。
你可以在[此处](<!-- TODO:gmock_cheat_sheet.md#CardinalityList -->)查阅完整的内置基数列表。

`Times()` 子句可以省略。
若省略 `Times()`，gMock 会根据以下规则自动推断基数：

- 若 `WillOnce()` 和 `WillRepeatedly()` 都未给定，推断为 `Times(1)`。
- 若存在 $n (\ge 1)$ 个 `WillOnce()`，但不存在 `WillRepeatedly()`，推断为 `Times(n)`。
- 若存在 $n (\ge 0)$ 个 `WillOnce()` 和一个 `WillRepeatedly()`，推断为 `Times(AtLeast(n))`。

::: note 思考题
若某方法预期调用两次但实际调用四次，会发生什么？
:::

### 动作：设置方法的行为

模拟对象本身并不具备真正的功能实现，作为用户，我们需要指定方法被调用时的行为。

gMock 为模拟方法提供了默认行为，若用户未指定动作，则采用默认行为：

- 当返回类型是内置类型或指针时，`void` 函数直接返回，`bool` 函数返回 `false`，其他类型返回 0。
- 在 C++11 及以上版本中，若返回类型具有默认构造函数，返回默认构造的值。

如果模拟方法没有默认行为，或者默认行为并不适用，可以使用 `WillOnce()` 和 `WillRepeatedly()` 子句来定制方法行为。
例如：

```cpp
using ::testing::Return;
...
EXPECT_CALL(turtle, GetX())
     .WillOnce(Return(100))
     .WillOnce(Return(200))
     .WillOnce(Return(300));
```

表示 `turtle.GetX()` 会被调用恰好三次（由 gMock 自动推断），且分别返回 100、200 和 300。

```cpp
using ::testing::Return;
...
EXPECT_CALL(turtle, GetY())
     .WillOnce(Return(100))
     .WillOnce(Return(200))
     .WillRepeatedly(Return(300));
```

表示 `turtle.GetY()` 会被调用至少两次（由 gMock 自动推断），前两次分别返回 100 和 200，之后始终返回 300。

如果你显示指定了 `Times()`，gMock 将不再自动推断基数。
这时，如果你指定的基数超出 `WillOnce()` 描述的数量，且没有指定 `WillRepeatedly()`，在耗尽所有 `WillOnce()` 后，方法将执行默认行为。

在设置动作时，除了 `Return()` 外，还可以使用 `RuturnRef(`_`variable`_`)` 来返回引用，或者执行其他[预定义行为](<!-- TODO:gmock_cook_book.md#using-actions -->)。

::: warning
`EXPECT_CALL()` 语句仅会执行动作子句一次，即使该动作可能被多次执行，因此需谨慎对待副作用。

例如，以下代码将无法实现预期效果：

```cpp
using ::testing::Return;
...
int n = 100;
EXPECT_CALL(turtle, GetX())
    .Times(4)
    .WillRepeatedly(Return(n++));
```

`n++` 语句只会被执行一次，因此该方法将始终返回 100，而不是 100、101、102、...。
类似地，`Return(new Foo)` 会在 `EXPECT_CALL()` 执行时创建一个 `Foo` 对象，之后每次都会返回相同的指针。
如果你希望副作用能够正常发生，可以使用自定义动作，这部分将在 [<!-- TODO:cook book -->](gmock_cook_book.md) 中提及。

:::

::: note 思考题

思考下面代码的含义：

```cpp
using ::testing::Return;
...
EXPECT_CALL(turtle, GetY())
    .Times(4)
    .WillOnce(Return(100));
```

**答案**：
!!`turtle.GetY()` 期望被调用四次，第一次返回 100，剩下三次返回 0 （`int` 的默认行为）。!!

:::

### 设置多重期望 {#multi-expectations}

在前面的示例中，我们只展示了使用一个期望的情况。
在实际测试中，我们可能需要为模拟对象的某一方法设置多重期望。
默认情况下，gMock 会按照期望定义的**逆序**来匹配，直到遇到第一个匹配的期望（即“后定义的期望具有更高优先级”）。
如果所有期望都不匹配，则会产生一个超限错误（_upper-bound-violated failure_）。

```cpp
using ::testing::_;
...
EXPECT_CALL(turtle, Forward(_));  // #1
EXPECT_CALL(turtle, Forward(10))  // #2
    .Times(2);
```

以上述代码为例，如果连续调用 3 次 `Forward(10)` ，就会产生一个错误，因为它匹配到了期望 `#2`。
如果第 3 次调用改为 `Forward(20)`，则没有问题，因为这时匹配到的是期望 `#1`。

::: info 设计目的
gMock 选用**逆序**来匹配期望，是因为这样允许用户在模拟对象的构造函数或测试套件的 `SetUp` 方法中提供默认期望，
然后在测试单元中设置更特定（_specific_）的期望来定制模拟对象。
因此，如果某个方法有两个期望，你应该将匹配器更加特定的期望放在后面，否则它会被更通用的规则给隐藏掉。
:::

::: tip 兜底期望
为方法设置一个**兜底期望**（_catch-all expectation_，即匹配所有参数并设为 `Times(AnyNumber())`）的行为非常普遍。
这使得方法的任何调用都能满足预期。
对于那些根本不会涉及的方法（称为“无趣”，_uninteresting_）来说，这样做没有必要；
但对于那些设置了一些期望、同时也允许其他调用方式的方法来说非常有用。
详见 [Understanding Uninteresting vs Unexpected Calls](<!-- TODO:gmock_cook_book.md#uninteresting-vs-unexpected -->)。
:::

### 有序调用 vs 无序调用 {#ordered-calls}

默认情况下，即使先声明的期望尚未满足，后声明的期望依旧可以被匹配到。
也就是说，方法的实际调用顺序不需要与期望声明的顺序一致。

然而，有时我们希望方法能够严格按照期望声明的顺序调用。
在 gMock 中，可以通过 `InSequence` 方便地实现这一功能：

```cpp
using ::testing::InSequence;
...
TEST(FooTest, DrawsLineSegment) {
  ...
  {
    InSequence seq;

    EXPECT_CALL(turtle, PenDown());
    EXPECT_CALL(turtle, Forward(100));
    EXPECT_CALL(turtle, PenUp());
  }
  Foo();
}
```

在创建 `InSequence` 的实例后，其作用域内的所有期望会形成一个顺序链，必须按照声明顺序匹配。
由于 `InSequence` 的功能仅依赖其构造和析构函数，因此变量名无关紧要。

在这个示例中，我们验证了 `Foo()` 严格按照声明顺序调用这三个方法。
如果调用顺序错乱，将产生一个错误。

::: note
如果你只关心部分方法的调用顺序，而不是所有方法，gMock 也允许你指定任意的偏序关系（_arbitrary partial order_）。
你可以在[这里](<!-- TODO:gmock_cook_book.md#OrderedCalls -->)了解更多细节。
:::

### 期望的持久性 {#sticky-expectations}

现在，让我们通过一个简单的问题来检验你对 gMock 的理解：
如何验证 `turtle` 恰好被要求移动到原点两次，同时忽略其他指令？

在查看参考答案前，请先尝试自行解答：

```cpp
using ::testing::_;
using ::testing::AnyNumber;
...
EXPECT_CALL(turtle, GoTo(_, _))  // #1
     .Times(AnyNumber());
EXPECT_CALL(turtle, GoTo(0, 0))  // #2
     .Times(2);
```

如果 `turtle.GoTo(0, 0)` 实际被调用三次，这三次调用都会匹配期望 `#2`（因为 gMock 优先匹配后定义的可用期望）。
此时，由于调用次数超出限制，gMock 将立即报错。
这部分内容我们已经在[设置多重期望](#multi-expectations)一节中讨论过。

上面的示例说明了 gMock 的期望默认具有==持久性==（_sticky_）：即使达到调用次数上限，期望仍然保持活跃状态。
这是 gMock 与其他模拟框架的一个重要区别（为何如此设计？因为我们认为此规则能简化大多数情况的表达）。

你觉得这很简单？
让我们看看你是否真正理解了这一规则——请阐述下面代码的作用：

```cpp
using ::testing::Return;
...
for (int i = n; i > 0; i--) {
  EXPECT_CALL(turtle, GetX())
      .WillOnce(Return(10*i));
}
```

如果你认为此代码期望 `turtle.GetX()` 被调用 `n` 次并依次返回 10、20、30、...，不妨重新思考一下。
我们前面提到，期望具有持久性，
因此，第二次调用 `turtle.GetX()` 时，仍会匹配到最后一次循环定义的期望（即 `i=1` 时的 `Return(10)`）：
这会立刻产生一个超限错误——此代码存在严重的逻辑缺陷。

要正确实现“依次返回 10、20、30、...”的行为，你应该显式地让期望在饱和（_saturated_）后立即失效（_retire_）：

```cpp
using ::testing::Return;
...
for (int i = n; i > 0; i--) {
  EXPECT_CALL(turtle, GetX())
      .WillOnce(Return(10*i))
      .RetiresOnSaturation();
}
```

不过，这里我们可以使用顺序链来更优雅地解决问题：

```cpp
using ::testing::InSequence;
using ::testing::Return;
...
{
  InSequence s;

  for (int i = 1; i <= n; i++) {
    EXPECT_CALL(turtle, GetX())
        .WillOnce(Return(10*i))
        .RetiresOnSaturation();
    // 译注：原文这里还调用了 `RetiresOnSaturation()`，但我认为这是不必要的，这可能是一处笔误。
  }
}
```

在顺序链中，期望会在饱和后自动失效，以便后续的期望能够被匹配。
这是使期望不具备持久性的另一种方法。

### 处理不重要方法

模拟对象可能会有很多方法，但并非所有方法都值得我们关注。
例如，在某些测试中，我们可能不关心 `GetX()` 和 `GetY()` 的调用次数。

在 gMock 中，对于不关注的方法，无需设置任何期望。
当这些方法被调用时，测试会输出警告信息，但不会导致测试失败。
这种行为称为“唠叨（_naggy_）模式”。
如果你想改变该默认行为，请参考[友好模式、严格模式和唠叨模式](<!-- TODO:gmock_cook_book.md#NiceStrictNaggy -->)。
