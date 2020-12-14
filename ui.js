module.exports = api => {
  const taskCommon = {
    prompts: [
      {
        name: 'port',
        type: 'input',
        default: '',
        description: 'Specify port',
      },
      {
        name: 'host',
        type: 'input',
        default: '',
        description: 'Specify host',
      },
      {
        name: 'server',
        type: 'input',
        default: '',
        description: 'Specify local server path (absolute from root project)',
      },
      {
        name: 'config',
        type: 'input',
        default: '',
        description: 'Specify local config path (absolute from root project)',
      },
    ],
    onBeforeRun: ({ answers, args }) => {
      if (answers.port) args.push('--port', answers.port)
      if (answers.host) args.push('--host', answers.host)
      if (answers.server) args.push('--server', answers.server)
      if (answers.config) args.push('--config', answers.config)
    },
  }

  const taskBuild = {
    prompts: [
      {
        name: 'modern',
        type: 'confirm',
        default: false,
        description: 'Build in modern mode',
      },
    ],
    onBeforeRun: ({ answers, args }) => {
      if (answers.modern) args.push('--modern')
    },
  }

  api.describeTask({
    match: /vue-cli-service ssr:serve --mode production/,
    description: 'Starts the HTTP server for SSR in production',
    link: 'https://github.com/djodjonx/vue-cli-plugin-ssr#usage',
    ...taskCommon,
  })

  api.describeTask({
    match: /vue-cli-service ssr:serve/,
    description: 'Compiles and hot-reloads for development with SSR',
    link: 'https://github.com/djodjonx/vue-cli-plugin-ssr#usage',
    ...taskCommon,
  })

  api.describeTask({
    match: /vue-cli-service ssr:build/,
    description: 'Compiles and minifies for production with SSR',
    link: 'https://github.com/djodjonx/vue-cli-plugin-ssr#usage',
    ...taskBuild,
  })

  api.describeTask({
    match: /vue-cli-service ssr:build-modern/,
    description: 'Compiles and minifies application in modern mode for production with SSR',
    link: 'https://github.com/djodjonx/vue-cli-plugin-ssr#usage',
    ...taskBuild,
  })

  api.describeConfig({
    id: 'org.vue.vssr',
    name: 'Vssr configuration',
    description: 'Turn your Vue app into an isomorphic SSR app, with customizable koa Server',
    link: 'https://github.com/djodjonx/vue-cli-plugin-ssr',
  })
}
