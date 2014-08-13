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
10. $scope.$on('jrgAreaSelectReInit',..
11. $scope.$on('jrgAreaSelectHide',..

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
	@param {Object} [opts]
		@param {String} [instId =[random string]] A way to uniquely identify this instance of the directive - used for using $scope.$on('jrgAreaSelectReInit',..

@param {Object} attrs REMEMBER: use snake-case when setting these on the partial! i.e. my-attr='1' NOT myAttr='1'
	@param {Number} [aspectRatio =0] 0 to NOT force an aspect ratio, otherwise width/height (so 1 for a square, 2 for twice as wide as tall and .5 for twice as tall as wide, etc.: use any number >0)
	@param {Number} [selectBuffer =50] Number of pixels OUTSIDE of element to allow starting selection
	@param {Number} [inline =0] Set to 1 to make the ng-transclude be an inline element (rather than a block element) so it won't take full width
	@param {Number} [inlineBlock =0] Set to 1 to make the ng-transclude be an inline-block element (rather than a block element) so it won't take full width

@dependencies
[none]

@usage
//EXAMPLE 1 - default
partial / html:
<div jrg-area-select coords='coords'>
	<!-- everything in here will be transcluded / stuffed in and used as the element to select inside of -->
	<div style='background-color:blue; height:300px; width:400px;'>&nbsp;</div>
</div>

controller / js:
$scope.coords ={};


//EXAMPLE 2 - aspect ratio (force square)
partial / html:
<div jrg-area-select coords='coords' aspect-ratio='1' select-buffer='15' inline='1' opts='opts'>
	<!-- everything in here will be transcluded / stuffed in and used as the element to select inside of -->
	<div style='background-color:red; height:350px; width:250px;'>&nbsp;</div>
</div>

controller / js:
$scope.coords ={};
$scope.opts ={
	instId: 'myInstId'
};

//re-init
$scope.$broadcast('jrgAreaSelectReInit', {instId:$scope.opts.instId});

//end: usage


//EXAMPLE 3 - image - note there's an HTML bug where there's an extra space below the image so 'vertical-align:top;' is needed on the image to remove this: http://stackoverflow.com/questions/5804256/why-an-image-inside-a-div-has-an-extra-space-below-the-image
partial / html:
<div jrg-area-select coords='coords' aspect-ratio='1' select-buffer='15' opts='opts'>
	<!-- everything in here will be transcluded / stuffed in and used as the element to select inside of -->
	<img ng-src='{{img.src}}' style='width:100%; height:100%; vertical-align:top;'/>
</div>

controller / js:
$scope.coords ={};
$scope.opts ={
	instId: 'myInstId'
};
$scope.img ={
	src: 'path/to/pic1.jpg'
};

//re-init
$scope.$broadcast('jrgAreaSelectReInit', {instId:$scope.opts.instId});

//end: usage
*/

'use strict';

angular.module('jackrabbitsgroup.angular-area-select', []).directive('jrgAreaSelect', ['$timeout', 
function ($timeout) {

	return {
		restrict: 'A',
		transclude: true,
		scope: {
			coords: '=',
			opts: '=?'
		},

		// replace: true,
		template: function(element, attrs) {
			var defaultsAttrs ={
				aspectRatio: 0,
				selectBuffer: 50,
				inline: 0,
				inlineBlock: 0
			};
			for(var xx in defaultsAttrs) {
				if(attrs[xx] ===undefined) {
					attrs[xx] =defaultsAttrs[xx];
				}
			}
			var toInt =['aspectRatio', 'selectBuffer', 'inline', 'inlineBlock'];
			var ii;
			for(ii =0; ii<toInt.length; ii++) {
				attrs[toInt[ii]] =parseInt(attrs[toInt[ii]], 10);
			}
			
			
			var html ="<div style='position:relative;'>";
				if(attrs.inline) {
					html+="<div class='jrg-area-select-ele' style='display:inline;' ng-transclude></div>";
				}
				else if(attrs.inlineBlock) {
					html+="<div class='jrg-area-select-ele' style='display:inline-block;' ng-transclude></div>";
				}
				else {
					html+="<div class='jrg-area-select-ele' ng-transclude></div>";
				}
				
				html+="<div ng-show='show.blurred'>"+
					"<div class='jrg-area-select-blurred' style='top:{{(coordsTemp.ele.top -offsets.ele.top)}}px; left:{{(coordsTemp.ele.left -offsets.ele.left)}}px; height:{{(coordsTemp.ele.bottom -coordsTemp.ele.top)}}px; width:{{(coordsTemp.select.left -coordsTemp.ele.left)}}px;'>&nbsp;</div>"+		//left side: from element left to select left; from element top to element bottom
					"<div class='jrg-area-select-blurred' style='top:{{(coordsTemp.ele.top -offsets.ele.top)}}px; left:{{(coordsTemp.select.right -offsets.ele.left)}}px; height:{{(coordsTemp.ele.bottom -coordsTemp.ele.top)}}px; width:{{(coordsTemp.ele.right -coordsTemp.select.right)}}px;'>&nbsp;</div>"+		//right side: from select right to element right; from element top to element bottom
					"<div class='jrg-area-select-blurred' style='top:{{(coordsTemp.ele.top -offsets.ele.top)}}px; left:{{(coordsTemp.select.left -offsets.ele.left)}}px; height:{{(coordsTemp.select.top -coordsTemp.ele.top)}}px; width:{{(coordsTemp.select.right -coordsTemp.select.left)}}px;'>&nbsp;</div>"+		//top side: from select left to select right; from element top to select top
					"<div class='jrg-area-select-blurred' style='top:{{(coordsTemp.select.bottom -offsets.ele.top)}}px; left:{{(coordsTemp.select.left -offsets.ele.left)}}px; height:{{(coordsTemp.ele.bottom -coordsTemp.select.bottom)}}px; width:{{(coordsTemp.select.right -coordsTemp.select.left)}}px;'>&nbsp;</div>"+		//bottom side: from select left to select right; from select bottom to element bottom
				"</div>"+
				
				//TESTING
				// "<div>coords: {{coords}}</div>"+
				// "<div>coordsTemp: {{coordsTemp}}</div>"+
				// "<div>offsets: {{offsets}}</div>"+
				//end: TESTING
			"</div>";
			return html;
		},
		
		link: function(scope, element, attrs) {
			if(scope.opts ===undefined) {
				scope.opts ={};
			}
			var defaultsOpts ={
				instId: "jrgjAreaSelect"+Math.random().toString(36).substring(7)
			};
			for(var xx in defaultsOpts) {
				if(scope.opts[xx] ===undefined) {
					scope.opts[xx] =defaultsOpts[xx];
				}
			}
		},
		
		controller: function($scope, $element, $attrs) {
			/**
			@toc 1.
			setup
			*/
			var eles ={
				main: $element.find('div').find('div'),
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
			@property $scope.show For use with ng-show/ng-hide
			@type Object
			*/
			$scope.show ={
				blurred: true
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
				$scope.show.blurred =true;
			}
			
			/**
			@toc 4.
			@method start
			*/
			function start(evt, params) {
				var xx =evt.pageX;
				var yy =evt.pageY;
				// if(xx >=$scope.coordsTemp.ele.left && xx <=$scope.coordsTemp.ele.right && yy >=$scope.coordsTemp.ele.top && yy <=$scope.coordsTemp.ele.bottom) {
				if(xx >=($scope.coordsTemp.ele.left -$attrs.selectBuffer) && xx <= ($scope.coordsTemp.ele.right +$attrs.selectBuffer) && yy >= ($scope.coordsTemp.ele.top -$attrs.selectBuffer) && yy <= ($scope.coordsTemp.ele.bottom +$attrs.selectBuffer) ) {		//only start if within a certain distance of the element itself (i.e. don't reset if doing something else but DO want a little buffer to allow for selecting from an edge and getting it all)
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
					var rect1 =eles.main[0].getBoundingClientRect();		//gives correct height & width sometimes negative/wrong left/top/right/bottom!
					var el =eles.main[0];
					var _x = 0;
					var _y = 0;
					while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
						// _x += el.offsetLeft - el.scrollLeft;
						// _y += el.offsetTop - el.scrollTop;
						//do NOT subtract scroll? creates issues on webkit/chrome if scrolled down
						_x += el.offsetLeft;
						_y += el.offsetTop;
						el = el.offsetParent;
					}
					
					var rect ={
						left: _x,
						right: (_x+rect1.width),
						top: _y,
						bottom: (_y+rect1.height)
					};
					
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
			
			/**
			@toc 10.
			@method $scope.$on('jrgAreaSelectReInit',..
			@param {Object} params
				@param {String} instId
			*/
			$scope.$on('jrgAreaSelectReInit', function(evt, params) {
				if(params.instId ==$scope.opts.instId) {
					init({});
				}
			});
			
			/**
			Hides / resets the blurred divs, etc. so you can't see any part of this directive other than the un-alterted transcluded content
			@toc 11.
			@method $scope.$on('jrgAreaSelectHide',..
			@param {Object} params
				@param {String} instId
			*/
			$scope.$on('jrgAreaSelectHide', function(evt, params) {
				if(params.instId ==$scope.opts.instId) {
					$scope.show.blurred =false;
				}
			});
			
			init({});
		}
	};
}]);