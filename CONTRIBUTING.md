# Contributing Guide

## 🚀 Getting Started

* Fork the [parseArgs repo](https://github.com/pkgjs/parseargs) using the Fork button on the rop right

* Clone your fork using SSH, GitHub CLI, or HTTPS

  ```bash
  git clone git@github.com:<GITHUB_ID>/parseargs.git # SSH
  gh repo clone <GITHUB_ID>/parseargs # GitHub CLI
  git clone https://github.com/<GITHUB_ID>/parseargs.git # HTTPS
  ```

* Change into your local parseargs project directory created from the step above

  ```bash
  cd parseargs
  ```

* Add pkgjs/parseargs as your upstream remote branch

  ```bash
  git remote add upstream git@github.com:pkgjs/parseargs.git
  ```

* Create a new branch for your awesome work

  ```bash
  git checkout -b <BRANCH_NAME>
  ```

* Confirm tests are passing

  ```bash
  npm test
  ```

* Commit your work. See the [`Pull Request and Commit Guidelines`](#-pull-request-and-commit-guidelines) section

* Push to your branch

  ```bash
  git push -u origin <YOUR_BRANCH>
  ```

* Open a pull request

----

## 📝 Pull Request and Commit Guidelines

* Multiple Commits would ideally be [squashed](https://docs.github.com/en/desktop/contributing-and-collaborating-using-github-desktop/managing-commits/squashing-commits) and merged into one commit wherever possible
  
* Do not use the merge button

* Commit messages would ideally reference the associated changed subsystem or behavior.

* Pull Requests for a new feature or bug fix must include tests. Additional tests or changes to the existing ones can made in the following file: [test/index.js](test/index.js)
