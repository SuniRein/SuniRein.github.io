import { defineThemeConfig } from 'vuepress-theme-plume';

export default defineThemeConfig({
    logo: '/images/logo.svg',
    profile: {
        name: 'SuniRein',
        description: '一名普通的技术宅',
        avatar: '/images/avatar.avif',
        location: '中国 杭州',
        circle: true,
    },
    navbar: [
        { text: '首页', link: '/' },
        { text: '博客', link: '/blog/' },
        { text: '笔记', link: '/notes/' },
        { text: '标签', link: '/blog/tags/' },
        { text: '归档', link: '/blog/archives/' },
        { text: 'RSS', link: '/atom.xml' },
    ],
    social: [{ icon: 'github', link: 'https://github.com/SuniRein' }],
    copyright: 'CC-BY-NC-SA-4.0',
});
