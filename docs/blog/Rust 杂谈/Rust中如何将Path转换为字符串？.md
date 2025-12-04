---
title: Rust 中如何将 Path 转换为字符串？
createTime: 2025-09-10 19:49:01
permalink: /blog/ai80resl/
tags:
  - Rust
  - 字符串
  - 路径处理
---

在开发中，将路径转换为字符串是一种常见的需求。
由于字符串编码的复杂性，Rust 在处理这一问题时也有些麻烦，初学者可能会遇到问题。
本文将探讨如何在 Rust 中解决这一问题，并给出项目开发实践中的一些建议。

<!-- more -->

## 表示路径的类型

Rust 中有两种表示路径的类型：

- `PathBuf`：拥有所有权且可变的路径，类似于 `String`。
- `Path`：路径的切片，类似于 `str`。

这两种类型实际上是 `OsString` 和 `OsStr` 的封装，而非使用 Rust 默认的字符串类型，因此在转换为 `String` 或 `str` 时比较麻烦。

::: info `OsString`
用于存储当前平台的原生字符串类型。

字符串在 Unix 上通常为非零 UTF-8 编码，在 Windows 上通常为非零 UTF-16 编码。
这与 Rust 的默认字符串不匹配，因此使用 `OsString` 来弥合这种差距。

需要注意，`OsString` 内部不一定是按照平台原生的形式来保存字符串，只是提供了一种与原生字符串交互的途径。
:::

## 路径转换为字符串的方法

由于 `PathBuf` 实现了 `Deref<Target=Path>`，因此这里仅介绍 `Path` 的方法。

### 获取 `OsStr` 后转化

```rust
impl Path {
  pub fn as_os_str(&self) -> &OsStr
}
```

可以调用上面提供的方法先将路径转化为 `OsStr` 再转换为字符串。

```rust
impl OsStr {
  /// 如果为有效的 Unicode 编码，返回内部 str，否则返回 None
  /// 该方法不会涉及拷贝或重编码，但是需要对字符串做有效性检查
  pub fn to_str(&self) -> Option<&str>

  /// 如果为有效的 Unicode 编码，返回内部 str，不作任何转换
  /// 否则，会将所有无效部分替换为 U+FFFD(�) 再返回，这需要分配新的内存
  pub fn to_string_lossy(&self) -> Cow<'_, str>
}
```

如果最终需要得到 `String`，还需再做额外的转换，完整代码如下：

```rust
let path = Path::new("./foo/bar.txt");
assert_eq!(
  String::new("./foo/bar.txt"),
  path.as_os_str().to_str().unwrap().to_string()
);
assert_eq!(
  String::new("./foo/bar.txt"),
  path.as_os_str().to_string_lossy().into_owned()
);
```

通常如果使用 `to_str` 会搭配 `unwrap`，表示我们预期输入是合法 Unicode。

而如果只是想要一个可用的字符串用于打印/日志，一般建议使用 `to_string_lossy`。
它只会在必要的时候进行有损转换，大多数情况下与 `to_str` 没有性能差异。

### 直接调用 `Path` 的转换方法

由于将 `Path` 转换为字符串的操作很普遍，Rust 为上面的操作提供了以下便携方法：

```rust
impl Path {
  pub fn to_str(&self) -> Option<&str>
  pub fn to_string_lossy(&self) -> Cow<'_, str>
}
```

在使用时可以直接调用这两个方法，无需经过 `OsStr` 的转换。

### `Display` 接口

```rust
impl Path {
  pub fn display(&self) -> std::path::Display<'_>
}
```

`Path` 提供了一个专门用于打印路径的方法，其行为类似 `to_string_lossy`，返回一个实现了 `Display` trait 的类型。
因此也可以使用该方法来获取字符串：

```rust
let path = Path::new("./foo/bar.txt");
assert_eq!(
  String::new("./foo/bar.txt"),
  path.display().to_string()
);
```

不过一般不建议使用该方法，更推荐使用意义更为明确的 `to_string_lossy`。

## 个人实践

一般我会根据需要选择 `to_str` 和 `to_string_lossy`：

- 如果要保证输入为合法 Unicode，选择 `to_str`。
- 如果无法确认输入的编码，或者需要用于打印/日志，选择 `to_string_lossy`。

使用这些方法将路径转换为字符串会比较冗长，因此我会将其封装为对应的 trait:

```rust
pub trait PathStr {
  fn to_utf8_string(&self) -> String
}

impl PathStr for Path {
  fn to_utf8_string(&self) -> String {
    self.to_str().unwrap().to_string()
  }
}
```

你可以根据自己的需要调整上面函数，只需在使用时导入对应的 trait 即可。
