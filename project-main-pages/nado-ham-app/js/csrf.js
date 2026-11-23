// CSRF 보호(서버에서 켜 둠): 화면의 fetch 중 데이터를 바꾸는 요청(POST·PUT·DELETE 등)에 토큰 헤더를 붙인다.
// 토큰은 머리글 조각이 #csrf_token 의 data 속성으로 내려 주고, 요청 때마다 읽어 쓴다(페이지에서 fetch 를 직접 쓰는 코드는 고치지 않아도 된다).
(function () {
    const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS', 'TRACE'];
    const nativeFetch = window.fetch.bind(window);

    function isSameOrigin(url) {
        try {
            return new URL(url, window.location.href).origin === window.location.origin;
        } catch (e) {
            return false;
        }
    }

    window.fetch = function (input, init) {
        let options = init || {};
        let method = (options.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
        let url = input instanceof Request ? input.url : String(input);
        let holder = document.getElementById('csrf_token');

        // 같은 사이트로 가는 요청에만 붙인다(다른 사이트로 토큰이 새지 않게 한다)
        if (!SAFE_METHODS.includes(method) && holder && holder.dataset.token && isSameOrigin(url)) {
            let headers = new Headers(options.headers || (input instanceof Request ? input.headers : undefined));
            headers.set(holder.dataset.header || 'X-CSRF-TOKEN', holder.dataset.token);
            options = Object.assign({}, options, {headers: headers});
        }

        return nativeFetch(input, options);
    };

    // 로그아웃은 POST 로만 받으므로 링크를 누르면 숨은 폼을 보낸다
    document.addEventListener('click', function (event) {
        let link = event.target.closest ? event.target.closest('a.signout_link') : null;
        if (!link) {
            return;
        }

        event.preventDefault();
        let form = document.getElementById('signout_form');
        if (form) {
            form.submit();
        }
    });
})();
