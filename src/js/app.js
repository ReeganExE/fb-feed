(function() {
    var qualities = ['flac', 'm4a', '320', '128'];

    angular.module('csn-downloader', ['ui.router']).controller('MainController', ['csnService', MainController]);

    function MainController(csnService) {
        var vm = this;
        vm.modern = true;
        vm.quality = '320';
        vm.inProgress = false;
        vm.link = location.search.substr(6) || 'http://chiasenhac.com/nghe-album/phut-cuoi~che-linh-thanh-tuyen~1042559.html';
        vm.filePerTime = 1;

        vm.extractLink = function(e) {
            e.preventDefault();
            vm.inProgress = true;
            csnService.extractAlbum(vm.link).then(function(links) {
                console.log(links);
                vm.links = links;
                vm.inProgress = false;
            }, error => {
                console.log(error);
            });
        };

        vm.linkForQuality = function(song, quality) {
            quality = vm.quality;
            if (song[quality]) {
                song.q = quality;
                return song[quality];
            }

            let index = qualities.indexOf(quality);
            if (index != -1) {
                for (let i = index, q; i < qualities.length; i++) {
                    q = qualities[i];
                    if (song[q]) {
                        song.q = q;
                        return song[q];
                    }
                }
            }
        };

        vm.handleDownload = function(song, index, auto) {
            let link = song[song.q],
                state = song.download || (song.download = {});
            if (state.inProgress && !auto) {
                state.stop();
                return;
            }
            state.inProgress = true;

            let downloader = csnService.download(link);
            state.stop = downloader.stop;
            downloader.promise.then(function downloaded(blob) {
                    state.inProgress = false;
                    downloader.userDownload(decodeURIComponent(link.substr(link.lastIndexOf('/') + 1)), blob);
                    let next = vm.links[index + 1];
                    next && vm.handleDownload(next, index + 1, true);
                },
                function onFailed() {
                    state.inProgress = false;
                },
                function onDownloadProgress(progress) {
                    state.progress = Math.round(progress * 100);
                });
        };

        vm.hasSong = function() {
            return vm.links && vm.links.length
        };

        vm.queue = function() {
            let filePerTime = vm.filePerTime;
            vm.queueStarted = !vm.queueStarted;
            vm.links.slice(0, filePerTime).forEach(link => {
                vm.handleDownload(link);
            });
        }
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
