/* global process, Promise */

/**
 * Module dependencies
 */

var chalk = require('chalk')
var Table = require('cli-table')

/**
 * User commands
 */

function registerUser (cli, options, done) {
  var userCmd = cli.command('user')

  /**
   * API Error Response Handler
   */

  function apiError (err) {
    if (err.statusCode && [401, 403].indexOf(err.statusCode) !== -1) {
      cli.log.error('Please login to the issuer.')
    } else {
      console.log(err)
    }

    process.exit(1)
  }

  /**
   * Display Field
   */

  function displayField (key, value, format) {
    if (typeof value !== 'undefined' && !(Array.isArray(value) && value.length === 0)) {
      // determine the number of tab characters to use
      var tabs = '\t'
      var diff = 24 - key.length
      if (diff > 8) { tabs += '\t' }
      if (diff > 16) { tabs += '\t' }

      // format the value
      if (Array.isArray(value)) {
        value = value.map(function (item) {
          return (format) ? chalk[format](item) : item
        }).join('\n\t\t\t')
      } else {
        value = (format) ? chalk[format](value) : value
      }

      cli.log(key + tabs + value)
    }
  }

  /**
   * Display User
   */

  function displayUser (data) {
    cli.log()
    displayField('Name', data.name, 'bold')
    displayField('User ID', data._id, 'yellow')
    displayField('Given name', data.givenName)
    displayField('Middle name', data.middleName)
    displayField('Family name', data.familyName)
    displayField('Nickname', data.nickname)
    displayField('Preferred Username', data.preferredUsername)
    displayField('Profile', data.profile)
    displayField('Picture', data.picture)
    displayField('Website', data.website)
    displayField('Email', data.email)
    displayField('Created', data.created && new Date(data.created))
    displayField('Modified', data.modified && new Date(data.modified))
  }

  userCmd
    .handler(function (data, flags, done) {
      cli.log('Usage:')
      cli.log(
        '  nvl user:register [--issuer | -i <issuer id>] [--trusted | -t]' +
        '[--name | -n <name>] [--uri | -u <uri>]\n\t' +
        '[--logo-uri | -l <logo uri>] [--application-type | -a <app type>]\n\t' +
        '[--response-type | -r <response type>] [--grant-type | -g <grant type>]\n\t' +
        '[--default-max-age | -d <seconds>] [--redirect-uri | -s <redirect uri>]\n\t' +
        '[--post-logout-redirect-uri | -p <post logout redirect uri>]'
      )

      cli.log('  nvl user:list [--issuer | -i <issuer id>]')

      cli.log('  nvl user:info [<id>] [--issuer | -i <issuer id>]')

      cli.log(
        '  nvl user:update [<id>] [--issuer | -i <issuer id>] [--trusted | -t] [--untrusted | -U]\n\t' +
        '[--name | -n <name>] [--uri | -u <uri>]\n\t' +
        '[--logo-uri | -l <logo uri>] [--application-type | -a <app type>]\n\t' +
        '[--response-type | -r <response type>] [--grant-type | -g <grant type>]\n\t' +
        '[--default-max-age | -d <seconds>] [--redirect-uri | -s <redirect uri>]\n\t' +
        '[--post-logout-redirect-uri | -p <post logout redirect uri>]'
      )

      cli.log('  nvl user:delete [<id>] [--issuer | -i <issuer id>]')

      done()
    })

  /**
   * User registration
   */

  userCmd
    .task('register')
    .handler(function (data, flags, done) {
      cli.issuers.prompt(flags['issuer'] || flags.i, function (err, issuer) {
        if (err) {
          cli.log.error(err)
          process.exit(1)
        }

        try {
          var anvil = cli.client.create(issuer)
        } catch (e) {
          cli.log.error(e)
          process.exit(1)
        }

        anvil.discover()
          .then(function (configuration) {
            cli.prompt([
              {
                type: 'input',
                name: 'name',
                message: 'Name',
                value: flags['name'] || flags.n,
                trim: true
              },
              {
                type: 'input',
                name: 'givenName',
                message: 'Given name',
                value: flags['given'] || flags.g,
                trim: true
              },
              {
                type: 'input',
                name: 'middleName',
                message: 'Middle name',
                value: flags['middle'] || flags.m,
                trim: true
              },
              {
                type: 'input',
                name: 'familyName',
                message: 'Family name',
                value: flags['family'] || flags.f,
                trim: true
              },
              {
                type: 'input',
                name: 'nickname',
                message: 'nickname',
                value: flags['nickname'] || flags.k,
                trim: true
              },
              {
                type: 'input',
                name: 'preferredUsername',
                message: 'Preferred username',
                value: flags['username'] || flags.u,
                trim: true
              },
              {
                type: 'input',
                name: 'profile',
                message: 'Profile URI',
                value: flags['profile'] || flags.p,
                format: 'url',
                trim: true
              },
              {
                type: 'input',
                name: 'picture',
                message: 'Picture URI',
                value: flags['picture'] || flags.i,
                format: 'url',
                trim: true
              },
              {
                type: 'input',
                name: 'website',
                message: 'Website',
                value: flags['website'] || flags.w,
                format: 'url',
                trim: true
              },
              {
                type: 'input',
                name: 'email',
                message: 'Email',
                value: flags['email'] || flags.e,
                trim: true
              },
              {
                type: 'password',
                name: 'password',
                message: 'Password'
              }
            ], function (answers) {
              // register the user
              anvil.users.create(answers, { token: anvil.tokens.access_token })
                .then(function (registration) {
                  displayUser(registration)
                  done()
                })
                // registration error
                .catch(apiError)
            })
          })
          // discover error
          .catch(apiError)
      })
    })

  /**
   * User list
   */

  userCmd
    .task('list')
    .handler(function (data, flags, done) {
      cli.issuers.prompt(flags['issuer'] || flags.i, function (err, issuer) {
        if (err) {
          cli.log.error(err)
          process.exit(1)
        }

        try {
          var anvil = cli.client.create(issuer)
        } catch (e) {
          cli.log.error(e)
          process.exit(1)
        }

        anvil.discover()
          .then(function (configuration) {
            return anvil.users.list({ token: anvil.tokens.access_token })
          })
          .then(function (users) {
            var table = new Table({
              head: ['Name', 'Client ID', 'URI']
            })

            users.forEach(function (user) {
              var name = chalk.bold(user.name || user.givenName + ' ' + user.familyName)
              var userId = chalk.yellow(user._id)
              var email = (user.email) ? chalk.cyan(user.email) : ''
              table.push([name, userId, email])
            })

            cli.log(table.toString())
            done()
          })
          .catch(apiError)
      })
    })

  /**
   * User info
   */

  userCmd
    .task('info')
    .handler(function (data, flags, done) {
      cli.issuers.prompt(flags['issuer'] || flags.i, function (err, issuer) {
        if (err) {
          cli.log.error(err)
          process.exit(1)
        }

        try {
          var anvil = cli.client.create(issuer)
        } catch (e) {
          cli.log.error(e)
          process.exit(1)
        }

        anvil.discover()
          .then(function (configuration) {
            return new Promise(function (resolve, reject) {
              if (data[0]) {
                resolve(data[0])
              } else {
                anvil.users.list({ token: anvil.tokens.access_token })
                  .then(function (users) {
                    cli.prompt([
                      {
                        type: 'list',
                        name: 'userId',
                        message: 'Select a user',
                        choices: users.map(function (user) {
                          return {
                            name: user.name + ' – ' + chalk.yellow(user._id),
                            value: user._id
                          }
                        })
                      }
                    ], function (answers) {
                      resolve(answers.userId)
                    })
                  })
                  .catch(reject)
              }
            })
          })
          .then(function (userId) {
            return anvil.users.get(userId, { token: anvil.tokens.access_token })
          })
          .then(function (data) {
            displayUser(data)
            done()
          })
          .catch(apiError)
      })
    })

  /**
   * User update
   */

  userCmd
    .task('update')
    .handler(function (data, flags, done) {
      cli.issuers.prompt(flags['issuer'] || flags.i, function (err, issuer) {
        if (err) {
          cli.log.error(err)
          process.exit(1)
        }

        try {
          var anvil = cli.client.create(issuer)
        } catch (e) {
          cli.log.error(e)
          process.exit(1)
        }

        anvil.discover()
          .then(function (configuration) {
            return new Promise(function (resolve, reject) {
              if (data[0]) {
                resolve(data[0])
              } else {
                anvil.users.list({ token: anvil.tokens.access_token })
                  .then(function (users) {
                    cli.prompt([
                      {
                        type: 'list',
                        name: 'userId',
                        message: 'Select a user',
                        choices: users.map(function (user) {
                          return {
                            name: user.name + ' – ' + chalk.yellow(user._id),
                            value: user._id
                          }
                        })
                      }
                    ], function (answers) {
                      resolve(answers.userId)
                    })
                  })
                  .catch(reject)
              }
            })
          })
          .then(function (userId) {
            return anvil.users.get(userId, { token: anvil.tokens.access_token })
          })
          .then(function (user) {
            return new Promise(function (resolve, reject) {
              cli.prompt([
                {
                  type: 'input',
                  name: 'name',
                  message: 'Name',
                  value: flags['name'] || flags.n,
                  default: user.name,
                  trim: true
                },
                {
                  type: 'input',
                  name: 'givenName',
                  message: 'Given name',
                  value: flags['given'] || flags.g,
                  default: user.givenName,
                  trim: true
                },
                {
                  type: 'input',
                  name: 'middleName',
                  message: 'Middle name',
                  value: flags['middle'] || flags.m,
                  default: user.middleName,
                  trim: true
                },
                {
                  type: 'input',
                  name: 'familyName',
                  message: 'Family name',
                  value: flags['family'] || flags.f,
                  default: user.familyName,
                  trim: true
                },
                {
                  type: 'input',
                  name: 'nickname',
                  message: 'nickname',
                  value: flags['nickname'] || flags.k,
                  default: user.nickname,
                  trim: true
                },
                {
                  type: 'input',
                  name: 'preferredUsername',
                  message: 'Preferred username',
                  value: flags['username'] || flags.u,
                  default: user.preferredUsername,
                  trim: true
                },
                {
                  type: 'input',
                  name: 'profile',
                  message: 'Profile URI',
                  value: flags['profile'] || flags.p,
                  format: 'url',
                  default: user.profile,
                  trim: true
                },
                {
                  type: 'input',
                  name: 'picture',
                  message: 'Picture URI',
                  value: flags['picture'] || flags.i,
                  format: 'url',
                  default: user.picture,
                  trim: true
                },
                {
                  type: 'input',
                  name: 'website',
                  message: 'Website',
                  value: flags['website'] || flags.w,
                  format: 'url',
                  default: user.website,
                  trim: true
                },
                {
                  type: 'input',
                  name: 'email',
                  message: 'Email',
                  value: flags['email'] || flags.e,
                  default: user.email,
                  trim: true
                }
              ], function (update) {
                resolve({
                  user: user,
                  update: update
                })
              })
            })
          })
          .then(function (data) {
            return anvil.users.update(data.user._id, data.update, { token: anvil.tokens.access_token })
          })
          .then(function (data) {
            displayUser(data)
            done()
          })
          .catch(apiError)
      })
    })

  /**
   * User delete
   */

  userCmd
    .task('delete')
    .handler(function (data, flags, done) {
      cli.issuers.prompt(flags['issuer'] || flags.i, function (err, issuer) {
        if (err) {
          cli.log.error(err)
          process.exit(1)
        }

        try {
          var anvil = cli.client.create(issuer)
        } catch (e) {
          cli.log.error(e)
          process.exit(1)
        }

        anvil.discover()
          .then(function (configuration) {
            return new Promise(function (resolve, reject) {
              if (data[0]) {
                resolve(data[0])
              } else {
                anvil.users.list({ token: anvil.tokens.access_token })
                  .then(function (users) {
                    cli.prompt([
                      {
                        type: 'list',
                        name: 'userId',
                        message: 'Select a user',
                        choices: users.map(function (user) {
                          return {
                            name: user.name + ' – ' + chalk.yellow(user._id),
                            value: user._id
                          }
                        })
                      }
                    ], function (answers) {
                      resolve(answers.userId)
                    })
                  })
                  .catch(reject)
              }
            })
          })
          .then(function (userId) {
            return anvil.users.delete(userId, { token: anvil.tokens.access_token })
          })
          .then(function () {
            done()
          })
          .catch(apiError)
      })
    })

  done()
}

/**
 * Exports
 */

module.exports = registerUser