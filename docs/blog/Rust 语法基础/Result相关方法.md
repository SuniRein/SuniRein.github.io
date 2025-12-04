---
title: Rust Result 类型方法详解
createTime: 2025-12-02 19:07:11
permalink: /blog/k3v8ajdo/
tags:
  - Rust
  - Rust std
---

在[上一篇文章](Option相关方法.md)中，我们对 `Option` 的相关方法进行了分类和总结，方便大家理解。
本文将在此基础上，继续介绍 Rust 标准库中 `Result` 的相关方法。

<!-- more -->

## 引言：与 Option 的比较

本质上，`Result` 相当于 `Option` 的一个扩展版本。
因此，`Option` 中的方法在 `Result` 中大多也有对应的实现。

这些相似的方法可以分为以下几类：

- 完全相同的方法，如 `unwrap`、`filter` 等。
  它们只处理 `Option` 中的 `Some` 分支或 `Result` 中的 `Ok` 分支，本质上没有区别。

- 除了名称不同外，功能完全相同的方法。
  这是由于 `Option` 和 `Result` 中的命名不同所致，例如 `Option::is_some` 对应 `Result::is_ok`。

- `Error` 所特有的方法。
  与 `Option::None` 不同，`Result` 中的 `Err` 可以存储值，与 `Ok` 和 `Some` 具有相同的地位，因此也提供了类似的方法。
  这些方法都以 `_err` 结尾，功能相同，例如 `unwrap_err`、`inspect_err`、`map_err` 等。

因此，如果你已经熟悉 `Option` 的相关方法，可以更容易地理解 `Result` 中的方法。

为了避免重复，这里我们只列出 `Result` 中独有的、或与 `Option` 中不同的方法。

## 安全提取值

这两个方法用于将 `Result` 中的 `Ok` 或 `Err` 分支转换为 `Option` 类型，用于从 `Result` 中安全地提取值。

```rust
fn ok(self) -> Option<T>
fn err(self) -> Option<E>
```

## 静态提取值

这两个方法利用了类型系统本身的安全性，可以将 `Result` 转换为 `T` 或 `E` 类型，但要求另一个类型必须是不可实例化的类型 `!`（即永远不会有值的类型）。

```rust
const fn into_ok(self) -> T where E: into<!>
const fn into_err(self) -> E where T: into<!>
```

## 作为程序返回值

`Result` 实现了 `Termination` trait，可以作为主函数的返回值。
由于 `main` 函数只支持整数类型的退出码，`Result` 会通过 `report` 方法将自身转换为 `ExitCode`。

```rust
impl<T: Termination, E: Debug> Termination for Result<T, E> {
  fn report(self) -> ExitCode
}
```

## Result 中不存在的方法

下面这些方法在 `Option` 中存在，但在 `Result` 中并不存在类似方法：

- `is_none_or`（但存在 `is_err_and`）
- `as_pin_ref` 和 `as_pin_mut`
- `as_slice` 和 `as_mut_slice`
- `filter`
- `zip`、`zip_with` 和 `unzip`
- `insert`、`get_or_insert`、`get_or_insert_default` 和 `get_or_insert_with`
- `take`、`replace` 和 `take_if`

这些方法的缺失，主要是因为 `Result` 和 `Option` 的定位不同导致的。
`Option` 更接近一个值的容器，因此提供了更多与容器相关的方法。
而 `Result` 更侧重于错误处理和结果传递，因此其方法更多地围绕这两个方面展开。

## 参考链接

- [Enum Result | Rust std](https://doc.rust-lang.org/std/result/enum.Result.html)
- [Module result | Rust std](https://doc.rust-lang.org/std/result/index.html)

以上两处官方文档是最权威的参考资料。
在不确定具体行为或需要查看最新稳定版 API 时，优先以官方文档为准。
