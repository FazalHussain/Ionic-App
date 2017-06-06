// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    setTimeout(function() {
      navigator.splashscreen.hide();
    }, 1000);
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state ('splash',{
    url: "/splash",
    abstract: false,
    templateUrl: "templates/splash.html",
    controller: 'LoadCtrl'
  })

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html",
    controller: 'AppCtrl'
  })

  .state('app.details', {
    url: "/details",
    views: {
      'menuContent': {
        templateUrl: "templates/details.html",
        controller: 'DetailsCtrl'
      }
    }
  })
  .state('app.newdetails', {
    url: "/newdetails",
    views: {
      'menuContent': {
        templateUrl: "templates/newdetails.html",
        controller: 'NewdetailsCtrl'
      }
    }
  })
  .state('app.newrespondent', {
    url: "/newrespondent",
    views: {
      'menuContent': {
        templateUrl: "templates/newrespondent.html",
        controller: 'NewrespondentCtrl'
      }
    }
  })
  .state('app.thankyou', {
    url: "/thankyou",
    views: {
      'menuContent': {
        templateUrl: "templates/thankyou.html",
        controller: 'ThankyouCtrl'
      }
    }
  })
  .state('app.about', {
    url: "/about",
    views: {
      'menuContent': {
         templateUrl: "templates/about.html"
       }
    }
  })

  .state('app.terms', {
     url: "/terms",
     views: {
       'menuContent': {
         templateUrl: "templates/terms.html"
       }
     }
  })

  .state('app.sync', {
    url: "/sync",
    views: {
      'menuContent': {
        templateUrl: "templates/sync.html",
          controller: 'SyncCtrl'
      }
    }
  })
    .state('app.survey', {
      url: "/survey",
      views: {
        'menuContent': {
          templateUrl: "templates/survey.html",
          controller: 'SurveyCtrl'
        }
      }
    })

  .state('app.single', {
    url: "/survey/:chapterId",
    views: {
      'menuContent': {
        templateUrl: "templates/chapter.html",
        controller: 'ChapterCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/splash');
});
