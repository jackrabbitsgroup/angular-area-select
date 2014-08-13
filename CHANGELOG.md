Version numbers correspond to `bower.json` version

# 1.0.6 (2014-08-12)
## Bug Fixes
- do NOT substract scroll top/left when getting element offset (fixes webkit/chrome issue when scrolled down on the page)


# 1.0.5 (2014-08-12)
- fix `bower.json` angular versions to be `>=` for backwards compatibility


# 1.0.4 (2014-08-12)
[same as v1.0.3, just updated `bower.json` & `CHANGELOG`]

# 1.0.3 (2014-08-12)
## Features
- add `inline-block` attribute
- chore: update Angular to 1.3.0-beta.17 (but should still be backwards compatible)


# 1.0.2 (2014-04-01)
## Features
- move `instId` from `attrs` to `scope` to allow setting/changing later/dynamically


# 1.0.1 (2014-01-25)
## Features
- `$scope.$on('jrgAreaSelectReInit',..` event listener added for re-initializing the directive (after it's already been written) - i.e. if the transcluded inner content changes
- `$scope.$on('jrgAreaSelectHide',..` event listener added for hiding the directive (i.e. the blurred sections)
- add `$attrs.inline`

## Bug Fixes
- switch from `getBoundingClientRect()` which was giving bad (negative/wrong) offset/coords
- add z-index:999 to blurred elements so they show up on top


# 1.0.0

## Features

## Bug Fixes

## Breaking Changes