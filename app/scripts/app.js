'use strict';

angular.module('datavizApp', ['ui.router', 'ngResource'])
.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider

      //route for index page
      .state('app', {
        url: '/',
        views: {
          'header': {
              templateUrl : 'views/header.html',
          },
          'content': {
              templateUrl : 'views/home.html',
              controller  : 'IndexController'
          }
          // ,
          // 'footer': {
          //     templateUrl : 'views/footer.html',
          // }
        }
      })

      //route for co2 emission visualization
      .state('app.co2', {
          url:'co2',
          views: {
              'content@': {
                  templateUrl : 'views/co2emission.html',
                  controller  : 'CO2Controller'
              }
          }
      })

      //route for combined visualization
      .state('app.combined', {
          url:'combined',
          views: {
              'content@': {
                  templateUrl : 'views/combined.html',
                  controller  : 'CombinedController'
              }
          }
      })

      //route for disaster visualization
      .state('app.disaster', {
          url:'disaster',
          views: {
              'content@': {
                  templateUrl : 'views/disaster.html',
                  controller  : 'DisasterController'
              }
          }
      })

      //route for ice extent visualization
      .state('app.ice', {
          url:'ice',
          views: {
              'content@': {
                  templateUrl : 'views/iceextent.html',
                  controller  : 'IceController'
              }
          }
      })

      //route for temperature visualization
      .state('app.temperature', {
          url:'temperature',
          views: {
              'content@': {
                  templateUrl : 'views/temperature.html',
                  controller  : 'TemperatureController'
              }
          }
      })

      //route for About page
      .state('app.about', {
          url:'about',
          views: {
              'content@': {
                  templateUrl : 'views/about.html',
                  controller  : 'AboutController'
              }
          }
      });

      $urlRouterProvider.otherwise('/');
})
;
