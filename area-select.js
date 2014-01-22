/**
@todo
- do returning (emit events or just have them pass in the coords scope variable?
- do final calculations (i.e. use ele top left as relative 0? and/or do percents from this relative 0?)
- add move handle function (for display - rectangle (& calculations?))
- document (methods, functions, toc)

@toc

@param {Object} scope (attrs that must be defined on the scope (i.e. in the controller) - they can't just be defined in the partial html). REMEMBER: use snake-case when setting these on the partial!
	@param {Object} coords Object to pass in (can be empty) that will be stuffed with the values, specifically:
		@param {Object} ele The coordinates of the element itself
			@param {Number} left
			@param {Number} right
			@param {Number} top
			@param {Number} bottom
		@param {Object} select The coordinates of the selected area
			@param {Number} left
			@param {Number} right
			@param {Number} top
			@param {Number} bottom

@param {Object} attrs REMEMBER: use snake-case when setting these on the partial! i.e. my-attr='1' NOT myAttr='1'
[none]

@dependencies
[none]

@usage
partial / html:
<div jrg-area-select coords='coords'>
	<!-- everything in here will be transcluded / stuffed in and used as the element to select inside of -->
	<div style='background-color:blue; height:100px; width:100px; margin-left:50px; margin-top:20px;'>&nbsp;</div>
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
			};
			for(var xx in defaultsAttrs) {
				if(attrs[xx] ===undefined) {
					attrs[xx] =defaultsAttrs[xx];
				}
			}
			
			var html ="<div style='position:relative;'>"+
				"<span class='jrg-area-select-ele' ng-transclude></span>"+
				"<div class='jrg-area-select-blurred' style='top:{{(coords.ele.top -offsets.ele.top)}}px; left:{{(coords.ele.left -offsets.ele.left)}}px; height:{{(coords.ele.bottom -coords.ele.top)}}px; width:{{(coords.select.left -coords.ele.left)}}px;'>&nbsp;</div>"+		//left side: from element left to select left; from element top to element bottom
				"<div class='jrg-area-select-blurred' style='top:{{(coords.ele.top -offsets.ele.top)}}px; left:{{(coords.select.right -offsets.ele.left)}}px; height:{{(coords.ele.bottom -coords.ele.top)}}px; width:{{(coords.ele.right -coords.select.right)}}px;'>&nbsp;</div>"+		//right side: from select right to element right; from element top to element bottom
				//TESTING
				"<div>coords: {{coords}}</div>"+
				"<div>coordsTemp: {{coordsTemp}}</div>"+
				"<div>offsets: {{offsets}}</div>"+
				//end: TESTING
			"</div>";
			return html;
		},
		
		link: function(scope, element, attrs) {
		},
		
		controller: function($scope, $element, $attrs) {
			var eles ={
				main: $element.find('span'),
				doc: angular.element(document)
			};
			
			$scope.offsets ={
				ele: {
					top: 0,
					left: 0
				}
			};
			
			$scope.state ={
				started: false,
				ended: false
			};
			
			$scope.coordsTemp ={
				start: {
					x: 0,
					y: 0
				},
				end: {
					x: 0,
					y: 0
				}
			};
			
			$scope.coords ={
				ele: {
					left: 0,
					right: 0,
					top: 0,
					bottom: 0
				},
				select: {
					left: 0,
					right: 0,
					top: 0,
					bottom: 0
				}
			};
			
			//start
			eles.doc.on('mousedown', function(evt) {
				console.log('mousedown');
				start(evt, {});
				scopeApply({});
			});
			eles.doc.on('touchstart', function(evt) {
				console.log('touchstart');
				start(evt, {});
				scopeApply({});
			});
			
			//end - NOTE: need to add this listener on the ENTIRE PAGE since they could end OUTSIDE our element
			// eles.main.on('mouseup', function(evt) {
			eles.doc.on('mouseup', function(evt) {
				console.log('mouseup');
				end(evt, {});
				scopeApply({});
			});
			// eles.main.on('touchend', function(evt) {
			eles.doc.on('touchend', function(evt) {
				console.log('touchend');
				end(evt, {});
				scopeApply({});
			});
			
			//move
			eles.doc.on('mousemove', function(evt) {
				console.log('mousemove');
				move(evt, {});
				scopeApply({});
			});
			eles.doc.on('touchmove', function(evt) {
				console.log('touchmove');
				move(evt, {});
				scopeApply({});
			});
			
			function init(params) {
				getEleCoords({});
			}
			
			function start(evt, params) {
				var xx =evt.pageX;
				var yy =evt.pageY;
				// if(xx >=$scope.coords.ele.left && xx <=$scope.coords.ele.right && yy >=$scope.coords.ele.top && yy <=$scope.coords.ele.bottom) {
				if(1) {
					console.log('starting');
					// console.log(evt);
					if(xx <$scope.coords.ele.left) {
						xx =$scope.coords.ele.left;
					}
					else if(xx >$scope.coords.ele.right) {
						xx =$scope.coords.ele.right;
					}
					if(yy <$scope.coords.ele.top) {
						yy =$scope.coords.ele.top;
					}
					else if(yy >$scope.coords.ele.bottom) {
						yy =$scope.coords.ele.bottom;
					}
					$scope.coordsTemp.start.x =xx;
					$scope.coordsTemp.start.y =yy;
					$scope.state.started =true;
				}
				$scope.state.ended =false;		//reset
			}
			
			function end(evt, params) {
				move(evt, params);
				if($scope.state.started) {
					console.log('ending');
					$scope.state.ended =true;
				}
				$scope.state.started =false;		//reset
			}
			
			function move(evt, params) {
				if($scope.state.started) {
					console.log('moving');
					// console.log(evt);
					var xx =evt.pageX;
					var yy =evt.pageY;
					
					//don't allow to be outside the element itself
					if(xx >$scope.coords.ele.right) {
						xx =$scope.coords.ele.right;
					}
					else if(xx <$scope.coords.ele.left) {
						xx =$scope.coords.ele.left;
					}
					if(yy >$scope.coords.ele.bottom) {
						yy =$scope.coords.ele.bottom;
					}
					else if(yy <$scope.coords.ele.top) {
						yy =$scope.coords.ele.top;
					}
					
					$scope.coordsTemp.end.x =xx;
					$scope.coordsTemp.end.y =yy;
					
					//calculate the select area top, left, right, bottom (if end is less than start, reverse them)
					//end more left than start
					if($scope.coordsTemp.end.x <$scope.coordsTemp.start.x) {
						$scope.coords.select.left =$scope.coordsTemp.end.x;
						$scope.coords.select.right =$scope.coordsTemp.start.x;
					}
					else {		//start same or more left than end
						$scope.coords.select.left =$scope.coordsTemp.start.x;
						$scope.coords.select.right =$scope.coordsTemp.end.x;
					}
					//end higher than start
					if($scope.coordsTemp.end.y <$scope.coordsTemp.start.y) {
						$scope.coords.select.top =$scope.coordsTemp.end.y;
						$scope.coords.select.bottom =$scope.coordsTemp.start.y;
					}
					else {		//start same or higher than end
						$scope.coords.select.top =$scope.coordsTemp.start.y;
						$scope.coords.select.bottom =$scope.coordsTemp.end.y;
					}
				}
			}
			
			function scopeApply(params) {
				if(!$scope.$$phase) {
					$scope.$apply();
				}
			}
			
			function calculateSelectArea(params) {
			}
			
			function getEleCoords(params) {
				//need timeout for it to load properly
				$timeout(function() {
					var rect =eles.main[0].getBoundingClientRect();
					// console.log(rect);
					$scope.coords.ele ={
						left: rect.left,
						right: rect.right,
						top: rect.top,
						bottom: rect.bottom
					};
					
					$scope.offsets.ele ={
						top: rect.top,
						left: rect.left
					};
				}, 100);
			}
			
			init({});
		}
	};
}]);