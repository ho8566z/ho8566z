// 카드를 누르면 화면이 커지며 사라진 뒤 해당 페이지로 넘어가는 전환 효과
(function () {
	'use strict';
	var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	// 뒤로가기(bfcache)로 돌아왔을 때 사라진 상태가 남지 않게 한다.
	window.addEventListener('pageshow', function () {
		document.body.classList.remove('is-leaving');
		document.querySelectorAll('.is-opening').forEach(function (el) { el.classList.remove('is-opening'); });
	});

	document.addEventListener('click', function (e) {
		var a = e.target.closest ? e.target.closest('a[data-transition]') : null;
		if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank' || reduce) {
			return;
		}
		e.preventDefault();
		var href = a.href;
		a.classList.add('is-opening');
		document.body.classList.add('is-leaving');
		window.setTimeout(function () { window.location.href = href; }, 340);
	});
})();

// 모바일 하단 탭 바: 현재 주소에 맞는 탭을 강조한다.
(function () {
	'use strict';
	var path = window.location.pathname;
	document.querySelectorAll('.tabbar a[data-tab]').forEach(function (a) {
		var base = a.getAttribute('data-tab');
		var on = a.hasAttribute('data-tab-exact') ? path === base : (path === base || path.indexOf(base + '/') === 0);
		if (on) {
			a.classList.add('is-active');
			a.setAttribute('aria-current', 'page');
		}
	});
	// 로그인·가입 화면은 '내 정보' 탭에 속한다.
	if (path === '/login' || path === '/signup') {
		var acc = document.querySelector('.tabbar a[data-tab="/account"]');
		if (acc) { acc.classList.add('is-active'); acc.setAttribute('aria-current', 'page'); }
	}
})();

// 푸터의 '휴대폰으로 보기': 펼칠 때 현재 화면 주소로 QR 이미지를 불러온다.
(function () {
	'use strict';
	var box = document.querySelector('details.mobile-qr');
	var img = box ? box.querySelector('img[data-qr-self]') : null;
	if (!box || !img) { return; }
	box.addEventListener('toggle', function () {
		if (box.open && !img.getAttribute('src')) {
			img.setAttribute('src', '/qr?target=' + encodeURIComponent(window.location.pathname + window.location.search));
		}
	});
})();

// 화면에 나오는 마스코트 이름 '거코'는 항상 오렌지색으로 보여 준다. (템플릿·DB 문구 모두 같은 방식으로 처리)
(function () {
	'use strict';
	var NAME = '거코';
	var skip = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, NOSCRIPT: 1, TITLE: 1 };
	var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
		acceptNode: function (n) {
			var p = n.parentNode;
			if (!n.nodeValue || n.nodeValue.indexOf(NAME) < 0) { return NodeFilter.FILTER_REJECT; }
			if (!p || skip[p.nodeName] || (p.classList && p.classList.contains('name-geoko'))) { return NodeFilter.FILTER_REJECT; }
			return NodeFilter.FILTER_ACCEPT;
		}
	});
	var nodes = [];
	while (walker.nextNode()) { nodes.push(walker.currentNode); }
	nodes.forEach(function (n) {
		var parts = n.nodeValue.split(NAME);
		var frag = document.createDocumentFragment();
		parts.forEach(function (text, i) {
			if (i > 0) {
				var span = document.createElement('span');
				span.className = 'name-geoko';
				span.textContent = NAME;
				frag.appendChild(span);
			}
			if (text) { frag.appendChild(document.createTextNode(text)); }
		});
		n.parentNode.replaceChild(frag, n);
	});
})();

// 사이드바: 이달의 기획전·베스트셀러를 화면 옆에 항상 띄운다. 두 페이지·메인·관리자 화면에서는 보이지 않고, 스크롤해도 따라온다(CSS fixed).
(function () {
	'use strict';
	var panel = document.querySelector('[data-side-promo]');
	var list = panel ? panel.querySelector('[data-side-list]') : null;
	if (!panel || !list) { return; }
	var path = window.location.pathname;
	if (path === '/' || path === '/special' || path.indexOf('/special/') === 0 || path === '/bestseller' || path.indexOf('/bestseller/') === 0
		|| path.indexOf('/admin') === 0) { return; }
	fetch('/api/side-promos', { headers: { 'Accept': 'application/json' } })
		.then(function (r) { return r.ok ? r.json() : []; })
		.then(function (items) {
			if (!items || !items.length) { return; }
			var heads = { plan: '이달의 기획전', best: '베스트셀러' };
			var last = '';
			items.forEach(function (it) {
				if (it.kind !== last) {
					var h = document.createElement('p');
					h.className = 'side-promo-label';
					h.textContent = heads[it.kind] || '';
					list.appendChild(h);
					last = it.kind;
				}
				var a = document.createElement('a');
				a.className = 'side-card';
				a.href = it.href;
				a.setAttribute('style', '--c1:' + it.from + ';--c2:' + it.to + (it.photo || ''));
				[['side-card-badge', it.badge], ['side-card-name', it.name], ['side-card-title', it.title], ['side-card-price', it.price]].forEach(function (p) {
					var s = document.createElement('span');
					s.className = p[0];
					s.textContent = p[1] || '';
					a.appendChild(s);
				});
				list.appendChild(a);
			});
			panel.hidden = false;
			document.body.classList.add('has-side');   // 본문이 사이드바에 가리지 않게 오른쪽을 비운다
		})
		.catch(function () { /* 사이드바는 없어도 화면 사용에 지장이 없다 */ });
})();

// 생동감: 스크롤하면 카드가 차례로 떠오르고, 스크롤하면 상단 메뉴에 그림자가 생기며, 맨 위로 버튼이 나타난다.
// 동작 줄이기 설정이면 아무것도 움직이지 않는다. 떠오르는 효과가 끝나면 클래스를 지워 카드의 호버 효과와 겹치지 않게 한다.
(function () {
	'use strict';
	var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	var header = document.querySelector('.site-header');
	var top = document.querySelector('.footer-top');
	function onScroll() {
		var y = window.scrollY || document.documentElement.scrollTop;
		if (header) { header.classList.toggle('is-scrolled', y > 8); }
		if (top) { top.classList.toggle('is-lit', y > 600); }
	}
	window.addEventListener('scroll', onScroll, { passive: true });
	onScroll();
	if (reduce || !('IntersectionObserver' in window)) { return; }
	var targets = document.querySelectorAll('main .grid > *, main .section-title, main .flight-card, main .about-card, main .table-wrap, main .origin-card, main .inquiry-item');
	var seen = new Map();
	var io = new IntersectionObserver(function (entries) {
		entries.forEach(function (en) {
			if (!en.isIntersecting) { return; }
			var el = en.target;
			io.unobserve(el);
			var idx = seen.get(el.parentNode) || 0;
			seen.set(el.parentNode, idx + 1);
			el.style.transitionDelay = Math.min(idx * 70, 350) + 'ms';
			el.classList.add('rv-in');
			window.setTimeout(function () {
				el.classList.remove('rv', 'rv-in');
				el.style.transitionDelay = '';
			}, 1100);
		});
	}, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
	targets.forEach(function (el) {
		var r = el.getBoundingClientRect();
		if (r.top > window.innerHeight) {   // 처음부터 보이는 것은 그대로 두고, 아래쪽 카드만 떠오르게 한다
			el.classList.add('rv');
			io.observe(el);
		}
	});
})();
