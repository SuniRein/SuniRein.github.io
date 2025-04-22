import { defineNoteConfig } from 'vuepress-theme-plume';

export default defineNoteConfig({
    dir: 'GoogleTest',
    link: '/gtest/',
    sidebar: [
        {
            text: '引导',
            items: ['welcome'],
        },
        {
            text: '快速开始',
            items: ['platforms', 'quickstart-bazel', 'quickstart-cmake'],
        },
        {
            text: '指南',
            items: ['primer', 'advanced', 'gmock_for_dummies', 'gmock_cook_book', 'gmock_cheat_sheet'],
        },
        {
            text: 'Reference',
            items: [
                'reference/testing',
                'reference/mocking',
                'reference/assertions',
                'reference/matchers',
                'reference/actions',
                'faq',
                'gmock_faq',
                'samples',
                'pkgconfig',
                'community_created_documentation',
            ],
        },
    ],
});
