// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion
import 'dotenv/config';

const { themes } = require('prism-react-renderer');
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Goofy blog",
  tagline: "Goofy blog",
  url: "https://blog.cptsai.com",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/icon.svg",

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "zh-Hant",
    locales: ["zh-Hant", "en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: false,
        blog: {
          routeBasePath: "/",
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: "https://github.com/oscar60310/blog/tree/master/",
          blogSidebarCount: 0,
          editLocalizedFiles: true,
        },
        pages: {
          path: "src/pages",
          routeBasePath: "/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
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
          alt: "Goofy blog logo",
          src: "img/icon.svg",
        },
        items: [
          {
            type: "localeDropdown",
            position: "right",
          },
          {
            href: "https://github.com/oscar60310",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            label: "About",
            to: "/about",
          },
          {
            label: "Github",
            to: "https://github.com/oscar60310",
          },
          {
            label: "Login",
            to: "https://api.cptsai.com/auth/login?redirect=https://blog.cptsai.com/",
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Ivan Tsai. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['bash', 'diff', 'json'],
      },
      metadata: [
        {
          name: "google-site-verification",
          content: "wj7xFjz_WHvTZVJdCX66WW5O7t5AXSRvZ_7f9wHBnw8",
        },
      ],
    }),

  plugins: [
    "plugin-image-zoom",
    [
      "@docusaurus/plugin-ideal-image",
      {
        min: 400,
        max: 1000,
        steps: 4,
      },
    ],
  ],

  customFields: {
    maptilerKey: process.env.MAP_TILER_KEY || '',
  },

  scripts: [
    {
      src: "https://umami.cptsai.com/5e69de98-2470-46f8-856d-29de43493460.js",
      async: true,
      'data-website-id': "2d94bbab-d0e1-4d61-b278-ff9abc5ef3f1"
    }
  ]
};

module.exports = config;
