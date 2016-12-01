(function() {
    $.fn.reduce = Array.prototype.reduce;
    $.fn.nmap = Array.prototype.map;
    var $http, $q;

    angular.module('csn-downloader').filter('toLink', function() {
        return function(input) {
            let output = [];
            input && angular.forEach(input, s => output.push(s[s.q]));
            return output.join('\n');
        }
    });


    angular.module('csn-downloader').factory('csnService', ['$q', '$http', csnService]);

    function csnService($qq, $h) {
        $q = $qq;
        $http = $h;

        let svr = {
            extractAlbum: extractAlbum,
            userDownload: userDownload,
            download: download
        };
        return svr;
    }

    function extractAlbum(href) {
        return $http.get(href).then(doc => $(noImage(doc.data)).find('#playlist')).then(playlist => {
            if (playlist.length) {
                let links = playlist.find('[href*="_download"]').nmap(x => x.href);

                let directLinks = links.map(function startDownload (link) {
                    return $http.get(link, {
                        headers: {
                            'Referer': 'http://chiasenhac.vn',
                            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
                        }
                    }).then(filterLink)
                });

                return $q.all(directLinks);
            }
            return $q.reject();
        });
    }


    function filterLink (doc) {
        // let $doc = $(noImage(doc.data));
        // let title = $doc.find('.viewtitle').text();
        // let $links = $doc.find('#downloadlink a');

        let title = 'aaa';
        var reg = /href="(http:\/\/.+downloads[^"]+)"/g;
        var reg2 = /http[^"]+/;
        let $links =doc.data.match(reg);
        let abc = $links.map(link => link.match(reg2)[0]).reduce(function (obj, link) {
            let href = link;
            if (href) {
                let q = href.match(/downloads\/.*\/.*\/(.*)\//);
                if (q) obj[q[1]] = href;
            }
            return obj;
        }, { title: title })

        return abc;
    }

    function userDownload(filename, blob) {
        var element = document.createElement('a');
        element.style.display = 'none';
        document.body.appendChild(element);
        var url = window.URL.createObjectURL(blob);
        element.href = url;
        element.download = filename;
        element.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(element);
    }

    function noImage(doc) {
        return doc.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi, function(match, capture) {
            return "<img no_load_src=\"" + capture + "\" />";
        });
    }


    function download(link) {
        let defer = $q.defer();
        // $.ajax({
        //     xhr: function() {
        //         var xhr = new window.XMLHttpRequest();
        //         // xhr.responseType = 'blob';
        //         //Download progress
        //         xhr.addEventListener("progress", function(evt) {
        //             if (evt.lengthComputable) {
        //                 var percentComplete = evt.loaded / evt.total;
        //                 //Do something with download progress
        //                 // console.log(percentComplete);
        //                 defer.notify(percentComplete);
        //             }
        //         }, false);
        //         return xhr;
        //     },
        //     type: 'GET',
        //     url: link,
        //     xhrFields: {responseType:'arraybuffer'}
        // }).then(d => defer.resolve(d), err => defer.reject(err));

        var xhr = new window.XMLHttpRequest();
        //Download progress
        xhr.addEventListener("progress", function(evt) {
            if (evt.lengthComputable) {
                var percentComplete = evt.loaded / evt.total;
                defer.notify(percentComplete);
            }
        }, false);
        xhr.addEventListener("abort", () => defer.reject(), false);
        xhr.addEventListener("error", () => defer.reject(), false);
        xhr.onreadystatechange = function(){
            if (this.readyState == 4 && this.status == 200){
                defer.resolve(this.response);
            }
        }
        xhr.open('GET', link);
        xhr.responseType = 'blob';
        xhr.send();

        return {
            stop: () => xhr.abort(),
            promise: defer.promise
        };
    }
})();