---
title: Rust 中的 Niche 优化
createTime: 2026/04/03 16:59:01
permalink: /blog/ssaaneyj/
tags:
  - Rust
  - 编译器优化
---

Niche 优化是 Rust 编译器的一种内存优化技术。
Rust 利用类型系统和数据布局的特性，识别出某些类型中未被使用的值（Niche），并将这些值用于存储额外的信息，从而减少内存占用和提高性能。

<!-- more -->

## 什么是 Niche？

在计算机的世界中，某些数据类型在二进制层面有一些逻辑上不会被使用的值，这些未被使用的值就是 **Niche**。

例如，Rust 规定 `Box`、引用等不为空，`0` 就是它们的 Niche。

Rust 编译器可以利用这些 Niche 来存储额外的信息，如枚举的标签，从而优化内存布局和性能。

```rust
assert_eq!(size_of::<Option<Box<i32>>>(), size_of::<Box<i32>>());
```

```rust
enum MyEnum2 {
  Zero,
  NonZero(std::num::NonZeroU8),
}
assert_eq!(size_of::<MyEnum2>(), size_of::<u8>());
```

## 哪些类型能被优化？

理论上，只要类型存在“空隙”，就能被优化。常见的类型包括：

### 指针与引用类型

Rust 保证所有的指针和引用都是非空的，因此内存地址 `0` 就是一个天然的“空隙”。

- 引用：`&T` 和 `&mut T`
- 智能指针：`Box<T>`, `Rc<T>`, `Arc<T>`
- 非空指针：`ptr::NonNull<T>`
- 函数指针：`fn()` 等

> [!warning]
> 裸指针 `*const T`, `*mut T` 可以为空，因此不能被优化。

### 非零整数类型

标准库在 `std::num` 模块下提供了一系列专门设计的类型，它们通过类型系统保证了值不为 `0`。

- `NonZeroU8`, `NonZeroU16`, `NonZeroU32`, `NonZeroU64`, `NonZeroU128`, `NonZeroUsize`
- `NonZeroI8`, `NonZeroI16`, `NonZeroI32`, `NonZeroI64`, `NonZeroI128`, `NonZeroIsize`

### 布尔类型

`bool` 只有两个可能的值：`true` 和 `false`，其余值（`2` - `255`）都是 Niche。

### 字符类型

Unicode 标准并没有使用全部的 32 位空间。
例如，范围在 0xD800 到 0xDFFF 之间的值是代理对，它们是无效的 Unicode 标量值。

Rust 的 `char` 类型保证会是有效的 Unicode 字符，因此可以利用这些“空隙”作为 Niche。

### 部分标准库 IO 类型

在 Unix 平台上，文件描述符是一个非负整数，`-1` 用于报告错误。因此 `-1` 就是它的 Niche。

```Rust
assert_eq!(size_of::<Option<std::fs::File>>(), size_of::<std::fs::File>());
```

很多标准库 IO 类型都具有类型的特定，例如：

- `std::fs::File`
- `std::net::TcpStream`
- `std::process::Child`
- `std::io::Stdin`, `std::io::Stdout`, `std::io::Stderr`

### 枚举类型

用户可以通过自定义枚举来创建具有 Niche 的类型。
只要枚举定义的变体数量少于其底层表示所能容纳的状态数量，就会产生“空隙”。

```rust
enum MyEnum {
  Variant1 = 0,
  Variant2 = 1,
}
```

### 结构体

Niche 优化具有传递性。如果一个结构体包含了一个具有 Niche 的字段，那么这个结构体本身也具有 Niche。

```rust
struct MyStruct {
  ptr: ptr::NonNull<u32>, // Niche: 0
  val: u32,
}
```

### 嵌套类型

此外，Niche 优化也支持嵌套枚举。一个已经被 Niche 优化的枚举如果还存在 Niche，那它依旧能被继续优化：

```rust
enum MyEnum {
  Variant1,
  Variant2,
}

assert_eq!(size_of::<Option<MyEnum>>(), size_of::<MyEnum>());
assert_eq!(size_of::<Option<Option<MyEnum>>>(), size_of::<MyEnum>()); // Option<Option<T>> 也能被优化
```

不过，这种优化虽然节约了内存，但也可能带来一些性能上的开销。
相比于直接使用标签，编译器可能需要进行一些位操作来判断当前枚举类型，增加了运行时复杂性。

## 如何实现自定义 Niche？

### 利用标准库内部特性

可以使用不稳定属性 `#[rustc_layout_scalar_valid_range_start]` 和 `#[rustc_layout_scalar_valid_range_end]`
来告诉编译器该类型的有效值范围。范围之外的值就被视为 Niche。

这需要使用 nightly 版本的 Rust，因为这些属性不稳定（官方明确说明只供 libcore/libstd 使用）。

下面是一个示例，定义了 `NonMaxU32` 类型，它的有效值范围是 `0` 到 `u32::MAX - 1`。

```rust
#![feature(rustc_attrs)]

#[repr(transparent)]
#[rustc_layout_scalar_valid_range_start(0)]
#[rustc_layout_scalar_valid_range_end(4_294_967_294)]  // u32::MAX - 1
pub struct NonMaxU32(u32);

impl NonMaxU32 {
    pub const fn new(value: u32) -> Option<Self> {
        if value == u32::MAX {
            None
        } else {
            Some(NonMaxU32(value))
        }
    }

    pub const fn get(self) -> u32 {
        self.0
    }
}
```

验证优化效果：

```rust
assert_eq!(std::mem::size_of::<NonMaxU32>(), 4);
assert_eq!(std::mem::size_of::<Option<NonMaxU32>>(), 4);
```

### 使用第三方库

- [`nomany`](https://docs.rs/nonany/latest/nonany/)：`nonany` 库允许用于指定任意一个 Niche 值，其内部通过 `NonZero* + XOR` 技巧实现。
- [`nonmax`](https://docs.rs/nonmax/latest/nonmax/): 提供了 `NonMax*` 等以最大值为 Niche 的整数类型。
- [`nook`](https://docs.rs/nook/latest/nook/)：该库提供了 `BalancedI*` 类型，具有相等范围的正负值，其 `Niche` 是最小的负数。

## 参考文献

- [Niche optimizations in Rust](https://www.0xatticus.com/posts/understanding_rust_niche/)
