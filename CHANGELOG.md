Version numbers correspond to `bower.json` version

# 1.0.1-3
## Features
- `$scope.$on('jrgAreaSelectReInit',..` event listener added for re-initializing the directive (after it's already been written) - i.e. if the transcluded inner content changes
- `$scope.$on('jrgAreaSelectHide',..` event listener added for hiding the directive (i.e. the blurred sections)
- add `$attrs.inline`

## Bug Fixes
- switch from `getBoundingClientRect()` which was giving bad (negative/wrong) offset/coords


# 1.0.0

## Features

## Bug Fixes

## Breaking Changes