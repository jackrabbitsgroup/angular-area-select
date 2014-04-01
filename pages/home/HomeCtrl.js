/**
*/

'use strict';

angular.module('myApp').controller('HomeCtrl', ['$scope', function($scope) {
	$scope.coords ={};
	
	$scope.coords2 ={};
	$scope.opts2 ={
		instId: 'my-inst'
	};
	
	$scope.reInit =function() {
		$scope.$broadcast('jrgAreaSelectReInit', {instId:$scope.opts2.instId});
	};
	
	$scope.changeInstId	=function() {
		$scope.opts2.instId ='my-new-inst'+Math.random().toString(36).substring(7);
	};
}]);