const Generator = require('yeoman-generator');
const path = require('path');

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
          {
            name:
              'Ready to go (env, stage-3) Basic ES6-7 functionnality. Recommended for new user',
            value: 'basic',
          },
          { name: 'Cutting edge (env, stage-0)', value: 'edge' },
          { name: 'React', value: 'react' },
          { name: 'Typescript', value: 'typescript' },
          {
            name:
              'Custom (Advanced, you need to know the name of the packages)',
            value: 'custom',
          },
        ],
      },
    ]);
  }
  _custom() {
    return this.prompt([
      {
        type: 'input',
        name: 'presets',
        message: 'Type a comma separated list of the babel presets you want:',
      },
      {
        type: 'input',
        name: 'plugins',
        message: 'Type a comma separated list of the babel plugins you want:',
      },
    ]).then(({ presets, plugins }) => {
      this.presets = presets !== '' ? presets.replace(' ', '').split(',') : [];
      this.plugins = plugins !== '' ? plugins.replace(' ', '').split(',') : [];
    });
  }
  _react() {
    return this.prompt([
      {
        type: 'confirm',
        name: 'flow',
        message: 'Do you use flow ?',
        default: false,
      },
    ]).then(({ flow }) => (this.flow = flow));
  }
  prompting() {
    return this._q1().then(({ yarn, type }) => {
      this.yarn = yarn;
      this.type = type;
      switch (type) {
        case 'react':
          return this._react();
        case 'custom':
          return this._custom();
        default:
          break;
      }
    });
  }
  configuring() {
    this.sourceRoot(path.resolve(__dirname, 'templates'));
    switch (this.type) {
      case 'basic':
        this.fs.copyTpl(
          this.templatePath('.babelrc-basic'),
          this.destinationPath('.babelrc')
        );
        break;
      case 'edge':
        this.fs.copyTpl(
          this.templatePath('.babelrc-edge'),
          this.destinationPath('.babelrc')
        );
        break;
      case 'react':
        this.fs.copyTpl(
          this.templatePath('.babelrc-react'),
          this.destinationPath('.babelrc'),
          { flow: this.flow }
        );
        break;
      case 'typescript':
        this.fs.copyTpl(
          this.templatePath('.babelrc-typescript'),
          this.destinationPath('.babelrc')
        );
        break;
      case 'custom':
        this.fs.copyTpl(
          this.templatePath('.babelrc'),
          this.destinationPath('.babelrc'),
          {
            presets: this.presets,
            plugins: this.plugins,
          }
        );
        break;
      default:
        break;
    }
  }
  install() {
    const exec = packages => {
      if (this.yarn) this.yarnInstall(packages, { dev: true });
      else this.npmInstall(packages, { 'save-dev': true });
    };
    switch (this.type) {
      case 'basic':
        return exec(['babel-preset-env', 'babel-preset-stage-3']);
      case 'edge':
        return exec(['babel-preset-env', 'babel-preset-stage-0']);
      case 'react':
        const packages = [
          'babel-preset-env',
          'babel-preset-stage-3',
          'babel-preset-react',
        ];
        if (this.flow) packages.push('babel-preset-flow');
        return exec(packages);
      case 'typescript':
        return exec(['babel-preset-env', 'babel-preset-typescript']);
      case 'custom':
        return exec([
          ...this.presets.map(s => `babel-preset-${s}`),
          ...this.plugins.map(s => `babel-plugin-${s}`),
        ]);
      default:
        return null;
    }
  }
};
