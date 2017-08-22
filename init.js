const Generator = require('yeoman-generator')
const path = require('path')

const p1 = [
  {name: 'babel-preset-env', value: 'babel-preset-env', checked: true},
  {name: 'babel-preset-es2015', value: 'babel-preset-es2015'},
  {name: 'babel-preset-es2016', value: 'babel-preset-es2016'},
  {name: 'babel-preset-es2017', value: 'babel-preset-es2017'},
  {name: 'babel-preset-typescript', value: 'babel-preset-typescript'},
]
const p2 = [
  {name: 'babel-preset-flow', value: 'babel-preset-flow'},
  {name: 'babel-preset-react', value: 'babel-preset-react'},
]
const p3 = [
  {name: 'none', value: null},
  {name: 'babel-preset-stage-0', value: 'babel-preset-stage-0'},
  {name: 'babel-preset-stage-1', value: 'babel-preset-stage-1'},
  {name: 'babel-preset-stage-2', value: 'babel-preset-stage-2'},
  {name: 'babel-preset-stage-3', value: 'babel-preset-stage-3'},
]

module.exports = class extends Generator {
  _q1() {
    return this.prompt([
      {
        type: 'confirm',
        name: 'yarn',
        message: 'Do you want to use yarn instead of npm ?',
        default: true,
      },
      {
        type: 'list',
        name: 'type',
        message: 'How do you want to configure your babel project :',
        choices: [
          {name: 'Using presets (recommended for new users)', value: 'presets'},
          {name: 'Choose my transformers', value: 'advanced'},
        ],
      },
    ])
  }
  _q2() {
    return this.prompt([
      {
        type: 'list',
        name: 'preset',
        message: 'Choose the preset you want :',
        choices: p1,
      },
      {
        type: 'list',
        name: 'stagePreset',
        message: 'Do you want aditional preset ?',
        choices: p3,
      },
      {
        type: 'confirm',
        name: 'react',
        message: 'Do you use react ?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'flow',
        message: 'Do you use flow ?',
        default: false,
      },
    ]).then(({preset, stagePreset, react, flow}) => {
      this.presets = [preset]
      if (stagePreset !== null) this.presets.push(stagePreset)
      if (react) this.presets.push('babel-preset-react')
      if (flow) this.presets.push('babel-preset-flow')
    })
  }
  _q3() {
    return null
  }
  prompting() {
    return this._q1().then(({yarn, type}) => {
      this.yarn = yarn
      return type === 'presets' ? this._q2() : this._q3()
    })
  }
  configuring() {
    this.sourceRoot(path.resolve(__dirname, 'templates'))
    this.fs.copyTpl(
      this.templatePath('.babelrc'),
      this.destinationPath('.babelrc'),
      {
        presets: this.presets.map(p => `"${p.replace('babel-preset-', '')}"`),
        plugins: [],
      }
    )
  }
  install() {
    if (this.yarn) this.yarnInstall(this.presets, {dev: true})
    else this.npmInstall(this.presets, {'save-dev': true})
  }
}
