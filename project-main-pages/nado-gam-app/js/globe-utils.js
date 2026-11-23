// 지구본 화면(메인, 해외 여행)이 함께 쓰는 도우미: 구면 보간, 비행 경로 만들기, 비행기·이름표 요소
(function () {
	'use strict';

	var RAD = Math.PI / 180;
	var IMG = 'https://cdn.jsdelivr.net/npm/three-globe/example/img/';
	var PLANE_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>';

	function toVec(lat, lng) {
		var a = lat * RAD, b = lng * RAD;
		return [Math.cos(a) * Math.cos(b), Math.cos(a) * Math.sin(b), Math.sin(a)];
	}
	function toLatLng(v) {
		return [Math.asin(Math.max(-1, Math.min(1, v[2]))) / RAD, Math.atan2(v[1], v[0]) / RAD];
	}
	function angle(a, b) {
		return Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
	}
	function slerp(a, b, t, omega) {
		if (omega < 1e-6) { return a; }
		var s = Math.sin(omega), k1 = Math.sin((1 - t) * omega) / s, k2 = Math.sin(t * omega) / s;
		return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
	}

	// 경로(공항 목록)를 [lat, lng, 고도] 점 목록으로 바꾼다. 구간마다 포물선 모양으로 떠올랐다 내려온다.
	function buildPath(points) {
		var pts = [];
		var total = 0;
		for (var s = 0; s < points.length - 1; s++) {
			var a = toVec(points[s].lat, points[s].lng), b = toVec(points[s + 1].lat, points[s + 1].lng);
			var omega = angle(a, b);
			total += omega;
			var h = 0.02 + 0.075 * omega;
			var steps = Math.max(24, Math.ceil(omega / RAD / 2));
			for (var i = (s === 0 ? 0 : 1); i <= steps; i++) {
				var t = i / steps;
				var ll = toLatLng(slerp(a, b, t, omega));
				pts.push([ll[0], ll[1], h * Math.sin(Math.PI * t)]);
			}
		}
		return { pts: pts, total: total };
	}

	function lerpAngle(a, b, f) {
		var d = ((b - a + 540) % 360) - 180; // 날짜변경선을 넘는 경우에도 짧은 쪽으로 보간
		return a + d * f;
	}

	// 경로 위의 t(0~1) 지점의 위도·경도·고도
	function pointAt(route, t) {
		var n = route.pts.length - 1;
		var f = Math.max(0, Math.min(1, t)) * n;
		var i = Math.min(n - 1, Math.floor(f));
		var k = f - i;
		var p = route.pts[i], q = route.pts[i + 1];
		return { lat: lerpAngle(p[0], q[0], k), lng: lerpAngle(p[1], q[1], k), alt: p[2] + (q[2] - p[2]) * k };
	}

	// 두 지점 사이의 가운데 위도·경도 (카메라를 맞출 때 쓴다)
	function midpoint(a, b) {
		var va = toVec(a.lat, a.lng), vb = toVec(b.lat, b.lng);
		var omega = angle(va, vb);
		var ll = toLatLng(slerp(va, vb, 0.5, omega));
		return { lat: ll[0], lng: ll[1], angle: omega };
	}

	function makePlane() {
		var d = document.createElement('div');
		d.className = 'plane';
		d.innerHTML = PLANE_SVG;
		return d;
	}

	function makeLabel(text, cls) {
		var d = document.createElement('div');
		d.className = 'city-label' + (cls ? ' ' + cls : '');
		d.textContent = text;
		return d;
	}

	// 비행기 아이콘을 화면에서 본 진행 방향으로 돌린다.
	function orient(globe, plane, cur, ahead) {
		var a = globe.getScreenCoords(cur.lat, cur.lng, cur.alt);
		var b = globe.getScreenCoords(ahead.lat, ahead.lng, ahead.alt);
		if (a && b && (Math.abs(b.x - a.x) + Math.abs(b.y - a.y)) > 0.05) {
			plane.rot = Math.atan2(b.y - a.y, b.x - a.x) / RAD + 90;
		}
	}

	window.NadoGlobe = {
		IMG: IMG,
		RAD: RAD,
		reduce: !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches),
		buildPath: buildPath,
		pointAt: pointAt,
		midpoint: midpoint,
		makePlane: makePlane,
		makeLabel: makeLabel,
		orient: orient
	};
})();
