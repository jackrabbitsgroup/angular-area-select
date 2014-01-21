/**
@todo
- do final calculations (i.e. use ele top left as relative 0? and/or do percents from this relative 0?)
- do returning (emit events or just have them pass in the coords scope variable?
- add move handle function (for display - rectangle (& calculations?))
- document (methods, functions, toc)

@toc

@param {Object} scope (attrs that must be defined on the scope (i.e. in the controller) - they can't just be defined in the partial html). REMEMBER: use snake-case when setting these on the partial!
TODO

@param {Object} attrs REMEMBER: use snake-case when setting these on the partial! i.e. my-attr='1' NOT myAttr='1'
TODO

@dependencies
TODO

@usage
partial / html:
TODO

controller / js:
TODO

//end: usage
*/

'use strict';

angular.module('jackrabbitsgroup.angular-area-select', []).directive('jrgAreaSelect', ['$timeout', 
function ($timeout) {

	return {
		restrict: 'A',
		transclude: true,
		scope: {
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
			
			var html ="<div>"+
				"<span ng-transclude></span>"+
				"<div>"+
					"{{coords}}"+
				"</div>"+
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
			
			$scope.state ={
				started: false,
				ended: false
			};
			
			$scope.coords ={
				ele: {
					x1: 0,
					x2: 0,
					y1: 0,
					y2: 0
				},
				select: {
					x1: 0,
					x2: 0,
					y1: 0,
					y2: 0
				},
				start: {
					x: 0,
					y: 0
				},
				end: {
					x: 0,
					y: 0
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
				scopeApply({});
			});
			eles.doc.on('touchmove', function(evt) {
				console.log('touchmove');
				scopeApply({});
			});
			
			function init(params) {
				getEleCoords({});
			}
			
			function start(evt, params) {
				var xx =evt.pageX;
				var yy =evt.pageY;
				// if(xx >=$scope.coords.ele.x1 && xx <=$scope.coords.ele.x2 && yy >=$scope.coords.ele.y1 && yy <=$scope.coords.ele.y2) {
				if(1) {
					console.log('starting');
					// console.log(evt);
					if(xx <$scope.coords.ele.x1) {
						xx =$scope.coords.ele.x1;
					}
					else if(xx >$scope.coords.ele.x2) {
						xx =$scope.coords.ele.x2;
					}
					if(yy <$scope.coords.ele.y1) {
						yy =$scope.coords.ele.y1;
					}
					else if(yy >$scope.coords.ele.y2) {
						yy =$scope.coords.ele.y2;
					}
					$scope.coords.start.x =xx;
					$scope.coords.start.y =yy;
					$scope.state.started =true;
				}
				$scope.state.ended =false;		//reset
			}
			
			function end(evt, params) {
				if($scope.state.started) {
					console.log('ending');
					// console.log(evt);
					var xx =evt.pageX;
					if(xx >$scope.coords.ele.x2) {
						xx =$scope.coords.ele.x2;
					}
					else if(xx <$scope.coords.ele.x1) {
						xx =$scope.coords.ele.x1;
					}
					var yy =evt.pageY;
					if(yy >$scope.coords.ele.y2) {
						yy =$scope.coords.ele.y2;
					}
					else if(yy <$scope.coords.ele.y1) {
						yy =$scope.coords.ele.y1;
					}
					
					$scope.coords.end.x =xx;
					$scope.coords.end.y =yy;
					$scope.state.ended =true;
				}
				$scope.state.started =false;		//reset
			}
			
			function scopeApply(params) {
				if(!$scope.$$phase) {
					$scope.$apply();
				}
			}
			
			function getEleCoords(params) {
				//need timeout for it to load properly
				$timeout(function() {
					var rect =eles.main[0].getBoundingClientRect();
					// console.log(rect);
					$scope.coords.ele ={
						x1: rect.left,
						x2: rect.right,
						y1: rect.top,
						y2: rect.bottom
					};
				}, 100);
			}
			
			init({});
		}
	};
}]);