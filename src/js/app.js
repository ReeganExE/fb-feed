(function() {
    var qualities = ['flac', 'm4a', '320', '128'];
    var log = _.ary(console.log, 1);

    angular.module('csn-downloader', ['ui.router']).controller('MainController', ['csnService', '$q', MainController]);

    function MainController(csnService, $q) {
        var vm = this;
        vm.posts = [];

        vm.hihi = 'n\u{1EEF}|gh\u{00E9}p|q7|q8|b\u{00EC}nh th\u{1EA1}nh|th\u{1EE7} \u{0111}\u{1EE9}c|q9';

        vm.link = 'https://graph.facebook.com/129415447250418/feed?limit=10&access_token=';

        // vm.token = 'EAAQZCw2ZA3yU0BAFZAQTsMFoxdONjoOFO3ArP2aPzw75ZCVL0udZC7fQL3FJYe5Yg301qwzmNTsvcgX6X3cjk3lzJ1qNvuZBwaDIvWWWYrk5o2Kpm9BvZBCjK1XUAvw99xOpDLAjTMvAVGg5ZBqVRtkkXyZCnQlPuiqEZD&expires=5184000';

        vm.extract = function($event) {
            $event && $event.preventDefault();
            vm.get('https://graph.facebook.com/129415447250418/feed?limit=10&access_token=' + vm.token);
        };

        vm.get = function(link) {
            $q.resolve($.getJSON(link)).then(j => {
                j.data.forEach(d => {
                    let [group, id] = d.id.split('_');
                    d.created = d.created_time;
                    d.created_time = moment(d.created_time).fromNow();
                    d.plink =  d.link || (`https://www.facebook.com/groups/${group}/permalink/${id}`);
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
        }])

        .filter('highlight', function($sce) {
          return function(text, phrase) {
            if (phrase && text) text = text.replace(new RegExp('('+phrase+')', 'gi'),
              '<span class="highlighted">$1</span>')
            return $sce.trustAsHtml(text)
          }
        });
})();
