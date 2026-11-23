// 메인 이벤트 팝업: 처음 들어오면 열고, 닫기·오늘 하루 안 보기를 지원한다.
(function () {
	'use strict';
	var popup = document.getElementById('event-popup');
	if (!popup) { return; }

	var id = popup.getAttribute('data-popup-id');
	var key = 'nadogam.popup.hide.' + id;
	var lastFocus = null;

	function today() {
		var d = new Date();
		return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
	}
	function hiddenToday() {
		try { return window.localStorage.getItem(key) === today(); } catch (e) { return false; }
	}
	function hideToday() {
		try { window.localStorage.setItem(key, today()); } catch (e) { /* 저장 불가면 이번 방문만 닫는다 */ }
	}

	function open() {
		lastFocus = document.activeElement;
		popup.hidden = false;
		document.body.classList.add('popup-open');
		var first = popup.querySelector('.popup-card .button, .popup-x');
		if (first) { first.focus(); }
	}
	function close() {
		popup.hidden = true;
		document.body.classList.remove('popup-open');
		if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
	}

	popup.addEventListener('click', function (e) {
		var t = e.target.closest ? e.target.closest('[data-popup-close],[data-popup-hide-today],[data-popup-close-on-click]') : null;
		if (!t) { return; }
		if (t.hasAttribute('data-popup-hide-today')) { hideToday(); }
		if (!t.hasAttribute('data-popup-close-on-click')) { close(); }
	});
	document.addEventListener('keydown', function (e) {
		if (popup.hidden) { return; }
		if (e.key === 'Escape') { close(); return; }
		if (e.key === 'Tab') {   // 팝업 안에서만 포커스가 돌게 한다
			var f = popup.querySelectorAll('a[href], button');
			if (!f.length) { return; }
			var first = f[0], last = f[f.length - 1];
			if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
			else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
		}
	});

	if (!hiddenToday()) {
		window.setTimeout(open, 600);
	}
})();
