---
title: 动作参考
createTime: 2025-04-08 18:19:08
permalink: /gtest/reference/actions/
copyright:
  creation: translate
  source: https://google.github.io/googletest/reference/actions.html
---

[**动作**](../gmock_for_dummies.md#actions-what-should-it-do)用于指定模拟函数被调用时应执行的操作。
本文列出 GoogleTest 提供的内置动作。
所有动作均定义在 `::testing` 命名空间内。

## 返回值类

| 动作                              | 描述                                                                                                      |
| :-------------------------------- | :-------------------------------------------------------------------------------------------------------- |
| `Return()`                        | 从返回类型为 `void` 的函数中返回。                                                                        |
| `Return(value)`                   | 返回 `value`。若 `value` 类型与模拟函数返回类型不一致，将在**设置期望时**（而非执行动作时）进行类型转换。 |
| `ReturnArg<N>()`                  | 返回第 `N` 个（从 0 开始）参数。                                                                          |
| `ReturnNew<T>(a1, ..., ak)`       | 返回 `new T(a1, ..., ak)`；每次运行会创建新对象。                                                         |
| `ReturnNull()`                    | 返回空指针。                                                                                              |
| `ReturnPointee(ptr)`              | 返回 `ptr` 指向的值。                                                                                     |
| `ReturnRef(variable)`             | 返回 `variable` 的引用。                                                                                  |
| `ReturnRefOfCopy(value)`          | 返回 `value` 副本的引用；该副本在动作生命周期内有效。                                                     |
| `ReturnRoundRobin({a1, ..., ak})` | 每次调用返回列表中的下一个元素，到达末尾时循环至开头。                                                    |

## 副作用类

| 动作                               | 描述                                                                                                               |
| :--------------------------------- | :----------------------------------------------------------------------------------------------------------------- |
| `Assign(&variable, value)`         | 将 `value` 赋值给 `variable`。                                                                                     |
| `DeleteArg<N>()`                   | 删除第 `N` 个参数（必须为指针）。                                                                                  |
| `SaveArg<N>(pointer)`              | 通过拷贝赋值将第 `N` 个参数存入 `*pointer`。                                                                       |
| `SaveArgByMove<N>(pointer)`        | 通过移动赋值将第 `N` 个参数存入 `*pointer`。                                                                       |
| `SaveArgPointee<N>(pointer)`       | 将第 `N` 个参数指向的值存入 `*pointer`。                                                                           |
| `SetArgReferee<N>(value)`          | 将 `value` 赋值给第 `N` 个参数引用的变量。                                                                         |
| `SetArgPointee<N>(value)`          | 将 `value` 赋值给第 `N` 个参数指向的变量。                                                                         |
| `SetArgumentPointee<N>(value)`     | 同 `SetArgPointee<N>(value)`。已弃用。将在 v1.7.0 移除。                                                           |
| `SetArrayArgument<N>(first, last)` | 将源范围 `[first, last)` 的元素拷贝到第 `N` 个参数指向的数组（可以是指针或迭代器）。该动作不持有源范围元素所有权。 |
| `SetErrnoAndReturn(error, value)`  | 设置 `errno` 为 `error` 并返回 `value`。                                                                           |
| `Throw(exception)`                 | 抛出指定异常（可为任意可拷贝值）。v1.1.0 起可用。                                                                  |

## 使用函数/仿函数/Lambda 充当动作

下文中的“可调用对象”指自由函数、`std::function`、仿函数或 lambda。

| 动作                                                | 描述                                                               |
| :-------------------------------------------------- | :----------------------------------------------------------------- |
| `f`                                                 | 使用模拟函数参数调用可调用对象 `f`。                               |
| `Invoke(f)`                                         | 使用模拟函数参数调用全局/静态函数或仿函数 `f`。                    |
| `Invoke(object_pointer, &class::method)`            | 使用模拟函数参数调用对象的方法。                                   |
| `InvokeWithoutArgs(f)`                              | 调用无参数的全局/静态函数或仿函数 `f`。                            |
| `InvokeWithoutArgs(object_pointer, &class::method)` | 调用对象的无参数方法。                                             |
| `InvokeArgument<N>(arg1, arg2, ..., argk)`          | 使用 `k` 个参数调用模拟函数的第 `N` 个参数（必须为函数或仿函数）。 |

被调用函数的返回值将作为动作的返回值。

在定义与 `Invoke*()` 配合使用的可调用对象时，可用 `Unused` 来声明未使用的参数：

```cpp
using ::testing::Invoke;
double Distance(Unused, double x, double y) { return sqrt(x*x + y*y); }
...
EXPECT_CALL(mock, Foo("Hi", _, _)).WillOnce(Invoke(Distance));
```

`Invoke(callback)` 和 `InvokeWithoutArgs(callback)` 将接管 `callback` 的所有权，因此其需为持久对象。
`callback` 必须为基类回调类型而非派生类：

```cpp
BlockingClosure* done = new BlockingClosure;
... Invoke(done) ...;  // 编译失败

Closure* done2 = new BlockingClosure;
... Invoke(done2) ...;  // 编译成功
```

在 `InvokeArgument<N>(...)` 中，若需传递引用参数，应使用 `std::ref()` 包装：

```cpp
using ::testing::InvokeArgument;
...
InvokeArgument<2>(5, string("Hi"), std::ref(foo))
```

这将按值传入 `5` 和 `string("Hi")` 及按引用传入 `foo` 来调用模拟函数的第 `2` 个参数。

## 默认动作

| 动作          | 描述                                                    |
| :------------ | :------------------------------------------------------ |
| `DoDefault()` | 执行默认动作（由 `ON_CALL()` 指定或使用内置默认动作）。 |

::: warning
因技术限制，`DoDefault()` 不可用于复合动作内部，否则会导致运行时错误。
:::

## 复合动作

| 动作                           | 描述                                                                                                     |
| :----------------------------- | :------------------------------------------------------------------------------------------------------- |
| `DoAll(a1, a2, ..., an)`       | 执行所有动作 `a1` 至 `an`，返回 `an` 的结果。前 `n-1` 个动作必须返回 `void` ，它们将接收参数的只读视图。 |
| `IgnoreResult(a)`              | 执行动作 `a` 并忽略其结果（`a` 必须返回非 `void`）。                                                     |
| `WithArg<N>(a)`                | 将模拟函数的第 `N` 个参数传递给动作 `a` 并执行。                                                         |
| `WithArgs<N1, N2, ..., Nk>(a)` | 将选定参数传递给动作 `a` 并执行。                                                                        |
| `WithoutArgs(a)`               | 无参数执行动作 `a`。                                                                                     |

## 定义动作

```cpp
ACTION(Sum) {
  return arg0 + arg1;
}
```

定义返回第 0 与第 1 参数之和的动作 `Sum()`。

```cpp
ACTION_P(Plus, n) {
  return arg0 + n;
}
```

定义返回第 0 参数与 `n` 之和的动作 `Plus(n)`。

```cpp
ACTION_Pk(Foo, p1, ..., pk) {
  // statements;
}
```

定义执行指定语句的参数化动作 `Foo(p1, ..., pk)`。

::: warning
`ACTION*` 系列宏不可在函数或类内部使用。
:::
