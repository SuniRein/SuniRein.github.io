---
title: Rust Option 类型方法详解
createTime: 2025/10/05 21:51:12
permalink: /article/mc9zsqkp/
tags:
  - Rust
  - Rust std
---

`Option` 和 `Result` 是 Rust 中最常接触的几个类型。
为了方便使用，Rust 提供了许多便利的方法。
不过，刚接触这些方法时，很容易被这么多的方法搞晕。
本文将对 `Option` 的相关方法进行分类和总结，帮助你更好地理解和使用它们。

<!-- more -->

## 存在性与谓词判断

```rust
const fn is_some(&self) -> bool
const fn is_none(&self) -> bool

fn is_some_and(self, f: impl FnOnce(T) -> bool) -> bool
fn is_none_or(self, f: impl FnOnce(T) -> bool) -> bool
```

这些方法用于快速判断 `Option ` 的变体或在判断时对内部值做简单谓词检查。
它们能避免显式的模式匹配，从而使代码更紧凑。

不过，当判断逻辑较复杂时，仍然建议使用 `match` 或 `if let` 以提高可读性。

## 引用适配器

```rust
const fn as_ref(&self) -> Option<&T>
const fn as_mut(&mut self) -> Option<&mut T>
```

`as_ref`/`as_mut` 用于将 `Option<T>` 转换为对内部值的引用形式，从而避免移动所有权。

```rust
fn as_deref(&self) -> Option<&<T as Deref>::Target>
where T: Deref

fn as_deref_mut(&mut self) -> Option<&<T as Deref>::Target>
where T: Deref
```

`as_deref` 系列在处理 `Option<Box<String>>` 这类嵌套可解引用类型时十分便捷，能直接得到目标类型的引用，避免 `map(|b| b.deref())` 的繁琐写法。

```rust
const fn as_pin_ref(self: Pin<&Option<T>>)     -> Option<Pin<&T>>
const fn as_pin_mut(self: Pin<&mut Option<T>>) -> Option<Pin<&mut T>>
```

这两个方法适用于与 `Pin` 相关的 API，简化相关操作。

```rust
const fn as_slice(&self) -> &[T]
const fn as_mut_slice(&mut self) -> &mut [T]
```

`as_slice` 等方法在内部有元素时返回一个单元素切片，为空则返回空切片。
它们可以方便地 `Option<T>` 作为切片，参与迭代或切片 API。

## 提取内部元素

### 触发 panic 的取值

```rust
const fn expect(self, msg: &str) -> T
const fn unwrap(self) -> T
```

`expect` 与 `unwrap` 在调试或明确能保证存在时使用较为方便，但在生产代码中需谨慎，建议在无法合理处理 `None` 情形时才用，以避免运行时 panic。

### 提供默认值的取值

```rust
fn unwrap_or(self, default: T) -> T                  // 立即求值
fn unwrap_or_else(self, f: impl FnOnce() -> T) -> T  // 延迟求值
fn unwrap_or_default(self) -> T where T: Default     // 使用 T:Default
```

### 不做检查的取值

```rust
const unsafe fn unwrap_unchecked(self) -> T
```

该方法在 `None` 时会导致未定义行为，仅应在经过严格分析并能保证不为 `None` 的极端性能路径中使用。

## 转换、映射与链式操作

### 转换成 Result

```rust
// 直接映射
fn ok_or<E>(self, err: E) -> Result<T, E>                       // 立即求值
fn ok_or_else<E>(self, err: impl FnOnce() -> E) -> Result<T, E> // 延迟求值
```

当需要将 `Option` 上升为 `Result`（例如在错误传播链中）时，常需要用到这两个方法；同样地，若错误值构造代价大应选择 `ok_or_else`。

在链式错误处理时，`ok_or_else` 常与 `?` 操作符结合使用以保持代码简洁。

```rust
impl<T, E> Option<Result<T, E>> {
  const fn transpose(self) -> Result<Option<T>, E>
}

// 相当于
match self {
  Some(Ok(val))  => Ok(Some(val))
  Some(Err(err)) => Err(err)
  None           => Ok(None)
}
```

`transpose` 用于进行 `Option<Result<_>>` 和 `Result<Option<_>>` 的互换，常用于从可能失败的解析或异步接口收集结果。

### 条件过滤

```rust
fn filter<P>(self, predicate: P) -> Option<T>
where
  P: FnOnce(&T) -> bool
```

`filter` 在满足谓词时返回内部值，否则返回 `None`，是函数式风格中的常见表达。

### 扁平化

```rust
impl<T> Option<Option<T>> {
  const fn flatten(self) -> Option<T>
}
```

`flatten` 能消除一层 `Option` 嵌套，用于处理多层 Option 嵌套，避免手动 `unwrap` 或嵌套匹配。

### 观察

```rust
fn inspect<F>(self, f: F) -> Option<T>
where
  F: FnOnce(&T)
```

`inspect` 会使用内部值调用 `f`，并原样返回，**不做任何修改**。
它适合在链式调用中添加日志、断言或调试操作等不改变原值的操作。

### 映射

```rust
fn map<U, F>(self, f: F) -> Option<U>
where
  F: FnOnce(T) -> U
```

`map` 用于对内部值进行纯映射，结果会被自动封装回 `Option`。

> [!note]
> 当映射函数本身可能失败并返回 `Option` 时，应优先使用 `and_then` 以避免嵌套 `Option`。

```rust
fn map_or<U, F>(self, default: U, f: F) -> U
where
  F: FnOnce(T) -> U
```

```rust
fn map_or_else<U, D, F>(self, default: D, f: F) -> U
where
  D: FnOnce() -> U,
  F: FnOnce(T) -> U
```

标准库还提供了上面两个带默认值的映射版本，当输入为 `None` 时将返回提供的默认值。

### 压缩

```rust
fn zip<U>(self, other: Option<U>) -> Option<(T, U)>
```

`zip` 只有在两个 `Option` 均有值的情况下才会返回 `Some((s, o))`，其余情况均返回 `None`。
它适合需要同时存在两个可选值才能继续处理的场景，例如同时从两个来源获取配置项。

```rust
const fn zip_with<U, F, R>(self, other: Option<U>, f: F) -> Option<R>
where
  F: FnOnce(T, U) -> R
```

`zip_with` 提供了更灵活的压缩行为，允许在存在两个值时直接进行合并转换，避免额外的元组构造。

## 布尔运算

### 与、或

```rust
fn and<U>(self, optb: Option<U>) -> Option<U>
fn or(self, optb: Option<T>) -> Option<T>
```

```rust
fn and_then<U, F>(self, f: F) -> Option<U>
where F: FnOnce(T) -> Option<U>

fn or_else<F>(self, f: F) -> Option<T>
where F: FnOnce() -> Option<T>
```

`and` 方法当自身是 `Some` 时返回 `optb`，是 `None` 时返回 `None`（相当于什么也不做）。  
`or` 方法当自身是 `None` 时返回 `optb`，是 `Some` 时返回自己（相当于什么也不做）。

`and_then` 和 `or_else` 则是它们的函数版本。

::: info 比较 `map` 与 `and_then`
`map` 的映射函数返回 `T`，最终会被包装成 `Option<T>`。
而 `and_then` 的映射函数返回 `Option<T>`，不会再被包装，用于可能失败的转换，可以防止多层 `Option` 嵌套。

`and_then` 的作用类似于函数式编程中常见的 `flatmap`。
:::

> [!note]
> Rust 提供了强大的模式匹配语法。
> 在链式调用中，合理选择 `map`/`and_then` 与 `and`/`or` 能显著提升表达力；
> 但当逻辑变得复杂或需要多分支处理时，用 `match` 更能表达清晰的分支语义。

### 异或

```rust
fn xor(self, optb: Option<T>) -> Option<T>
```

除了上面的方法外，Rust 还提供了一个不太常见的 `xor` 方法。
该方法接受两个 `Option`，当其中只有一个是 `Some` 时返回该值，否则返回 `None`。

`xor` 在某些需要“互斥存在”的场景很有用，但在日常编码中较少见，使用时应确保语义清晰以免误解。

## 比较运算符

如果 `T` 实现了 `PartialOrd` 或 `Ord`，`Option<T>` 会自动派生相应的实现。

在这种语境下，两个 `Some` 之间的比较遵循 `T` 原有的规则，而 `None` 小于任何的 `Some`。

该实现主要用于简化一些比较逻辑，例如对 `Vec<Option<T>>` 进行排序。
需要注意的是，这一约定会影响排序与集合操作的结果，在需要不同语义时应显式处理 `None`（例如在比较前将 `None` 映射为特定的哨值）。

## 作为迭代器使用

你可以直接将 `Option` 作为迭代器使用。
对于 `Some`，将作为一个单值迭代器；对于 `None`，将作为一个空迭代器。

该用法常见于串联迭代器，例如：

```rust
let mayby_num = Some(42);
let nums: Vec<i32> = (0..4).chain(mayby_num).chain(4..8).collect();
assert_eq!(nums, [0, 1, 2, 3, 42, 4, 5, 6, 7])
```

以这种方式串联迭代器，可以获得一致的返回值类型，从而作为 `impl Iterator` 的返回值。

```rust
fn make_iter(do_insert: bool) -> impl Iterator<Item = i32> {
    match do_insert {
        true => (0..4).chain(Some(42)).chain(4..8)
        false => (0..4).chain(None).chain(4..8)
    }
}
```

这里不能使用 `once()` 和 `empty()`，否则会因为类型不匹配而报错。

## 从迭代器聚合为 Option

### 容器聚合

`Option` 实现了 `FromIterator<Option<T>>` trait，可以将任何 `Option` 的迭代器收集成一个包含值的容器的 `Option`。

如果迭代器内的值全是 `Some`，将返回包含这些值的容器；否则，返回 `None`。

```rust
let v = [Some(4), Some(3), Some(11)];
let res: Option<Vec<_>> = v.into_iter().collect();
assert_eq!(res, Some(vec![4, 3, 11]));
```

```rust
let v = [Some(4), None, Some(11)];
let res: Option<Vec<_>> = v.into_iter().collect();
assert_eq!(res, None);
```

### 聚合运算（求积、求和）

`Option` 实现了 `Product<Option<T>>` 和 `Sum<Option<T>>` trait，可以通过 `product` 或 `sum` 方法来对 `Option` 迭代器求积或求和。

```rust
let input = ["123", "invalid", "2"];
let res: Option<i32> = input.into_iter().map(|s| s.parse::<i32>().ok()).product();
assert_eq!(res, None);
```

```rust
let input = ["123", "2", "2"];
let res: Option<i32> = input.into_iter().map(|s| s.parse::<i32>().ok()).product();
assert_eq!(res, Some(492));
```

## 就地修改与所有权操作

### 插入与可变引用

```rust
fn insert(&mut self, value: T) -> &mut T
```

`insert` 会用新值替换内部值并返回可变引用，适合希望在容器中就地构造或更新值的场景。

```rust
fn get_or_insert(&mut self, value: T) -> &mut T
fn get_or_insert_default(&mut self) -> &mut T where T: Default
fn get_or_insert_with(&mut self, f: impl FnOnce() -> T) -> &mut T
```

这几个方法与 `insert` 类似，但仅在为 `None` 时更新内部值。

这些方法在处理缓存、懒初始化或复用 `Option` 内部存储时非常有用。

### 移动与替换

```rust
const fn take(&mut self) -> Option<T>
```

`take` 将值移动出去并把容器置为 `None`，这是实现可复用容器或交换逻辑的常见手段。

```rust
const fn replace(&mut self, value: T) -> Option<T>
```

`replace` 则会直接用新值替换旧值，并同时获取旧值进行处理。

与 `take` 不同，`replace` 保证容器最终有新值，因此常用于更新缓存或重置状态。

::: info `take_if` 方法

[#98934](https://github.com/rust-lang/rust/issues/98934) 添加了 `take_if` 方法：

```rust
fn take_if<P>(&mut self, predicate: P) -> Option<T>
where
  P: FnOnce(&mut T) -> bool
```

该方法仅在谓词被满足时调用 `take`，为某些需要“有条件移动”的场景提供了便利。

不过，它也允许你直接在谓词中修改内部值，这可能有悖直觉，使用时要格外谨慎以免引入难以察觉的副作用。

:::

## 参考链接

- [Enum Option | Rust std](https://doc.rust-lang.org/std/option/enum.Option.html)
- [Module option | Rust std](https://doc.rust-lang.org/std/option/index.html)

以上两处官方文档是最权威的参考资料；在不确定具体行为或需要查看最新稳定版 API 时，优先以官方文档为准。
