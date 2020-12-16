# Deployment

This section aims explain how deploy this project on server when used local server (no builtIns).

if you use builtIns server, you just need have vue-cli-service installed on your server then run command for build and start server

# Build

Before all, build your application locally or on your Pipeline.

`:warning: You should have vue-cli-service installed for run build`

### normal build
```bash
npm run ssr:build
      #or
yarn run ssr:build
```

### modern build
```bash
npm run ssr:build-modern
      #or
yarn run ssr:build-modern
```

> If you have pull your project on server, don't forget to run install before

# Copy

Now, build as done, so you have to copy files on server.

Files required:

- node_modules
- dist folder
- server folder

> If you change folder three on copy, don't forget to edit your configuration file.

# Run server

Now it's time to run server

```bash
# exemple command on root
node ./server/index.js
```

