## Propogate Auro Change

This shell script can be used to create PRs to all of our auro components in a single move. This can be very handy for making small configuration changes to all of our repos.

> Note: This tool will not create issues for every PR. This is due to a known aggressive limitation around automating mass issue creation via GitHubs API: https://github.com/cli/cli/issues/4801. Issues will still need to be created manually for every component. As the amount of components we have grows we may eventually hit these limits in PR creation as well and need to introduce proper timeout handling.

> **⚠️ Note ⚠️**: This tool should be used with the utmost care so as to not mistakenly create a large amount of unnecc PRs.
