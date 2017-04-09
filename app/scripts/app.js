'use strict';

angular.module('datavizApp', ['ui.router', 'ngResource'])
.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider

      //route for index page
      .state('app', {
        url: '/',
        views: {
          'header': {
              templateUrl : 'app/views/header.html',
          },
          'content': {
              templateUrl : 'app/views/home.html',
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
                  templateUrl : 'app/views/co2emission.html',
                  controller  : 'CO2Controller'
              }
          }
      })

      //route for combined visualization
      .state('app.combined', {
          url:'combined',
          views: {
              'content@': {
                  templateUrl : 'app/views/combined.html',
                  controller  : 'CombinedController'
              }
          }
      })

      //route for disaster visualization
      .state('app.disaster', {
          url:'disaster',
          views: {
              'content@': {
                  templateUrl : 'app/views/disaster.html',
                  controller  : 'DisasterController'
              }
          }
      })

      //route for ice extent visualization
      .state('app.ice', {
          url:'ice',
          views: {
              'content@': {
                  templateUrl : 'app/views/iceextent.html',
                  controller  : 'IceController'
              }
          }
      })

      //route for temperature visualization
      .state('app.temperature', {
          url:'temperature',
          views: {
              'content@': {
                  templateUrl : 'app/views/temperature.html',
                  controller  : 'TemperatureController'
              }
          }
      })

      //route for About page
      .state('app.about', {
          url:'about',
          views: {
              'content@': {
                  templateUrl : 'app/views/about.html',
                  controller  : 'AboutController'
              }
          }
      });

      $urlRouterProvider.otherwise('/');
})
;
