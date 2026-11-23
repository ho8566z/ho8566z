// 메인 지구본: 돌아가는 지구 위로 전 세계 주요 도시 100곳 사이를 희미한 주황 선과 그 위를 흐르는 불빛이 오간다. (장식용, world-cities.js)
// 출발·도착 도시는 100곳 중에서 무작위로 짝지은 경로 60개이고, 실제 '나도 감' 항공편과는 무관하다.
(function () {
	'use strict';

	var el = document.getElementById('globe');
	if (!el) { return; }

	var U = window.NadoGlobe;
	var reduce = U ? U.reduce : false;
	var RAD = Math.PI / 180;

	function fallback() {
		el.innerHTML = '<div class="globe-fallback"><p>지구본을 불러오지 못했어요. 인터넷 연결을 확인해 주세요.</p></div>';
	}

	if (typeof Globe !== 'function' || !U) { fallback(); return; }

	function start(routes) {
		var width = el.clientWidth || 640;
		var height = el.clientHeight || 520;

		var paths = routes.map(function (r) {
			var built = U.buildPath(r.points);
			return { pts: built.pts, total: built.total, featured: r.featured, name: r.name, points: r.points };
		}).filter(function (p) { return p.pts.length > 1; });
		// 선 60개 + 선마다 불빛(밝은 심지 + 은은한 번짐)을 같은 위치에 겹쳐 그린다. 불빛은 조금 위에 얹어 선과 겹쳐 깜빡이지 않게 한다.
		var lines = paths.map(function (p) { return { pts: p.pts, total: p.total, light: false, glow: false }; });
		paths.forEach(function (p) {
			var up = p.pts.map(function (q) { return [q[0], q[1], q[2] + 0.003]; });
			var gap = Math.random();   // 같은 경로의 심지와 번짐이 함께 움직이도록 시작 위치를 공유한다
			lines.push({ pts: up, total: p.total, light: false, glow: true, gap: gap });
			lines.push({ pts: up, total: p.total, light: true, glow: false, gap: gap });
		});

		// 회전은 직접 제어한다. 카메라의 '위쪽'이 고정되지 않아 어느 축으로든 돌릴 수 있도록 trackball 방식을 쓴다.
		var globe = Globe({ controlType: 'trackball' })(el)
			.width(width).height(height)
			.backgroundColor('rgba(0,0,0,0)')
			.globeImageUrl(U.IMG + 'earth-blue-marble.jpg')
			.bumpImageUrl(U.IMG + 'earth-topology.png')
			.showAtmosphere(true).atmosphereColor('#ffa050').atmosphereAltitude(0.2)
			// 경로: 같은 좌표로 '주황 선'과 그 위를 흐르는 '불빛'을 함께 그린다(선 하나, 불빛 하나)
			.pathsData(lines)
			.pathPoints('pts').pathPointLat(function (p) { return p[0]; }).pathPointLng(function (p) { return p[1]; }).pathPointAlt(function (p) { return p[2]; })
			.pathColor(function (d) {
				if (d.light) { return ['rgba(255, 214, 140, 0)', 'rgba(255, 252, 240, 1)']; }
				if (d.glow) { return ['rgba(255, 90, 54, 0)', 'rgba(255, 140, 100, 0.7)']; }
				return 'rgba(255, 90, 54, 0.5)';
			})
			.pathStroke(function (d) { return d.light ? 0.75 : (d.glow ? 1.9 : 0.32); })
			.pathDashLength(function (d) { return d.light || d.glow ? 0.08 : 1; })
			.pathDashGap(function (d) { return d.light || d.glow ? 1.18 : 0; })
			.pathDashInitialGap(function (d) { return d.light || d.glow ? d.gap * 1.26 : 0; })
			.pathDashAnimateTime(function (d) { return (d.light || d.glow) && !reduce ? 3200 + d.total * 2400 : 0; })
			.pathTransitionDuration(0);

		// 도시 100곳의 점과 몇몇 도시에서 퍼지는 물결
		var cityList = (window.NadoWorldCities || []).map(function (c) { return { name: c[0], lat: c[1], lng: c[2] }; });
		var ringCities = cityList.filter(function (c, i) { return i % 9 === 0; });

		globe
			.pointsData(cityList)
			.pointAltitude(0.004).pointRadius(0.24)
			.pointColor(function () { return 'rgba(255,255,255,0.9)'; })
			.ringsData(ringCities)
			.ringColor(function () { return function (t) { return 'rgba(255, 90, 54,' + (1 - t) + ')'; }; })
			.ringMaxRadius(3).ringPropagationSpeed(2).ringRepeatPeriod(2400);

		// 회전은 기본 컨트롤 대신 직접 구현한다. (자유 회전, 11/20 변경)
		// 카메라를 지구 중심 기준으로 '어느 축으로든' 돌린다. 끌어서 놓으면 놓은 방향(축)으로 계속 돌고,
		// 서서히 평소 속도로 안정된다. 세로·대각선으로 돌려도 원래 각도로 되돌아가지 않고 그 축 그대로 계속 돈다.
		var CRUISE = reduce ? 0 : 15 * RAD;      // 평소 회전 속도(라디안/초)
		var cruise = [0, -CRUISE, 0];           // 평소 회전 벡터(카메라 각속도). 처음에는 지구 자전축(세로)이고 지표면이 오른쪽으로 흐른다
		var omega = cruise.slice();             // 지금 회전 벡터(방향 = 회전축, 크기 = 속도)
		var flick = null;                       // 던진 직후의 감속 상태 { w: 던진 회전 벡터, t: 지난 시간(초) }
		var FLICK_MAX = 1200 * RAD;             // 던질 때 최대 속도(라디안/초)
		var FLICK_SECONDS = 3;                  // 던진 속도가 평소 속도로 돌아오기까지 걸리는 시간
		var drag = null;

		function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
		function len(a) { return Math.sqrt(dot(a, a)); }
		function scale(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
		function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
		function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
		function norm(a) { var l = len(a) || 1; return scale(a, 1 / l); }
		// 로드리게스 회전: v 를 단위축 ax 둘레로 ang 만큼 돌린다
		function rotate(v, ax, ang) {
			var c = Math.cos(ang), s = Math.sin(ang);
			return add(add(scale(v, c), scale(cross(ax, v), s)), scale(ax, dot(ax, v) * (1 - c)));
		}

		// 처음 보는 각도(위도 28°, 경도 120°)로 카메라를 놓고, 그 위치와 '위쪽' 벡터를 직접 관리한다.
		globe.pointOfView({ lat: 28, lng: 120, altitude: 2.15 }, 0);
		var cam = globe.camera();
		var pos = [cam.position.x, cam.position.y, cam.position.z];
		var up = [cam.up.x, cam.up.y, cam.up.z];
		var dist = len(pos);
		var controls = globe.controls();
		controls.enabled = false;      // 기본 드래그 회전은 끄고 아래에서 직접 처리한다
		controls.noRotate = true; controls.noZoom = true; controls.noPan = true; controls.staticMoving = true;   // 기본 컨트롤이 카메라를 되돌리지 못하게 한다
		try { globe.renderer().setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); } catch (e) { /* 무시 */ }

		function degPerPx() { return 57.3 / Math.max(120, Math.min(el.clientWidth, el.clientHeight) * 0.4); }

		// 카메라 방향 기준 좌표: 앞(forward) = 지구 중심 쪽, right = 화면 오른쪽
		function frameAxes() {
			var f = norm(scale(pos, -1));
			var right = norm(cross(f, up));
			return { f: f, right: right, up: cross(right, f) };
		}

		// 회전 벡터 rv(라디안)만큼 카메라를 돌린다. 오차가 쌓이지 않게 거리와 직각을 다시 맞춘다.
		function applyRotation(rv) {
			var ang = len(rv);
			if (ang < 1e-9) { return; }
			var ax = scale(rv, 1 / ang);
			pos = rotate(pos, ax, ang);
			up = rotate(up, ax, ang);
			pos = scale(norm(pos), dist);
			var f = norm(scale(pos, -1));
			up = norm(add(up, scale(f, -dot(up, f))));
		}

		// 끊김 없는 회전(11/20 수정): 잡았다 놓아도 회전이 0에서 다시 시작하지 않는다.
		// - 잡는 동안에는 손을 따라가고, 놓으면 직전 회전(없으면 평소 회전)에서 이어 돈다.
		// - 던진 속도(최대 1200도/초)는 3초에 걸쳐 평소 속도(15도/초)로 돌아온다.
		el.addEventListener('pointerdown', function (e) {
			if (e.pointerType === 'mouse' && e.button !== 0) { return; }
			drag = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), samples: [] };
			try { el.setPointerCapture(e.pointerId); } catch (err) { /* 무시 */ }
			flick = null;
			el.classList.add('is-grabbing');
		});
		el.addEventListener('pointermove', function (e) {
			if (!drag || e.pointerId !== drag.id) { return; }
			var now = performance.now();
			var dx = e.clientX - drag.x, dy = e.clientY - drag.y, k = degPerPx() * RAD;
			var ax = frameAxes();
			// 오른쪽/아래로 끌면 지표면이 커서를 따라온다 → 카메라는 반대로 돈다. 가로·세로가 합쳐져 어느 축이든 가능하다.
			var rv = add(scale(ax.up, -dx * k), scale(ax.right, -dy * k));
			applyRotation(rv);
			// 최근 100ms 동안의 움직임을 모아 놓는 순간의 각속도를 구한다(한 번의 튐에 흔들리지 않는다).
			drag.samples.push({ t: now, rv: rv });
			while (drag.samples.length && now - drag.samples[0].t > 100) { drag.samples.shift(); }
			drag.x = e.clientX; drag.y = e.clientY; drag.t = now;
		});
		function release(e) {
			if (!drag || e.pointerId !== drag.id) { return; }
			var now = performance.now();
			var w = [0, 0, 0];
			var recent = drag.samples.filter(function (s) { return now - s.t <= 100; });
			if (recent.length) {
				var sum = [0, 0, 0];
				recent.forEach(function (s) { sum = add(sum, s.rv); });
				w = scale(sum, 1 / Math.max(0.05, (now - recent[0].t) / 1000));
			}
			var m = len(w);
			if (m > 4 * RAD) {
				if (m > FLICK_MAX) { w = scale(w, FLICK_MAX / m); }   // 최대 1200도/초
				omega = w;
				flick = { w: w, t: 0 };
				// 놓은 축과 방향을 새 평소 회전으로 삼는다(속도는 평소 속도로 안정).
				if (CRUISE > 0) { cruise = scale(norm(w), CRUISE); }
			} else {
				flick = null;
				omega = cruise.slice();        // 멈춘 채로 놓거나 클릭만 해도 평소 회전을 그대로 이어 간다
			}
			drag = null;
			el.classList.remove('is-grabbing');
		}
		el.addEventListener('pointerup', release);
		el.addEventListener('pointercancel', release);

		function stepCamera(dt) {
			if (!drag) {
				// 던진 속도는 3초 동안 부드럽게(처음엔 오래 빠르다가 끝에서 완만하게) 평소 속도로 돌아온다. 축(방향)은 놓은 그대로다.
				if (flick) {
					flick.t += dt;
					var k = Math.max(0, 1 - flick.t / FLICK_SECONDS);
					omega = add(cruise, scale(add(flick.w, scale(cruise, -1)), k * k));
					if (flick.t >= FLICK_SECONDS) { flick = null; omega = cruise.slice(); }
				}
				applyRotation(scale(omega, dt));
			}
			cam.position.set(pos[0], pos[1], pos[2]);
			cam.up.set(up[0], up[1], up[2]);
			cam.lookAt(0, 0, 0);
		}

		// 프레임 루프: 카메라 회전
		var last = performance.now();
		function frame(now) {
			var dt = Math.min(0.1, (now - last) / 1000);
			last = now;
			stepCamera(dt);
			window.requestAnimationFrame(frame);
		}
		window.requestAnimationFrame(frame);

		// 크기 변경
		function resize() {
			var w = el.clientWidth, h = el.clientHeight;
			if (w && h) { globe.width(w).height(h); }
		}
		if (window.ResizeObserver) { new ResizeObserver(resize).observe(el); } else { window.addEventListener('resize', resize); }

		// 탭이 숨겨지면 렌더링을 멈춰 전력을 아낀다.
		document.addEventListener('visibilitychange', function () {
			if (document.hidden) { globe.pauseAnimation(); } else { globe.resumeAnimation(); last = performance.now(); }
		});
	}

	// 100개 도시 중에서 서로 다른 두 도시를 짝지어 경로를 만든다. 너무 가까운 짝(약 1,700km 미만)은 건너뛴다.
	function makeRoutes(count) {
		var cities = window.NadoWorldCities || [];
		var routes = [], seen = {}, tries = 0;
		function dist(a, b) {
			var x = Math.sin((b[1] - a[1]) * RAD / 2), y = Math.sin((b[2] - a[2]) * RAD / 2);
			var h = x * x + Math.cos(a[1] * RAD) * Math.cos(b[1] * RAD) * y * y;
			return 2 * Math.asin(Math.min(1, Math.sqrt(h)));
		}
		while (routes.length < count && cities.length > 1 && tries++ < count * 40) {
			var i = Math.floor(Math.random() * cities.length), j = Math.floor(Math.random() * cities.length);
			if (i === j || seen[i + '-' + j] || dist(cities[i], cities[j]) < 15 * RAD) { continue; }
			seen[i + '-' + j] = true;
			var a = cities[i], b = cities[j];
			routes.push({ featured: false, name: a[0] + ' → ' + b[0], points: [
				{ code: 'C' + i, city: a[0], lat: a[1], lng: a[2] },
				{ code: 'C' + j, city: b[0], lat: b[1], lng: b[2] }
			] });
		}
		return routes;
	}

	start(makeRoutes(60));
})();
