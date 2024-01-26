#!/bin/bash

# Simple function that looks into a repo's package.json and print out
# the current verison released.
function gitVersion {
  # Version key/value should be on his own line
  PACKAGE_VERSION=$(cat package.json \
    | grep version \
    | head -1 \
    | awk -F: '{ print $2 }' \
    | sed 's/[",^|]//g')

  echo -e "Package version -$PACKAGE_VERSION"
}

# This function will loop through all the repos listed
# and do a `git pull` for each repo before moving on.
function updateRepos {
  ## declare an array variable
  declare -a arr=("alert" "WC-Generator/" "drawer/" "wcss/" "hyperlink/" "auro-lockup/" "icons/" "flight/" "dialog/" "banner/" "card/" "nav/" "datepicker/" "popover/" "dropdown/" "radio/" "checkbox/" "button/" "loader/" "flightline/" "b2top/" "combobox/" "carousel/" "table/" "toast/" "icon/" "select/" "sidenav/" "pane/" "header/" "datetime/" "input/" "avatar/" "badge/" "background/" "interruption/" "skeleton/" "menu/" "eslint-config/" "tokens/"
 )

  ## now loop through the above array
  for i in "${arr[@]}"
  do
    echo -e "\n$i\n"
    command cd ~/src/auro/"$i"
    echo "look at me in '$i'"
    gitVersion
    branch=$(git symbolic-ref --short HEAD)
    echo -e "making sure on $branch branch"
    command git checkout $branch
    echo -e "updating repo from remote"
    command git pull

  done
}


function addToRepo {
  ## declare an array variable
  declare -a arr=("wcss/" "icons/" "banner/" "card/" "radio/" "checkbox/" "button/" "loader/" "flightline/" "b2top/" "combobox/" "carousel/" "table/" "toast/" "icon/" "select/" "sidenav/" "pane/" "header/" "datetime/" "input/" "avatar/" "badge/" "background/" "interruption/" "skeleton/" "menu/" "eslint-config/" "tokens/")

  ## now loop through the above array
  for i in "${arr[@]}"
  do
    # CD into dir and ensure that the repo is
    # up to date with a `git pull`
    # -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    echo -e "\n$i\n"
    command cd ~/src/auro/"$i"
    echo "look at me in '$i'"
    sleep 1
    gitVersion
    branch=$(git symbolic-ref --short HEAD) # determins if the head is `master` or `main`
    echo -e "making sure on $branch branch" # uses variable
    command git checkout $branch # uses variable
    echo -e "updating repo from remote"
    command git pull
    sleep 1

    # Customize the action to be performed
    # -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    # This action will copy a resource from one dir to another
    # to update the repo
    command cp ../WC-Generator/.github/workflows/addToProject.yml .github/workflows/addToProject.yml
    echo -e "Copied file to '$i' repo.\n"

    # This action will look for `@v3` and replace with @v4
    # in .github/workflows/testPublish.yml, then delete the
    # temporary file that was created.
    command sed -i -e 's/@v3/@v4/g' .github/workflows/testPublish.yml
    command rm .github/workflows/testPublish.yml-e
    echo -e "Updated workflow script\n"

    # Perform git functions to add, commit and push
    # -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    sleep 1
    command git add --all
    sleep 1
    command git commit -m "build: add auto-assign to project script"
    echo -e "Commit added to Git\n"
    echo -e "Pushing to the remote\n"
    sleep 2
    command git push
    echo -e "Update pushed to the remote\n"
    sleep 2

  done
}

# This function will loop through the array to construct a URL for each repo's
# actions landing page. This is great for validating that actions have
# run successfully.
function openActions {
  ## declare an array variable
  declare -a arr=("auro-alert" "WC-Generator/" "auro-drawer/" "webcorestylesheets/" "auro-hyperlink/" "auro-lockup/" "icons/" "auro-flight/" "auro-dialog/" "auro-banner/" "auro-card/" "auro-nav/" "auro-datepicker/" "auro-popover/" "auro-dropdown/" "auro-radio/" "auro-checkbox/" "auro-button/" "auro-loader/" "auro-flightline/" "auro-backtotop/" "auro-combobox/" "auro-carousel/" "auro-table/" "auro-toast/" "auro-icon/" "auro-select/" "auro-sidenav/" "auro-pane/" "auro-header/" "auro-datetime/" "auro-input/" "auro-avatar/" "auro-badge/" "auro-background/" "auro-interruption/" "auro-skeleton/" "auro-menu/" "eslint-config-auro/" "aurodesigntokens/")

  ## now loop through the above array
  for i in "${arr[@]}"
  do
    command open https://github.com/AlaskaAirlines/"$i"actions
  done
}
