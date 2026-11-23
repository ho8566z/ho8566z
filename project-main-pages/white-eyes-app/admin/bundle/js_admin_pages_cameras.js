(() => {
  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/common/toast.js
  var CONTAINER_ID = "toast-stack";
  var DEFAULT_DURATION_MS = 5e3;
  function showToast(message, durationMs = DEFAULT_DURATION_MS) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "alert");
    toast.textContent = message;
    getContainer().append(toast);
    window.setTimeout(() => toast.remove(), durationMs);
    return toast;
  }
  function getContainer(id = CONTAINER_ID, className = "toast-stack") {
    let container = document.getElementById(id);
    if (!container) {
      container = document.createElement("div");
      container.id = id;
      container.className = className;
      document.body.append(container);
    }
    return container;
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/common/api.js
  var CSRF_HEADER = "X-CSRF-TOKEN";
  var NETWORK_ERROR_MESSAGE = "\uC11C\uBC84\uC5D0 \uC5F0\uACB0\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.";
  var DEFAULT_ERROR_MESSAGE = "\uC77C\uC2DC\uC801\uC778 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.";
  var UNAUTHORIZED_MESSAGE = "\uB85C\uADF8\uC778\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.";
  var ApiError = class extends Error {
    constructor(status, code, message, fieldErrors) {
      super(message);
      this.name = "ApiError";
      this.status = status;
      this.code = code;
      this.fieldErrors = fieldErrors ?? [];
    }
  };
  function url(path) {
    const meta = document.querySelector('meta[name="context-path"]');
    const contextPath = (meta?.content ?? "/").replace(/\/$/, "");
    return contextPath + path;
  }
  function get(path, params, options) {
    return request("GET", path, { params, ...options });
  }
  function post(path, body, options) {
    return request("POST", path, { body, ...options });
  }
  function patch(path, body, options) {
    return request("PATCH", path, { body, ...options });
  }
  function del(path, options) {
    return request("DELETE", path, { ...options });
  }
  async function request(method, path, { params, body, toast = true, file = false, absolute = false, signal, cache } = {}) {
    let target = absolute ? path : url(path);
    if (params) {
      target += "?" + new URLSearchParams(params).toString();
    }
    const headers = { Accept: "application/json" };
    if (body !== void 0) {
      headers["Content-Type"] = "application/json";
    }
    const csrfToken = document.querySelector('meta[name="_csrf"]')?.content;
    if (csrfToken && method !== "GET") {
      headers[CSRF_HEADER] = csrfToken;
    }
    let response;
    try {
      response = await fetch(target, {
        method,
        headers,
        body: body === void 0 ? void 0 : JSON.stringify(body),
        credentials: "same-origin",
        signal,
        cache
      });
    } catch {
      return fail(new ApiError(0, null, NETWORK_ERROR_MESSAGE, []), toast);
    }
    if (response.status === 401) {
      window.location.href = url("/login");
      throw new ApiError(401, "UNAUTHORIZED", UNAUTHORIZED_MESSAGE, []);
    }
    if (file && response.ok) {
      return { blob: await response.blob(), fileName: fileNameOf(response) };
    }
    const data = await readJson(response);
    if (!response.ok) {
      return fail(
        new ApiError(
          response.status,
          data?.code ?? null,
          data?.message ?? DEFAULT_ERROR_MESSAGE,
          data?.fieldErrors
        ),
        toast
      );
    }
    return data;
  }
  function fail(error, toast) {
    if (toast && error.fieldErrors.length === 0) {
      showToast(error.message);
    }
    throw error;
  }
  function fileNameOf(response) {
    const disposition = response.headers.get("Content-Disposition") ?? "";
    const encoded = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
    if (encoded) {
      return decodeURIComponent(encoded[1]);
    }
    const plain = /filename="([^"]+)"/i.exec(disposition);
    return plain ? plain[1] : null;
  }
  async function readJson(response) {
    const text = await response.text();
    if (!text) {
      return null;
    }
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/camera/camera-form.js
  var URI_HINT = {
    DUMMY: "dummy/videos/ \uB85C \uC2DC\uC791\uD558\uACE0 .mp4 \uB85C \uB05D\uB098\uB294 \uC0C1\uB300\uACBD\uB85C (\uC608: dummy/videos/a.mp4)",
    LIVE: "rtsp:// \uB85C \uC2DC\uC791\uD558\uB294 \uC8FC\uC18C (\uC608: rtsp://10.0.0.21/stream)"
  };
  var FORM_ERROR_TARGET = { ZONE_NOT_FOUND: "zoneId", ZONE_HAS_CAMERA: "zoneId" };
  function initCameraForm({ onSaved }) {
    const modal2 = document.getElementById("camera-modal");
    const form = document.getElementById("camera-form");
    const formError = document.getElementById("camera-form-error");
    const zoneSelect = document.getElementById("camera-zone");
    const uriInput = document.getElementById("camera-uri");
    const uriHint = document.getElementById("camera-uri-hint");
    const saveButton = document.getElementById("camera-save");
    let editing = null;
    modal2.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", closeModal));
    modal2.addEventListener("mousedown", (event) => {
      if (event.target === modal2) {
        closeModal();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal2.hidden) {
        closeModal();
      }
    });
    form.addEventListener("submit", submitForm);
    form.querySelectorAll('input[name="sourceType"]').forEach(
      (radio) => radio.addEventListener("change", updateUriHint)
    );
    updateUriHint();
    async function open(camera, preferredZoneId) {
      editing = camera;
      form.reset();
      clearErrors();
      document.getElementById("camera-modal-title").textContent = camera ? "\uCEA0 \uC218\uC815" : "\uCEA0 \uB4F1\uB85D";
      document.getElementById("camera-zone-hint").textContent = camera ? "\uAD6C\uC5ED\uC740 \uBC14\uAFC0 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4" : "\uCEA0\uC774 \uC5C6\uB294 \uAD6C\uC5ED\uB9CC \uACE0\uB97C \uC218 \uC788\uC2B5\uB2C8\uB2E4(\uAD6C\uC5ED\uB2F9 1\uB300)";
      if (camera) {
        form.elements.name.value = camera.name;
        form.elements.sourceType.value = camera.sourceType;
        uriInput.value = camera.sourceUri;
      }
      updateUriHint();
      modal2.hidden = false;
      if (camera) {
        zoneSelect.replaceChildren(option(camera.zoneId, camera.zoneName));
        zoneSelect.disabled = true;
        saveButton.disabled = false;
        form.elements.name.focus();
        return;
      }
      zoneSelect.disabled = false;
      zoneSelect.replaceChildren(option("", "\uAD6C\uC5ED\uC744 \uBD88\uB7EC\uC624\uB294 \uC911\u2026"));
      saveButton.disabled = true;
      try {
        const zones = await get("/api/v1/zones");
        const free = zones.filter((zone) => !zone.hasCamera);
        zoneSelect.replaceChildren(
          ...free.length === 0 ? [option("", "\uCEA0\uC774 \uC5C6\uB294 \uAD6C\uC5ED\uC774 \uC5C6\uC2B5\uB2C8\uB2E4")] : [option("", "\uAD6C\uC5ED \uC120\uD0DD"), ...free.map((zone) => option(zone.id, zone.name))]
        );
        if (free.some((zone) => zone.id === preferredZoneId)) {
          zoneSelect.value = String(preferredZoneId);
        }
        saveButton.disabled = false;
        (zoneSelect.value ? form.elements.name : zoneSelect).focus();
      } catch {
        zoneSelect.replaceChildren(option("", "\uAD6C\uC5ED\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4"));
      }
    }
    function closeModal() {
      modal2.hidden = true;
      editing = null;
    }
    function updateUriHint() {
      uriHint.textContent = URI_HINT[form.elements.sourceType.value];
      uriInput.placeholder = form.elements.sourceType.value === "LIVE" ? "rtsp://\u2026" : "dummy/videos/\u2026.mp4";
    }
    function clearErrors() {
      formError.hidden = true;
      formError.textContent = "";
      form.querySelectorAll("[data-error-for]").forEach((hint) => {
        hint.hidden = true;
        hint.textContent = "";
      });
      form.querySelectorAll(".input.err").forEach((input) => input.classList.remove("err"));
    }
    function showFieldError(field, message) {
      const hint = form.querySelector(`[data-error-for="${field}"]`);
      if (!hint) {
        formError.textContent = message;
        formError.hidden = false;
        return;
      }
      hint.textContent = message;
      hint.hidden = false;
      form.elements[field]?.classList?.add("err");
    }
    async function submitForm(event) {
      event.preventDefault();
      clearErrors();
      const values = {
        name: form.elements.name.value.trim(),
        sourceType: form.elements.sourceType.value,
        sourceUri: uriInput.value.trim()
      };
      saveButton.disabled = true;
      try {
        if (editing) {
          await saveEdit(values);
        } else {
          await post(
            "/api/v1/manage/cameras",
            { zoneId: zoneSelect.value ? Number(zoneSelect.value) : null, ...values },
            { toast: false }
          );
          closeModal();
          await onSaved();
        }
      } catch (error) {
        if (!(error instanceof ApiError)) {
          throw error;
        }
        if (error.fieldErrors.length > 0) {
          error.fieldErrors.forEach(({ field, message }) => showFieldError(field, message));
        } else if (error.code === "INVALID_INPUT") {
          showFieldError("sourceUri", error.message);
        } else if (error.code === "CAMERA_NOT_STOPPED") {
          showFieldError("", error.message);
          await onSaved();
        } else {
          showFieldError(FORM_ERROR_TARGET[error.code] ?? "", error.message);
        }
      } finally {
        saveButton.disabled = false;
      }
    }
    async function saveEdit(values) {
      const body = {};
      Object.keys(values).forEach((key) => {
        if (values[key] !== editing[key]) {
          body[key] = values[key];
        }
      });
      if (Object.keys(body).length === 0) {
        closeModal();
        return;
      }
      const updated = await patch(`/api/v1/manage/cameras/${editing.id}`, body, { toast: false });
      closeModal();
      showToast(`'${updated.name}' \uCEA0 \uC815\uBCF4\uB97C \uC218\uC815\uD588\uC2B5\uB2C8\uB2E4.`);
      await onSaved();
    }
    return {
      openRegister: (preferredZoneId = null) => open(null, preferredZoneId),
      openEdit: (camera) => open(camera, null)
    };
  }
  function option(value, label) {
    const node = document.createElement("option");
    node.value = String(value);
    node.textContent = label;
    return node;
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/common/format.js
  function isBlank(value) {
    return value === null || value === void 0 || value === "" || Number.isNaN(Number(value));
  }
  function formatNumber(value) {
    return isBlank(value) ? "-" : Number(value).toLocaleString("ko-KR");
  }
  function formatDecimal(value, fractionDigits = 1) {
    if (isBlank(value)) {
      return "-";
    }
    return Number(value).toLocaleString("ko-KR", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    });
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/common/now-count.js
  var FRESH_MS = 15e3;
  var EXPIRE_CHECK_MS = 5e3;
  var counts = /* @__PURE__ */ new Map();
  var listeners = [];
  window.setInterval(() => {
    if (counts.size > 0) {
      notify();
    }
  }, EXPIRE_CHECK_MS);
  function nowCountOf(zoneId) {
    const found = counts.get(Number(zoneId));
    return found && Date.now() - found.receivedAt <= FRESH_MS ? found.count : void 0;
  }
  function bindNowCount(element, zoneId, fallback, suffix = "") {
    element.dataset.nowZone = String(zoneId);
    element.dataset.nowFallback = fallback;
    element.dataset.nowSuffix = suffix;
    render(element);
  }
  function render(element) {
    const count = nowCountOf(element.dataset.nowZone);
    element.textContent = count === void 0 ? element.dataset.nowFallback : `${formatNumber(count)}${element.dataset.nowSuffix}`;
  }
  function notify() {
    document.querySelectorAll("[data-now-zone]").forEach(render);
    listeners.forEach((listener) => listener());
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/live/mini-charts.js
  var SVG_NS = "http://www.w3.org/2000/svg";
  var WIDTH = 400;
  var LEVEL_COLORS = { 1: "#34a37f", 2: "#c98a1c", 3: "#d9475a" };
  var EMPTY_COLOR = "#253242";
  var NOW_COLOR = "#818cf8";
  var COUNT_COLOR = "#818cf8";
  var COUNT_FILL = "rgba(129, 140, 248, .16)";
  var INFLOW_COLOR = "#a5b4fc";
  var OUTFLOW_COLOR = "#4f46e5";
  var WARN_COLOR = "#c98a1c";
  var CONGESTION_FILL = "rgba(239, 77, 85, .15)";
  var CONGESTED_LEVEL = 2;
  var GAP_RATIO = 0.18;
  function levelBars(points, { height, max, warn = null, label }) {
    const svg = svgBox(height, label);
    const step = WIDTH / Math.max(points.length, 1);
    const nowIndex = points.findLastIndex(
      (point) => point.value !== null && point.value !== void 0
    );
    points.forEach((point, index) => {
      if (point.value === null || point.value === void 0) {
        return;
      }
      const barHeight = Math.max(1, point.value / max * (height - 2));
      const isNow = index === nowIndex;
      svg.append(
        rect(
          index * step + step * GAP_RATIO / 2,
          height - barHeight,
          step * (1 - GAP_RATIO),
          barHeight,
          isNow ? NOW_COLOR : LEVEL_COLORS[point.level] ?? EMPTY_COLOR
        )
      );
    });
    if (warn !== null && warn > 0 && warn <= max) {
      const y = height - warn / max * (height - 2);
      svg.append(line(0, y, WIDTH, y, WARN_COLOR, "4 3"));
    }
    return svg;
  }
  function countLine(points, { height, max, label }) {
    const svg = svgBox(height, label);
    const step = WIDTH / Math.max(points.length, 1);
    shadeCongested(svg, points, step, height);
    const xy = points.map(
      (point, index) => point.value === null || point.value === void 0 ? null : [index * step + step / 2, height - 1 - point.value / max * (height - 4)]
    );
    let run = [];
    const flush = () => {
      if (run.length > 1) {
        const area = document.createElementNS(SVG_NS, "polygon");
        area.setAttribute(
          "points",
          [...run, [run[run.length - 1][0], height], [run[0][0], height]].map(pair).join(" ")
        );
        area.setAttribute("fill", COUNT_FILL);
        svg.append(area);
        const polyline = document.createElementNS(SVG_NS, "polyline");
        polyline.setAttribute("points", run.map(pair).join(" "));
        polyline.setAttribute("fill", "none");
        polyline.setAttribute("stroke", COUNT_COLOR);
        polyline.setAttribute("stroke-width", "2");
        polyline.setAttribute("vector-effect", "non-scaling-stroke");
        svg.append(polyline);
      }
      run = [];
    };
    xy.forEach((point) => point ? run.push(point) : flush());
    flush();
    return svg;
  }
  function flowBars(points, { height, label }) {
    const svg = svgBox(height, label);
    const step = WIDTH / Math.max(points.length, 1);
    shadeCongested(svg, points, step, height);
    const max = Math.max(1, ...points.flatMap((point) => [point.inflow ?? 0, point.outflow ?? 0]));
    const middle = height / 2;
    points.forEach((point, index) => {
      const x = index * step + step * GAP_RATIO / 2;
      const width = step * (1 - GAP_RATIO);
      if (point.inflow) {
        const barHeight = point.inflow / max * (middle - 1);
        svg.append(rect(x, middle - barHeight, width, barHeight, INFLOW_COLOR));
      }
      if (point.outflow) {
        svg.append(rect(x, middle, width, point.outflow / max * (middle - 1), OUTFLOW_COLOR));
      }
    });
    svg.append(line(0, middle, WIDTH, middle, EMPTY_COLOR));
    return svg;
  }
  function niceMax(values) {
    const max = Math.max(0, ...values.filter((value) => value !== null && value !== void 0));
    if (max <= 0) {
      return 1;
    }
    const magnitude = 10 ** Math.floor(Math.log10(max));
    const scaled = max / magnitude;
    const nice = scaled <= 1 ? 1 : scaled <= 2 ? 2 : scaled <= 5 ? 5 : 10;
    return nice * magnitude;
  }
  function isCongested(level) {
    return level !== null && level !== void 0 && level >= CONGESTED_LEVEL;
  }
  function shadeCongested(svg, points, step, height) {
    points.forEach((point, index) => {
      if (isCongested(point.level)) {
        svg.append(rect(index * step, 0, step, height, CONGESTION_FILL));
      }
    });
  }
  function svgBox(height, label) {
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${WIDTH} ${height}`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", label);
    svg.style.height = `${height}px`;
    svg.style.width = "100%";
    svg.style.display = "block";
    return svg;
  }
  function rect(x, y, width, height, fill) {
    const element = document.createElementNS(SVG_NS, "rect");
    element.setAttribute("x", x.toFixed(1));
    element.setAttribute("y", y.toFixed(1));
    element.setAttribute("width", Math.max(0, width).toFixed(1));
    element.setAttribute("height", Math.max(0, height).toFixed(1));
    element.setAttribute("rx", "1.5");
    element.setAttribute("fill", fill);
    return element;
  }
  function line(x1, y1, x2, y2, stroke, dash) {
    const element = document.createElementNS(SVG_NS, "line");
    element.setAttribute("x1", String(x1));
    element.setAttribute("y1", y1.toFixed(1));
    element.setAttribute("x2", String(x2));
    element.setAttribute("y2", y2.toFixed(1));
    element.setAttribute("stroke", stroke);
    element.setAttribute("stroke-width", "1");
    element.setAttribute("vector-effect", "non-scaling-stroke");
    if (dash) {
      element.setAttribute("stroke-dasharray", dash);
    }
    return element;
  }
  var pair = ([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`;

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/live/live-graphs.js
  var SERIES_API = "/api/v1/stats/series";
  var MINUTE_MS = 6e4;
  var WINDOW_MINUTES = 60;
  var RECENT_MINUTES = 10;
  var BAR_HEIGHT = 90;
  var COUNT_HEIGHT = 80;
  var FLOW_HEIGHT = 55;
  var DIRECTIONS = [
    ["N", "\uBD81"],
    ["E", "\uB3D9"],
    ["S", "\uB0A8"],
    ["W", "\uC11C"]
  ];
  var latestRequestId = 0;
  function clearLiveGraphs() {
    latestRequestId++;
    if (!document.getElementById("live-graphs")) {
      return;
    }
    [
      "live-graph-10m",
      "live-graph-60m",
      "live-graph-count",
      "live-graph-flow",
      "live-compass",
      "live-direction-bars"
    ].forEach((id) => byId(id).replaceChildren());
    byId("live-net").textContent = "-";
  }
  async function loadLiveGraphs(camera) {
    if (!document.getElementById("live-graphs")) {
      return;
    }
    const to = new Date(Math.floor(Date.now() / MINUTE_MS) * MINUTE_MS + MINUTE_MS);
    const from = new Date(to.getTime() - WINDOW_MINUTES * MINUTE_MS);
    const query = {
      targetType: "ZONE",
      targetId: String(camera.zoneId),
      interval: "1m",
      from: toInputValue(from),
      to: toInputValue(to)
    };
    byId("live-stats-link").href = `${url("/stats/graph")}?${new URLSearchParams(query).toString()}`;
    const requestId = ++latestRequestId;
    try {
      const response = await get(SERIES_API, query, { toast: false });
      if (requestId !== latestRequestId) {
        return;
      }
      render2(response.items, camera.name);
      byId("live-graph-error").hidden = true;
    } catch {
      if (requestId === latestRequestId) {
        byId("live-graph-error").hidden = false;
      }
    }
  }
  function render2(items, cameraName) {
    const points = items.map((point) => ({
      value: point.countAvg === null || point.countAvg === void 0 ? null : Number(point.countAvg),
      level: point.level ?? null,
      inflow: sum(point.inflow),
      outflow: sum(point.outflow)
    }));
    const max = niceMax(points.map((point) => point.value));
    const recent = points.slice(-RECENT_MINUTES);
    byId("live-graph-10m").replaceChildren(
      levelBars(recent, { height: BAR_HEIGHT, max, label: "\uCD5C\uADFC 10\uBD84 \uC778\uC6D0, \uD63C\uC7A1 \uB2E8\uACC4 \uC0C9" })
    );
    byId("live-graph-60m").replaceChildren(
      levelBars(points, { height: BAR_HEIGHT, max, label: "\uCD5C\uADFC 1\uC2DC\uAC04 \uC778\uC6D0, \uD63C\uC7A1 \uB2E8\uACC4 \uC0C9" })
    );
    byId("live-graph-count").replaceChildren(
      countLine(points, { height: COUNT_HEIGHT, max, label: "\uCD5C\uADFC 1\uC2DC\uAC04 \uC778\uC6D0" })
    );
    byId("live-graph-flow").replaceChildren(
      flowBars(points, { height: FLOW_HEIGHT, label: "\uCD5C\uADFC 1\uC2DC\uAC04 \uC720\uC785\xB7\uC720\uCD9C" })
    );
    const totals = DIRECTIONS.map(([key, name]) => ({
      name,
      inflow: items.reduce((total, point) => total + (point.inflow?.[key] ?? 0), 0),
      outflow: items.reduce((total, point) => total + (point.outflow?.[key] ?? 0), 0)
    }));
    renderCompass(totals, cameraName, points);
    renderDirectionBars(totals);
    const hasFlow = points.some((point) => point.inflow !== null || point.outflow !== null);
    const net = totals.reduce(
      (total, direction2) => total + direction2.inflow - direction2.outflow,
      0
    );
    byId("live-net").textContent = hasFlow ? `${net > 0 ? "+" : net < 0 ? "\u2212" : ""}${formatNumber(Math.abs(net))}\uBA85` : "-";
  }
  function renderCompass(totals, cameraName, points) {
    const [north, east, south, west] = totals;
    const latest = [...points].reverse().find((point) => point.value !== null);
    const center = cell("center");
    const name = document.createElement("b");
    name.textContent = cameraName;
    const count = document.createElement("div");
    count.className = "muted";
    count.textContent = latest ? `${formatNumber(Math.round(latest.value))}\uBA85` : "-";
    center.append(name, count);
    byId("live-compass").replaceChildren(
      document.createElement("span"),
      direction(north, "\u2193", "\u2191"),
      document.createElement("span"),
      direction(west, "\u2192", "\u2190"),
      center,
      direction(east, "\u2190", "\u2192"),
      document.createElement("span"),
      direction(south, "\u2191", "\u2193"),
      document.createElement("span")
    );
  }
  function direction(total, inArrow, outArrow) {
    const box = cell("dir");
    const label = document.createElement("div");
    label.className = "muted";
    label.textContent = total.name;
    const inflow = document.createElement("div");
    inflow.className = "in";
    inflow.textContent = `${inArrow}${formatNumber(total.inflow)}`;
    const outflow = document.createElement("div");
    outflow.className = "out";
    outflow.textContent = `${outArrow}${formatNumber(total.outflow)}`;
    box.append(label, inflow, outflow);
    return box;
  }
  function renderDirectionBars(totals) {
    const max = Math.max(1, ...totals.flatMap((total) => [total.inflow, total.outflow]));
    byId("live-direction-bars").replaceChildren(
      ...totals.map((total) => {
        const row = cell("row");
        const name = document.createElement("span");
        name.className = "muted";
        name.textContent = total.name;
        const bars = cell("bars");
        bars.append(
          bar("in", total.inflow, max, `\uC720\uC785 ${formatNumber(total.inflow)}\uBA85`),
          bar("out", total.outflow, max, `\uC720\uCD9C ${formatNumber(total.outflow)}\uBA85`)
        );
        row.append(name, bars);
        return row;
      })
    );
  }
  function bar(kind, value, max, title) {
    const element = document.createElement("div");
    element.className = `bar ${kind}`;
    element.style.width = `${value / max * 100}%`;
    element.title = title;
    return element;
  }
  function cell(className) {
    const element = document.createElement("div");
    element.className = className;
    return element;
  }
  function sum(flow) {
    return flow ? Object.values(flow).reduce((total, value) => total + value, 0) : null;
  }
  var pad = (value) => String(value).padStart(2, "0");
  function toInputValue(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
  function byId(id) {
    return document.getElementById(id);
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/live/live-view.js
  var PLAYBACK_MESSAGES = {
    RECORDING_NOT_FOUND: "\uC601\uC0C1 \uC5C6\uC74C",
    RECORDING_EXPIRED: "\uBCF4\uAD00 \uAE30\uAC04 \uC9C0\uB0A8"
  };
  var LEVEL_LABELS = { 1: "\uC815\uC0C1", 2: "\uC8FC\uC758", 3: "\uC704\uD5D8" };
  var modal = null;
  var current = null;
  function initLiveView() {
    modal = document.getElementById("live-modal");
    if (!modal) {
      return;
    }
    const img = byId2("live-img");
    modal.querySelectorAll("[data-live-close]").forEach((button) => button.addEventListener("click", closeLiveView));
    modal.addEventListener("mousedown", (event) => {
      if (event.target === modal) {
        closeLiveView();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hidden) {
        closeLiveView();
      }
    });
    img.addEventListener("load", () => showNotice(""));
    img.addEventListener("error", () => {
      if (img.getAttribute("src")) {
        showNotice("\uC601\uC0C1\uC744 \uBD88\uB7EC\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4", true);
      }
    });
    byId2("live-retry").addEventListener("click", connect);
    byId2("live-playback").addEventListener("click", openPlayback);
  }
  function openLiveView(camera) {
    if (!modal) {
      return;
    }
    current = camera;
    byId2("live-cam").textContent = `CAM ${camera.id}`;
    byId2("live-name").textContent = camera.name;
    byId2("live-place").textContent = `\xB7 ${camera.regionPath} \xB7 ${camera.zoneName} \xB7 ${formatNumber(Math.round(camera.areaM2))}\u33A1`;
    renderStat(camera);
    modal.hidden = false;
    connect();
    clearLiveGraphs();
    loadLiveGraphs(camera);
  }
  function updateLiveView(cameras) {
    if (!modal || modal.hidden || !current) {
      return;
    }
    const latest = cameras.find((camera) => camera.id === current.id);
    if (latest) {
      current = latest;
      renderStat(latest);
      loadLiveGraphs(latest);
    }
  }
  function closeLiveView() {
    if (!modal || modal.hidden) {
      return;
    }
    modal.hidden = true;
    current = null;
    clearLiveGraphs();
    const img = byId2("live-img");
    img.removeAttribute("src");
  }
  function connect() {
    if (!current) {
      return;
    }
    const img = byId2("live-img");
    showNotice("\uC601\uC0C1\uC744 \uBD88\uB7EC\uC624\uB294 \uC911\u2026");
    img.hidden = false;
    img.src = `${url(`/live/${current.id}`)}?t=${Date.now()}`;
  }
  function showNotice(message, withRetry = false) {
    byId2("live-notice").hidden = message === "";
    byId2("live-notice-text").textContent = message;
    byId2("live-retry").hidden = !withRetry;
  }
  function renderStat(camera) {
    const stat = camera.stat;
    const shown = stat ? `${formatNumber(stat.currentCount ?? Math.round(stat.countAvg))}\uBA85` : "";
    bindNowCount(byId2("live-count"), camera.zoneId, stat ? shown : "-", "\uBA85");
    byId2("live-density").textContent = stat ? formatDecimal(stat.density, 2) : "-";
    const chip = byId2("live-level");
    chip.className = "chip";
    if (stat && LEVEL_LABELS[stat.level]) {
      chip.classList.add(`l${stat.level}`);
      chip.textContent = LEVEL_LABELS[stat.level];
      chip.hidden = false;
    } else {
      chip.hidden = true;
    }
    byId2("live-level-none").hidden = !chip.hidden;
    bindNowCount(byId2("live-count-badge"), camera.zoneId, shown, "\uBA85");
  }
  async function openPlayback() {
    if (!current) {
      return;
    }
    try {
      const found = await get(
        "/api/v1/playback",
        { zoneId: current.zoneId, latest: true },
        { toast: false }
      );
      window.location.href = `${url("/playback")}?zoneId=${current.zoneId}&at=${encodeURIComponent(found.startedAt)}`;
    } catch (error) {
      if (error instanceof ApiError && error.status !== 401) {
        showToast(PLAYBACK_MESSAGES[error.code] ?? error.message);
      }
    }
  }
  function byId2(id) {
    return document.getElementById(id);
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/admin/pages/cameras.js
  var POLL_INTERVAL_MS = 3e3;
  var STREAM_DEBOUNCE_MS = 300;
  var STATUS = {
    STOPPED: { label: "\uC815\uC9C0", chip: "off" },
    PREPARING: { label: "\uC900\uBE44 \uC911", chip: "prep" },
    RUNNING: { label: "\uAC00\uB3D9 \uC911", chip: "run" },
    ERROR: { label: "\uC624\uB958", chip: "err" }
  };
  var SOURCE_TYPE = { DUMMY: "\uB354\uBBF8", LIVE: "\uB77C\uC774\uBE0C" };
  var NOT_STOPPED_HINT = "\uC815\uC9C0 \uC0C1\uD0DC\uC5D0\uC11C\uB9CC \uACE0\uCE60 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uBA3C\uC800 \uC815\uC9C0\uD574 \uC8FC\uC138\uC694.";
  var rowsEl = document.getElementById("camera-rows");
  var emptyEl = document.getElementById("camera-empty");
  var summaryEl = document.getElementById("camera-summary");
  var deleteModal = document.getElementById("camera-delete-modal");
  var deleteConfirm = document.getElementById("camera-delete-confirm");
  var pollTimer = null;
  var loading = false;
  var streamTimer = null;
  var deleteTarget = null;
  var deleting = false;
  window.addEventListener("we:camera-status", () => {
    window.clearTimeout(streamTimer);
    streamTimer = window.setTimeout(loadCameras, STREAM_DEBOUNCE_MS);
  });
  async function loadCameras() {
    if (loading) {
      return;
    }
    loading = true;
    try {
      const cameras = await get("/api/v1/manage/cameras", void 0, { toast: false });
      render3(cameras);
      updateLiveView(cameras);
      schedulePoll(cameras.some((camera) => camera.status === "PREPARING"));
    } catch (error) {
      if (!rowsEl.hasChildNodes()) {
        summaryEl.textContent = "\uBAA9\uB85D\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.";
      }
      showToast(error.message);
      schedulePoll(rowsEl.querySelector('[data-status="PREPARING"]') !== null);
    } finally {
      loading = false;
    }
  }
  function schedulePoll(preparing) {
    window.clearTimeout(pollTimer);
    pollTimer = preparing ? window.setTimeout(loadCameras, POLL_INTERVAL_MS) : null;
  }
  function render3(cameras) {
    rowsEl.replaceChildren(...cameras.map(buildRow));
    emptyEl.hidden = cameras.length > 0;
    const count = (status) => cameras.filter((camera) => camera.status === status).length;
    summaryEl.textContent = `\uCD1D ${cameras.length}\uB300 \xB7 \uAC00\uB3D9 ${count("RUNNING")} \xB7 \uC900\uBE44 ${count("PREPARING")} \xB7 \uC624\uB958 ${count("ERROR")}`;
  }
  function buildRow(camera) {
    const row = el("div", "tr");
    row.setAttribute("role", "row");
    row.dataset.id = camera.id;
    row.dataset.status = camera.status;
    row.append(
      cell2(textWithSmall(camera.zoneName, camera.regionPath)),
      cell2(textWithSmall(camera.name, camera.sourceUri)),
      cell2(SOURCE_TYPE[camera.sourceType] ?? camera.sourceType),
      cell2(statusChip(camera.status)),
      cell2(progressCell(camera)),
      cell2(errorCell(camera)),
      cell2(actions(camera))
    );
    return row;
  }
  function statusChip(status) {
    const info = STATUS[status] ?? { label: status, chip: "off" };
    return el("span", `chip ${info.chip}`, info.label);
  }
  function progressCell(camera) {
    if (camera.status !== "PREPARING") {
      return el("span", "muted", "-");
    }
    const percent = Math.max(0, Math.min(100, camera.progress ?? 0));
    const wrap = el("div", "cam-progress");
    const bar2 = el("div", "progress");
    bar2.setAttribute("role", "progressbar");
    bar2.setAttribute("aria-valuenow", String(percent));
    bar2.setAttribute("aria-valuemin", "0");
    bar2.setAttribute("aria-valuemax", "100");
    const fill = document.createElement("i");
    fill.style.width = `${percent}%`;
    bar2.append(fill);
    wrap.append(bar2, el("span", "muted", `${percent}%`));
    return wrap;
  }
  var RUN_PENDING_HINT = "\uAC00\uB3D9 \uC694\uCCAD \uCC98\uB9AC \uC911\uC785\uB2C8\uB2E4. \uC7A0\uC2DC \uB4A4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uAC70\uB098 \uC815\uC9C0\uD574 \uC8FC\uC138\uC694";
  function errorCell(camera) {
    if (camera.errorMessage) {
      return el("span", "cam-error", camera.errorMessage);
    }
    return isRunPending(camera) ? el("span", "muted cam-pending", RUN_PENDING_HINT) : "";
  }
  function isRunPending(camera) {
    return camera.status === "STOPPED" && camera.runRequested;
  }
  function actions(camera) {
    const wrap = el("div", "row-actions");
    wrap.append(liveButton(camera), editButton(camera));
    if (camera.status === "STOPPED") {
      wrap.append(actionButton("\uAC00\uB3D9", "primary", camera, "start"));
    }
    if (camera.status === "ERROR") {
      wrap.append(actionButton("\uB2E4\uC2DC \uC2DC\uC791", "primary", camera, "start"));
    }
    if (camera.status !== "STOPPED" || camera.runRequested) {
      wrap.append(actionButton("\uC815\uC9C0", "secondary", camera, "stop"));
    }
    wrap.append(deleteButton(camera));
    return wrap;
  }
  function deleteButton(camera) {
    const button = el("button", "btn danger sm", "\uC0AD\uC81C");
    button.type = "button";
    button.disabled = camera.status !== "STOPPED" || camera.runRequested;
    if (isRunPending(camera)) {
      button.title = RUN_PENDING_HINT;
    }
    button.addEventListener("click", () => openDeleteModal(camera));
    return button;
  }
  function liveButton(camera) {
    const button = el("button", "btn secondary sm", "\uC2E4\uC2DC\uAC04 \uBCF4\uAE30");
    button.type = "button";
    button.disabled = camera.status !== "RUNNING";
    button.addEventListener("click", () => openLiveView(camera));
    return button;
  }
  function editButton(camera) {
    const button = el("button", "btn secondary sm", "\uC218\uC815");
    button.type = "button";
    const editable = camera.status === "STOPPED" && !camera.runRequested;
    button.disabled = !editable;
    if (!editable) {
      button.title = isRunPending(camera) ? RUN_PENDING_HINT : NOT_STOPPED_HINT;
    }
    button.addEventListener("click", () => cameraForm.openEdit(camera));
    return button;
  }
  function actionButton(label, variant, camera, action) {
    const button = el("button", `btn ${variant} sm`, label);
    button.type = "button";
    button.addEventListener("click", () => runAction(button, camera, action));
    return button;
  }
  async function runAction(button, camera, action) {
    const buttons = button.closest(".row-actions").querySelectorAll("button");
    buttons.forEach((each) => each.disabled = true);
    try {
      const result = await post(`/api/v1/manage/cameras/${camera.id}/${action}`);
      if (action === "stop" && result?.warning) {
        showToast(result.warning);
      }
    } catch {
    }
    await loadCameras();
  }
  function openDeleteModal(camera) {
    deleteTarget = camera;
    deleteConfirm.disabled = false;
    deleteModal.hidden = false;
    deleteConfirm.focus();
  }
  function closeDeleteModal() {
    if (deleting) {
      return;
    }
    deleteModal.hidden = true;
    deleteTarget = null;
  }
  async function confirmDelete() {
    if (!deleteTarget || deleting) {
      return;
    }
    const camera = deleteTarget;
    deleting = true;
    deleteConfirm.disabled = true;
    try {
      await del(`/api/v1/manage/cameras/${camera.id}`);
      showToast("\uCEA0\uC744 \uC0AD\uC81C\uD588\uC2B5\uB2C8\uB2E4.");
    } catch {
    }
    deleting = false;
    closeDeleteModal();
    await loadCameras();
  }
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    if (text !== void 0) {
      node.textContent = text;
    }
    return node;
  }
  function cell2(content) {
    const node = el("div");
    node.setAttribute("role", "cell");
    node.append(content);
    return node;
  }
  function textWithSmall(main, sub) {
    const fragment = document.createDocumentFragment();
    fragment.append(main ?? "");
    if (sub) {
      fragment.append(el("small", void 0, sub));
    }
    return fragment;
  }
  initLiveView();
  var cameraForm = initCameraForm({ onSaved: loadCameras });
  document.getElementById("camera-add").addEventListener("click", () => cameraForm.openRegister());
  deleteModal.querySelectorAll("[data-delete-close]").forEach((button) => button.addEventListener("click", closeDeleteModal));
  deleteModal.addEventListener("mousedown", (event) => {
    if (event.target === deleteModal) {
      closeDeleteModal();
    }
  });
  deleteConfirm.addEventListener("click", confirmDelete);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !deleteModal.hidden) {
      closeDeleteModal();
    }
  });
  loadCameras();
})();
