## Dependency Tag Versioming

This workflow works to automatically delete and clear any surge demos that have been active for more than 2+ months. Surge in theory allows us to have an infinite amount of active pages but by clearing unused and stale demos we can keep our Surge account more organized in the future.

> Note: This workflow exectutes on a monthly cronjob on the first of each month.

In order to clear all our surge projects we rely on [this GitHub Action](https://github.com/marketplace/actions/surge-sh-teardown) to handle the deletion logic.
