# Automated shell scripts

In this repo is a single shell script that contains functions designed to do automated tasks locally, prepare those updates and push them to their individual remote repos.

### Install shell script

This shell script, and others, can be installed anywhere in your local environment. If you chose, installing the npm in a global space is acceptable as well.

To access the script(s) from your command line, it is required to source the file when a new shell is opened.

With BASH, it is common to add a `source` command in the `~./bash_profile` config file. In the following code example the `automation.sh` shell script was placed into the `~/.bash_resources` directory.

```shell
source ~/.bash_resources/automation.sh
```

### What's in the script?

`gitVersion`

This is a simple function that when within a repo's directory, from the CLI you can run `gitVersion` and it will print out the version number from the repo's package.json file.

This is handy for things like having an alias to a repo's directory. For example, you could have an alias for the `auro-menu` component that takes you to the repo's directory and prints out the package version.

```shell
alias menu="cd ~/src/auro/menu && gitVersion"
```

`updateRepos`

This function takes an array of all the repo directories in your local setup that you want to loop through, determine what the HEAD branch is, check it out and perform a `git pull`.

With this one command you can ensure that all your local repos have the latest versions from the remote.

`addToRepo`

This function is like a sandwich. There is the first part that ensures that the repo is up to date. Much like the `updateRepos` function, and then it ends with a commit and a push.

In the middle is the part where custom actions can be written that allow for simple repetitive updates to be scripted.

Need to add a new file to all the repos?

```shell
command cp ../WC-Generator/.github/workflows/addToProject.yml .github/workflows/addToProject.yml
```

Need to do a search and replace of content in a specific file and delete the temp resource created?

```shell
command sed -i -e 's/@v3/@v4/g' .github/workflows/testPublish.yml
command rm .github/workflows/testPublish.yml-e
```

`openActions`

This really simple function takes an array and constructs a URL on the fly to be opened by your default browser.

This function specifically opens all the Auro element actions page. This is a great way to do a quick scan of all the repos to ensure that actions are working as expected and there are no unknown blocked releases because you missed a notification from Github.
