/* global PubNub angular */

var app = angular.module('StartConferenceCallApp');

app.controller('MainController', function($scope, $http, $timeout, $interval, $window, subscribeKey, publishKey, uuid) {

    var autoStartCountdownStart = 5;
	var lastMessageTime = 0;
    
    $scope.pubnubStatus = 'connecting...';
    $scope.meetings = [];
    $scope.autoStart = false;
    $scope.autoStartCountdown = autoStartCountdownStart;
    $scope.autoStartChoice = -1;
    $scope.autoStartFrameUrl = "";
    $scope.loading = false;
    $scope.loadingFailed = false;
	$scope.serviceStatus = 'connecting...';
	
	var checkService = function() {
		$http.get('/status?_='+new Date().getTime()).then(
			function success(res) {
				$scope.serviceStatus = 'connected';
			},
			function error(res) {
				$scope.serviceStatus = 'unable to connect, try restarting'
			}
		);
	};
	
	checkService();
	$interval( checkService, 10000 ); 
    

    var pubnub = new PubNub({
        subscribeKey : subscribeKey,
        publishKey: publishKey,
        uuid: uuid
    });
       
    pubnub.addListener({
        status: function(statusEvent) {
            console.log("Got status: " + statusEvent.category);
            if (statusEvent.category === "PNConnectedCategory") {
                $scope.pubnubStatus = "connected";
            } else
            if (statusEvent.category === "PNNetworkUpCategory") {
                $scope.pubnubStatus = "network up...";
            } else
            if (statusEvent.category === "PNNetworkDownCategory") {
                $scope.pubnubStatus = "network down...";
            } else
            if (statusEvent.category === "PNNetworkIssuesCategory") {
                $scope.pubnubStatus = "network issue...";
            } else
            if (statusEvent.category === "PNReconnectedCategory") {
                $scope.pubnubStatus = "reconnected";
            } else
            if (statusEvent.category === "PNTimeoutCategory") {
                $scope.pubnubStatus = "timeout...";
            } else {
                $scope.pubnubStatus = statusEvent.category;
            }
            $scope.$apply();
        },
        message: function(message) {
            console.log("New Message!!", message);
            if( message.message == 'startconferencecall' && message.timetoken > lastMessageTime) {
				lastMessageTime = message.timetoken;
				$scope.loadMeetings();
			}
        }

    });    
    console.log("Subscribing..");
    pubnub.subscribe({
        channels: ['startconferencecall'] 
    });
    
    $scope.cancelAutoStartAction = function() {
        $scope.autoStartChoice = -1;  
    };
    
    var autoStartAction = function() {
        
        if( !$scope.autoStart )
            return;
        
        if( $scope.autoStartChoice == -1 )
            return;
        
        $scope.autoStartCountdown -= 1;
        console.log($scope.autoStartCountdown);
        if( $scope.autoStartCountdown == 0 ) {
            console.log("Starting conference call");
            
            $window.open($scope.meetings[$scope.autoStartChoice].urls[0].url, '_blank');
            // $scope.autoStartFrameUrl = $scope.meetings[$scope.autoStartChoice].urls[0].url;
            // do something here.
            $scope.autoStartChoice = -1;
        } else if( $scope.autoStartCountdown > 0 ) {
            $timeout(autoStartAction, 1000);
        }
    };
    
    $scope.autoStartClicked = function() {
      if( $scope.autoStart == false ) {
          $scope.autoStartChoice = -1;
      }  
    };
    
    $scope.loadMeetings = function() {
        $scope.autoStartCountdown = autoStartCountdownStart;
        $scope.autoStartChoice = -1;
        $scope.autoStartFrameUrl = "";
        $scope.loading = true;
        $scope.loadingFailed = false;
        $scope.meetings = [];
        $http.get('/activemeetings?_='+new Date().getTime()).then(function(response) {
          $scope.loading = false;
          $scope.loadingFailed = false;
          $scope.meetings = response.data;
          console.log("Received meeting data: ");
          console.log(response.data);
          console.log($scope.autoStart);
          
          if( $scope.autoStart && $scope.meetings.length != 0 
              && $scope.meetings[0].urls.length != 0 
              && ($scope.meetings.length == 1 || $scope.meetings[0].startTime != $scope.meetings[1].startTime) ) {
            $scope.autoStartChoice = 0;
            autoStartAction();
          }
        }, function() {
            $scope.loading = false;
            $scope.loadingFailed = true;
        });
    };

});
