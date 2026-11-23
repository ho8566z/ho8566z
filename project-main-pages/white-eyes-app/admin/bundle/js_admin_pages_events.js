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
  function patch(path, body, options) {
    return request("PATCH", path, { body, ...options });
  }
  function download(path, params, options) {
    return request("GET", path, { params, ...options, file: true });
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

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/common/format.js
  var pad = (value) => String(value).padStart(2, "0");
  function isBlank(value) {
    return value === null || value === void 0 || value === "" || Number.isNaN(Number(value));
  }
  function formatDateTime(value) {
    if (value === null || value === void 0 || value === "") {
      return "-";
    }
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "-";
    }
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
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

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/admin/event-action.js
  var NOTE_MAX_LENGTH = 200;
  var OTHER_CODE = "OTHER";
  var modal = document.getElementById("action-modal");
  var form = document.getElementById("action-form");
  var subtitle = document.getElementById("action-sub");
  var noteInput = document.getElementById("action-note");
  var noteCount = document.getElementById("action-note-count");
  var saveButton = document.getElementById("action-save");
  var current = null;
  var opener = null;
  var saving = false;
  var CHANGE_SAVED = "saved";
  var CHANGE_CONFLICT = "conflict";
  var CHANGE_FAILED = "failed";
  var STATUS_CONFLICT = 409;
  async function requestStatusChange(eventId, body) {
    try {
      await patch(`/api/v1/events/${eventId}/status`, body);
      return CHANGE_SAVED;
    } catch (error) {
      if (error instanceof ApiError) {
        return error.status === STATUS_CONFLICT ? CHANGE_CONFLICT : CHANGE_FAILED;
      }
      throw error;
    }
  }
  function openActionDialog(target, onDone) {
    current = { ...target, onDone };
    opener = target.opener ?? null;
    form.reset();
    subtitle.textContent = target.summary;
    updateState();
    modal.hidden = false;
    form.focus();
  }
  function isActionDialogOpen() {
    return !modal.hidden;
  }
  function closeActionDialog() {
    modal.hidden = true;
    current = null;
    if (opener?.isConnected) {
      opener.focus();
    }
    opener = null;
  }
  function selectedCode() {
    return form.querySelector('input[name="actionCode"]:checked')?.value ?? null;
  }
  function updateState() {
    const code = selectedCode();
    const note = noteInput.value.trim();
    noteCount.textContent = `${noteInput.value.length} / ${NOTE_MAX_LENGTH}`;
    saveButton.disabled = saving || code === null || code === OTHER_CODE && note === "";
  }
  async function save() {
    if (saveButton.disabled || current === null) {
      return;
    }
    const { eventId, expectedStatus, onDone } = current;
    const note = noteInput.value.trim();
    saving = true;
    updateState();
    const body = {
      expectedStatus,
      status: "RESOLVED",
      actionCode: selectedCode(),
      actionNote: note === "" ? null : note
    };
    let result;
    try {
      result = await requestStatusChange(eventId, body);
    } finally {
      saving = false;
    }
    if (result !== CHANGE_FAILED) {
      closeActionDialog();
      onDone();
    } else {
      updateState();
    }
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    save();
  });
  form.addEventListener("change", updateState);
  noteInput.addEventListener("input", updateState);
  modal.querySelectorAll("[data-action-close]").forEach((button) => {
    button.addEventListener("click", closeActionDialog);
  });
  modal.addEventListener("mousedown", (event) => {
    if (event.target === modal) {
      closeActionDialog();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isActionDialogOpen()) {
      closeActionDialog();
    }
  });

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/admin/playback/model.js
  var MINUTE = 60 * 1e3;
  var HOUR = 60 * MINUTE;
  var DAY = 24 * HOUR;
  var KST_OFFSET = 9 * HOUR;
  var RANGE_MS = { "30m": 30 * MINUTE, "1h": HOUR, "3h": 3 * HOUR };
  var pad2 = (value) => String(value).padStart(2, "0");
  function kstParts(ms) {
    const date = new Date(ms + KST_OFFSET);
    return {
      year: date.getUTCFullYear(),
      month: pad2(date.getUTCMonth() + 1),
      day: pad2(date.getUTCDate()),
      hour: pad2(date.getUTCHours()),
      minute: pad2(date.getUTCMinutes()),
      second: pad2(date.getUTCSeconds())
    };
  }
  function formatClock(ms) {
    const p = kstParts(ms);
    return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}`;
  }
  function formatHm(ms) {
    const p = kstParts(ms);
    return `${p.hour}:${p.minute}`;
  }
  function toKstIso(ms) {
    const p = kstParts(ms);
    return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}+09:00`;
  }
  function minuteStart(ms) {
    return Math.floor(ms / MINUTE) * MINUTE;
  }
  function windowFor(rangeKey, center) {
    if (rangeKey === "today") {
      const dayStart = Math.floor((center + KST_OFFSET) / DAY) * DAY - KST_OFFSET;
      return { from: dayStart, to: dayStart + DAY };
    }
    const span = RANGE_MS[rangeKey] ?? RANGE_MS["1h"];
    const from = minuteStart(center - span / 2);
    return { from, to: from + span };
  }
  function fraction(ms, from, to) {
    return Math.min(1, Math.max(0, (ms - from) / (to - from)));
  }
  function normalizeSeries(items) {
    const sum = (flow) => flow ? Object.values(flow).reduce((total, value) => total + (Number(value) || 0), 0) : 0;
    return items.filter((item) => item.sampleSec !== 0).map((item) => ({
      at: minuteStart(Date.parse(item.at)),
      countAvg: item.countAvg,
      countMax: item.countMax,
      countMin: item.countMin,
      density: item.density,
      level: item.level,
      inflow: sum(item.inflow),
      outflow: sum(item.outflow),
      sampleSec: item.sampleSec
    })).filter((item) => !Number.isNaN(item.at)).sort((first, second) => first.at - second.at);
  }
  var CHART_HEADROOM = 1.1;
  var METRICS = {
    count: { line: "countAvg", low: "countMin", high: "countMax" },
    density: { line: "density" },
    flow: { line: "inflow", second: "outflow" }
  };
  function buildChart(items, metricKey, from, to, width, height, thresholds = []) {
    const metric = METRICS[metricKey] ?? METRICS.count;
    const visible = items.filter((item) => item.at >= from && item.at <= to);
    const keys = [metric.line, metric.second, metric.high].filter(Boolean);
    const dataMax = Math.max(
      0,
      ...visible.flatMap((item) => keys.map((key) => Number(item[key]) || 0))
    );
    const max = (dataMax || 1) * CHART_HEADROOM;
    const x = (ms) => fraction(ms, from, to) * width;
    const y = (value) => height - Math.max(0, Number(value) || 0) / max * height;
    const lineKeys = [metric.line, metric.second].filter(Boolean);
    const lines = lineKeys.map((key) => ({
      key,
      segments: splitSegments(visible, (item) => [x(item.at), y(item[key])])
    }));
    let band = null;
    if (metric.low && visible.length > 0) {
      const upper = visible.map((item) => [x(item.at), y(item[metric.high])]);
      const lower = visible.map((item) => [x(item.at), y(item[metric.low])]).reverse();
      band = [...upper, ...lower];
    }
    const guides = visible.length === 0 ? [] : thresholds.filter((t) => Number(t.value) > 0 && Number(t.value) <= max).map((t) => ({ key: t.key, y: y(t.value) }));
    return { lines, band, guides, max };
  }
  function splitSegments(items, toPoint) {
    const segments = [];
    let current2 = [];
    let previous = null;
    for (const item of items) {
      if (previous !== null && item.at - previous > 2 * MINUTE) {
        segments.push(current2);
        current2 = [];
      }
      current2.push(toPoint(item));
      previous = item.at;
    }
    if (current2.length > 0) {
      segments.push(current2);
    }
    return segments;
  }
  function toPath(points) {
    if (points.length === 0) {
      return "";
    }
    const list = points.length === 1 ? [points[0], [points[0][0] + 0.5, points[0][1]]] : points;
    return list.map(([px, py], index) => `${index === 0 ? "M" : "L"}${px.toFixed(1)} ${py.toFixed(1)}`).join(" ");
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/admin/playback/boxes.js
  function parseFrames(json) {
    if (!json || !Array.isArray(json.frames)) {
      return null;
    }
    const frames = json.frames.filter((frame) => frame && Number.isFinite(frame.t) && Array.isArray(frame.b)).map((frame) => ({ t: frame.t, boxes: frame.b.map(toBox).filter((box) => box !== null) })).sort((a, b) => a.t - b.t);
    return frames.length > 0 ? frames : null;
  }
  function toBox(entry) {
    if (!Array.isArray(entry) || entry.length < 5) {
      return null;
    }
    const [id, x, y, w, h] = entry;
    if (![x, y, w, h].every(Number.isFinite)) {
      return null;
    }
    return { id: Number.isFinite(id) ? id : null, x, y, w, h };
  }
  function findFrame(frames, position) {
    let low = 0;
    let high = frames.length - 1;
    let found = -1;
    while (low <= high) {
      const mid = low + high >> 1;
      if (frames[mid].t <= position) {
        found = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return found === -1 ? null : frames[found];
  }
  function containRect(boxWidth, boxHeight, videoWidth, videoHeight) {
    if (!(videoWidth > 0 && videoHeight > 0 && boxWidth > 0 && boxHeight > 0)) {
      return null;
    }
    const scale = Math.min(boxWidth / videoWidth, boxHeight / videoHeight);
    const width = videoWidth * scale;
    const height = videoHeight * scale;
    return { x: (boxWidth - width) / 2, y: (boxHeight - height) / 2, width, height };
  }
  function toPixels(boxes, area) {
    return boxes.map((box) => ({
      x: area.x + box.x * area.width,
      y: area.y + box.y * area.height,
      w: box.w * area.width,
      h: box.h * area.height
    }));
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/admin/event-video.js
  var NOTICE_MESSAGES = {
    RECORDING_NOT_FOUND: "\uC601\uC0C1 \uC5C6\uC74C",
    RECORDING_EXPIRED: "\uBCF4\uAD00 \uAE30\uAC04 \uC9C0\uB0A8"
  };
  var NOTICE_LOADING = "\uBD88\uB7EC\uC624\uB294 \uC911\u2026";
  var NOTICE_FAILED = "\uC601\uC0C1\uC744 \uBD88\uB7EC\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.";
  var BOX_COLOR = "#5ee0b5";
  var CHART_WIDTH = 600;
  var CHART_HEIGHT = 34;
  var CHART_RANGE = "1h";
  var section = document.getElementById("detail-video");
  var video = document.getElementById("detail-video-player");
  var boxCanvas = document.getElementById("detail-video-boxes");
  var notice = document.getElementById("detail-video-notice");
  var boxNote = document.getElementById("detail-video-box-note");
  var feedLabel = document.getElementById("detail-video-label");
  var chartLine = document.getElementById("detail-video-line");
  var chartRange = document.getElementById("detail-video-range");
  var chartMark = document.getElementById("detail-video-mark");
  var chartEmpty = document.getElementById("detail-video-chart-empty");
  var axis = document.getElementById("detail-video-axis");
  var playbackLink = document.getElementById("detail-open-playback");
  var openSeq = 0;
  var boxFrames = null;
  var boxLoopArmed = false;
  function openEventVideo(detail) {
    closeEventVideo();
    const seq = openSeq;
    showLink(detail);
    section.hidden = !detail.playbackAvailable;
    if (!detail.playbackAvailable) {
      return;
    }
    const startedAt = Date.parse(detail.startedAt);
    showNotice(NOTICE_LOADING);
    loadVideo(detail.zoneId, startedAt, seq);
    loadChart(detail, startedAt, seq);
  }
  function closeEventVideo() {
    openSeq++;
    video.pause();
    video.hidden = true;
    video.removeAttribute("src");
    video.load();
    boxFrames = null;
    drawBoxes();
    boxNote.hidden = true;
    feedLabel.hidden = true;
    resetChart();
  }
  function showLink(detail) {
    playbackLink.hidden = detail.type === "CAM_FAULT";
    if (detail.playbackAvailable) {
      const query = new URLSearchParams({ zoneId: String(detail.zoneId), at: detail.startedAt });
      playbackLink.href = url(`/playback?${query.toString()}`);
      playbackLink.removeAttribute("aria-disabled");
    } else {
      playbackLink.removeAttribute("href");
      playbackLink.setAttribute("aria-disabled", "true");
    }
  }
  function showNotice(message) {
    notice.textContent = message;
    notice.hidden = false;
  }
  async function loadVideo(zoneId, startedAt, seq) {
    try {
      const found = await get(
        "/api/v1/playback",
        { zoneId, at: toKstIso(startedAt) },
        { toast: false }
      );
      if (seq !== openSeq) {
        return;
      }
      notice.hidden = true;
      video.hidden = false;
      feedLabel.hidden = false;
      feedLabel.textContent = `\uB179\uD654 \xB7 ${formatClock(startedAt)}`;
      video.addEventListener(
        "loadedmetadata",
        () => {
          video.currentTime = found.seekSec;
          video.play().catch(() => {
          });
        },
        { once: true }
      );
      video.src = found.videoUrl;
      loadBoxes(found.boxesUrl, seq);
    } catch (error) {
      if (seq === openSeq) {
        showNotice(
          error instanceof ApiError && NOTICE_MESSAGES[error.code] ? NOTICE_MESSAGES[error.code] : NOTICE_FAILED
        );
      }
    }
  }
  async function loadBoxes(boxesUrl, seq) {
    let frames = null;
    try {
      frames = parseFrames(await get(boxesUrl, void 0, { absolute: true, toast: false }));
    } catch {
      frames = null;
    }
    if (seq !== openSeq) {
      return;
    }
    boxFrames = frames;
    boxNote.hidden = frames !== null;
    drawBoxes();
    armBoxLoop();
  }
  function drawBoxes() {
    const context = boxCanvas.getContext("2d");
    const ratio = window.devicePixelRatio || 1;
    const width = boxCanvas.clientWidth;
    const height = boxCanvas.clientHeight;
    if (boxCanvas.width !== Math.round(width * ratio) || boxCanvas.height !== Math.round(height * ratio)) {
      boxCanvas.width = Math.round(width * ratio);
      boxCanvas.height = Math.round(height * ratio);
    }
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    if (boxFrames === null || video.hidden) {
      return;
    }
    const area = containRect(width, height, video.videoWidth, video.videoHeight);
    const frame = findFrame(boxFrames, video.currentTime);
    if (!area || !frame) {
      return;
    }
    context.strokeStyle = BOX_COLOR;
    context.lineWidth = 1.5;
    toPixels(frame.boxes, area).forEach((box) => context.strokeRect(box.x, box.y, box.w, box.h));
  }
  function armBoxLoop() {
    if (boxLoopArmed || boxFrames === null) {
      return;
    }
    boxLoopArmed = true;
    const tick = () => {
      boxLoopArmed = false;
      drawBoxes();
      armBoxLoop();
    };
    if ("requestVideoFrameCallback" in video) {
      video.requestVideoFrameCallback(tick);
    } else {
      window.requestAnimationFrame(tick);
    }
  }
  ["seeked", "loadedmetadata", "pause", "play"].forEach(
    (name) => video.addEventListener(name, drawBoxes)
  );
  new ResizeObserver(drawBoxes).observe(document.getElementById("detail-video-feed"));
  video.addEventListener("error", () => {
    if (!video.hidden) {
      video.hidden = true;
      showNotice(NOTICE_FAILED);
    }
  });
  async function loadChart(detail, startedAt, seq) {
    const { from, to } = windowFor(CHART_RANGE, startedAt);
    axis.replaceChildren(
      axisLabel(formatHm(from)),
      axisLabel(`\uBC1C\uC0DD ${formatHm(startedAt)}`),
      axisLabel(formatHm(to))
    );
    placeEvent(detail, startedAt, from, to);
    let items = [];
    try {
      const result = await get(
        "/api/v1/stats/series",
        {
          targetType: "ZONE",
          targetId: detail.zoneId,
          interval: "1m",
          from: toKstIso(from),
          to: toKstIso(to)
        },
        { toast: false }
      );
      items = normalizeSeries(result?.items ?? []);
    } catch {
      items = [];
    }
    if (seq !== openSeq) {
      return;
    }
    const shape = buildChart(items, "count", from, to, CHART_WIDTH, CHART_HEIGHT);
    chartLine.setAttribute("d", shape.lines[0].segments.map(toPath).join(" "));
    chartEmpty.hidden = items.length > 0;
  }
  function placeEvent(detail, startedAt, from, to) {
    const endedAt = detail.endedAt ? Date.parse(detail.endedAt) : to;
    const start = fraction(startedAt, from, to);
    chartRange.style.left = `${start * 100}%`;
    chartRange.style.width = `${(fraction(endedAt, from, to) - start) * 100}%`;
    chartMark.style.left = `${start * 100}%`;
  }
  function resetChart() {
    chartLine.setAttribute("d", "");
    chartRange.style.width = "0";
    chartEmpty.hidden = true;
    axis.replaceChildren();
  }
  function axisLabel(text) {
    const label = document.createElement("span");
    label.textContent = text;
    return label;
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/admin/pages/events.js
  var PAGE_SIZE = 20;
  var KEYWORD_DEBOUNCE_MS = 300;
  var KST_OFFSET2 = "+09:00";
  var PAGE_BUTTON_WINDOW = 2;
  var TYPE_LABEL = { CONGESTION: "\uD63C\uC7A1", SURGE: "\uAE09\uC99D", CAM_FAULT: "\uCEA0 \uC774\uC0C1" };
  var STATUS = {
    UNCHECKED: { label: "\uBBF8\uD655\uC778", chip: "unread" },
    CHECKED: { label: "\uD655\uC778 \uC911", chip: "review" },
    RESOLVED: { label: "\uC870\uCE58\uC644\uB8CC", chip: "done" }
  };
  var LEVEL_CHIP = { 2: "l2", 3: "l3" };
  var ACTION_LABEL = {
    ONSITE_OK: "\uD604\uC7A5 \uD655\uC778\xB7\uC815\uC0C1",
    STAFF: "\uC778\uB825 \uBC30\uCE58",
    FALSE_ALARM: "\uC624\uD0D0",
    CAM_CHECK: "\uCEA0 \uC810\uAC80 \uC694\uCCAD",
    OTHER: "\uAE30\uD0C0"
  };
  var form2 = document.getElementById("event-filter");
  var fromInput = document.getElementById("filter-from");
  var toInput = document.getElementById("filter-to");
  var statusSelect = document.getElementById("filter-status");
  var typeSelect = document.getElementById("filter-type");
  var keywordInput = document.getElementById("filter-keyword");
  var detailToggle = document.getElementById("filter-detail-toggle");
  var detailPanel = document.getElementById("filter-detail");
  var rowsEl = document.getElementById("event-rows");
  var emptyEl = document.getElementById("event-empty");
  var totalEl = document.getElementById("event-total");
  var pagesEl = document.getElementById("event-pages");
  var summaryTotalLabel = document.getElementById("summary-total-label");
  var exportButton = document.getElementById("export-button");
  var detailModal = document.getElementById("detail-modal");
  var detailTypeChip = document.getElementById("detail-type-chip");
  var detailTitle = document.getElementById("detail-title");
  var detailStatusChip = document.getElementById("detail-status-chip");
  var detailInfo = document.getElementById("detail-info");
  var detailHistories = document.getElementById("detail-histories");
  var page = 0;
  var requestSeq = 0;
  var keywordTimer = null;
  var levelNames = {};
  var detailSeq = 0;
  var detailOpener = null;
  init();
  async function init() {
    const requestedEventId = readRequestedEventId();
    restoreFilters();
    bindFilters();
    bindDetail();
    await loadLevelNames();
    await refresh();
    if (requestedEventId !== null) {
      openDetail(requestedEventId);
    }
    bindNotifications();
  }
  function readRequestedEventId() {
    const eventId = Number(new URLSearchParams(window.location.search).get("eventId"));
    return Number.isInteger(eventId) && eventId > 0 ? eventId : null;
  }
  function bindNotifications() {
    window.addEventListener("we:event-created", () => {
      if (page === 0) {
        refresh();
      }
    });
  }
  function restoreFilters() {
    const params = new URLSearchParams(window.location.search);
    const today = formatDate(/* @__PURE__ */ new Date());
    fromInput.value = params.get("from") || today;
    toInput.value = params.get("to") || today;
    statusSelect.value = params.get("status") || "";
    typeSelect.value = params.get("type") || "";
    keywordInput.value = params.get("keyword") || "";
    page = Math.max(0, Number(params.get("page")) || 0);
    setDetailOpen(params.has("from") || params.has("to") || params.has("type"));
  }
  function setDetailOpen(open) {
    detailPanel.hidden = !open;
    detailToggle.setAttribute("aria-expanded", String(open));
  }
  function bindFilters() {
    form2.addEventListener("submit", (event) => event.preventDefault());
    detailToggle.addEventListener("click", () => setDetailOpen(detailPanel.hidden));
    for (const control of [fromInput, toInput, statusSelect, typeSelect]) {
      control.addEventListener("change", () => applyFilters());
    }
    keywordInput.addEventListener("input", () => {
      window.clearTimeout(keywordTimer);
      keywordTimer = window.setTimeout(applyFilters, KEYWORD_DEBOUNCE_MS);
    });
  }
  exportButton.addEventListener("click", downloadExcel);
  async function downloadExcel() {
    exportButton.disabled = true;
    const query = commonQuery();
    if (statusSelect.value) {
      query.append("statuses", statusSelect.value);
    }
    try {
      const { blob, fileName } = await download("/api/v1/events/export", [...query.entries()]);
      saveFile(blob, fileName ?? "events.xlsx");
    } catch (error) {
      console.error(error);
    } finally {
      exportButton.disabled = false;
    }
  }
  function saveFile(blob, fileName) {
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fileName;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  }
  function applyFilters() {
    page = 0;
    refresh();
  }
  function periodParams() {
    const params = {};
    if (fromInput.value) {
      params.from = `${fromInput.value}T00:00:00${KST_OFFSET2}`;
    }
    if (toInput.value) {
      params.to = `${addDays(toInput.value, 1)}T00:00:00${KST_OFFSET2}`;
    }
    return params;
  }
  function commonQuery() {
    const params = new URLSearchParams(periodParams());
    if (typeSelect.value) {
      params.append("types", typeSelect.value);
    }
    const keyword = keywordInput.value.trim();
    if (keyword) {
      params.set("keyword", keyword);
    }
    return params;
  }
  function saveFiltersToUrl() {
    const params = new URLSearchParams();
    params.set("from", fromInput.value);
    params.set("to", toInput.value);
    if (statusSelect.value) {
      params.set("status", statusSelect.value);
    }
    if (typeSelect.value) {
      params.set("type", typeSelect.value);
    }
    if (keywordInput.value.trim()) {
      params.set("keyword", keywordInput.value.trim());
    }
    if (page > 0) {
      params.set("page", String(page));
    }
    window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
  }
  async function refresh() {
    const seq = ++requestSeq;
    saveFiltersToUrl();
    const listQuery = commonQuery();
    if (statusSelect.value) {
      listQuery.append("statuses", statusSelect.value);
    }
    listQuery.set("page", String(page));
    listQuery.set("size", String(PAGE_SIZE));
    try {
      const [list, summary] = await Promise.all([
        get("/api/v1/events", Object.fromEntries(listQuery)),
        get("/api/v1/events/summary", Object.fromEntries(commonQuery()), { toast: false })
      ]);
      if (seq !== requestSeq) {
        return;
      }
      renderSummary(summary);
      renderList(list);
    } catch {
      if (seq === requestSeq) {
        clearResult();
        totalEl.textContent = "\uBAA9\uB85D\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.";
      }
    }
  }
  function clearResult() {
    rowsEl.replaceChildren();
    emptyEl.hidden = true;
    pagesEl.replaceChildren();
    for (const id of [
      "summary-total",
      "summary-unchecked",
      "summary-checked",
      "summary-resolved"
    ]) {
      document.getElementById(id).textContent = "-";
    }
  }
  async function loadLevelNames() {
    try {
      const levels = await get("/api/v1/meta/levels", void 0, { toast: false });
      levelNames = Object.fromEntries(levels.map((level) => [level.level, level.name]));
    } catch {
      levelNames = {};
    }
  }
  function renderSummary(summary) {
    summaryTotalLabel.textContent = fromInput.value === toInput.value && fromInput.value === formatDate(/* @__PURE__ */ new Date()) ? "\uC804\uCCB4 (\uC624\uB298)" : "\uC804\uCCB4";
    document.getElementById("summary-total").textContent = formatNumber(summary.total);
    document.getElementById("summary-unchecked").textContent = formatNumber(summary.unchecked);
    document.getElementById("summary-checked").textContent = formatNumber(summary.checked);
    document.getElementById("summary-resolved").textContent = formatNumber(summary.resolved);
  }
  function renderList(result) {
    rowsEl.replaceChildren(...result.items.map(buildRow));
    emptyEl.hidden = result.items.length > 0;
    totalEl.textContent = `\uCD1D ${formatNumber(result.totalElements)}\uAC74`;
    renderPages(result.page, result.totalPages);
  }
  function buildRow(event) {
    const row = el("div", "tr ev-row");
    row.setAttribute("role", "row");
    row.tabIndex = 0;
    row.dataset.eventId = event.id;
    row.append(
      cell(textWithSmall(formatDateTime(event.startedAt), endedText(event))),
      cell(typeChip(event)),
      cell(textWithSmall(event.zoneName, regionAndCamera(event))),
      cell(textWithSmall(valueText(event), peakCountText(event))),
      cell(document.createTextNode(durationText(event.durationSec))),
      cell(statusChip(event.status)),
      cell(actionControls(event))
    );
    return row;
  }
  function actionControls(event) {
    const box = el("div", "ev-actions");
    if (event.status === "RESOLVED") {
      box.append(el("span", "muted ev-handled", "\uCC98\uB9AC\uB428"));
      return box;
    }
    if (event.status === "UNCHECKED") {
      const check = el("button", "btn secondary sm", "\uD655\uC778");
      check.type = "button";
      check.addEventListener("click", () => markChecked(event, check));
      box.append(check);
    }
    const resolve = el("button", "btn primary sm", "\uC870\uCE58\uD558\uAE30");
    resolve.type = "button";
    resolve.addEventListener("click", () => {
      openActionDialog(actionTarget(event, resolve), refresh);
    });
    box.append(resolve);
    return box;
  }
  async function markChecked(event, button) {
    button.disabled = true;
    await requestStatusChange(event.id, { expectedStatus: event.status, status: "CHECKED" });
    await refresh();
  }
  function actionTarget(event, opener2) {
    const place = [event.zoneName, event.cameraName].filter(Boolean).join(" \xB7 ");
    return {
      eventId: event.id,
      expectedStatus: event.status,
      summary: `${place} \xB7 ${formatDateTime(event.startedAt).slice(11)} \xB7 ${peakTitle(event)}`,
      opener: opener2
    };
  }
  function endedText(event) {
    if (event.ongoing) {
      return "\uC9C4\uD589 \uC911";
    }
    const started = formatDateTime(event.startedAt);
    const ended = formatDateTime(event.endedAt);
    return `${started.slice(0, 10) === ended.slice(0, 10) ? ended.slice(11) : ended} \uC885\uB8CC`;
  }
  function typeChip(event) {
    const chipClass = event.type === "CONGESTION" ? LEVEL_CHIP[event.peakLevel] ?? "l2" : event.type === "SURGE" ? "surge" : "cam";
    return el("span", `chip ${chipClass}`, TYPE_LABEL[event.type] ?? event.type);
  }
  function regionAndCamera(event) {
    return [event.regionPath, event.cameraName].filter(Boolean).join(" \xB7 ");
  }
  function valueText(event) {
    if (event.type === "CONGESTION") {
      const levelName = levelNames[event.peakLevel] ?? `${event.peakLevel}\uB2E8\uACC4`;
      return `${levelName} \xB7 ${formatDecimal(event.peakValue, 2)}\uBA85/\u33A1`;
    }
    if (event.type === "SURGE") {
      return `+${formatDecimal(event.peakValue, 0)}%`;
    }
    return "-";
  }
  function peakCountText(event) {
    return event.peakCount === null || event.peakCount === void 0 ? "" : `\uCD5C\uACE0 ${formatNumber(event.peakCount)}\uBA85`;
  }
  function durationText(seconds) {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 1) {
      return `${seconds}\uCD08`;
    }
    if (minutes < 60) {
      return `${minutes}\uBD84`;
    }
    const rest = minutes % 60;
    return rest === 0 ? `${Math.floor(minutes / 60)}\uC2DC\uAC04` : `${Math.floor(minutes / 60)}\uC2DC\uAC04 ${rest}\uBD84`;
  }
  function statusChip(status) {
    const info = STATUS[status] ?? { label: status, chip: "off" };
    return el("span", `chip ${info.chip}`, info.label);
  }
  function bindDetail() {
    rowsEl.addEventListener("click", (event) => openDetailOf(event.target));
    rowsEl.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        openDetailOf(event.target);
      }
    });
    detailModal.querySelectorAll("[data-close]").forEach((button) => button.addEventListener("click", closeDetail));
    detailModal.addEventListener("mousedown", (event) => {
      if (event.target === detailModal) {
        closeDetail();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !detailModal.hidden) {
        closeDetail();
      }
    });
  }
  function openDetailOf(target) {
    if (target.closest("button")) {
      return;
    }
    const row = target.closest(".ev-row");
    if (row) {
      detailOpener = row;
      openDetail(row.dataset.eventId);
    }
  }
  async function openDetail(eventId) {
    const seq = ++detailSeq;
    try {
      const detail = await get(`/api/v1/events/${eventId}`);
      if (seq === detailSeq) {
        renderDetail(detail);
        openEventVideo(detail);
        detailModal.hidden = false;
        detailModal.querySelector(".modal").focus();
      }
    } catch {
    }
  }
  function closeDetail() {
    detailSeq++;
    closeEventVideo();
    detailModal.hidden = true;
    if (detailOpener?.isConnected) {
      detailOpener.focus();
    }
    detailOpener = null;
  }
  function renderDetail(detail) {
    detailTypeChip.replaceChildren(typeChip(detail));
    detailTitle.textContent = `${detail.zoneName ?? "-"} \xB7 ${peakTitle(detail)}`;
    detailStatusChip.replaceChildren(statusChip(detail.status));
    const rows = [
      ["\uAD6C\uC5ED \xB7 \uC9C0\uC5ED", [detail.zoneName, regionAndCamera(detail)].filter(Boolean).join(" \xB7 ")],
      ["\uBC1C\uC0DD \xB7 \uC885\uB8CC", periodText(detail)],
      ["\uCD5C\uACE0 \uB2E8\uACC4\xB7\uAC12", peakNode(detail)],
      ["\uB2F9\uC2DC \uAE30\uC900\uAC12", thresholdText(detail)]
    ];
    if (detail.actionCode) {
      rows.push(["\uC870\uCE58 \uD56D\uBAA9", ACTION_LABEL[detail.actionCode] ?? detail.actionCode]);
    }
    if (detail.actionNote) {
      rows.push(["\uC870\uCE58 \uBA54\uBAA8", detail.actionNote]);
    }
    if (detail.handledAt) {
      rows.push(["\uCC98\uB9AC \uC77C\uC2DC", formatDateTime(detail.handledAt)]);
    }
    detailInfo.replaceChildren(
      ...rows.flatMap(([label, value]) => [el("dt", "", label), definition(value)])
    );
    detailHistories.replaceChildren(
      ...detail.histories.length > 0 ? detail.histories.map(buildHistory) : [el("p", "muted ev-history-empty", "\uCC98\uB9AC \uC774\uB825\uC774 \uC5C6\uC2B5\uB2C8\uB2E4")]
    );
  }
  function peakTitle(detail) {
    if (detail.type === "CONGESTION") {
      return levelNames[detail.peakLevel] ?? `${detail.peakLevel}\uB2E8\uACC4`;
    }
    return TYPE_LABEL[detail.type] ?? detail.type;
  }
  function periodText(detail) {
    const started = formatDateTime(detail.startedAt);
    const duration = durationText(detail.durationSec);
    if (detail.ongoing) {
      return `${started} ~ \uC9C4\uD589 \uC911 (${duration})`;
    }
    const ended = formatDateTime(detail.endedAt);
    const endedLabel = started.slice(0, 10) === ended.slice(0, 10) ? ended.slice(11) : ended;
    return `${started} ~ ${endedLabel} (${duration})`;
  }
  function peakNode(detail) {
    if (detail.type === "CAM_FAULT") {
      return "-";
    }
    const fragment = document.createDocumentFragment();
    if (detail.type === "CONGESTION") {
      fragment.append(
        el("span", `chip ${LEVEL_CHIP[detail.peakLevel] ?? "l2"}`, peakTitle(detail)),
        " "
      );
      fragment.append(`${formatDecimal(detail.peakValue, 2)}\uBA85/\u33A1`);
    } else {
      fragment.append(`+${formatDecimal(detail.peakValue, 0)}%`);
    }
    fragment.append(` \xB7 ${formatNumber(detail.peakCount)}\uBA85`);
    return fragment;
  }
  function thresholdText(detail) {
    const snapshot = detail.thresholdSnapshot ?? {};
    if (detail.type === "CONGESTION" && has(snapshot.warnDensity) && has(snapshot.dangerDensity)) {
      return `\uC8FC\uC758 ${snapshot.warnDensity} \xB7 \uC704\uD5D8 ${snapshot.dangerDensity} \uBA85/\u33A1`;
    }
    if (detail.type === "CAM_FAULT" && has(snapshot.timeoutSec)) {
      return `\uACB0\uACFC \uC5C6\uC74C ${snapshot.timeoutSec}\uCD08 \uC774\uC0C1`;
    }
    if (detail.type === "SURGE" && has(snapshot.window) && has(snapshot.rate) && has(snapshot.minDensity)) {
      return `${snapshot.window}\uBD84 \uC804\uBCF4\uB2E4 +${snapshot.rate}% \uC774\uC0C1 \xB7 \uCD5C\uC18C \uBC00\uC9D1\uB3C4 ${snapshot.minDensity}\uBA85/\u33A1`;
    }
    return "-";
  }
  function has(value) {
    return value !== null && value !== void 0;
  }
  function buildHistory(history) {
    const row = el("div", "ev-history-row");
    if (history.from) {
      row.append(statusChip(history.from), " \u2192 ");
    }
    row.append(statusChip(history.to), ` ${formatDateTime(history.at)} \xB7 ${history.loginId}`);
    const action = ACTION_LABEL[history.actionCode] ?? history.actionCode;
    if (action) {
      row.append(` \xB7 ${action}${history.actionNote ? ` \u2014 ${history.actionNote}` : ""}`);
    } else if (history.actionNote) {
      row.append(` \xB7 ${history.actionNote}`);
    }
    return row;
  }
  function definition(value) {
    const node = el("dd");
    node.append(value);
    return node;
  }
  function renderPages(current2, totalPages) {
    if (totalPages <= 1) {
      pagesEl.replaceChildren();
      return;
    }
    const buttons = [pageButton("\u2039", current2 - 1, current2 === 0, false)];
    const first = Math.max(0, current2 - PAGE_BUTTON_WINDOW);
    const last = Math.min(totalPages - 1, current2 + PAGE_BUTTON_WINDOW);
    for (let index = first; index <= last; index++) {
      buttons.push(pageButton(String(index + 1), index, false, index === current2));
    }
    buttons.push(pageButton("\u203A", current2 + 1, current2 >= totalPages - 1, false));
    pagesEl.replaceChildren(...buttons);
  }
  function pageButton(label, target, disabled, selected) {
    const button = el("button", selected ? "on" : "", label);
    button.type = "button";
    button.disabled = disabled;
    if (selected) {
      button.setAttribute("aria-current", "page");
    }
    button.addEventListener("click", () => {
      page = target;
      refresh();
    });
    return button;
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
  function cell(content) {
    const node = el("div");
    node.setAttribute("role", "cell");
    node.append(content);
    return node;
  }
  function textWithSmall(main, small) {
    const fragment = document.createDocumentFragment();
    fragment.append(document.createTextNode(main ?? "-"));
    if (small) {
      fragment.append(el("small", "", small));
    }
    return fragment;
  }
  function formatDate(date) {
    const pad3 = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad3(date.getMonth() + 1)}-${pad3(date.getDate())}`;
  }
  function addDays(dateText, days) {
    const date = /* @__PURE__ */ new Date(`${dateText}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  }
})();
