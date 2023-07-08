#!/bin/bash

# Script used to propogate a specific change to all of our repositories by making identical PRs into every repository.

# Required:
#   - GitHub CLI >= 2.31.0
#   - AlaskaAirlines GitHub PAT

# Notes:
#   - CANNOT be exectuted within another git repo

# Parameters:
#   `-b`: Name of branch PRs will be made from.
#   `-t`: Title of PR that will be opened
#   `-c`: Commit message for standard change

# Parse Command Line Arguments
while getopts b:t:c: flag
do
    case "${flag}" in
        b) branchName=${OPTARG};;
        t) prTitle=${OPTARG};;
        c) commitMessage=${OPTARG};;
    esac
done

# Validate all necc variables are defined
if [ -z "$branchName" ]; then
  echo "branchName undefined, please define using -b flag.";
  exit 1;
fi
if [ -z "$prTitle" ]; then
  echo "prTitle undefined, please define using -t flag.";
  exit 1;
fi
if [ -z "$commitMessage" ]; then
  echo "commitMessage undefined, please define using -c flag.";
  exit 1;
fi

# Get All Auro Repositories
repoOwner="AlaskaAirlines"
repos=$(gh repo list $repoOwner \
        --source \
        --visibility=public \
        --json name \
        --jq .[].name \
      | grep "auro-" \
      );

# Clear Previous Workspace
rm -rf ./workspace

# Create New Workspace and Move There
mkdir workspace;
cd ./workspace;

# Create PR Links Array
prLinks=()

# Operate on each repo
for repo in $repos; do
  echo "$repoOwner/$repo"
  gh repo clone "$repoOwner/$repo" -- --depth=1 --single-branch
  cd $repo
  git checkout -b $branchName

  ## ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  ## ~~~~~~~~~~~~~~~~~~~~~~~~~~ MAKE CHANGES HERE ~~~~~~~~~~~~~~~~~~~~~~~~~~
  ## ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  # Example change:
  mkdir .github
  mkdir .github/workflows
  curl https://raw.githubusercontent.com/AlaskaAirlines/auro-library/main/.github/workflows/publishDemo.yml -o .github/workflows/publishDemo.yml

  ## ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  ## ~~~~~~~~~~~~~~~~~~~~~~~~~ STOP MAKING CHANGES ~~~~~~~~~~~~~~~~~~~~~~~~~
  ## ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  # Commit changes to branch
  git add .
  git commit -m $commitMessage

  # Push change up to branch
  git push -u origin $branchName

  # Open PR
  ghOutput=$(gh pr create --title $prTitle --fill --head $(git branch --show-current) | grep "github.com")
  prLink=$(echo $ghOutput | grep "github.com")

  # Add PR to List of Links
  prLinks+=("$prLink")

  # Exit repo
  cd ..
done

# Echo Results
echo "PRs have been created successfully!!"
echo "Here are the new PRs: "
for link in "${prLinks[@]}"; do
  echo "--- $link";
done
