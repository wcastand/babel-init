const Generator = require('yeoman-generator')
const path = require('path')
const fs = require('fs')
const osLocal = require('os-locale')

const local = osLocal.sync()
const msg = fs.existsSync(path.resolve(__dirname, `./locals/${local}.js`))
  ? require(`./locals/${local}.js`)
  : require('./locals/en_US.js')

module.exports = class extends Generator {
  _q1() {
    return this.prompt([
      {
        type: 'confirm',
        name: 'yarn',
        message: msg['yarn'],
        default: true,
      },
      {
        type: 'list',
        name: 'type',
        message: msg['type'],
        choices: [
          {
            name: msg['basic'],
            value: 'basic',
          },
          {name: msg['edge'], value: 'edge'},
          {name: msg['react'], value: 'react'},
          {name: msg['typescript'], value: 'typescript'},
          {
            name: msg['custom'],
            value: 'custom',
          },
        ],
      },
    ])
  }
  _custom() {
    return this.prompt([
      {
        type: 'input',
        name: 'presets',
        message: msg['presets'],
      },
      {
        type: 'input',
        name: 'plugins',
        message: msg['plugins'],
      },
    ]).then(({presets, plugins}) => {
      this.presets = presets !== '' ? presets.replace(' ', '').split(',') : []
      this.plugins = plugins !== '' ? plugins.replace(' ', '').split(',') : []
    })
  }
  _react() {
    return this.prompt([
      {
        type: 'confirm',
        name: 'flow',
        message: msg['flow'],
        default: false,
      },
    ]).then(({flow}) => (this.flow = flow))
  }
  prompting() {
    return this._q1().then(({yarn, type}) => {
      this.yarn = yarn
      this.type = type
      switch (type) {
        case 'react':
          return this._react()
        case 'custom':
          return this._custom()
        default:
          break
      }
    })
  }
  configuring() {
    this.sourceRoot(path.resolve(__dirname, 'templates'))
    switch (this.type) {
      case 'basic':
        this.fs.copyTpl(
          this.templatePath('.babelrc-basic'),
          this.destinationPath('.babelrc')
        )
        break
      case 'edge':
        this.fs.copyTpl(
          this.templatePath('.babelrc-edge'),
          this.destinationPath('.babelrc')
        )
        break
      case 'react':
        this.fs.copyTpl(
          this.templatePath('.babelrc-react'),
          this.destinationPath('.babelrc'),
          {flow: this.flow}
        )
        break
      case 'typescript':
        this.fs.copyTpl(
          this.templatePath('.babelrc-typescript'),
          this.destinationPath('.babelrc')
        )
        break
      case 'custom':
        this.fs.copyTpl(
          this.templatePath('.babelrc'),
          this.destinationPath('.babelrc'),
          {
            presets: this.presets,
            plugins: this.plugins,
          }
        )
        break
      default:
        break
    }
  }
  install() {
    const exec = packages => {
      if (this.yarn) this.yarnInstall(packages, {dev: true})
      else this.npmInstall(packages, {'save-dev': true})
    }
    switch (this.type) {
      case 'basic':
        return exec(['babel-preset-env', 'babel-preset-stage-3'])
      case 'edge':
        return exec(['babel-preset-env', 'babel-preset-stage-0'])
      case 'react':
        const packages = [
          'babel-preset-env',
          'babel-preset-stage-3',
          'babel-preset-react',
        ]
        if (this.flow) packages.push('babel-preset-flow')
        return exec(packages)
      case 'typescript':
        return exec(['babel-preset-env', 'babel-preset-typescript'])
      case 'custom':
        return exec([
          ...this.presets.map(s => `babel-preset-${s}`),
          ...this.plugins.map(s => `babel-plugin-${s}`),
        ])
      default:
        return null
    }
  }
}
