#pragma once

#include <algorithm>
#include <cstddef>
#include <optional>

namespace xtd
{

template <typename T>
class AvlTree
{
  public:
    using value_type = T;
    using size_type = std::size_t;

    struct Node
    {
        value_type key{};
        size_type height{};
        Node* left{};
        Node* right{};

        void update_height()
        {
            height = 1 + std::max(get_height(left), get_height(right));
        }
    };

    std::optional<value_type> find(value_type const& key) const
    {
        Node const* node = find(root_, key);
        return node ? std::make_optional(node->key) : std::nullopt;
    }

    void insert(value_type const& key)
    {
        root_ = insert(root_, key);
    }

    void remove(value_type const& key)
    {
        root_ = remove(root_, key);
    }

  private:
    static int get_height(Node* node)
    {
        return node ? node->height : 0;
    }

    static int get_balance(Node* node)
    {
        return node ? get_height(node->left) - get_height(node->right) : 0;
    }

    Node* root_{};

    Node const* find(Node const* node, value_type const& key) const
    {
        if (node == nullptr || node->key == key)
        {
            return node;
        }

        if (key < node->key)
        {
            return find(node->left, key);
        }
        return find(node->right, key);
    }

    Node* rotate_right(Node* node)
    {
        if (node == nullptr || node->left == nullptr)
        {
            return node;
        }

        Node* left = node->left;
        Node* right = left->right;

        left->right = node;
        node->left = right;

        // 先更新 node 的高度，再更新 left 的高度
        node->update_height();
        left->update_height();

        return left;
    }

    Node* rotate_left(Node* node)
    {
        if (node == nullptr || node->right == nullptr)
        {
            return node;
        }

        Node* right = node->right;
        Node* left = right->left;

        right->left = node;
        node->right = left;

        // 先更新 node 的高度，再更新 right 的高度
        node->update_height();
        right->update_height();

        return right;
    }

    Node* rotate(Node* node)
    {
        if (node == nullptr)
        {
            return node;
        }

        if (get_balance(node) > 1)
        {
            if (get_balance(node->left) < 0)
            {
                node->left = rotate_left(node->left);
            }
            return rotate_right(node);
        }

        if (get_balance(node) < -1)
        {
            if (get_balance(node->left) > 0)
            {
                node->left = rotate_right(node->left);
            }
            return rotate_left(node);
        }

        return node;
    }

    Node* insert(Node* node, value_type const& key)
    {
        if (node == nullptr)
        {
            return new Node{.key = key, .height = 1};
        }

        if (key < node->key)
        {
            node->left = insert(node->left, key);
        }
        else
        {
            node->right = insert(node->right, key);
        }

        node->update_height();
        return rotate(node);
    }

    Node* remove(Node* node, value_type const& key)
    {
        if (node == nullptr)
        {
            return node;
        }

        if (key < node->key)
        {
            node->left = remove(node->left, key);
        }
        else if (key > node->key)
        {
            node->right = remove(node->right, key);
        }
        else
        {
            if (node->left == nullptr || node->right == nullptr)
            {
                Node* temp = node->left ? node->left : node->right;

                // node 为叶子节点，直接删除
                if (temp == nullptr)
                {
                    delete node;
                    return nullptr;
                }

                // node 只有一个子节点，用子节点替换 node
                *node = *temp;
                delete temp;
            }
            else
            {
                // node 有两个子节点，找到右子树的最小节点，用该节点替换 node
                Node* temp = node->right;
                while (temp->left != nullptr)
                {
                    temp = temp->left;
                }

                node->key = temp->key;
                node->right = remove(node->right, temp->key);
            }
        }

        node->update_height();
        return rotate(node);
    }
};

} // namespace xtd

