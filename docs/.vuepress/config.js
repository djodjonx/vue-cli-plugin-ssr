module.exports = {
  base: '/',
  serviceWorker: true,
  head: [
    ['link', { rel: 'icon', href: '/logo.png' }],
  ],
  locales: {
    '/': {
      lang: 'en-US',
      title: 'Vue CLI VSSR plugin',
      description: 'Dead Simple Server-Side-Rendering',
    },
  },
  themeConfig: {
    repo: 'djodjonx/vue-cli-plugin-ssr',
    docsDir: 'docs',
    editLinks: true,
    serviceWorker: {
      updatePopup: true,
    },
    locales: {
      '/': {
        selectText: 'Languages',
        label: 'English',
        lastUpdated: 'Last Updated',
        nav: [
          {
            text: 'Guide',
            link: '/guide/',
          },
        ],
        sidebarDepth: 3,
        sidebar: {
          '/guide/': [
            '',
            'configuration',
            'directives',
            'webpack',
          ],
        },
      },
    },
  },
}
