---
title: 断言参考
createTime: 2025-04-06 23:40:58
permalink: /gtest/kx3i4hau/
copyright:
  creation: translate
  source: https://google.github.io/googletest/reference/assertions.html
---

本文档列举了 GoogleTest 为验证代码行为提供的断言宏。
使用前需添加 `#include <gtest/gtest.h>` 头文件。

大多数宏以 `EXPECT_` 和 `ASSERT_` 两种形式存在：

- `EXPECT_` 宏在失败时生成非致命错误，允许当前函数继续执行。
- `ASSERT_` 宏在失败时生成致命错误，终止当前函数。

所有断言宏都支持通过 `<<` 运算符流式传输自定义错误信息，例如：

```cpp
EXPECT_TRUE(my_condition) << "My condition is not true";
```

流式传输支持所有可输出到 `ostream` 的类型（特别是 C 风格字符串和 `string` 对象）。
若流式传输宽字符串（`wchar_t*`、Windows 在 Unicode 模式下的 `TCHAR*` 或 `std::wstring`），
输出时将自动转换成 UTF-8 编码。

## 显式成功与失败 {#success-failure}

本节的断言将直接生成成功或失败，而不是测试值或表达式。
这些在使用控制流（而非布尔表达式）决定测试成功或失败时非常有用，如下例所示：

```c++
switch(expression) {
  case 1:
    // ... 一些检查项 ...
  case 2:
    // ... 另一些检查项 ...
  default:
    FAIL() << "We shouldn't get here.";
}
```

### SUCCEED {#SUCCEED}

```cpp
SUCCEED()
```

生成成功。
这**不会**使整个测试成功，要使测试成功需要所有断言通过。

目前，`SUCCEED` 断言仅作为文档说明，不会产生可见输出。
未来版本可能会为它添加输出信息。

### FAIL {#FAIL}

```cpp
FAIL()
```

生成致命失败，并从当前函数返回。

仅限在返回类型为 `void` 的函数中使用。
详见[可以使用断言的范围](../advanced.md#assertion-placement)。

### ADD_FAILURE {#ADD_FAILURE}

```cpp
ADD_FAILURE()
```

生成非致命失败，这允许当前函数继续运行。

### ADD_FAILURE_AT {#ADD_FAILURE_AT}

```cpp
ADD_FAILURE_AT(file_path, line_number)
```

在指定文件和行号位置生成非致命失败。

## 泛用断言 {#generalized}

本节的断言允许使用[匹配器](matchers.md)来验证值。

### EXPECT_THAT {#EXPECT_THAT}

```cpp
EXPECT_THAT(value, matcher)
ASSERT_THAT(value, matcher)
```

验证值 _`value`_ 满足[匹配器](matchers.md) _`matcher`_ 的条件。

例如，下面的代码验证了字符串 `value1` 以 `"Hello"` 开头，
`value2` 匹配给定正则表达式，且 `value3` 位于 5 和 10 之间：

```cpp
#include <gmock/gmock.h>

using ::testing::AllOf;
using ::testing::Gt;
using ::testing::Lt;
using ::testing::MatchesRegex;
using ::testing::StartsWith;

...
EXPECT_THAT(value1, StartsWith("Hello"));
EXPECT_THAT(value2, MatchesRegex("Line \\d+"));
ASSERT_THAT(value3, AllOf(Gt(5), Lt(10)));
```

匹配器形式的断言具有更好的可读性，且能生成易读的错误信息。
例如，如果上述对 `value1` 的断言失败，会产生类似下面的错误信息：

```ansi
Value of: value1
  Actual: "Hi, world!"
Expected: starts with "Hello"
```

GoogleTest 提供了内置匹配器库（见[匹配器参考](matchers.md)），
同时也支持用户自定义匹配器（见[编写新匹配器](../gmock_cook_book.md#new-matchers)）。
与匹配器配合，使得 `EXPECT_THAT` 功能强大且扩展性强。

::: info
本断言的灵感来源于 Joe Walnes 的 Hamcrest 项目，它为 JUnit 添加了 `assertThat()`。
:::

## 布尔条件 {#boolean}

本节的断言用于验证布尔条件。

### EXPECT_TRUE {#EXPECT_TRUE}

```cpp
EXPECT_TRUE(condition)
ASSERT_TRUE(condition)
```

验证 _`condition`_ 为真。

### EXPECT_FALSE {#EXPECT_FALSE}

```cpp
EXPECT_FALSE(condition)
ASSERT_FALSE(condition)
```

验证 _`condition`_ 为假。

## 二元比较 {#binary-comparison}

本节的断言用于比较两个值。
值参数必须支持断言对应的比较运算符，否则会导致编译错误。

若参数支持 `<<` 运算符，当断言失败时将调用该运算符以输出参数值。
否则，GoogleTest 会自动选择最佳的输出方式，
见[告诉 GoogleTest 如何打印参数值](../advanced.md#teaching-googletest-how-to-print-your-values)。

参数只会被计算一次，因此允许存在副作用。
不过，参数的求值顺序未定义，程序不应依赖特定的求值顺序。

断言同时支持窄、宽字符串（`string` 和 `wstring`）。

要避免浮点数比较时的精度问题，请参阅[浮点数比较](#floating-point)。

### EXPECT_EQ {#EXPECT_EQ}

```cpp
EXPECT_EQ(val1, val2)
ASSERT_EQ(val1, val2)
```

验证 `val1 == val2`。

在比较指针时会比较其地址。
对于 C 字符串，会验证其具有相同地址，而不是相同值。
若要验证 C 字符串的值相等，请使用 [`EXPECT_STREQ`](#EXPECT_STREQ)。

若要验证指针为空，请使用 `EXPECT_EQ(ptr, nullptr)` 而非 `EXPECT_EQ(ptr, NULL)`。

### EXPECT_NE {#EXPECT_NE}

```cpp
EXPECT_NE(val1, val2)
ASSERT_NE(val1, val2)
```

验证 `val1 != val2`。

在比较指针时会比较其地址。
对于 C 字符串，会验证其具有不同地址，而不是不同值。
若要验证 C 字符串的值不相等，请使用 [`EXPECT_STRNE`](#EXPECT_STRNE)。

若要验证指针非空，请使用 `EXPECT_NE(ptr, nullptr)` 而非 `EXPECT_NE(ptr, NULL)`。

### EXPECT_LT {#EXPECT_LT}

```cpp
EXPECT_LT(val1, val2)
ASSERT_LT(val1, val2)
```

验证 `val1 < val2`。

### EXPECT_LE {#EXPECT_LE}

```cpp
EXPECT_LE(val1, val2)
ASSERT_LE(val1, val2)
```

验证 `val1 <= val2`。

### EXPECT_GT {#EXPECT_GT}

```cpp
EXPECT_GT(val1, val2)
ASSERT_GT(val1, val2)
```

验证 `val1 > val2`。

### EXPECT_GE {#EXPECT_GE}

```cpp
EXPECT_GE(val1, val2)
ASSERT_GE(val1, val2)
```

验证 `val1 >= val2`。

## 字符串比较 {#c-strings}

本节的断言用于比较两个 **C 字符串**。
要比较 `string`，请使用 [`EXPECT_EQ`](#EXPECT_EQ) 或 [`EXPECT_NE`](#EXPECT_NE)。

断言也支持宽字符串（`wchar_t*`），在失败时将输出 UTF-8 编码结果。

若要比较 C 字符串与 `NULL`，请使用 `EXPECT_EQ(c_string, nullptr)` 或 `EXPECT_NE(c_string, nullptr)`。

### EXPECT_STREQ {#EXPECT_STREQ}

```cpp
EXPECT_STREQ(str1, str2)
ASSERT_STREQ(str1, str2)
```

验证两 C 字符串 _`str1`_ 与 _`str2`_ 内容相同。

### EXPECT_STRNE {#EXPECT_STRNE}

```cpp
EXPECT_STRNE(str1, str2)
ASSERT_STRNE(str1, str2)
```

验证两 C 字符串 _`str1`_ 与 _`str2`_ 内容不同。

### EXPECT_STRCASEEQ {#EXPECT_STRCASEEQ}

```cpp
EXPECT_STRCASEEQ(str1, str2)
ASSERT_STRCASEEQ(str1, str2)
```

验证两 C 字符串 _`str1`_ 与 _`str2`_ 内容相同（忽略大小写）。

### EXPECT_STRCASENE {#EXPECT_STRCASENE}

```cpp
EXPECT_STRCASENE(str1, str2)
ASSERT_STRCASENE(str1, str2)
```

验证两 C 字符串 _`str1`_ 与 _`str2`_ 内容不同（忽略大小写）。

## 浮点数比较 {#floating-point}

本节的断言用于比较两个浮点数。

由于存在舍入误差，浮点数无法精确比较，因此不适用 `EXPECT_EQ`。
通常，要对浮点数进行有意义的比较，需要谨慎选择合适的误差边界（_error bound_）。

GoogleTest 还提供了基于最小精度单位（_Unit in the Last Place_，_ULP_）设置默认误差边界的断言。
要了解更多关于 ULP 的信息，请参阅文章
[Comparing Floating Point Numbers](https://randomascii.wordpress.com/2012/02/25/comparing-floating-point-numbers-2012-edition/)。

### EXPECT_FLOAT_EQ {#EXPECT_FLOAT_EQ}

```cpp
EXPECT_FLOAT_EQ(val1, val2)
ASSERT_FLOAT_EQ(val1, val2)
```

验证两个 `FLOAT` 值 _`val1`_ 和 _`val2`_ 近似相等，彼此相差不超过 4 个 ULP。
无穷大与最大有限浮点数值视为相差 1 个 ULP。

### EXPECT_DOUBLE_EQ {#EXPECT_DOUBLE_EQ}

```cpp
EXPECT_DOUBLE_EQ(val1, val2)
ASSERT_DOUBLE_EQ(val1, val2)
```

验证两个 `double` 值 _`val1`_ 和 _`val2`_ 近似相等，彼此相差不超过 4 个 ULP。
无穷大与最大有限双精度浮点数值视为相差 1 个 ULP。

### EXPECT_NEAR {#EXPECT_NEAR}

```cpp
EXPECT_NEAR(val1, val2, abs_error)
ASSERT_NEAR(val1, val2, abs_error)
```

验证 _`val1`_ 和 _`val2`_ 的差值不超过绝对误差限 _`abs_error`_。

若 _`val1`_ 和 _`val2`_ 为符号相同的无穷大，则差值视为 0。
否则，若任一值为无穷大，则差值视为无穷大。
所有非 NaN 值（包括无穷大）都不会超过无穷大的 _`abs_error`_。

## 异常断言 {#exceptions}

本节的断言用于验证代码段抛出（或不抛出）异常。
使用时需保证构建环境启用了异常机制。

::: note

被测代码片段可以是复合语句，例如：

```cpp
EXPECT_NO_THROW({
  int n = 5;
  DoSomething(&n);
});
```

:::

### EXPECT_THROW {#EXPECT_THROW}

```cpp
EXPECT_THROW(statement, exception_type)
ASSERT_THROW(statement, exception_type)
```

验证 _`statement`_ 抛出类型为 _`exception_type`_ 的异常。

### EXPECT_ANY_THROW {#EXPECT_ANY_THROW}

```cpp
EXPECT_ANY_THROW(statement)
ASSERT_ANY_THROW(statement)
```

验证 _`statement`_ 抛出任意类型的异常。

### EXPECT_NO_THROW {#EXPECT_NO_THROW}

```cpp
EXPECT_NO_THROW(statement)
ASSERT_NO_THROW(statement)
```

验证 _`statement`_ 不抛出任何异常。

## 谓词断言 {#predicates}

本节的断言用于验证复杂谓词，相比单独使用 `EXPECT_TRUE` 能提供更清晰的错误信息。

### EXPECT_PRED\* {#EXPECT_PRED}

```cpp
EXPECT_PRED1(pred, val1)
EXPECT_PRED2(pred, val1, val2)
EXPECT_PRED3(pred, val1, val2, val3)
EXPECT_PRED4(pred, val1, val2, val3, val4)
EXPECT_PRED5(pred, val1, val2, val3, val4, val5)
```

```cpp
ASSERT_PRED1(pred, val1)
ASSERT_PRED2(pred, val1, val2)
ASSERT_PRED3(pred, val1, val2, val3)
ASSERT_PRED4(pred, val1, val2, val3, val4)
ASSERT_PRED5(pred, val1, val2, val3, val4, val5)
```

验证谓词 _`pred`_ 在接受给定参数时返回 `true`。

参数 _`pred`_ 是一个接受相应宏参数数量的函数或仿函数。
若 _`pred`_ 对给定参数返回 `true`，则断言成功，否则断言失败。

断言失败时会打印每个参数的值。
保证每个参数只会被计算一次。

示例：

```cpp
// 当 m 和 n 没有非 1 公因数时返回 true
bool MutuallyPrime(int m, int n) { ... }
...
const int a = 3;
const int b = 4;
const int c = 10;
...
EXPECT_PRED2(MutuallyPrime, a, b);  // 成功
EXPECT_PRED2(MutuallyPrime, b, c);  // 失败
```

上述示例中，第二个断言失败，将输出：

```ansi
MutuallyPrime(b, c) is false, where
b is 4
c is 10
```

若给定谓词是重载函数或模板函数，断言宏可能无法解析出合适的谓词，需要显示指定类型。
例如，对于接受 `int` 或 `double` 类型的 `IsPositive` 重载函数，需使用：

```cpp
EXPECT_PRED1(static_cast<bool (*)(int)>(IsPositive), 5);
EXPECT_PRED1(static_cast<bool (*)(double)>(IsPositive), 3.14);
```

直接使用 `EXPECT_PRED1(IsPositive, 5)` 会导致编译错误。
类似地，使用模板函数需指定模板参数：

```cpp
template <typename T>
bool IsNegative(T x) {
  return x < 0;
}
...
EXPECT_PRED1(IsNegative<int>, -5);  // 必须指定模板参数
```

多个模板参数需用括号包裹以确保宏正确解析：

```cpp
ASSERT_PRED2((MyPredicate<int, int>), 5, 0);
```

### EXPECT_PRED_FORMAT\* {#EXPECT_PRED_FORMAT}

```cpp
EXPECT_PRED_FORMAT1(pred_formatter, val1)
EXPECT_PRED_FORMAT2(pred_formatter, val1, val2)
EXPECT_PRED_FORMAT3(pred_formatter, val1, val2, val3)
EXPECT_PRED_FORMAT4(pred_formatter, val1, val2, val3, val4)
EXPECT_PRED_FORMAT5(pred_formatter, val1, val2, val3, val4, val5)
```

```cpp
ASSERT_PRED_FORMAT1(pred_formatter, val1)
ASSERT_PRED_FORMAT2(pred_formatter, val1, val2)
ASSERT_PRED_FORMAT3(pred_formatter, val1, val2, val3)
ASSERT_PRED_FORMAT4(pred_formatter, val1, val2, val3, val4)
ASSERT_PRED_FORMAT5(pred_formatter, val1, val2, val3, val4, val5)
```

验证谓词格式化器 _`pred_formatter`_ 在接受给定参数时返回 `true`。

参数 _`pred_formatter`_ 是谓词格式化器，其签名为：

```cpp
testing::AssertionResult PredicateFormatter(const char* expr1,
                                            const char* expr2,
                                            ...
                                            const char* exprn,
                                            T1 val1,
                                            T2 val2,
                                            ...
                                            Tn valn);
```

其中 _`val1`_、_`val2`_、...、_`valn`_ 是参数值，_`expr1`_、_`expr2`_、...、_`exprn`_ 是源代码中相应的表达式。
`T1`、`T2`、...、`Tn` 既可以是值类型，也可以是引用类型。
关于返回类型 `testing::AssertionResult`，请参阅
[使用返回 AssertionResult 的函数](../advanced.md#using-a-function-that-returns-an-assertionresult)。

示例：

```cpp
// 返回 m 和 n 的最小公质因数，互质则返回 1
int SmallestPrimeCommonDivisor(int m, int n) { ... }

// 当 m 和 n 没有非 1 公因数时返回 true
bool MutuallyPrime(int m, int n) { ... }

// 断言两个整数互质的谓词格式化器
testing::AssertionResult AssertMutuallyPrime(const char* m_expr,
                                             const char* n_expr,
                                             int m,
                                             int n) {
  if (MutuallyPrime(m, n)) return testing::AssertionSuccess();

  return testing::AssertionFailure() << m_expr << " and " << n_expr
      << " (" << m << " and " << n << ") are not mutually prime, "
      << "as they have a common divisor " << SmallestPrimeCommonDivisor(m, n);
}

...
const int a = 3;
const int b = 4;
const int c = 10;
...
EXPECT_PRED_FORMAT2(AssertMutuallyPrime, a, b);  // 成功
EXPECT_PRED_FORMAT2(AssertMutuallyPrime, b, c);  // 失败
```

上述示例中，第二个断言失败，将输出：

```ansi
b and c (4 and 10) are not mutually prime, as they have a common divisor 2
```

## Windows HRESULT 断言 {#HRESULT}

本节的断言用于验证 `HARSULT` 成功或失败。
例如：

```cpp
CComPtr<IShellDispatch2> shell;
ASSERT_HRESULT_SUCCEEDED(shell.CoCreateInstance(L"Shell.Application"));
CComVariant empty;
ASSERT_HRESULT_SUCCEEDED(shell->ShellExecute(CComBSTR(url), empty, empty, empty, empty));
```

断言失败时将输出可读的 `HRESULT` 错误信息。

### EXPECT_HRESULT_SUCCEEDED {#EXPECT_HRESULT_SUCCEEDED}

```cpp
EXPECT_HRESULT_SUCCEEDED(expression)
ASSERT_HRESULT_SUCCEEDED(expression)
```

验证 _`expression`_ 是成功的 `HRESULT`。

### EXPECT_HRESULT_FAILED {#EXPECT_HRESULT_FAILED}

```cpp
EXPECT_HRESULT_FAILED(expression)
ASSERT_HRESULT_FAILED(expression)
```

验证 _`expression`_ 是失败的 `HRESULT`。

## 死亡断言 {#death}

本节的断言用于验证代码段导致进程终止。
详见[死亡测试](../advanced.md#death-tests)。

这些断言会创建新进程来执行被测代码。
断言的具体行为取决于平台和变量 `::testing::GTEST_FLAG(death_test_style)`
（通过命令行参数 `--gtest_death_test_style` 初始化）。

- 在 POSIX 系统中，使用 `fork()`（Linux 上为 `clone()`）创建子进程，之后：
  - 若变量值为 `"fast"`，立即执行死亡测试语句。
  - 若变量值为 `"threadsafe"`，子进程会重新执行测试程序，但只运行单个死亡测试。
- 在 Windows 上，使用 `CreateProcess()` 创建子进程，行为类似 POSIX 的 `"threadsafe"` 模式。

其它变量值视为无效值，会导致死亡测试失败。
目前，变量值默认为 `"fast"`。

若死亡测试语句执行完毕后未终止，子进程依旧会终止，而断言失败。

::: note

被测代码片段可以是复合语句，例如：

```cpp
EXPECT_DEATH({
  int n = 5;
  DoSomething(&n);
}, "Error on line .* of DoSomething()");
```

:::

### EXPECT_DEATH {#EXPECT_DEATH}

```cpp
EXPECT_DEATH(statement, matcher)
ASSERT_DEATH(statement, matcher)
```

验证 _`statement`_ 导致进程以非零退出码终止，且 `stderr` 输出匹配 _`matcher`_。

参数 _`matcher`_ 可以是 `const std::string&` 的[匹配器](matchers.md)，
或正则表达式（参见[正则表达式语法](../advanced.md#regular-expression-syntax)）。
裸字符串 `s` 将被视为 [`ContainsRegex(s)`](matchers.md#string-matchers)，
而非 [`Eq(s)`](matchers.md#generic-comparison)。

例如，下列代码验证 `DoSomething(42)` 导致进程终止并输出包含 `"My error"` 的错误信息：

```cpp
EXPECT_DEATH(DoSomething(42), "My error");
```

### EXPECT_DEATH_IF_SUPPORTED {#EXPECT_DEATH_IF_SUPPORTED}

```cpp
EXPECT_DEATH_IF_SUPPORTED(statement, matcher)
ASSERT_DEATH_IF_SUPPORTED(statement, matcher)
```

若支持死亡测试，行为同 [`EXPECT_DEATH`](#EXPECT_DEATH)，否则不作验证。

### EXPECT_DEBUG_DEATH {#EXPECT_DEBUG_DEATH}

```cpp
EXPECT_DEBUG_DEATH(statement, matcher)
ASSERT_DEBUG_DEATH(statement, matcher)
```

调试模式下，行为同 [`EXPECT_DEATH`](#EXPECT_DEATH)。
非调试模式（定义了 `NDEBUG` 宏）下，仅执行 _`statement`_。

### EXPECT_EXIT {#EXPECT_EXIT}

```cpp
EXPECT_EXIT(statement, predicate, matcher)
ASSERT_EXIT(statement, predicate, matcher)
```

验证 _`statement`_ 导致进程终止，且退出状态满足 _`predicate`_，`stderr` 输出匹配 _`matcher`_。

参数 _`predicate`_ 是接受 `int` 退出状态并返回 `bool` 的函数或仿函数。
GoolgeTest 提供了两个常用谓词：

```cpp
// 当程序以指定退出码正常终止时返回 true
::testing::ExitedWithCode(exit_code);

// 当程序被以指定信号终止时 返回 true（Windows 上不可用）
::testing::KilledBySignal(signal_number);
```

参数 _`matcher`_ 可以是 `const std::string&` 的[匹配器](matchers.md)，
或正则表达式（参见[正则表达式语法](../advanced.md#regular-expression-syntax)）。
裸字符串 `s` 将被视为 [`ContainsRegex(s)`](matchers.md#string-matchers)，
而非 [`Eq(s)`](matchers.md#generic-comparison)。

例如，下列代码验证 `NormalExit()` 导致进程输出包含 `"Success"` 的错误信息并以状态码 0 退出：

```cpp
EXPECT_EXIT(NormalExit(), testing::ExitedWithCode(0), "Success");
```
