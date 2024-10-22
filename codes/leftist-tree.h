#pragma once

#include <cstddef>
#include <initializer_list>
#include <queue>
#include <utility>

template<typename T>
class LeftistTree
{
  public:
    using ValueType = T;
    using SizeType  = std::ptrdiff_t;

    LeftistTree() = default;
    LeftistTree(std::initializer_list<T> list)
    {
        assign(list.begin(), list.end());
    }

    LeftistTree(LeftistTree const&) = delete;
    LeftistTree& operator=(LeftistTree const&)=delete;

    ~LeftistTree() noexcept { delete root_; }

    void      push(ValueType const& key);
    ValueType pop();

    [[nodiscard]]
    ValueType const& top()
    {
        return root_->key;
    }

    [[nodiscard]]
    bool empty() const
    {
        return root_ == nullptr;
    }

    [[nodiscard]]
    SizeType size() const
    {
        return size_;
    }

    void clear()
    {
        delete root_;
        root_ = nullptr;
        size_ = 0;
    }

    template<typename ForwardIter>
    void assign(ForwardIter start, ForwardIter end);

  private:
    struct Node
    {
        ValueType key{};
        Node*     left{};
        Node*     right{};
        SizeType  dist{};

        explicit Node(ValueType const& key): key(key) {}

        ~Node()
        {
            delete left;
            delete right;
        }
    };

    Node*    root_{};
    SizeType size_{};

    [[nodiscard]]
    Node* merge(Node* lhs, Node* rhs);
};

template<typename T>
auto LeftistTree<T>::merge(Node* lhs, Node* rhs) -> Node*
{
    if (!lhs)
    {
        return rhs;
    }
    if (!rhs)
    {
        return lhs;
    }

    // 取较小的节点作为根节点
    if (lhs->key > rhs->key)
    {
        std::swap(lhs, rhs);
    }

    lhs->right = merge(lhs->right, rhs);
    if (!lhs->left || lhs->left->dist < lhs->right->dist)
    {
        std::swap(lhs->left, lhs->right);
    }
    lhs->dist = lhs->right ? lhs->right->dist + 1 : 0;
    return lhs;
}

template<typename T>
void LeftistTree<T>::push(ValueType const& key)
{
    ++size_;
    Node* node = new Node(key);
    root_      = merge(root_, node);
}

template<typename T>
auto LeftistTree<T>::pop() -> ValueType
{
    --size_;
    Node*     origin = root_;
    ValueType key    = root_->key;
    root_            = merge(root_->left, root_->right);

    origin->left  = nullptr;
    origin->right = nullptr;
    delete origin;

    return key;
}

template<typename T>
template<typename ForwardIter>
void LeftistTree<T>::assign(ForwardIter start, ForwardIter end)
{
    clear();

    std::queue<Node*> queue;
    while (start != end)
    {
        queue.push(new Node(*start++));
    }
    size_ = queue.size();

    while (queue.size() >= 2)
    {
        Node* lhs = queue.front();
        queue.pop();
        Node* rhs = queue.front();
        queue.pop();
        queue.push(merge(lhs, rhs));
    }
    root_ = queue.front();
}
