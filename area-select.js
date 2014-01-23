/**

@toc
1. setup
2. Event handlers setup - mousedown/touchstart, mouseup/touchend, mousemove/touchmove
3. init
4. start
5. end
6. move
7. scopeApply
8. calculateSelectArea
9. getEleCoords

@param {Object} scope (attrs that must be defined on the scope (i.e. in the controller) - they can't just be defined in the partial html). REMEMBER: use snake-case when setting these on the partial!
	@param {Object} coords Object to pass in (can be empty) that will be stuffed with the values, specifically:
		@param {Object} ele The coordinates of the element itself
			@param {Number} left Will always be 0 since it's offset from here
			@param {Number} right
			@param {Number} top Will always be 0 since it's offset from here
			@param {Number} bottom
			@param {Number} height (for convenience: just bottom - top)
			@param {Number} width (for convenience: just right - left)
		@param {Object} select The coordinates of the selected area
			@param {Number} left Relative to ele.left
			@param {Number} right Relative to ele.left
			@param {Number} top Relative to ele.top
			@param {Number} bottom Relative to ele.top
			@param {Number} height (for convenience: just bottom - top)
			@param {Number} width (for convenience: just right - left)

@param {Object} attrs REMEMBER: use snake-case when setting these on the partial! i.e. my-attr='1' NOT myAttr='1'
	@param {Number} [aspectRatio =0] 0 to NOT force an aspect ratio, otherwise width/height (so 1 for a square, 2 for twice as wide as tall and .5 for twice as tall as wide, etc.: use any number >0)

@dependencies
[none]

@usage
//EXAMPLE 1 - default
partial / html:
<div jrg-area-select coords='coords'>
	<!-- everything in here will be transcluded / stuffed in and used as the element to select inside of -->
	<div style='background-color:blue; height:200px; width:300px;'>&nbsp;</div>
</div>

controller / js:
$scope.coords ={};


//EXAMPLE 2 - aspect ratio (force square)
partial / html:
<div jrg-area-select coords='coords' aspect-ratio='1'>
	<!-- everything in here will be transcluded / stuffed in and used as the element to select inside of -->
	<div style='background-color:blue; height:200px; width:300px;'>&nbsp;</div>
</div>

controller / js:
$scope.coords ={};

//end: usage
*/

'use strict';

angular.module('jackrabbitsgroup.angular-area-select', []).directive('jrgAreaSelect', ['$timeout', 
function ($timeout) {

	return {
		restrict: 'A',
		transclude: true,
		scope: {
			coords: '='
		},

		// replace: true,
		template: function(element, attrs) {
			var defaultsAttrs ={
				aspectRatio: 0
			};
			for(var xx in defaultsAttrs) {
				if(attrs[xx] ===undefined) {
					attrs[xx] =defaultsAttrs[xx];
				}
			}
			
			var html ="<div style='position:relative;'>"+
				"<span class='jrg-area-select-ele' ng-transclude></span>"+
				"<div class='jrg-area-select-blurred' style='top:{{(coordsTemp.ele.top -offsets.ele.top)}}px; left:{{(coordsTemp.ele.left -offsets.ele.left)}}px; height:{{(coordsTemp.ele.bottom -coordsTemp.ele.top)}}px; width:{{(coordsTemp.select.left -coordsTemp.ele.left)}}px;'>&nbsp;</div>"+		//left side: from element left to select left; from element top to element bottom
				"<div class='jrg-area-select-blurred' style='top:{{(coordsTemp.ele.top -offsets.ele.top)}}px; left:{{(coordsTemp.select.right -offsets.ele.left)}}px; height:{{(coordsTemp.ele.bottom -coordsTemp.ele.top)}}px; width:{{(coordsTemp.ele.right -coordsTemp.select.right)}}px;'>&nbsp;</div>"+		//right side: from select right to element right; from element top to element bottom
				"<div class='jrg-area-select-blurred' style='top:{{(coordsTemp.ele.top -offsets.ele.top)}}px; left:{{(coordsTemp.select.left -offsets.ele.left)}}px; height:{{(coordsTemp.select.top -coordsTemp.ele.top)}}px; width:{{(coordsTemp.select.right -coordsTemp.select.left)}}px;'>&nbsp;</div>"+		//top side: from select left to select right; from element top to select top
				"<div class='jrg-area-select-blurred' style='top:{{(coordsTemp.select.bottom -offsets.ele.top)}}px; left:{{(coordsTemp.select.left -offsets.ele.left)}}px; height:{{(coordsTemp.ele.bottom -coordsTemp.select.bottom)}}px; width:{{(coordsTemp.select.right -coordsTemp.select.left)}}px;'>&nbsp;</div>"+		//bottom side: from select left to select right; from select bottom to element bottom
				
				//TESTING
				// "<div>coords: {{coords}}</div>"+
				// "<div>coordsTemp: {{coordsTemp}}</div>"+
				// "<div>offsets: {{offsets}}</div>"+
				//end: TESTING
			"</div>";
			return html;
		},
		
		link: function(scope, element, attrs) {
		},
		
		controller: function($scope, $element, $attrs) {
			/**
			@toc 1.
			setup
			*/
			var eles ={
				main: $element.find('span'),
				doc: angular.element(document)
			};
			
			/**
			@property $scope.offsets Holds the relative offset of this directive / the element (for position absolute to work with the coordinates properly)
			@type Object
			*/
			$scope.offsets ={
				ele: {
					top: 0,
					left: 0
				}
			};
			
			/**
			@property $scope.state Triggers for tracking when mouse/touch is started and ended
			@type Object
			*/
			$scope.state ={
				started: false,
				ended: false
			};
			
			/**
			@property $scope.coordsTemp Internal coordinates used for the calculations
			@type Object
			*/
			$scope.coordsTemp ={
				start: {
					x: 0,
					y: 0
				},
				end: {
					x: 0,
					y: 0
				},
				//raw coords - without $scope.offsets.ele subtracted
				ele: {
					left: 0,
					right: 0,
					top: 0,
					bottom: 0
				},
				//raw coords - without $scope.offsets.ele subtracted
				select: {
					left: 0,
					right: 0,
					top: 0,
					bottom: 0
				}
			};
			
			/**
			@property $scope.coords The passed in (and set) coordinates to use outside this directive. They are all 0 offset so you'll get the dimensions of the element itself and then the dimensions of the selected area inside of that.
			@type Object
			*/
			$scope.coords ={
				ele: {
					left: 0,
					right: 0,
					top: 0,
					bottom: 0,
					height: 0,
					width: 0
				},
				select: {
					left: 0,
					right: 0,
					top: 0,
					bottom: 0,
					height: 0,
					width: 0
				}
			};
			
			/**
			@property buffer Number of pixels to allow outside the element to start tracking it
			@type Number
			*/
			var buffer =50;
			
			/**
			@toc 2.
			Event handlers setup - mousedown/touchstart, mouseup/touchend, mousemove/touchmove
			*/
			//start
			eles.doc.on('mousedown', function(evt) {
				// console.log('mousedown');
				start(evt, {});
				scopeApply({});
			});
			eles.doc.on('touchstart', function(evt) {
				// console.log('touchstart');
				start(evt, {});
				scopeApply({});
			});
			
			//end - NOTE: need to add this listener on the ENTIRE PAGE since they could end OUTSIDE our element
			// eles.main.on('mouseup', function(evt) {
			eles.doc.on('mouseup', function(evt) {
				// console.log('mouseup');
				end(evt, {});
				scopeApply({});
			});
			// eles.main.on('touchend', function(evt) {
			eles.doc.on('touchend', function(evt) {
				// console.log('touchend');
				end(evt, {});
				scopeApply({});
			});
			
			//move
			eles.doc.on('mousemove', function(evt) {
				// console.log('mousemove');
				move(evt, {});
				scopeApply({});
			});
			eles.doc.on('touchmove', function(evt) {
				// console.log('touchmove');
				move(evt, {});
				scopeApply({});
			});
			
			/**
			@toc 3.
			@method init
			*/
			function init(params) {
				getEleCoords({});
			}
			
			/**
			@toc 4.
			@method start
			*/
			function start(evt, params) {
				var xx =evt.pageX;
				var yy =evt.pageY;
				// if(xx >=$scope.coordsTemp.ele.left && xx <=$scope.coordsTemp.ele.right && yy >=$scope.coordsTemp.ele.top && yy <=$scope.coordsTemp.ele.bottom) {
				if(xx >=($scope.coordsTemp.ele.left -buffer) && xx <= ($scope.coordsTemp.ele.right +buffer) && yy >= ($scope.coordsTemp.ele.top -buffer) && yy <= ($scope.coordsTemp.ele.bottom +buffer) ) {		//only start if within a certain distance of the element itself (i.e. don't reset if doing something else but DO want a little buffer to allow for selecting from an edge and getting it all)
				// if(1) {
					// console.log('starting');
					// console.log(evt);
					if(xx <$scope.coordsTemp.ele.left) {
						xx =$scope.coordsTemp.ele.left;
					}
					else if(xx >$scope.coordsTemp.ele.right) {
						xx =$scope.coordsTemp.ele.right;
					}
					if(yy <$scope.coordsTemp.ele.top) {
						yy =$scope.coordsTemp.ele.top;
					}
					else if(yy >$scope.coordsTemp.ele.bottom) {
						yy =$scope.coordsTemp.ele.bottom;
					}
					$scope.coordsTemp.start.x =xx;
					$scope.coordsTemp.start.y =yy;
					$scope.state.started =true;
				}
				$scope.state.ended =false;		//reset
			}
			
			/**
			@toc 5.
			@method end
			*/
			function end(evt, params) {
				move(evt, params);
				if($scope.state.started) {
					// console.log('ending');
					calculateSelectArea({});
					$scope.state.ended =true;
				}
				$scope.state.started =false;		//reset
			}
			
			/**
			@toc 6.
			@method move
			*/
			function move(evt, params) {
				if($scope.state.started) {
					// console.log('moving');
					// console.log(evt);
					var xx =evt.pageX;
					var yy =evt.pageY;
					
					//don't allow to be outside the element itself
					if(xx >$scope.coordsTemp.ele.right) {
						xx =$scope.coordsTemp.ele.right;
					}
					else if(xx <$scope.coordsTemp.ele.left) {
						xx =$scope.coordsTemp.ele.left;
					}
					if(yy >$scope.coordsTemp.ele.bottom) {
						yy =$scope.coordsTemp.ele.bottom;
					}
					else if(yy <$scope.coordsTemp.ele.top) {
						yy =$scope.coordsTemp.ele.top;
					}
					
					$scope.coordsTemp.end.x =xx;
					$scope.coordsTemp.end.y =yy;
					
					var selectTemp ={};
					
					//calculate the select area top, left, right, bottom (if end is less than start, reverse them)
					//end more left than start
					if($scope.coordsTemp.end.x <$scope.coordsTemp.start.x) {
						selectTemp.left =$scope.coordsTemp.end.x;
						selectTemp.right =$scope.coordsTemp.start.x;
					}
					else {		//start same or more left than end
						selectTemp.left =$scope.coordsTemp.start.x;
						selectTemp.right =$scope.coordsTemp.end.x;
					}
					//end higher than start
					if($scope.coordsTemp.end.y <$scope.coordsTemp.start.y) {
						selectTemp.top =$scope.coordsTemp.end.y;
						selectTemp.bottom =$scope.coordsTemp.start.y;
					}
					else {		//start same or higher than end
						selectTemp.top =$scope.coordsTemp.start.y;
						selectTemp.bottom =$scope.coordsTemp.end.y;
					}
					
					//if aspect ratio set, enforce proportions by making the part that is too large be smaller (i.e. always SHRINK, rather than grow). Shrink because this ensures don't run into issues where to make it fit the ratio, would have to go outside the element and thus would have to do handle these more complicated edge cases.
					if($attrs.aspectRatio >0) {
						var curWidth =selectTemp.right -selectTemp.left;
						var curHeight =selectTemp.bottom -selectTemp.top;
						var curRatio =curWidth / curHeight;
						//too wide, shrink width
						if(curRatio >$attrs.aspectRatio) {
							//end more left than start
							if($scope.coordsTemp.end.x <$scope.coordsTemp.start.x) {
								//were ending on the left, so alter the left
								selectTemp.left =selectTemp.right - (curHeight *$attrs.aspectRatio);
							}
							else {		//start same or more left than end
								//were ending on right, alter the right
								selectTemp.right =selectTemp.left + (curHeight *$attrs.aspectRatio);
							}
						}
						//too tall, shrink height
						else {
							//end higher than start
							if($scope.coordsTemp.end.y <$scope.coordsTemp.start.y) {
								//were ending on the top, so alter top
								selectTemp.top =selectTemp.bottom - (curWidth /$attrs.aspectRatio);
							}
							else {		//start same or higher than end
								//were ending on the bottom, so alter bottom
								selectTemp.bottom =selectTemp.top + (curWidth /$attrs.aspectRatio);
							}
						}
					}
					
					$scope.coordsTemp.select.top =selectTemp.top;
					$scope.coordsTemp.select.left =selectTemp.left;
					$scope.coordsTemp.select.bottom =selectTemp.bottom;
					$scope.coordsTemp.select.right =selectTemp.right;
				}
			}
			
			/**
			@toc 7.
			@method scopeApply
			*/
			function scopeApply(params) {
				if(!$scope.$$phase) {
					$scope.$apply();
				}
			}
			
			/**
			@toc 8.
			*/
			function calculateSelectArea(params) {
				$scope.coords.select ={
					left: ($scope.coordsTemp.select.left -$scope.offsets.ele.left),
					top: ($scope.coordsTemp.select.top -$scope.offsets.ele.top),
					right: ($scope.coordsTemp.select.right -$scope.offsets.ele.left),
					bottom: ($scope.coordsTemp.select.bottom -$scope.offsets.ele.top),
					height: ($scope.coordsTemp.select.bottom -$scope.coordsTemp.select.top),
					width: ($scope.coordsTemp.select.right -$scope.coordsTemp.select.left)
				};
			}
			
			/**
			@toc 9.
			@method getEleCoords
			*/
			function getEleCoords(params) {
				//need timeout for it to load properly
				$timeout(function() {
					var rect =eles.main[0].getBoundingClientRect();
					// console.log(rect);
					$scope.coordsTemp.ele ={
						left: rect.left,
						right: rect.right,
						top: rect.top,
						bottom: rect.bottom
					};
					
					$scope.offsets.ele ={
						top: rect.top,
						left: rect.left
					};
					
					//set select coords to have it all selected at first
					$scope.coordsTemp.select ={
						left: rect.left,
						right: rect.right,
						top: rect.top,
						bottom: rect.bottom
					};
					
					$scope.coords.ele ={
						left: 0,
						top: 0,
						right: (rect.right -rect.left),
						bottom: (rect.bottom -rect.top),
						height: (rect.bottom -rect.top),
						width: (rect.right -rect.left)
					};
				}, 100);
			}
			
			init({});
		}
	};
}]);