(function() {
    var qualities = ['flac', 'm4a', '320', '128'];
    var log = _.ary(console.log, 1);

    angular.module('csn-downloader', ['ui.router']).controller('MainController', ['csnService', '$q', MainController]);

    function MainController(csnService, $q) {
        var vm = this;
        vm.posts = [];

        vm.link = 'https://graph.facebook.com/129415447250418/feed?limit=10&access_token=';

        vm.extract = function($event) {
            $event && $event.preventDefault();
            vm.get('https://graph.facebook.com/129415447250418/feed?limit=10&access_token=' + vm.token);
        };

        vm.get = function(link) {
            $q.resolve($.getJSON(link)).then(j => {
                j.data.forEach(d => {
                    d.created = d.created_time;
                    d.created_time = moment(d.created_time).fromNow();
                    d.plink =  d.link || ('https://www.facebook.com/groups/PhongTroTpHCM/permalink/' + d.id);
                });
               vm.posts.push(...j.data);
               vm.nextPage = j.paging.next;
            })
            .catch(log);
        };

        vm.next = function() {
            vm.get(vm.nextPage);
        };
    }

    angular.module('csn-downloader').config(['$stateProvider', '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise("/");
            // Now set up the states
            $stateProvider
                .state('about', {
                    url: "/about",
                    templateUrl: 'about.html'
                })
                .state('help', {
                    url: "/help",
                    templateUrl: 'help.html'
                })
                .state('main', {
                    url: "/",
                    templateUrl: "body.html",
                    controller: 'MainController',
                    controllerAs: 'main'
                });
        }]);
})();
