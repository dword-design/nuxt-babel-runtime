<!-- TITLE/ -->
# nuxt-babel-runtime
<!-- /TITLE -->

<!-- BADGES/ -->
[![NPM version](https://img.shields.io/npm/v/nuxt-babel-runtime.svg)](https://npmjs.org/package/nuxt-babel-runtime)
![Linux macOS Windows compatible](https://img.shields.io/badge/os-linux%20%7C%C2%A0macos%20%7C%C2%A0windows-blue)
[![Build status](https://img.shields.io/github/workflow/status/dword-design/nuxt-babel-runtime/build)](https://github.com/dword-design/nuxt-babel-runtime/actions)
[![Coverage status](https://img.shields.io/coveralls/dword-design/nuxt-babel-runtime)](https://coveralls.io/github/dword-design/nuxt-babel-runtime)
[![Dependency status](https://img.shields.io/david/dword-design/nuxt-babel-runtime)](https://david-dm.org/dword-design/nuxt-babel-runtime)
![Renovate enabled](https://img.shields.io/badge/renovate-enabled-brightgreen)

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/dword-design/nuxt-babel-runtime)
<!-- /BADGES -->

<!-- DESCRIPTION/ -->
Nuxt CLI that supports babel. Inspired by @nuxt/typescript-runtime.
<!-- /DESCRIPTION -->

<!-- INSTALL/ -->
## Install

```bash
# NPM
$ npm install nuxt-babel-runtime

# Yarn
$ yarn add nuxt-babel-runtime
```
<!-- /INSTALL -->

## Usage
Nuxt allows to customize the babel configuration for the build. But this does not take module files or `nuxt.config.js` into account. This package provides a CLI that starts Nuxt with a babel config.

First create a babel config file like `.babelrc.json` in your project path.

Then, simply run `nuxt-babel` as you would run `nuxt`:
```bash
$ nuxt-babel dev
$ nuxt-babel build
$ nuxt-babel start
```

<!-- LICENSE/ -->
## License

Unless stated otherwise all works are:

Copyright &copy; Sebastian Landwehr <info@dword-design.de>

and licensed under:

[MIT License](https://opensource.org/licenses/MIT)
<!-- /LICENSE -->
