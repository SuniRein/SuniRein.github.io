---
title: 匹配器参考
createTime: 2025-04-07 21:04:15
permalink: /gtest/gs2t2tao/
copyright:
  creation: translate
  source: https://google.github.io/googletest/reference/matchers.html
---

**匹配器**用于匹配*单个*参数。
你可以在 `ON_CALL()` 或 `EXPECT_CALL()` 中使用匹配器，或通过以下两个宏来直接验证值：

| 宏                                   | 描述                                                            |
| :----------------------------------- | :-------------------------------------------------------------- |
| `EXPECT_THAT(actual_value, matcher)` | 断言 `actual_value` 匹配 `matcher`。                            |
| `ASSERT_THAT(actual_value, matcher)` | 功能同 `EXPECT_THAT(actual_value, matcher)`，但会产生致命失败。 |

::: warning
虽然可以通过 `EXPECT_THAT(actual, expected_value)` 进行等值匹配，但需注意隐式转换可能导致的意外结果。
例如，`EXPECT_THAT(some_bool, "some_string")` 可以通过编译且可能匹配通过。

**最佳实践**：使用 `EXPECT_THAT(actual_value, Eq(expected_value))` 或 `EXPECT_EQ(actual_value, expected_value)` 进行等值比较。
:::

内置匹配器按功能可分为以下类别。
其中 `argument` 为函数参数，例如上述示例中的 `actual_value`，
或者 `EXPECT_THAT(mock_object, method(mathcers))` 中 `method` 的参数。
除特别说明外，所有匹配器均定义在 `::testing` 命名空间。

## 通配符匹配器 {#wildcard}

| 匹配器                       | 描述                              |
| :--------------------------- | :-------------------------------- |
| `_`                          | `argument` 为任意合适类型值。     |
| `A<type>()`<br/>`An<type>()` | `argument` 为任意 `type` 类型值。 |

## 通用比较匹配器 {#generic-comparison}

| 匹配器                                  | 描述                                                                                                                                             |
| :-------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| `Eq(value)`<br/>`value`                 | `argument == value`。                                                                                                                            |
| `Ge(value)`                             | `argument >= value`。                                                                                                                            |
| `Gt(value)`                             | `argument > value`。                                                                                                                             |
| `Le(value)`                             | `argument <= value`。                                                                                                                            |
| `Lt(value)`                             | `argument < value`。                                                                                                                             |
| `Ne(value)`                             | `argument != value`。                                                                                                                            |
| `IsFalse()`                             | `argument` 在布尔上下文中求值为 `false`。                                                                                                        |
| `DistanceFrom(target, m)`               | `argument` 与 `target` 的绝对差（`abs(argument - target)`）匹配 `m`                                                                              |
| `DistanceFrom(target, get_distance, m)` | `argument` 与`target` 的距离（`get_distance(argument, target)`） 匹配 `m`                                                                        |
| `IsTrue()`                              | `argument` 在布尔上下文中求值为 `true`。                                                                                                         |
| `IsNull()`                              | `argument` 为空指针（兼容裸指针和智能指针）。                                                                                                    |
| `NotNull()`                             | `argument` 为非空指针（兼容裸指针和智能指针）。                                                                                                  |
| `Optional(m)`                           | `argument` 为包含值匹配 `m` 的 `optional<>`。使用 `nullopt` 可以检测 `optional<>` 是否有值。若内部类型不支持 `==` 运算符，请使用 `Eq(nullopt)`。 |
| `VariantWith<T>(m)`                     | `argument` 为持有类型为 `T` 且其值匹配 `m` 的 `variant<>`。                                                                                      |
| `Ref(variable)`                         | `argument` 为 `variable` 的引用。                                                                                                                |
| `TypedEq<type>(value)`                  | `argument` 类型为 `type` 且等于 `value`。当模拟函数存在重载时，可能需要使用 `TypeEq<T>(m)` 而非 `Eq(m)`。                                        |

除 `Ref()` 外，这些匹配器都持有 `value` 的拷贝，以防其稍后被更改或销毁。
若编译器报错 `value` 没有拷贝构造函数，可以尝试包裹 `std::ref()`，如 `Eq(std::ref(non_copyable_value))`。
用户需确保这种情况下 `non_copyable_value` 不会被更改或销毁，否则匹配器的功能会改变。

`IsTrue` 和 `IsFalse` 适用于需要使用匹配器，或者值只能显式转换成布尔值而不支持隐式转换的场景。
对于其他情况，应使用 [`EXPECT_TRUE` 和 `EXPECT_FALSE`](assertions.md#boolean) 断言。

## 浮点数匹配器 {#fp-matchers}

| 匹配器                           | 描述                                                                  |
| :------------------------------- | :-------------------------------------------------------------------- |
| `DoubleEq(a_double)`             | `argument` 为近似等于 `a_double` 的 `double` 值（`NaN` 视为不相等）。 |
| `FloatEq(a_float)`               | `argument` 为近似等于 `a_float` 的 `float` 值（`NaN` 视为不相等）。   |
| `NanSensitiveDoubleEq(a_double)` | `argument` 为近似等于 `a_double` 的 `double` 值（`NaN` 视为相等）。   |
| `NanSensitiveFloatEq(a_float)`   | `argument` 为近似等于 `a_float` 的 `float` 值（`NaN` 视为相等）。     |
| `IsNan()`                        | `argument` 为 `NaN`。                                                 |

上述匹配器使用基于 ULP 的比较（与 GoogleTest 相同）。
它们会根据期望值的绝对值自动选择合理的误差范围。
`DoubleEq()` 和 `FloatEq()` 符合 IEEE 标准，在比较两个 `NaN` 的相等性时返回 `false`。
`NanSensitive*` 版本则将两个 `NaN` 视为相等，这通常更符合用户预期。

| 匹配器                                            | 描述                                                                                                 |
| :------------------------------------------------ | :--------------------------------------------------------------------------------------------------- |
| `DoubleNear(a_double, max_abs_error)`             | `argument` 是接近 `a_double` 的 `double` 值（绝对误差 `<= max_abs_error`）， 两个 `NaN` 视为不相等。 |
| `FloatNear(a_float, max_abs_error)`               | `argument` 是接近 `a_float` 的 `float` 值（绝对误差 `<= max_abs_error`）， 两个 `NaN` 视为不相等。   |
| `NonSensitiveDoubleNear(a_double, max_abs_error)` | `argument` 是接近 `a_double` 的 `double` 值（绝对误差 `<= max_abs_error`）， 两个 `NaN` 视为相等。   |
| `NonSensitiveFloatNear(a_float, max_abs_error)`   | `argument` 是接近 `a_float` 的 `float` 值（绝对误差 `<= max_abs_error`）， 两个 `NaN` 视为相等。     |

## 字符串匹配器 {#string-matchers}

`argument` 可以是 C 字符串或 C++ 字符串对象：

| 匹配器                   | 描述                                                                                   |
| :----------------------- | :------------------------------------------------------------------------------------- |
| `ContainsRegex(string)`  | `argument` 匹配给定正则表达式。                                                        |
| `EndsWith(suffix)`       | `argument` 以 `suffix` 结尾。                                                          |
| `HasSubstr(string)`      | `argument` 包含子串 `string`。                                                         |
| `IsEmpty()`              | `argument` 为空字符串。                                                                |
| `MatchesRegex(string)`   | `argument` 完整匹配给定正则表达式（从第一个字符开始到最后一个字符结束）。              |
| `StartsWith(prefix)`     | `argument` 以 `prefix` 开头。                                                          |
| `StrCaseEq(string)`      | `argument` 与 `string` 相等（忽略大小写）。                                            |
| `StrCaseNe(string)`      | `argument` 与 `string` 不相等（忽略大小写）。                                          |
| `StrEq(string)`          | `argument` 与 `string` 相等。                                                          |
| `StrNe(string)`          | `argument` 与 `string` 不相等。                                                        |
| `WhenBase64Unescaped(m)` | `argument` 是符合 [RFC 4648][] 定义的 Web 安全的 Base64 转码字符串，且解码后匹配 `m`。 |

[RFC 4648]: https://www.rfc-editor.org/rfc/rfc4648#section-5

`ContainsRegex()` 和 `MatchesRegex()` 会接管 `RE` 对象的所有权。
它们使用的正则表达式语法定义参见[此处](../advanced.md#regular-expression-syntax)。
除 `ContainsRegex()` 和 `MatchesRegex()` 外，其他匹配器都支持宽字符串。

## 容器匹配器

大多数 STL 风格容器支持 `==` 操作符，因此可以直接使用 `Eq(expected_container)` 或 `expected_container` 来精确匹配容器。
如果需要内联指定元素、更灵活地匹配元素或获取更详细的错误信息，则可以使用以下匹配器：

| 匹配器                                                                                                                                                                                                                       | 描述                                                                                                                                                                                                   |
| :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `BeginEndDistanceIs(m)`                                                                                                                                                                                                      | `argument` 是迭代器 `begin()` 和 `end()` 间距匹配 `m` 的容器。例如 `BeginEndDistanceIs(2)` 或 `BeginEndDistanceIs(Lt(2))`。对于定义了 `size()` 方法的容器，使用 `SizeIs(m)` 可能更高效。               |
| `ContainerEq(container)`                                                                                                                                                                                                     | 与 `Eq(container)` 相同，但失败信息会额外显示两个容器之间的差异元素。                                                                                                                                  |
| `Contains(e)`                                                                                                                                                                                                                | `argument` 包含至少一个匹配 `e` 的元素（`e` 可以是值或匹配器）。                                                                                                                                       |
| `Contains(e).Times(n)`                                                                                                                                                                                                       | `argument` 包含 `n` 个匹配 `e` 的元素（`e` 和 `n` 可以是值或匹配器）。不同于普通的 `Contains` 和 `Each`，此方法支持校验任意出现次数，包括使用 `Contains(e).Times(0)` 校验不存在的情况。                |
| `Each(e)`                                                                                                                                                                                                                    | `argument` 是每个元素都匹配 `e` 的容器（`e` 可以是值或匹配器）。                                                                                                                                       |
| `ElementsAre(e0, e1, ..., en)`                                                                                                                                                                                               | `argument` 包含 `n + 1` 个元素，其中第 `i` 个元素匹配 `ei` （`ei` 可以是值或匹配器）。                                                                                                                 |
| `ElementsAreArray({e0, e1, ..., en})`<br/>`ElementsAreArray(a_container)`<br/>`ElementsAreArray(begin, end)`<br/>`ElementsAreArray(array)`<br/>`ElementsAreArray(array, count)`                                              | 功能同 `ElementsAre()`，但期望值/匹配器来自初始化列表、STL 风格容器、迭代器范围或 C 风格数组。                                                                                                         |
| `IsEmpty()`                                                                                                                                                                                                                  | `argument` 为空容器（`container.empty()`）。                                                                                                                                                           |
| `IsSubsetOf({e0, e1, ..., en})`<br/>`IsSubsetOf(a_container)`<br/>`IsSubsetOf(begin, end)`<br/>`IsSubsetOf(array)`<br/>`IsSubsetOf(array, count)`                                                                            | `argument` 匹配 `UnorderedElementsAre(x0, x1, ..., xk)`，其中 `{x0, x1, ..., xk}` 是预期匹配器的某个子集。                                                                                             |
| `IsSupersetOf({e0, e1, ..., en})`<br/>`IsSupersetOf(a_container)`<br/>`IsSupersetOf(begin, end)`<br/>`IsSupersetOf(array)`<br/>`IsSupersetOf(array, count)`                                                                  | `argument` 的某个子集匹配 `UnorderedElementsAre(`预期匹配器`)`。                                                                                                                                       |
| `Pointwise(m, container)`<br/>`Pointwise(m, {e0, e1, ..., en})`                                                                                                                                                              | `argument` 包含与 `container` 相同数量的元素，且其中相同位置的元素匹配二元匹配器 `m`。例如，`Pointwise(Le(), upper_bounds)` 验证 `argument` 的每个元素都不大于 `upper_bounds` 的对应元素（详见下文）。 |
| `SizeIs(m)`                                                                                                                                                                                                                  | `argument` 是大小匹配 `m` 的容器。例如， `SizeIs(2)` 或 `SizeIs(Lt(2))`。                                                                                                                              |
| `UnorderedElementsAre(e0, e1, ..., en)`                                                                                                                                                                                      | `argument` 包含 `n + 1` 个元素，且存在某种排列使得每个元素匹配对应的 `ei`（`ei` 可以是值或匹配器）。                                                                                                   |
| `UnorderedElementsAreArray({e0, e1, ..., en})`<br/>`UnorderedElementsAreArray(a_container)`<br/>`UnorderedElementsAreArray(begin, end)`<br/>`UnorderedElementsAreArray(array)`<br/>`UnorderedElementsAreArray(array, count)` | 功能同 `UnorderedElementsAre()`，但期望值/匹配器来自初始化列表、STL 风格容器、迭代器范围或 C 风格数组。                                                                                                |
| `UnorderedPointwise(m, container)`<br/>`UnorderedPointwise(m, {e0, e1, ..., en})`                                                                                                                                            | 功能同 `Pointwise(m, container)`，但忽略元素顺序。                                                                                                                                                     |
| `WhenSorted(m)`                                                                                                                                                                                                              | 当 `argument` 使用 `<` 运算符排序后，匹配容器匹配器 `m` 。例如，`WhenSorted(ElementsAre(1, 2, 3))` 验证 `argument` 包含元素 1、2、3（忽略顺序）。                                                      |
| `WhenSortedBy(comparator, m)`。                                                                                                                                                                                              | 功能同 `WhenSorted(m)`，但使用指定比较器代替 `<` 进行排序。例如，`WhenSortedBy(std::greater(), ElementsAre(3, 2, 1))`。                                                                                |

::: note

- 这些匹配器还可以匹配：

  1. 按引用传递的原生数组，如 `Foo(const int (&a)[5])`。
  2. 以指针和长度形式传递的数组，如 `Bar(const T* buffer, int len)`，见[多参数匹配器](#multi-arg-matchers)。

- 被匹配的数组可以是多维数组（即元素本身可以是数组）。

- `Pointwise(m, ...)` 和 `UnorderedPointwise(m, ...)` 中的 `m` 应为匹配 `::std::tuple<T, U>` 的匹配器，
  其中 `T` 和 `U` 分别为实际容器和期望容器的元素类型。
  例如，要比较两个不支持 `operator==` 的 `Foo` 容器时，可以编写：

  ```cpp
  MATCHER(FooEq, "") {
    return std::get<0>(arg).Equals(std::get<1>(arg));
  }
  ...
  EXPECT_THAT(actual_foos, Pointwise(FooEq(), expected_foos));
  ```

:::

## 成员匹配器

| 匹配器                                         | 描述                                                                                                                                                                               |
| :--------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Field(&class::field, m)`                      | `argument.field`（当 `argument` 为普通指针时为 `argument->field`）匹配 `m`，其中 `argument` 为 _`class`_ 类型的对象。                                                              |
| `Field(field_name, &class::field, m)`          | 功能同双参数版本，但提供更友好的错误信息。                                                                                                                                         |
| `Key(e)`                                       | `argument.first` 匹配 `e`（`e` 可以是值或匹配器）。例如，`Contains(Key(Le(5)))` 可验证 `map` 中存在键 `<= 5`。                                                                     |
| `Pair(m1, m2)`                                 | `argument` 是 `std::pair` 类型，其 `first` 字段匹配 `m1` 且 `second` 字段匹配 `m2`。                                                                                               |
| `FieldsAre(m...)`                              | `argument` 是符合结构化协议的对象，其各字段依次匹配 `m...`。兼容对象包括支持 `std::tuple_size<Obj>` + `get<I>(obj)` 协议的类型，C++17 及以上版本还支持符合结构化绑定的聚合类型。   |
| `Property(&class::property, m)`                | `argument.property()`（当 `argument` 为普通指针时使用 `argument->property()`）匹配匹配器 `m` ，其中 `argument` 是 _`class`_ 类型的对象。`property()` 方法必须为无参 `const` 方法。 |
| `Property(property_name, &class::property, m)` | 功能同双参数版本，但提供更友好的错误信息。                                                                                                                                         |

::: warning
不要对不属于你的成员函数使用 `Property()` 匹配器，因为获取函数地址具有脆弱性且不属于函数契约范畴。
:::

::: note

`FieldsAre()` 可匹配任何支持结构化绑定的类型，如 `std::tuple`、`std::pair`、`std::array` 和聚合类型。
例如：

```cpp
std::tuple<int, std::string> my_tuple{7, "hello world"};
EXPECT_THAT(my_tuple, FieldsAre(Ge(0), HasSubstr("hello")));

struct MyStruct {
  int value = 42;
  std::string greeting = "aloha";
};
MyStruct s;
EXPECT_THAT(s, FieldsAre(42, "aloha"));
```

:::

## 函数/函数对象匹配器

| 匹配器                               | 描述                                                |
| :----------------------------------- | :-------------------------------------------------- |
| `ResultOf(f, m)`                     | `f(argument)` 匹配 `m`, 其中 `f` 为函数或函数对象。 |
| `ResultOf(result_description, f, m)` | 功能同双参数版本，但提供更友好的错误消息。          |

## 指针匹配器

| 匹配器                    | 描述                                                                                                       |
| :------------------------ | :--------------------------------------------------------------------------------------------------------- |
| `Address(m)`              | `std::addressof(argument)` 的结果匹配 `m`。                                                                |
| `Pointee(m)`              | `argument`（智能指针或原始指针）指向的值匹配 `m`。                                                         |
| `Pointer(m)`              | `argument`（智能指针或原始指针）包含的指针值匹配 `m` 。无论 `argument` 类型如何， `m` 始终匹配原始指针值。 |
| `WhenDynamicCastTo<T>(m)` | 当 `argument` 经过 `dynamic_cast<T>()` 转换后，匹配匹配器 `m`。                                            |

## 多参数匹配器 {#multi-arg-matchers}

技术上，所有匹配器都匹配单个值，多参数匹配器实际匹配的是元组。
下列匹配器可用于匹配元组`(x, y)`：

| 匹配器 | 描述     |
| :----- | :------- |
| `Eq()` | `x == y` |
| `Ge()` | `x >= y` |
| `Gt()` | `x > y`  |
| `Le()` | `x <= y` |
| `Lt()` | `x < y`  |
| `Ne()` | `x != y` |

可以以下选择器来选取参数的子集（或新的排序）进行匹配：

| 匹配器                     | 描述                                                                                         |
| :------------------------- | :------------------------------------------------------------------------------------------- |
| `AllArgs(m)`               | 等效于 `m`，用于 `.With(AllArgs(m))` 语法糖。                                                |
| `Args<N1, N2, ..., Nk>(m)` | 选取基于索引参数组成的元组匹配 `m`，例如 `Args<1, 2>(Eq())` 验证第二个和第三个参数的相等性。 |

## 复合匹配器

可通过组合现有匹配器创建新匹配器：

| 匹配器                                                                                                                                            | 描述                                                                                |
| :------------------------------------------------------------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------- |
| `AllOf(m1, m2, ..., mn)`                                                                                                                          | `argument` 同时匹配 `m1` 到 `mn` 的所有匹配器。                                     |
| `AllOfArray({m0, m1, ..., mn})`<br/>`AllOfArray(a_container)`<br/>`AllOfArray(begin, end)`<br/>`AllOfArray(array)`<br/>`AllOfArray(array, count)` | 功能同 `AllOf()`，但匹配器来源于初始化列表、STL 风格容器、迭代器范围或 C 风格数组。 |
| `AnyOf(m1, m2, ..., mn)`                                                                                                                          | `argument` 匹配 `m1` 到 `mn` 的任一匹配器。                                         |
| `AnyOfArray({m0, m1, ..., mn})`, `AnyOfArray(a_container)`, `AnyOfArray(begin, end)`, `AnyOfArray(array)`, or `AnyOfArray(array, count)`          | 功能同 `AnyOf()`，但匹配器来源于初始化列表、STL 风格容器、迭代器范围或 C 风格数组。 |
| `Not(m)`                                                                                                                                          | `argument` 不匹配匹配器 `m`。                                                       |
| `Conditional(cond, m1, m2)`                                                                                                                       | 若 `cond` 为 `true`，`argument` 匹配 `m1`，否则匹配 `m2`。                          |

## 匹配器适配器

| 匹配器                  | 描述                                                                                   |
| :---------------------- | :------------------------------------------------------------------------------------- |
| `MatcherCast<T>(m)`     | 将匹配器 `m` 转换为 `Matcher<T>` 类型。                                                |
| `SafeMatcherCast<T>(m)` | 将匹配器 `m` [安全转换](../gmock_cook_book.md#safe-matcher-cast)为 `Matcher<T>` 类型。 |
| `Truly(predicate)`      | 当 `predicate(argument)` 返回被 C++ 视为 `true` 的值时匹配成功。                       |

`Truly(predicate)` 会接管 `predicate` 的所有权，该谓词必须永久有效。

## 将匹配器作为谓词使用 {#matchers-as-predicates-cheat}

| 匹配器                                          | 描述                                                                          |
| :---------------------------------------------- | :---------------------------------------------------------------------------- |
| `Matches(m)(value)`                             | 当 `value` 匹配 `m` 时返回 `true`。可以将 `Matches(m)` 作为一元函数单独使用。 |
| `ExplainMatchResult(m, value, result_listener)` | 当 `value` 匹配 `m` 时返回 `true`，失败时通过 `result_listener` 解释原因。    |
| `Value(value, m)`                               | 当 `value` 匹配 `m` 时返回 `true`。                                           |

## 定义匹配器

```cpp
MATCHER(IsEven, "") {
  return (arg % 2) == 0;
}
```

定义匹配偶数的 `IsEven()` 匹配器。

```cpp
MATCHER_P(IsDivisibleBy, n, "") {
  *result_listener << "where the remainder is " << (arg % n);
  return (arg % n) == 0;
}
```

定义匹配能被 `n` 整除的数的 `IsDivisibleBy(n)` 匹配器。

```cpp
MATCHER_P1(IsBetween, a, b,
           absl::StrCat(negation ? "isn't" : "is", " between ",
                        PrintToString(a), " and ", PrintToString(b))) {
  return a <= arg && arg <= b;
}
```

定义匹配区间 `[a, b]` 的 `IsBetween(a, b)` 匹配器。

::: note

1. `MATCHER*` 宏不能在函数或类内部使用。

1. 匹配器体必须是纯函数式（即无副作用，结果仅取决于被匹配值和函数参数）。

1. 可使用 `PrintToString(x)` 将任意类型值 `x` 转换成字符串。

1. 可在自定义匹配器中使用 `ExplainMatchResult()` 包装其他匹配器，例如：

   ```cpp
   MATCHER_P(NestedPropertyMatches, matcher, "") {
     return ExplainMatchResult(matcher, arg.nested().property(), result_listener);
   }
   ```

1. 可使用 `DescribeMatcher<>` 来描述其他匹配器，例如：

   ```cpp
   MATCHER_P(XAndYThat, matcher,
             "X that " + DescribeMatcher<int>(matcher, negation) +
                 (negation ? " or" : " and") + " Y that " +
                 DescribeMatcher<double>(matcher, negation)) {
     return ExplainMatchResult(matcher, arg.x(), result_listener) &&
            ExplainMatchResult(matcher, arg.y(), result_listener);
   }
   ```

:::
