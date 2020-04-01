# 贡献须知

- [前言](#前言)
- [开发](#开发)
  - [开发环境](#开发环境)
  - [开始开发](#开始开发)
  - [分支](#分支)
  - [代码规范](#代码规范)
- [测试](#测试)
- [提交 Pull Request](#提交-pull-request)

## 前言

浪潮是一个开放的社区，欢迎各位有心人士前来贡献代码，也欢迎加入我们的 Slack 群进行交流：

- [Slack](https://join.slack.com/t/v2land/shared_invite/enQtMzA4NTE1ODQzODU2LTMzNjMyZjdiYWU3OGQyZTI1YzA2ZTliNDBlMzY1MTA0N2RhYjBmZDJhNTY2N2IxMDdmMmJkNWY1NjcwZmY0NGQ)

## 开发

v2land-redstone 是一个用 [Sails](https://sailsjs.com/) 重构的后端。先前我们线上采用的基于 Loopback 开发的 [v2land-api](https://github.com/v2land/v2land-api)已不会再更新。

如果您想参与到 Redstone 的开发当中，您可以做的事情有：

- API 的实现
- 数据库的设计
- 测试的编写
- 文档的改善

开发前，我们希望您可以加入我们的 [Slack](https://join.slack.com/t/v2land/shared_invite/enQtMzA4NTE1ODQzODU2LTMzNjMyZjdiYWU3OGQyZTI1YzA2ZTliNDBlMzY1MTA0N2RhYjBmZDJhNTY2N2IxMDdmMmJkNWY1NjcwZmY0NGQ) 群和我们充分沟通。

### 开发环境

[Sails](https://sailsjs.com/) 框架是基于 Node.js 技术栈的，所以我们的开发环境包括：

- Node.js 10.13 或以上
- Yarn 1.32 或以上
- PostgreSQL 10.4 或以上
- Sails 0.12

### 开始开发

```sh
$ git clone https://github.com/v2land/v2land-redstone.git
$ yarn install
```

### 分支

开发时，新分支的命名应该保持规范。大部分情况下，新分支应基于 `develop` 分支建立。

所有和 features 有关的分支以 feature 命名，如此类推：

- feature 相关 -> feature/xxx
- 测试相关 -> test/xxx
- 文档相关 -> doc/xxx
- API 重构相关 -> api/xxx
- 修复 bugs 相关 -> fix/xxx

### 代码规范

我们使用 eslint 来保持代码的格式和整洁，使用以下命令来 lint 代码：

```sh
$ make eslint
```

使用 eslint fix 来 fix 你的代码：

```sh
$ make eslint-fix
```

## 测试

Redstone 的测试包含两部分：单元测试和完整性测试，以下命令可以运行所有测试（包括 eslint）：

```sh
$ make test
```

使用以下测试测试完整性：

```sh
$ make test-completeness
```

注：完整性测试意味着每个 API 都应该有对应的单元测试。

只运行测试代码，不运行 eslint:

```sh
$ make test-without-lint
```

你可以在 mocha 的测试用例 `describe` 后面添加 `.only` 来指定只跑这个测试。

## 调试

v2land-redstone 现在可以使用 Chrome Dev Tools 进行调试了！具体方法如下：

进入你要进行单步调试的测试代码下面，加入一行：

```js
// 上一行代码
debugger;
// 下一行代码
```

然后进入 shell，键入：

```sh
make debug
```

等待提示服务启动成功之后，打开 Chrome 浏览器，在地址栏输入 [chrome://inspect/](chrome://inspect/) 然后在 **「Remote Target」** 下面查找到你要单步调试的用例，点击 **inspect** 就可以进行单步调试啦！

你同样可以如上文所述那样在 mocha 测试用例使用 describe.only 来指定运行哪些测试代码。

## 提交 Pull Request

当您完成开发之后，您就可以给我们的 `develop` 分支提交 PR，我们感谢您的付出和支持。
