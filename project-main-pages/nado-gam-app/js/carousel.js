// 카드 캐로셀: 한 번에 한 장씩 큰 카드를 보여주고, 자동으로 넘어간다.
// 좌우 버튼, 점(진행 표시), 키보드 방향키, 터치/마우스 스와이프를 지원하고 마우스를 올리면 멈춘다.
(function () {
	'use strict';
	var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	function init(root) {
		var track = root.querySelector('.track');
		var slides = Array.prototype.slice.call(track.children);
		var dotsBox = root.querySelector('.dots');
		var prev = root.querySelector('.nav--prev');
		var next = root.querySelector('.nav--next');
		var count = slides.length;
		var delay = parseInt(root.getAttribute('data-autoplay'), 10) || 0;
		var index = 0;
		var timer = null;
		var hovering = false;

		if (count === 0) { return; }
		if (count === 1) {
			if (prev) { prev.hidden = true; }
			if (next) { next.hidden = true; }
		}
		root.style.setProperty('--autoplay', delay + 'ms');

		var dots = slides.map(function (_, i) {
			var b = document.createElement('button');
			b.type = 'button';
			b.setAttribute('role', 'tab');
			b.setAttribute('aria-label', (i + 1) + '번째 카드');
			b.addEventListener('click', function () { go(i, true); });
			dotsBox.appendChild(b);
			return b;
		});

		function render() {
			track.style.transform = 'translateX(' + (-index * 100) + '%)';
			slides.forEach(function (s, i) {
				var active = i === index;
				s.classList.toggle('is-active', active);
				s.setAttribute('aria-hidden', active ? 'false' : 'true');
				s.setAttribute('aria-label', (i + 1) + ' / ' + count);
				// 보이지 않는 카드의 링크는 탭 키로 이동되지 않게 한다.
				s.querySelectorAll('a').forEach(function (a) { a.tabIndex = active ? 0 : -1; });
			});
			dots.forEach(function (d, i) {
				d.classList.toggle('is-active', i === index);
				d.setAttribute('aria-selected', i === index ? 'true' : 'false');
			});
		}

		function restartProgress() {
			// 점의 진행 애니메이션을 처음부터 다시 시작한다.
			root.classList.remove('is-playing');
			void root.offsetWidth;
			if (delay && !reduce && count > 1) { root.classList.add('is-playing'); }
		}

		function go(i, user) {
			index = (i + count) % count;
			render();
			restartProgress();
			if (user) { schedule(); }
		}

		function schedule() {
			window.clearTimeout(timer);
			if (!delay || reduce || count < 2 || hovering || document.hidden) { return; }
			timer = window.setTimeout(function () { go(index + 1, false); schedule(); }, delay);
		}

		function pause() {
			hovering = true;
			window.clearTimeout(timer);
			root.classList.add('is-paused');
		}

		function resume() {
			hovering = false;
			root.classList.remove('is-paused');
			restartProgress();
			schedule();
		}

		if (prev) { prev.addEventListener('click', function () { go(index - 1, true); }); }
		if (next) { next.addEventListener('click', function () { go(index + 1, true); }); }
		root.addEventListener('mouseenter', pause);
		root.addEventListener('mouseleave', resume);
		root.addEventListener('focusin', pause);
		root.addEventListener('focusout', resume);
		document.addEventListener('visibilitychange', function () { if (document.hidden) { window.clearTimeout(timer); } else { resume(); } });

		root.addEventListener('keydown', function (e) {
			if (e.key === 'ArrowLeft') { go(index - 1, true); }
			if (e.key === 'ArrowRight') { go(index + 1, true); }
		});

		// 스와이프: 좌우로 50px 이상 끌면 넘어간다. 끌고 나서 생기는 클릭(링크 이동)은 막는다.
		var startX = null;
		var moved = false;
		root.addEventListener('pointerdown', function (e) { startX = e.clientX; moved = false; });
		root.addEventListener('pointerup', function (e) {
			if (startX === null) { return; }
			var dx = e.clientX - startX;
			startX = null;
			if (Math.abs(dx) > 50) {
				moved = true;
				go(dx < 0 ? index + 1 : index - 1, true);
			}
		});
		root.addEventListener('click', function (e) {
			if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
		}, true);

		render();
		restartProgress();
		schedule();
	}

	document.querySelectorAll('[data-carousel]').forEach(init);
})();
