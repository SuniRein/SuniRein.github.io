import{_ as a,c as r,a as t,o as p}from"./app-L9UMUiU0.js";const s={};function o(n,e){return p(),r("div",null,e[0]||(e[0]=[t('<p>今天将博客从 <mark>Hexo</mark> 迁移到了 <mark>Vuepress</mark>，有所感慨，故作此文。</p><h2 id="为何当初选择了-hexo" tabindex="-1"><a class="header-anchor" href="#为何当初选择了-hexo"><span>为何当初选择了 <mark>Hexo</mark></span></a></h2><p>我开始写个人博客是在今年 8 月，但想写个人博客的念头却是很早就有了。 当时 Hexo 很流行，我也一直有耳闻它的大名。 今年 8 月我开始想写博客的时候，便去了解了下目前流行的博客框架， 知道了 <mark>Hexo</mark>、<mark>WordPress</mark>、<mark>Hugo</mark>、<mark>Vuepress</mark> 这几个知名框架。</p><p>WordPress 首先就被我排除掉了，我不喜欢它的臃肿，而且它对 <mark>Markdown</mark> 也不友好。 当时我对 <mark>Vue</mark> 也不了解，当然就没有选择 Vuepress。 最终剩下的框架里，我选择了相对更知名的 Hexo。 我看过很多人用 Hexo 写博客，也听说 Hexo 的教程很多，遇到问题好解决，于是就选择了它。</p><p>事实证明这个选择过于草率，这给我后续写博客也带来了很多麻烦。 不过现在这么想也算是事后诸葛亮了。</p><h2 id="我用-hexo-面临的问题" tabindex="-1"><a class="header-anchor" href="#我用-hexo-面临的问题"><span>我用 <mark>Hexo</mark> 面临的问题</span></a></h2><h3 id="年代久远-缺乏生命力" tabindex="-1"><a class="header-anchor" href="#年代久远-缺乏生命力"><span>年代久远，缺乏生命力</span></a></h3><p>Hexo 毕竟是一个“年龄”非常大的框架了，也有了很多历史沉积带来的问题。 一方面网上的教程时间跨度大，很多老教程里面的方法现在已经不适用了， 新教程讲的也可以是一些老方法，不断试错的过程非常痛苦。 另一方面，很多以前知名的插件现在也可能不维护了，出现了很多问题， 而新的替代品则很难找，生态缺乏生命力。</p><p>Hexo 自身的语法能力有限，缺乏如代码高亮、数学公式等这些博客常用的功能。 而官方文档对这部分的描述又过于简单，需要自己去摸索，非常痛苦。 而且 Hexo 默认的 <mark>Markdown</mark> 渲染引擎也不太行，没办法进行扩展， 第三方的扩展引擎挺多也有年久失修了。 当初为了解决这个问题我折腾了很久，其中艰辛，不堪回首。</p><p>相比之下，Vuepress 的生态更加活跃，文档也更加完善， 语法高亮、数学公式等功能可以开箱即用，自带的扩展语法也足够强大， 减少了很多不必要的折腾。</p><h3 id="配置复杂" tabindex="-1"><a class="header-anchor" href="#配置复杂"><span>配置复杂</span></a></h3><p>Hexo 使用 <mark>YAML</mark> 作为配置文件，本身配置项繁多，每次使用都需要查文档。 一些配置项位置较深，查找麻烦，而且配置项之间的关系也不太清晰。 不同插件之间的配置也不太统一，风格多样。</p><p>Vuepress 使用 <mark>TypeScript</mark> 作为配置文件，配置项清晰，且可以通过 TypeScript 的类型检查来减少配置错误， 使用起来相当方便。</p><h3 id="功能有限" tabindex="-1"><a class="header-anchor" href="#功能有限"><span>功能有限</span></a></h3><p>Hexo 本身只是一个博客框架，只适合用来写博客。 最初我只是想要写简单的个人博客，倒也无所谓。 但最近我的需求有所增加，想要把这个博客发展成我的个人网站，扩展一些非博客的功能。 Hexo 自然就不太适合了。</p><h3 id="缺乏足够的扩展性" tabindex="-1"><a class="header-anchor" href="#缺乏足够的扩展性"><span>缺乏足够的扩展性</span></a></h3><p>Hexo 中的语法扩展能力有限，大多都是通过纯字符串的形式来实现。 例如我想要写多标签页，就需要<code>{% tabs title %} ... {% endtabs %}</code>这样的语法， 一旦博客内容多了，可读性骤然下降。 而 Vuepress 可以通过 Vue 组件来实现扩展原生语法， 功能更强，可读性也会更高。</p><h2 id="最终选择-vuepress-的原因" tabindex="-1"><a class="header-anchor" href="#最终选择-vuepress-的原因"><span>最终选择 <mark>Vuepress</mark> 的原因</span></a></h2><p>除了上面提到的 Vuepress 的优点外，促使我最终选择 Vuepress， 主要还是我对前端技术了解的加深。</p><p>以前的我对前端技术了解甚少，只知道 <mark>HTML</mark>、<mark>CSS</mark>、<mark>JavaScript</mark> 这些基础知识。 最近我在写一个项目，需要用前端来实现用户界面，于是就开始学习前端技术。 在这个过程中，我逐渐了解了 <mark>Vue</mark> 这个前端框架，也写过很多 <mark>Vue</mark> 组件。 知道得多了，我对这门技术也就更加感兴趣了，最终就促使我选择了 Vuepress。</p><p>如果让今年 8 月的我来选择，我可能还是会选择 Hexo。 毕竟当时的我还真是个前端小白，别说 Vue 了，就连 <mark>TypeScript</mark>， 甚至用 <mark>Npm</mark> 来管理依赖都不会。</p><h2 id="迁移过程" tabindex="-1"><a class="header-anchor" href="#迁移过程"><span>迁移过程</span></a></h2><p>从我决定迁移博客到搭建好完整的 Vuepress 博客，只用了 2 个小时不到的时间。 这固然也有我对前端了解加深的原因，但也说明了 Vuepress 的易用性。 开箱即用的功能，清晰的文档，强大的扩展性，给我留下了很好的印象。</p><p>我之前写的博客中用到了很多 Hexo 的特有语法，没办法直接迁移。 不过以我现在的眼光来看，当时博客里面写的内容也有些过时了， 我也打算趁这个机会重新整理一下博客内容。</p><p>之后我还会继续完善这个博客，增加一些新的功能，并分享下我部署个人网站的经验。 希望这个博客能够帮助到更多的人。</p>',25)]))}const m=a(s,[["render",o],["__file","index.html.vue"]]),c=JSON.parse('{"path":"/article/p1wolfdw/","title":"博客迁移","lang":"zh-CN","frontmatter":{"title":"博客迁移","createTime":"2024/12/28 20:20:35","permalink":"/article/p1wolfdw/","tags":["随笔","建站"],"description":"今天将博客从 Hexo 迁移到了 Vuepress，有所感慨，故作此文。 为何当初选择了 Hexo 我开始写个人博客是在今年 8 月，但想写个人博客的念头却是很早就有了。 当时 Hexo 很流行，我也一直有耳闻它的大名。 今年 8 月我开始想写博客的时候，便去了解了下目前流行的博客框架， 知道了 Hexo、WordPress、Hugo、Vuepress...","head":[["meta",{"property":"og:url","content":"https://sunirein.tech/article/p1wolfdw/"}],["meta",{"property":"og:site_name","content":"SuniRein 的个人小站"}],["meta",{"property":"og:title","content":"博客迁移"}],["meta",{"property":"og:description","content":"今天将博客从 Hexo 迁移到了 Vuepress，有所感慨，故作此文。 为何当初选择了 Hexo 我开始写个人博客是在今年 8 月，但想写个人博客的念头却是很早就有了。 当时 Hexo 很流行，我也一直有耳闻它的大名。 今年 8 月我开始想写博客的时候，便去了解了下目前流行的博客框架， 知道了 Hexo、WordPress、Hugo、Vuepress..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2024-12-28T13:38:09.000Z"}],["meta",{"property":"article:tag","content":"随笔"}],["meta",{"property":"article:tag","content":"建站"}],["meta",{"property":"article:modified_time","content":"2024-12-28T13:38:09.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"博客迁移\\",\\"image\\":[\\"\\"],\\"dateModified\\":\\"2024-12-28T13:38:09.000Z\\",\\"author\\":[]}"]]},"headers":[],"readingTime":{"minutes":4.45,"words":1335},"git":{"updatedTime":1735393089000,"contributors":[{"name":"SuniRein","username":"SuniRein","email":"sunirein@qq.com","commits":1,"avatar":"https://avatars.githubusercontent.com/SuniRein?v=4","url":"https://github.com/SuniRein"}]},"autoDesc":true,"filePathRelative":"随笔/建站心得/博客迁移.md","categoryList":[{"id":"8936f5","sort":10000,"name":"随笔"},{"id":"d10731","sort":10002,"name":"建站心得"}],"bulletin":false}');export{m as comp,c as data};