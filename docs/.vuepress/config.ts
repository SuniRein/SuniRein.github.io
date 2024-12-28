import { viteBundler } from '@vuepress/bundler-vite';
import { plumeTheme } from 'vuepress-theme-plume';
import { defineUserConfig } from 'vuepress';

export default defineUserConfig({
    lang: 'zh-CN',
    title: 'SuniRein 的个人小站',
    description: '一名普通技术宅的个人博客',

    bundler: viteBundler(),

    theme: plumeTheme({
        plugins: {
            markdownPower: {
                // See https://theme-plume.vuejs.press/guide/markdown/npm-to
                npmTo: {
                    tabs: ['pnpm', 'npm', 'yarn'],
                },
            },
            shiki: {
                languages: ['asm', 'c', 'cpp', 'sh', 'css', 'javascript', 'typescript', 'vue'],
            },
        },
        hostname: 'https://sunirein.tech',
    }),
});
