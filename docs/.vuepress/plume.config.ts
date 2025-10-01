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
    footer: {
        message: `
            <span style="display: flex; align-items: center; justify-content: center; gap: 3px;">
                <a href="https://beian.miit.gov.cn/" target="_blank">粤ICP备2024324598号</a>
                <img src="/images/gongan.webp">
                <a href="https://beian.mps.gov.cn/#/query/webSearch?code=33010602013756" rel="noopener" target="_blank">浙公网安备33010602013756号</a>
            </span>
        `,
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
