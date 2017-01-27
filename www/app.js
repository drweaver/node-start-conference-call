/* global PubNub angular */

var app = angular.module('StartConferenceCallApp');

app.controller('MainController', function($scope, $http, $timeout, $window, subscribeKey, publishKey) {

    var autoStartCountdownStart = 5;
    
    $scope.pubnubStatus = 'connecting...';
    $scope.meetings = [];
    $scope.autoStart = false;
    $scope.autoStartCountdown = autoStartCountdownStart;
    $scope.autoStartChoice = -1;
    $scope.autoStartFrameUrl = "";
    

    var pubnub = new PubNub({
        subscribeKey : subscribeKey,
        publishKey: publishKey
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
            $scope.loadMeetings();
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
    
    $scope.loadMeetings = function() {
        $scope.autoStartCountdown = autoStartCountdownStart;
        $scope.autoStartChoice = -1;
        $scope.autoStartFrameUrl = "";
      $http.get('/activemeetings').success(function(data) {
          $scope.meetings = data;
          console.log("Received meeting data: ");
          console.log(data);
          console.log($scope.autoStart);
          
          if( $scope.autoStart && $scope.meetings.length != 0 
              && $scope.meetings[0].urls.length != 0 
              && ($scope.meetings.length == 1 || $scope.meetings[0].startTime != $scope.meetings[1].startTime) ) {
            $scope.autoStartChoice = 0;
            autoStartAction();
          }
      });
    };

});
