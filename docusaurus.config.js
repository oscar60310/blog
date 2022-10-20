// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Goofy',
  tagline: 'Goofy blog',
  url: 'https://blog.cptsai.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/icon.svg',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: false,
        blog: {
          routeBasePath: '/',
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/oscar60310/blog/tree/main/',
          blogSidebarCount: 0
        },
        pages: {
          path: 'src/pages',
          routeBasePath: '/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        gtag: {
          trackingID: 'GTM-WNQNTJK'
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: `Goofy's blog`,
        logo: {
          alt: 'Goofy blog logo',
          src: 'img/icon.svg',
        },
        items: [
          {
            href: 'https://github.com/oscar60310',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [{
          label: 'About',
          to: '/about',
        }, {
          label: 'Github',
          to: 'https://github.com/oscar60310',
        }, {
          label: 'Login',
          to: 'https://api.cptsai.com/auth/login?redirect=https://blog.cptsai.com/',
        }],
        copyright: `Copyright © ${new Date().getFullYear()} Ivan Tsai. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),

  plugins: [
    'plugin-image-zoom',
    [
      '@docusaurus/plugin-ideal-image',
      {
        min: 400,
        max: 1000,
        steps: 4,
      },
    ],
  ],
};

module.exports = config;
