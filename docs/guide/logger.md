# Logger middleware

## Description

Logger middleware send information (on console) about path called. All paths are logs with next informations :
- method
- url
- date
- duration
- return type

## Configuration

You can customize colors used, return type or ignore logs in `config.middlewares.logger`.

```js
/**
 * Logger middleware object config
 *
 * @type {object}
 *    @param {boolean} active Active logger middleware
 *    @param {object} options Logger options
 *      @param {object} colors colors object
 *        @param {sting} method method message color (ex: 'blue')
 *        @param {sting} alert alert message color (ex: 'red')
 *        @param {sting} warning warning message color (ex: 'yellow')
 *        @param {sting} success success message color (ex: 'green')
 *        @param {sting} url url message color (ex: 'bold')
 *        @param {sting} type type message color (ex: 'bold')
 *        @param {sting} date date message color (ex: 'bold')
 *        @see https://github.com/chalk/chalk#readme
 *    @param {object} types defines types
 *      @param {object} typesName name of type, use for add type of dat in log (ex: static: {})
 *        @type {string} regex for match type
 *          or
 *        @param {string} matcher regex for match type
 *        @param {boolean} ignore ignore log for this type
 */

module.exports = {
  port: 3000,
  ...,
  middlewares: {
    logger: {
      active: true,
      options: {
        colors: {
          warning: 'purple'
        },
        types: {
          foo: {
            matcher: /foo/g,
            ignore: true
          },
          bar: /.*\/bar/g
        }
      }
    }
  }
}

```

## Colors

This middleware use `chalk.js` for colorize log, so used chalk documentation for defined color could be used.