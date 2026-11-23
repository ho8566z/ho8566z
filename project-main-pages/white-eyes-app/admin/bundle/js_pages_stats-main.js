(() => {
  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/common/toast.js
  var CONTAINER_ID = "toast-stack";
  var DEFAULT_DURATION_MS = 5e3;
  function showToast(message2, durationMs = DEFAULT_DURATION_MS) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "alert");
    toast.textContent = message2;
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
    constructor(status, code, message2, fieldErrors) {
      super(message2);
      this.name = "ApiError";
      this.status = status;
      this.code = code;
      this.fieldErrors = fieldErrors ?? [];
    }
  };
  function url(path2) {
    const meta = document.querySelector('meta[name="context-path"]');
    const contextPath = (meta?.content ?? "/").replace(/\/$/, "");
    return contextPath + path2;
  }
  function get(path2, params, options) {
    return request("GET", path2, { params, ...options });
  }
  function post(path2, body, options) {
    return request("POST", path2, { body, ...options });
  }
  function patch(path2, body, options) {
    return request("PATCH", path2, { body, ...options });
  }
  function del(path2, options) {
    return request("DELETE", path2, { ...options });
  }
  function download(path2, params, options) {
    return request("GET", path2, { params, ...options, file: true });
  }
  async function request(method, path2, { params, body, toast = true, file = false, absolute = false, signal, cache } = {}) {
    let target = absolute ? path2 : url(path2);
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
    const modal3 = document.getElementById("camera-modal");
    const form = document.getElementById("camera-form");
    const formError = document.getElementById("camera-form-error");
    const zoneSelect = document.getElementById("camera-zone");
    const uriInput = document.getElementById("camera-uri");
    const uriHint = document.getElementById("camera-uri-hint");
    const saveButton = document.getElementById("camera-save");
    let editing = null;
    modal3.querySelectorAll("[data-close]").forEach((button2) => button2.addEventListener("click", closeModal));
    modal3.addEventListener("mousedown", (event) => {
      if (event.target === modal3) {
        closeModal();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal3.hidden) {
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
      modal3.hidden = false;
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
      modal3.hidden = true;
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
    function showFieldError(field, message2) {
      const hint = form.querySelector(`[data-error-for="${field}"]`);
      if (!hint) {
        formError.textContent = message2;
        formError.hidden = false;
        return;
      }
      hint.textContent = message2;
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
          error.fieldErrors.forEach(({ field, message: message2 }) => showFieldError(field, message2));
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

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/export/export-modal.js
  var EXPORT_API = "/api/v1/stats/export";
  var MINUTE_MS = 6e4;
  var INTERVALS = {
    "1m": { label: "1\uBD84", max: { days: 7 }, maxLabel: "7\uC77C" },
    "1h": { label: "1\uC2DC\uAC04", max: { days: 93 }, maxLabel: "93\uC77C" },
    "1d": { label: "1\uC77C", max: { years: 10 }, maxLabel: "10\uB144" },
    "1w": { label: "1\uC8FC", max: { years: 10 }, maxLabel: "10\uB144" },
    "1M": { label: "1\uC6D4", max: { years: 10 }, maxLabel: "10\uB144" },
    "1y": { label: "1\uB144", max: { years: 10 }, maxLabel: "10\uB144" }
  };
  var DEFAULT_ERROR_MESSAGE2 = "\uC77C\uC2DC\uC801\uC778 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.";
  var byId = (id) => document.getElementById(id);
  var modal = null;
  var scopes = [];
  function initExportModal() {
    modal = byId("export-modal");
    if (!modal) {
      return;
    }
    modal.querySelectorAll("[data-export-close]").forEach((button2) => button2.addEventListener("click", closeExportModal));
    modal.addEventListener("mousedown", (event) => {
      if (event.target === modal) {
        closeExportModal();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hidden) {
        closeExportModal();
      }
    });
    byId("export-scope").addEventListener("change", () => {
      renderSum();
      validate();
    });
    ["export-from", "export-end", "export-interval"].forEach(
      (id) => byId(id).addEventListener("change", validate)
    );
    itemBoxes().forEach((box) => box.addEventListener("change", validate));
    modal.querySelector("form").addEventListener("submit", (event) => {
      event.preventDefault();
      submit();
    });
  }
  function openExportModal({ zone = null, region = null, interval, from, to }) {
    if (!modal) {
      return;
    }
    scopes = [];
    if (zone) {
      const name = zone.deleted ? `${zone.name} (\uC0AD\uC81C\uB428)` : zone.name;
      scopes.push({ scope: "ZONE", targetId: zone.id, label: `\uAD6C\uC5ED \xB7 ${name}` });
    }
    if (region) {
      scopes.push({ scope: "REGION", targetId: region.id, label: `\uC9C0\uC5ED \xB7 ${region.name}` });
    }
    scopes.push({ scope: "ALL", targetId: null, label: "\uC804\uCCB4" });
    const scopeSelect = byId("export-scope");
    scopeSelect.replaceChildren(
      ...scopes.map((entry, index) => {
        const option2 = document.createElement("option");
        option2.value = String(index);
        option2.textContent = entry.label;
        return option2;
      })
    );
    scopeSelect.value = "0";
    byId("export-sum").checked = false;
    byId("export-interval").value = INTERVALS[interval] ? interval : "1h";
    byId("export-from").value = toInputValue(from);
    byId("export-end").value = toInputValue(new Date(to.getTime() - MINUTE_MS));
    hideError();
    renderSum();
    validate();
    modal.hidden = false;
    scopeSelect.focus();
  }
  function closeExportModal() {
    if (modal) {
      modal.hidden = true;
    }
  }
  function itemBoxes() {
    return [...modal.querySelectorAll('#export-items input[type="checkbox"]')];
  }
  function selectedScope() {
    return scopes[Number(byId("export-scope").value)];
  }
  function renderSum() {
    byId("export-sum-row").hidden = selectedScope()?.scope !== "REGION";
  }
  function readConditions() {
    const from = parseLocal(byId("export-from").value);
    const end = parseLocal(byId("export-end").value);
    if (!from || !end) {
      return { reason: "\uC2DC\uC791\xB7\uB05D \uC2DC\uAC01\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694." };
    }
    const to = new Date(end.getTime() + MINUTE_MS);
    if (to <= from) {
      return { reason: "\uB05D \uC2DC\uAC01\uC740 \uC2DC\uC791 \uC2DC\uAC01\uBCF4\uB2E4 \uB4A4\uC5EC\uC57C \uD569\uB2C8\uB2E4." };
    }
    const interval = byId("export-interval").value;
    const spec = INTERVALS[interval];
    if (to > shift(from, spec.max)) {
      return { reason: `${spec.label} \uB2E8\uC704\uB294 \uCD5C\uB300 ${spec.maxLabel}\uAE4C\uC9C0 \uB0B4\uB824\uBC1B\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4.` };
    }
    const items = itemBoxes().filter((box) => box.checked).map((box) => box.value);
    if (items.length === 0) {
      return { reason: "\uD56D\uBAA9\uC744 \uD558\uB098 \uC774\uC0C1 \uACE8\uB77C \uC8FC\uC138\uC694." };
    }
    return { from, to, interval, items };
  }
  function validate() {
    const { reason } = readConditions();
    const reasonText = byId("export-reason");
    reasonText.textContent = reason ?? "";
    reasonText.hidden = !reason;
    byId("export-submit").disabled = Boolean(reason);
    return !reason;
  }
  async function submit() {
    const conditions = readConditions();
    if (conditions.reason) {
      validate();
      return;
    }
    const { scope, targetId } = selectedScope();
    const params = [
      ["scope", scope],
      ["interval", conditions.interval],
      ["from", toInputValue(conditions.from)],
      ["to", toInputValue(conditions.to)],
      ...conditions.items.map((item) => ["items", item])
    ];
    if (targetId !== null) {
      params.push(["targetId", String(targetId)]);
    }
    if (scope === "REGION" && byId("export-sum").checked) {
      params.push(["sum", "true"]);
    }
    const button2 = byId("export-submit");
    button2.disabled = true;
    hideError();
    try {
      const { blob, fileName } = await download(EXPORT_API, params, { toast: false });
      save(blob, fileName ?? "stats.xlsx");
      closeExportModal();
    } catch (error) {
      showError(errorText(error));
    } finally {
      button2.disabled = false;
    }
  }
  function save(blob, fileName) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), MINUTE_MS);
  }
  function errorText(error) {
    if (!(error instanceof ApiError)) {
      console.error(error);
      return DEFAULT_ERROR_MESSAGE2;
    }
    if (error.fieldErrors.length > 0) {
      return `${error.message} (${error.fieldErrors.map((fieldError) => fieldError.message).join(" / ")})`;
    }
    return error.message;
  }
  function showError(message2) {
    const notice = byId("export-error");
    notice.textContent = message2;
    notice.hidden = false;
  }
  function hideError() {
    const notice = byId("export-error");
    notice.hidden = true;
    notice.textContent = "";
  }
  function shift(date, { years = 0, months = 0, days = 0 }) {
    const result = new Date(date.getTime());
    const day = result.getDate();
    result.setDate(1);
    result.setFullYear(result.getFullYear() + years, result.getMonth() + months, 1);
    const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
    result.setDate(Math.min(day, lastDay) + days);
    return result;
  }
  var pad = (value) => String(value).padStart(2, "0");
  function toInputValue(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
  function parseLocal(text) {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(text ?? "");
    if (!match) {
      return null;
    }
    const [, year, month, day, hour, minute] = match;
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/common/format.js
  var pad2 = (value) => String(value).padStart(2, "0");
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
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
  }
  function formatNumber(value) {
    return isBlank(value) ? "-" : Number(value).toLocaleString("ko-KR");
  }
  function formatSigned(value, fractionDigits = 1) {
    if (isBlank(value)) {
      return "-";
    }
    const number = Number(value);
    const text = formatDecimal(Math.abs(number), fractionDigits);
    if (Number(text.replace(/,/g, "")) === 0) {
      return text;
    }
    return (number > 0 ? "+" : "\u2212") + text;
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
  function setNowCounts(items) {
    counts.clear();
    const receivedAt = Date.now();
    items.forEach(
      (item) => counts.set(Number(item.zoneId), { count: Number(item.currentCount), receivedAt })
    );
    notify();
  }
  function nowCountOf(zoneId) {
    const found = counts.get(Number(zoneId));
    return found && Date.now() - found.receivedAt <= FRESH_MS ? found.count : void 0;
  }
  function nowTotal() {
    const fresh = [...counts.keys()].map(nowCountOf).filter((count) => count !== void 0);
    return fresh.length === 0 ? null : fresh.reduce((sum2, count) => sum2 + count, 0);
  }
  function onNowCounts(listener) {
    listeners.push(listener);
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
  var MINUTE_MS2 = 6e4;
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
    ].forEach((id) => byId2(id).replaceChildren());
    byId2("live-net").textContent = "-";
  }
  async function loadLiveGraphs(camera) {
    if (!document.getElementById("live-graphs")) {
      return;
    }
    const to = new Date(Math.floor(Date.now() / MINUTE_MS2) * MINUTE_MS2 + MINUTE_MS2);
    const from = new Date(to.getTime() - WINDOW_MINUTES * MINUTE_MS2);
    const query = {
      targetType: "ZONE",
      targetId: String(camera.zoneId),
      interval: "1m",
      from: toInputValue2(from),
      to: toInputValue2(to)
    };
    byId2("live-stats-link").href = `${url("/stats/graph")}?${new URLSearchParams(query).toString()}`;
    const requestId = ++latestRequestId;
    try {
      const response = await get(SERIES_API, query, { toast: false });
      if (requestId !== latestRequestId) {
        return;
      }
      render2(response.items, camera.name);
      byId2("live-graph-error").hidden = true;
    } catch {
      if (requestId === latestRequestId) {
        byId2("live-graph-error").hidden = false;
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
    byId2("live-graph-10m").replaceChildren(
      levelBars(recent, { height: BAR_HEIGHT, max, label: "\uCD5C\uADFC 10\uBD84 \uC778\uC6D0, \uD63C\uC7A1 \uB2E8\uACC4 \uC0C9" })
    );
    byId2("live-graph-60m").replaceChildren(
      levelBars(points, { height: BAR_HEIGHT, max, label: "\uCD5C\uADFC 1\uC2DC\uAC04 \uC778\uC6D0, \uD63C\uC7A1 \uB2E8\uACC4 \uC0C9" })
    );
    byId2("live-graph-count").replaceChildren(
      countLine(points, { height: COUNT_HEIGHT, max, label: "\uCD5C\uADFC 1\uC2DC\uAC04 \uC778\uC6D0" })
    );
    byId2("live-graph-flow").replaceChildren(
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
    byId2("live-net").textContent = hasFlow ? `${net > 0 ? "+" : net < 0 ? "\u2212" : ""}${formatNumber(Math.abs(net))}\uBA85` : "-";
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
    byId2("live-compass").replaceChildren(
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
    byId2("live-direction-bars").replaceChildren(
      ...totals.map((total) => {
        const row4 = cell("row");
        const name = document.createElement("span");
        name.className = "muted";
        name.textContent = total.name;
        const bars = cell("bars");
        bars.append(
          bar("in", total.inflow, max, `\uC720\uC785 ${formatNumber(total.inflow)}\uBA85`),
          bar("out", total.outflow, max, `\uC720\uCD9C ${formatNumber(total.outflow)}\uBA85`)
        );
        row4.append(name, bars);
        return row4;
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
  var pad3 = (value) => String(value).padStart(2, "0");
  function toInputValue2(date) {
    return `${date.getFullYear()}-${pad3(date.getMonth() + 1)}-${pad3(date.getDate())}T${pad3(date.getHours())}:${pad3(date.getMinutes())}`;
  }
  function byId2(id) {
    return document.getElementById(id);
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/live/live-view.js
  var PLAYBACK_MESSAGES = {
    RECORDING_NOT_FOUND: "\uC601\uC0C1 \uC5C6\uC74C",
    RECORDING_EXPIRED: "\uBCF4\uAD00 \uAE30\uAC04 \uC9C0\uB0A8"
  };
  var LEVEL_LABELS = { 1: "\uC815\uC0C1", 2: "\uC8FC\uC758", 3: "\uC704\uD5D8" };
  var modal2 = null;
  var current = null;
  function initLiveView() {
    modal2 = document.getElementById("live-modal");
    if (!modal2) {
      return;
    }
    const img = byId3("live-img");
    modal2.querySelectorAll("[data-live-close]").forEach((button2) => button2.addEventListener("click", closeLiveView));
    modal2.addEventListener("mousedown", (event) => {
      if (event.target === modal2) {
        closeLiveView();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal2.hidden) {
        closeLiveView();
      }
    });
    img.addEventListener("load", () => showNotice(""));
    img.addEventListener("error", () => {
      if (img.getAttribute("src")) {
        showNotice("\uC601\uC0C1\uC744 \uBD88\uB7EC\uC62C \uC218 \uC5C6\uC2B5\uB2C8\uB2E4", true);
      }
    });
    byId3("live-retry").addEventListener("click", connect);
    byId3("live-playback").addEventListener("click", openPlayback);
  }
  function openLiveView(camera) {
    if (!modal2) {
      return;
    }
    current = camera;
    byId3("live-cam").textContent = `CAM ${camera.id}`;
    byId3("live-name").textContent = camera.name;
    byId3("live-place").textContent = `\xB7 ${camera.regionPath} \xB7 ${camera.zoneName} \xB7 ${formatNumber(Math.round(camera.areaM2))}\u33A1`;
    renderStat(camera);
    modal2.hidden = false;
    connect();
    clearLiveGraphs();
    loadLiveGraphs(camera);
  }
  function updateLiveView(cameras) {
    if (!modal2 || modal2.hidden || !current) {
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
    if (!modal2 || modal2.hidden) {
      return;
    }
    modal2.hidden = true;
    current = null;
    clearLiveGraphs();
    const img = byId3("live-img");
    img.removeAttribute("src");
  }
  function connect() {
    if (!current) {
      return;
    }
    const img = byId3("live-img");
    showNotice("\uC601\uC0C1\uC744 \uBD88\uB7EC\uC624\uB294 \uC911\u2026");
    img.hidden = false;
    img.src = `${url(`/live/${current.id}`)}?t=${Date.now()}`;
  }
  function showNotice(message2, withRetry = false) {
    byId3("live-notice").hidden = message2 === "";
    byId3("live-notice-text").textContent = message2;
    byId3("live-retry").hidden = !withRetry;
  }
  function renderStat(camera) {
    const stat = camera.stat;
    const shown = stat ? `${formatNumber(stat.currentCount ?? Math.round(stat.countAvg))}\uBA85` : "";
    bindNowCount(byId3("live-count"), camera.zoneId, stat ? shown : "-", "\uBA85");
    byId3("live-density").textContent = stat ? formatDecimal(stat.density, 2) : "-";
    const chip = byId3("live-level");
    chip.className = "chip";
    if (stat && LEVEL_LABELS[stat.level]) {
      chip.classList.add(`l${stat.level}`);
      chip.textContent = LEVEL_LABELS[stat.level];
      chip.hidden = false;
    } else {
      chip.hidden = true;
    }
    byId3("live-level-none").hidden = !chip.hidden;
    bindNowCount(byId3("live-count-badge"), camera.zoneId, shown, "\uBA85");
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
  function byId3(id) {
    return document.getElementById(id);
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/map/map-view.js
  var TILE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
  var TILE_ATTRIBUTION = "\xA9 OpenStreetMap contributors";
  var MAX_ZOOM = 19;
  var LEVEL_COLORS2 = { 1: "#3bc99b", 2: "#f59e0b", 3: "#ef4d55" };
  var OFF_COLOR = "#4a5768";
  function levelColor(level) {
    return LEVEL_COLORS2[level] ?? OFF_COLOR;
  }
  function createMap(element, { center, zoom }) {
    const map2 = L.map(element, { center, zoom, zoomControl: false, attributionControl: true });
    L.tileLayer(TILE_URL, { maxZoom: MAX_ZOOM, attribution: TILE_ATTRIBUTION }).addTo(map2);
    new ResetControl({ center, zoom }).addTo(map2);
    return map2;
  }
  var ResetControl = L.Control.extend({
    options: { position: "bottomright" },
    initialize(home) {
      this.home = home;
    },
    onAdd(map2) {
      const box = L.DomUtil.create("div", "map-ctrl");
      box.append(
        button("+", "\uD655\uB300", () => map2.zoomIn()),
        button("\u2212", "\uCD95\uC18C", () => map2.zoomOut()),
        button("\uCD08\uAE30\uD654", "\uCC98\uC74C \uC704\uCE58\uB85C", () => map2.setView(this.home.center, this.home.zoom))
      );
      L.DomEvent.disableClickPropagation(box);
      return box;
    }
  });
  function button(text, label, onClick) {
    const element = document.createElement("button");
    element.type = "button";
    element.textContent = text;
    element.title = label;
    element.setAttribute("aria-label", label);
    element.addEventListener("click", onClick);
    return element;
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/map/status-map.js
  var FALLBACK_ZOOM = 12;
  var OFF_PAINT = "#4a5768";
  var EDIT_STYLE = { color: "#76a7ff", weight: 3, fillColor: "#4f8cff", fillOpacity: 0.28 };
  var OUTLINE_TARGET = {
    color: "#1f3a5f",
    weight: 3.5,
    fill: true,
    fillColor: "#4f8cff",
    fillOpacity: 0.07
  };
  var OUTLINE_SIBLING = { color: "#4a5d78", weight: 2, dashArray: "6 4", fill: false };
  var HOVER_FILL_BOOST = 0.2;
  var HOVER_MAX_FILL = 0.6;
  var OUTLINE_HOVER_FILL = 0.18;
  var POPUP_OFFSET = [0, -18];
  var PIN_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 7h13v10H3zM16 10l5-3v10l-5-3"></path></svg>';
  function createRegionMap(element, region, previous) {
    previous?.remove();
    const center = [Number(region.centerLat), Number(region.centerLng)];
    const probe = createMap(element, { center, zoom: FALLBACK_ZOOM });
    const bounds = region.boundary ? L.geoJSON(region.boundary).getBounds() : null;
    const fitted = bounds?.isValid() === true;
    const zoom = fitted ? probe.getBoundsZoom(bounds) : FALLBACK_ZOOM;
    const viewCenter = fitted ? bounds.getCenter() : L.latLng(center);
    probe.remove();
    return createMap(element, { center: [viewCenter.lat, viewCenter.lng], zoom });
  }
  function createStatusLayer(map2, {
    onSelectRegion,
    onSelectSibling,
    onZoneMenu,
    onEmptyMenu,
    isBusy,
    onViewStart,
    onViewChange,
    onPinClick,
    levels: levels2 = []
  }) {
    const outlines = L.layerGroup().addTo(map2);
    const boundaries = L.layerGroup().addTo(map2);
    const pins = L.layerGroup().addTo(map2);
    let zonePoints = [];
    let openPopupZoneId = null;
    let boundaryLayers = [];
    let paint = null;
    let regionRings = [];
    let zoneEditing = null;
    map2.on("moveend", onViewChange);
    ["movestart", "zoomstart"].forEach((name) => map2.on(name, () => onViewStart?.()));
    if (onZoneMenu || onEmptyMenu) {
      map2.on("contextmenu", (event) => {
        L.DomEvent.preventDefault(event.originalEvent);
        if (!isBusy?.() && onEmptyMenu && regionRings.some((ring) => insideRing(event.latlng, ring))) {
          onEmptyMenu(event.latlng, event.originalEvent);
        }
      });
    }
    function addOutline(boundary, style, onClick, name) {
      if (!boundary) {
        return;
      }
      const layer2 = L.geoJSON(
        boundary,
        onClick ? { style: { ...style, fill: true, fillOpacity: 0 } } : { style, interactive: false }
      );
      if (onClick) {
        layer2.on("click", () => {
          if (!isBusy?.()) {
            onClick();
          }
        });
        layer2.bindTooltip(textTooltip(name, "\uB20C\uB7EC\uC11C \uC774\uB3D9"), { sticky: true });
        layer2.on(
          "mouseover",
          () => layer2.setStyle({ weight: style.weight + 1.5, fillOpacity: OUTLINE_HOVER_FILL })
        );
        layer2.on("mouseout", () => layer2.setStyle({ weight: style.weight, fillOpacity: 0 }));
      }
      outlines.addLayer(layer2);
    }
    function zoomTo(layer2) {
      map2.fitBounds(layer2.getBounds(), { padding: [60, 60], maxZoom: 18 });
    }
    function styleOf(entry) {
      if (entry.editing) {
        return EDIT_STYLE;
      }
      const painted = paint?.get(entry.id);
      let style;
      if (paint && painted) {
        style = {
          color: painted.color,
          weight: 1.5,
          fillColor: painted.color,
          fillOpacity: painted.fillOpacity
        };
      } else if (paint) {
        style = { color: OFF_PAINT, weight: 1, fillColor: OFF_PAINT, fillOpacity: 0.12 };
      } else {
        style = entry.style;
      }
      return entry.hover ? {
        ...style,
        weight: style.weight + 1.5,
        fillOpacity: Math.min(HOVER_MAX_FILL, style.fillOpacity + HOVER_FILL_BOOST)
      } : style;
    }
    function applyPaint() {
      boundaryLayers.forEach((entry) => {
        const { id, name, layer: layer2, item } = entry;
        const painted = paint?.get(id);
        layer2.setStyle(styleOf(entry));
        if (paint && painted) {
          layer2.setTooltipContent(textTooltip(name, painted.label));
        } else if (paint) {
          layer2.setTooltipContent(textTooltip(name, "\uB370\uC774\uD130 \uC5C6\uC74C"));
        } else {
          layer2.setTooltipContent(() => tooltip(name, item));
        }
      });
    }
    return {
      /**
       * 경계를 단계 색으로 칠한다. 통계가 없으면 회색. clickable이면 눌러서 줌인한다:
       * 지역은 그 지역으로 이동(onSelectRegion), unit.zoom이 true인 구역은 지도를 그 구역에 맞춘다.
       */
      showBoundaries(units, clickable) {
        this.stopZoneEdit();
        boundaries.clearLayers();
        boundaryLayers = [];
        units.forEach(({ id, name, boundary, item, zoom }) => {
          if (!boundary) {
            return;
          }
          const color = levelColor(item?.level);
          const layer2 = L.geoJSON(boundary, {
            style: {
              color,
              weight: item?.level ? 2 : 1.5,
              fillColor: color,
              fillOpacity: item?.level ? 0.22 : 0.12
            }
          });
          layer2.bindTooltip(() => tooltip(name, item), { sticky: true });
          if (clickable) {
            layer2.on("click", () => {
              if (!isBusy?.()) {
                return zoom ? zoomTo(layer2) : onSelectRegion(id);
              }
            });
          }
          if (zoom && onZoneMenu) {
            layer2.on("contextmenu", (event) => {
              L.DomEvent.stop(event);
              if (!isBusy?.()) {
                onZoneMenu(id, event.originalEvent);
              }
            });
          }
          boundaries.addLayer(layer2);
          const entry = {
            id,
            name,
            layer: layer2,
            style: layer2.options.style,
            item,
            hover: false,
            held: false,
            editing: false,
            isZone: Boolean(zoom)
          };
          layer2.on("mouseover", () => {
            entry.hover = true;
            layer2.setStyle(styleOf(entry));
          });
          layer2.on("mouseout", () => {
            if (entry.held) {
              return;
            }
            entry.hover = false;
            layer2.setStyle(styleOf(entry));
          });
          boundaryLayers.push(entry);
        });
        applyPaint();
      },
      /** 우클릭 메뉴가 뜬 구역(zoneId)을 강조한 채로 붙들어 둔다. 마우스가 메뉴로 옮겨가도 풀리지 않는다(releaseZone으로 푼다). */
      holdZone(zoneId) {
        this.releaseZone();
        const entry = boundaryLayers.find(
          (candidate) => candidate.isZone && candidate.id === zoneId
        );
        if (entry) {
          entry.held = true;
          entry.hover = true;
          entry.layer.setStyle(styleOf(entry));
        }
      },
      /** 붙들어 둔 강조를 푼다(메뉴가 닫힐 때). */
      releaseZone() {
        boundaryLayers.forEach((entry) => {
          if (entry.held) {
            entry.held = false;
            entry.hover = false;
            entry.layer.setStyle(styleOf(entry));
          }
        });
      },
      /**
       * 구역 하나의 꼭짓점 편집을 시작한다(FNC-A-015). 꼭짓점을 끌거나 더하거나 지울 때마다 onChange가 새 GeoJSON Polygon으로 불린다.
       * 선이 서로 겹치게 옮기는 것은 막는다. 고치는 동안 그 구역은 수정 색으로 칠한다.
       */
      startZoneEdit(zoneId, onChange) {
        this.stopZoneEdit();
        const entry = boundaryLayers.find(
          (candidate) => candidate.isZone && candidate.id === zoneId
        );
        const polygon = entry ? entry.layer.getLayers()[0] : null;
        if (!polygon) {
          return;
        }
        entry.editing = true;
        entry.layer.setStyle(EDIT_STYLE);
        entry.layer.bringToFront();
        polygon.pm.enable({
          allowSelfIntersection: false,
          removeLayerBelowMinVertexCount: false
        });
        const handler = () => onChange(polygon.toGeoJSON().geometry);
        polygon.on("pm:edit", handler);
        zoneEditing = { entry, polygon, handler };
      },
      /** 꼭짓점 편집을 끝낸다. 고친 모양을 버리려면 부른 쪽이 경계를 다시 그린다(showBoundaries). */
      stopZoneEdit() {
        if (!zoneEditing) {
          return;
        }
        const { entry, polygon, handler } = zoneEditing;
        polygon.off("pm:edit", handler);
        polygon.pm.disable();
        entry.editing = false;
        zoneEditing = null;
      },
      /**
       * 지금 보는 지역(target)과 이웃 지역(siblings)의 윤곽선을 그린다. 하위 단위 경계(showBoundaries)와 별개로 남아,
       * 동까지 내려가도 지역 경계가 지도에서 사라지지 않는다.
       * @param {{boundary: object|null}} target 지금 보는 지역(regions API 항목)
       * @param {{id: number, name: string, boundary: object|null}[]} siblings 같은 단계의 이웃 지역(누르면 onSelectSibling)
       */
      showOutlines(target, siblings) {
        outlines.clearLayers();
        regionRings = target.boundary ? outerRings(target.boundary) : [];
        siblings.forEach(
          ({ id, name, boundary }) => addOutline(
            boundary,
            OUTLINE_SIBLING,
            onSelectSibling ? () => onSelectSibling(id) : void 0,
            name
          )
        );
        addOutline(target.boundary, OUTLINE_TARGET);
      },
      /**
       * 경계를 혼잡 단계 색 대신 주어진 색으로 칠한다(히트맵, FNC-C-011). null이면 단계 색으로 되돌린다.
       * 경계를 다시 그려도(새 1분 통계) 끌 때까지 이 색을 유지한다.
       * @param {Map<number, {color: string, fillOpacity: number, label: string}>|null} next 단위 id → 칠할 모양
       */
      paintBoundaries(next) {
        paint = next;
        applyPaint();
      },
      /** 구역 핀: 중심점에 단계 색, 진행 중 이벤트가 있으면 오늘 이벤트 수 배지. */
      showPins(items) {
        const reopenZoneId = openPopupZoneId;
        pins.clearLayers();
        zonePoints = items.filter((item) => item.centerLat !== null && item.centerLat !== void 0).map((item) => ({
          item,
          latLng: L.latLng(Number(item.centerLat), Number(item.centerLng))
        }));
        zonePoints.forEach(({ item, latLng }) => {
          const marker = L.marker(latLng, { icon: pinIcon(item) });
          marker.bindTooltip(() => tooltip(item.name, item));
          if (onZoneMenu) {
            marker.on("contextmenu", (event) => {
              L.DomEvent.stop(event);
              if (!isBusy?.()) {
                onZoneMenu(item.id, event.originalEvent);
              }
            });
          }
          if (onPinClick) {
            marker.on("click", () => onPinClick(item.id));
          } else {
            marker.bindPopup(() => zonePopup(item, levels2), { offset: POPUP_OFFSET });
            marker.on("popupopen", () => {
              openPopupZoneId = item.id;
            });
            marker.on("popupclose", () => {
              openPopupZoneId = null;
            });
          }
          pins.addLayer(marker);
          if (!onPinClick && item.id === reopenZoneId) {
            marker.openPopup();
          }
        });
      },
      /** 지금 지도 화면 안에 핀이 있는 구역 id (캠 패널이 '지도 화면 안 캠'을 거를 때 쓴다) */
      visibleZoneIds() {
        const bounds = map2.getBounds();
        return new Set(
          zonePoints.filter(({ latLng }) => bounds.contains(latLng)).map(({ item }) => item.id)
        );
      },
      /** 통계 패널을 접고 펼치거나 캠 패널 높이가 바뀌어 지도 칸 크기가 달라진 뒤에 부른다 */
      refreshSize() {
        map2.invalidateSize();
      }
    };
  }
  function outerRings(boundary) {
    const rings = [];
    L.geoJSON(boundary).eachLayer((layer2) => {
      const latLngs = layer2.getLatLngs();
      if (Array.isArray(latLngs[0]) && Array.isArray(latLngs[0][0])) {
        latLngs.forEach((polygon) => rings.push(polygon[0]));
      } else if (Array.isArray(latLngs[0])) {
        rings.push(latLngs[0]);
      }
    });
    return rings;
  }
  function insideRing(point, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const a = ring[i];
      const b = ring[j];
      if (a.lat > point.lat !== b.lat > point.lat && point.lng < (b.lng - a.lng) * (point.lat - a.lat) / (b.lat - a.lat) + a.lng) {
        inside = !inside;
      }
    }
    return inside;
  }
  function pinIcon(item) {
    const pin = document.createElement("span");
    pin.className = "pin " + (item.level ? "l" + item.level : "off");
    pin.style.background = levelColor(item.level);
    pin.innerHTML = PIN_ICON;
    if (item.ongoingEvent) {
      const badge = document.createElement("b");
      if (item.todayEventCount > 0) {
        badge.textContent = formatNumber(item.todayEventCount);
      }
      pin.append(badge);
    }
    return L.divIcon({ html: pin, className: "zone-pin", iconSize: [0, 0] });
  }
  function zonePopup(item, levels2) {
    const box = document.createElement("div");
    box.className = "zone-popup";
    const title = document.createElement("b");
    title.textContent = item.name;
    box.append(title);
    if (!item.level) {
      if (hasNowCount(item)) {
        box.append(popupRow("\uD604\uC7AC \uC778\uC6D0", nowCountSpan(item)));
        return box;
      }
      const empty = document.createElement("div");
      empty.textContent = "\uB370\uC774\uD130 \uC5C6\uC74C";
      box.append(empty);
      return box;
    }
    const found = levels2.find((candidate) => candidate.level === item.level);
    const chip = document.createElement("span");
    chip.className = "chip l" + item.level;
    chip.textContent = found ? found.name : "\uB2E8\uACC4 " + item.level;
    box.append(
      popupRow("\uD604\uC7AC \uC778\uC6D0", nowCountSpan(item)),
      popupRow("\uBC00\uC9D1\uB3C4", document.createTextNode(`${formatDecimal(item.density, 2)}\uBA85/\u33A1`)),
      popupRow("\uD63C\uC7A1 \uB2E8\uACC4", chip)
    );
    return box;
  }
  function popupRow(label, value) {
    const row4 = document.createElement("div");
    const name = document.createElement("span");
    name.textContent = label;
    row4.append(name, value);
    return row4;
  }
  function textTooltip(name, text) {
    const box = document.createElement("div");
    const title = document.createElement("b");
    title.textContent = name;
    const body = document.createElement("div");
    body.textContent = text;
    box.append(title, body);
    return box;
  }
  function tooltip(name, item) {
    const box = document.createElement("div");
    const title = document.createElement("b");
    title.textContent = name;
    box.append(title);
    if (item?.regionPath) {
      const path2 = document.createElement("div");
      path2.textContent = item.regionPath;
      box.append(path2);
    }
    const body = document.createElement("div");
    if (item?.level) {
      body.append(nowCountSpan(item), ` \xB7 ${formatDecimal(item.density, 2)}\uBA85/\u33A1`);
    } else if (item && hasNowCount(item)) {
      body.append(nowCountSpan(item));
    } else {
      body.textContent = "\uB370\uC774\uD130 \uC5C6\uC74C";
    }
    box.append(body);
    return box;
  }
  function isZoneItem(item) {
    return item.centerLat !== null && item.centerLat !== void 0;
  }
  function hasNowCount(item) {
    return item.currentCount !== null && item.currentCount !== void 0;
  }
  function nowCountSpan(item) {
    const span2 = document.createElement("span");
    const fallback = `${formatNumber(hasNowCount(item) ? item.currentCount : Math.round(Number(item.countAvg)))}\uBA85`;
    if (isZoneItem(item)) {
      bindNowCount(span2, item.id, fallback, "\uBA85");
    } else {
      span2.textContent = fallback;
    }
    return span2;
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/pages/stats-main/abnormal.js
  var COMPARE_API = "/api/v1/compare";
  var BASE_PRESET = "LAST_MONTH";
  var DAYS = 7;
  var TOP_CELLS = 3;
  var WEEKDAYS = ["\uC6D4", "\uD654", "\uC218", "\uBAA9", "\uAE08", "\uD1A0", "\uC77C"];
  var NO_DATA = "\uB370\uC774\uD130 \uC5C6\uC74C";
  var LOAD_ERROR = "\uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.";
  var byId4 = (id) => document.getElementById(id);
  function createAbnormalPanel() {
    const box = byId4("abnormal-box");
    const count = byId4("abnormal-count");
    const list = byId4("abnormal-list");
    const detail = byId4("abnormal-detail");
    let regionId = null;
    let loadedRegionId = null;
    let latestRequestId2 = 0;
    box.addEventListener("toggle", () => {
      if (box.open) {
        load();
      }
    });
    function setRegion(id) {
      regionId = id;
      detail.href = url(`/stats/graph?${new URLSearchParams(graphParams()).toString()}`);
      if (box.open && loadedRegionId !== id) {
        load();
      }
    }
    function graphParams() {
      const today = /* @__PURE__ */ new Date();
      return {
        targetType: "REGION",
        targetId: String(regionId),
        interval: "1h",
        from: toDateText(addDays(today, -DAYS)),
        to: toDateText(today)
      };
    }
    function params() {
      const yesterday = addDays(/* @__PURE__ */ new Date(), -1);
      return {
        targetType: "REGION",
        targetId: String(regionId),
        from: toDateText(addDays(yesterday, -(DAYS - 1))),
        to: toDateText(yesterday),
        basePreset: BASE_PRESET
      };
    }
    async function load() {
      if (regionId === null) {
        return;
      }
      const requestId = ++latestRequestId2;
      const requested = params();
      try {
        const data = await get(COMPARE_API, requested, { toast: false });
        if (requestId !== latestRequestId2) {
          return;
        }
        loadedRegionId = Number(requested.targetId);
        render3(data);
      } catch {
        if (requestId === latestRequestId2) {
          count.textContent = LOAD_ERROR;
          list.replaceChildren();
        }
      }
    }
    function render3(data) {
      if (data.totalRate === null) {
        count.textContent = NO_DATA;
        list.replaceChildren();
        return;
      }
      const abnormal = data.cells.filter((cell2) => cell2.abnormal);
      count.textContent = abnormal.length > 0 ? `\uBE44\uC815\uC0C1 \uCE78 ${formatNumber(abnormal.length)}\uAC1C` : "\uBE44\uC815\uC0C1 \uBCC0\uB3D9 \uC5C6\uC74C";
      const top = [...abnormal].sort((a, b) => Math.abs(Number(b.rate)) - Math.abs(Number(a.rate))).slice(0, TOP_CELLS);
      list.replaceChildren(...top.map(row));
    }
    return { setRegion };
  }
  function row(cell2) {
    const rate = Number(cell2.rate);
    const item = document.createElement("div");
    item.className = "row";
    const chip = document.createElement("span");
    chip.className = rate > 0 ? "chip l3" : "chip run";
    chip.textContent = `${formatSigned(rate, 0)}%`;
    const text = document.createElement("span");
    const hour = String(cell2.hour).padStart(2, "0");
    text.textContent = `${WEEKDAYS[cell2.weekday - 1]} ${hour}\uC2DC \xB7 \uC9C0\uB09C\uB2EC \uAC19\uC740 \uC694\uC77C\uBCF4\uB2E4 ${rate > 0 ? "\uB9CE\uC74C" : "\uC801\uC74C"}`;
    item.append(chip, text);
    return item;
  }
  function addDays(date, days) {
    const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    copy.setDate(copy.getDate() + days);
    return copy;
  }
  function toDateText(date) {
    const pad4 = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad4(date.getMonth() + 1)}-${pad4(date.getDate())}`;
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/pages/stats-main/aux-metrics.js
  var SERIES_API2 = "/api/v1/stats/series";
  var EVENT_SUMMARY_API = "/api/v1/events/summary";
  var NO_DATA2 = "\uB370\uC774\uD130 \uC5C6\uC74C";
  var LOAD_ERROR2 = "\uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.";
  var SVG_NS2 = "http://www.w3.org/2000/svg";
  var MINUTE_MS3 = 6e4;
  var HOUR_MINUTES = 60;
  var SECONDS_PER_HOUR = 3600;
  var TOP_ZONES = 5;
  var DIRECTIONS2 = [
    ["N", "\uBD81(N)"],
    ["E", "\uB3D9(E)"],
    ["S", "\uB0A8(S)"],
    ["W", "\uC11C(W)"]
  ];
  var GRAPH_WIDTH = 360;
  var DWELL_COLOR = "#a78bfa";
  var SPREAD_COLOR = "#76a7ff";
  var SPREAD_BAND_COLOR = "rgba(79,140,255,.22)";
  var RECEIVE_COLOR = "#76a7ff";
  var EVENT_FOLD = "aux-events";
  var EVENT_TYPES = [
    ["CONGESTION", "\uD63C\uC7A1", "l3"],
    ["SURGE", "\uAE09\uC99D", "surge"],
    ["CAM_FAULT", "\uCEA0 \uC774\uC0C1", "cam"]
  ];
  var FOLDS = {
    "aux-flow": ["lastHour"],
    "aux-dwell": ["lastHour", "todayHourly"],
    "aux-spread": ["lastHour"],
    "aux-level-time": ["todayMinute"],
    "aux-top-zones": [],
    "aux-observe": ["lastHour"]
  };
  var byId5 = (id) => document.getElementById(id);
  function createAuxMetricsPanel(levels2) {
    let regionId = null;
    let latestRequestId2 = 0;
    let latestEventRequestId = 0;
    const eventFold = byId5(EVENT_FOLD);
    Object.keys(FOLDS).forEach((id) => {
      byId5(id).addEventListener("toggle", () => {
        if (byId5(id).open) {
          loadSeries(openFolds());
        }
      });
    });
    eventFold?.addEventListener("toggle", () => {
      if (eventFold.open) {
        loadEvents();
      }
    });
    function setRegion(id) {
      regionId = id;
    }
    function refresh2(items) {
      renderTopZones(items);
      renderObservedZones(items);
      loadSeries(openFolds());
      if (eventFold?.open) {
        loadEvents();
      }
    }
    function openFolds() {
      return Object.keys(FOLDS).filter((id) => byId5(id).open);
    }
    async function loadSeries(foldIds) {
      const kinds = [...new Set(foldIds.flatMap((id) => FOLDS[id]))];
      if (regionId === null || kinds.length === 0) {
        return;
      }
      const requestId = ++latestRequestId2;
      const ranges = seriesRanges(/* @__PURE__ */ new Date());
      try {
        const entries = await Promise.all(
          kinds.map(async (kind) => [kind, await readSeries(regionId, ranges[kind])])
        );
        if (requestId !== latestRequestId2) {
          return;
        }
        const series = Object.fromEntries(entries);
        foldIds.forEach((id) => renderFold(id, series));
      } catch {
        if (requestId === latestRequestId2) {
          foldIds.filter((id) => FOLDS[id].length > 0).forEach((id) => showMessage(id, LOAD_ERROR2));
        }
      }
    }
    async function loadEvents() {
      if (regionId === null) {
        return;
      }
      const requestId = ++latestEventRequestId;
      const now = /* @__PURE__ */ new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      try {
        const summary = await readEventSummary(regionId, midnight, now);
        if (requestId === latestEventRequestId) {
          renderEvents(summary);
        }
      } catch {
        if (requestId === latestEventRequestId) {
          showMessage(EVENT_FOLD, LOAD_ERROR2);
        }
      }
    }
    function renderFold(id, series) {
      switch (id) {
        case "aux-flow":
          renderFlow(series.lastHour);
          break;
        case "aux-dwell":
          renderDwell(series.lastHour, series.todayHourly);
          break;
        case "aux-spread":
          renderSpread(series.lastHour);
          break;
        case "aux-level-time":
          renderLevelTime(series.todayMinute, levels2);
          break;
        case "aux-observe":
          renderReceiveRate(series.lastHour);
          break;
        default:
          break;
      }
    }
    return { setRegion, refresh: refresh2 };
  }
  function seriesRanges(now) {
    const minuteEnd = new Date(Math.floor(now.getTime() / MINUTE_MS3) * MINUTE_MS3);
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return {
      lastHour: {
        interval: "1m",
        from: new Date(minuteEnd.getTime() - HOUR_MINUTES * MINUTE_MS3),
        to: minuteEnd
      },
      todayHourly: { interval: "1h", from: midnight, to: minuteEnd },
      todayMinute: { interval: "1m", from: midnight, to: minuteEnd }
    };
  }
  async function readSeries(regionId, { interval, from, to }) {
    if (to <= from) {
      return [];
    }
    const params = {
      targetType: "REGION",
      targetId: String(regionId),
      interval,
      from: from.toISOString(),
      to: to.toISOString()
    };
    const data = await get(SERIES_API2, params, { toast: false });
    return data.items;
  }
  function sampled(points) {
    return points.filter((point) => point.countAvg !== null);
  }
  function renderFlow(points) {
    const rows = sampled(points);
    if (rows.length === 0) {
      showMessage("aux-flow", NO_DATA2);
      return;
    }
    const sum2 = (key, direction2) => rows.reduce((total, point) => total + (point[key]?.[direction2] ?? 0), 0);
    const totals = DIRECTIONS2.map(([code, label]) => ({
      label,
      inflow: sum2("inflow", code),
      outflow: sum2("outflow", code)
    }));
    const max = Math.max(...totals.flatMap((total) => [total.inflow, total.outflow]), 1);
    byId5("aux-flow-body").replaceChildren(
      ...totals.map(({ label, inflow, outflow }) => {
        const row4 = document.createElement("div");
        row4.className = "row";
        const name = document.createElement("span");
        name.className = "dir";
        name.textContent = label;
        const amount = document.createElement("span");
        amount.className = "num";
        amount.textContent = `+${formatNumber(inflow)} / \u2212${formatNumber(outflow)}`;
        row4.append(
          name,
          bar2(inflow / max, "var(--lv1)", true),
          bar2(outflow / max, "var(--lv3)", false),
          amount
        );
        return row4;
      })
    );
  }
  function bar2(ratio, color, alignEnd) {
    const track = document.createElement("div");
    track.className = alignEnd ? "bar flow-bar end" : "bar flow-bar";
    const fill = document.createElement("i");
    fill.style.width = `${Math.round(ratio * 100)}%`;
    fill.style.background = color;
    track.append(fill);
    return track;
  }
  function renderDwell(lastHour, todayHourly) {
    const minuteValues = lastHour.map((point) => point.dwellAvgSec).filter((value2) => value2 !== null);
    const hourlyValues = todayHourly.map(
      (point) => point.dwellAvgSec === null ? null : Number(point.dwellAvgSec)
    );
    if (minuteValues.length === 0 && hourlyValues.every((value2) => value2 === null)) {
      showMessage("aux-dwell", NO_DATA2);
      return;
    }
    const average = minuteValues.length === 0 ? null : minuteValues.reduce((total, value2) => total + Number(value2), 0) / minuteValues.length;
    const head = document.createElement("div");
    head.className = "row";
    const value = document.createElement("strong");
    value.className = "big";
    value.textContent = average === null ? "-" : formatDuration(average);
    const note = document.createElement("span");
    note.className = "muted";
    note.textContent = "\uCD5C\uADFC 1\uC2DC\uAC04 \xB7 \uC544\uB798\uB294 \uC624\uB298 \uC2DC\uAC04\uBCC4";
    head.append(value, note);
    byId5("aux-dwell-body").replaceChildren(
      head,
      lineGraph(hourlyValues, DWELL_COLOR, 50, "\uC624\uB298 \uC2DC\uAC04\uBCC4 \uD3C9\uADE0 \uCCB4\uB958")
    );
  }
  function formatDuration(seconds) {
    const rounded = Math.round(seconds);
    const minutes = Math.floor(rounded / 60);
    return minutes > 0 ? `${minutes}\uBD84 ${rounded % 60}\uCD08` : `${rounded}\uCD08`;
  }
  function renderSpread(points) {
    const rows = sampled(points);
    if (rows.length === 0) {
      showMessage("aux-spread", NO_DATA2);
      return;
    }
    const spreads = rows.map((point) => point.countMax - point.countMin);
    const latest = spreads[spreads.length - 1];
    const summary = document.createElement("div");
    summary.className = "row";
    summary.append(
      labeled("\uCD5C\uADFC 1\uBD84 \uBCC0\uB3D9\uD3ED", `${formatNumber(latest)}\uBA85`),
      labeled("1\uC2DC\uAC04 \uCD5C\uB300", `${formatNumber(Math.max(...spreads))}\uBA85`)
    );
    const note = document.createElement("span");
    note.className = "muted";
    note.textContent = "\uD3ED\uC774 \uB113\uC744\uC218\uB85D 1\uBD84 \uC548\uC5D0\uC11C \uC778\uC6D0\uC774 \uD06C\uAC8C \uCD9C\uB801\uC784 \u2192 \uAE09\uC99D \uC804\uC870";
    byId5("aux-spread-body").replaceChildren(summary, bandGraph(points), note);
  }
  function labeled(label, value) {
    const span2 = document.createElement("span");
    span2.className = "muted";
    const strong = document.createElement("b");
    strong.textContent = value;
    span2.append(`${label} `, strong);
    return span2;
  }
  function renderLevelTime(points, levels2) {
    const minutes = levels2.map(({ level, name }) => ({
      level,
      name,
      count: points.filter((point) => point.level === level).length
    }));
    if (minutes.every((entry) => entry.count === 0)) {
      showMessage("aux-level-time", NO_DATA2);
      return;
    }
    const stack = document.createElement("div");
    stack.className = "level-stack";
    const labels = document.createElement("div");
    labels.className = "level-time muted";
    minutes.forEach(({ level, name, count }) => {
      if (count > 0) {
        const part = document.createElement("span");
        part.style.flex = String(count);
        part.style.background = levelColor(level);
        stack.append(part);
      }
      const label = document.createElement("span");
      label.textContent = `${name} ${formatMinutes(count)}`;
      labels.append(label);
    });
    byId5("aux-level-time-body").replaceChildren(stack, labels);
  }
  function formatMinutes(total) {
    const hours = Math.floor(total / 60);
    return hours > 0 ? `${hours}\uC2DC\uAC04 ${total % 60}\uBD84` : `${total}\uBD84`;
  }
  function renderTopZones(items) {
    const ranked = items.filter((item) => item.level !== null && item.density !== null).sort((a, b) => Number(b.density) - Number(a.density)).slice(0, TOP_ZONES);
    if (ranked.length === 0) {
      showMessage("aux-top-zones", NO_DATA2);
      return;
    }
    byId5("aux-top-zones-body").replaceChildren(
      ...ranked.map((item, index) => {
        const row4 = document.createElement("div");
        row4.className = "row";
        const rank = document.createElement("b");
        rank.className = "rank";
        rank.textContent = String(index + 1);
        const name = document.createElement("span");
        name.className = "name";
        name.textContent = item.name;
        row4.append(rank, name);
        if (item.countAvg !== null) {
          const count = document.createElement("span");
          count.className = "count muted";
          count.textContent = `${formatNumber(Math.round(Number(item.countAvg)))}\uBA85`;
          row4.append(count);
        }
        const chip = document.createElement("span");
        chip.className = `chip l${item.level}`;
        chip.textContent = formatDecimal(item.density, 2);
        row4.append(chip);
        return row4;
      })
    );
  }
  function readEventSummary(regionId, from, to) {
    const params = {
      from: from.toISOString(),
      to: to.toISOString(),
      regionId: String(regionId)
    };
    return get(EVENT_SUMMARY_API, params, { toast: false });
  }
  function renderEvents(summary) {
    if (summary.total === 0) {
      showMessage(EVENT_FOLD, NO_DATA2);
      return;
    }
    const chips = document.createElement("div");
    chips.className = "row";
    EVENT_TYPES.forEach(([type, label, chipClass]) => {
      const chip = document.createElement("span");
      chip.className = `chip ${chipClass}`;
      chip.textContent = `${label} ${formatNumber(summary.byType[type] ?? 0)}`;
      chips.append(chip);
    });
    const unchecked = document.createElement("div");
    unchecked.className = "row";
    const name = document.createElement("span");
    name.className = "grow";
    name.textContent = "\uBBF8\uD655\uC778";
    const count = document.createElement("b");
    count.className = "aux-unchecked";
    count.textContent = `${formatNumber(summary.unchecked)}\uAC74`;
    unchecked.append(name, count);
    byId5(`${EVENT_FOLD}-body`).replaceChildren(chips, unchecked);
  }
  function renderObservedZones(items) {
    const observed = items.filter((item) => item.statAt !== null).length;
    byId5("aux-observe-zones").textContent = items.length === 0 ? NO_DATA2 : `${formatNumber(observed)} / ${formatNumber(items.length)}`;
  }
  function renderReceiveRate(points) {
    const receivedSec = points.reduce((total, point) => total + point.sampleSec, 0);
    const box = byId5("aux-observe-rate");
    if (receivedSec === 0) {
      box.replaceChildren(NO_DATA2);
      return;
    }
    const rate = Math.min(receivedSec / SECONDS_PER_HOUR, 1);
    const track = document.createElement("div");
    track.className = "bar";
    const fill = document.createElement("i");
    fill.style.width = `${Math.round(rate * 100)}%`;
    fill.style.background = RECEIVE_COLOR;
    track.append(fill);
    const value = document.createElement("b");
    value.textContent = `${Math.round(rate * 100)}%`;
    box.replaceChildren(track, value);
  }
  function svgGraph(height, label) {
    const svg = document.createElementNS(SVG_NS2, "svg");
    svg.setAttribute("viewBox", `0 0 ${GRAPH_WIDTH} ${height}`);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("class", "aux-graph");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", label);
    svg.style.height = `${height}px`;
    return svg;
  }
  function xAt(index, count) {
    return count < 2 ? GRAPH_WIDTH / 2 : index / (count - 1) * GRAPH_WIDTH;
  }
  function lineGraph(values, color, height, label) {
    const svg = svgGraph(height, label);
    const present = values.filter((value) => value !== null);
    if (present.length === 0) {
      return svg;
    }
    const max = Math.max(...present) || 1;
    const yAt = (value) => height - 3 - value / max * (height - 6);
    segments(values).forEach((segment) => {
      const line2 = document.createElementNS(SVG_NS2, segment.length === 1 ? "circle" : "polyline");
      if (segment.length === 1) {
        const [index] = segment;
        line2.setAttribute("cx", xAt(index, values.length).toFixed(1));
        line2.setAttribute("cy", yAt(values[index]).toFixed(1));
        line2.setAttribute("r", "2");
        line2.setAttribute("fill", color);
      } else {
        const xy = (index) => `${xAt(index, values.length).toFixed(1)},${yAt(values[index]).toFixed(1)}`;
        line2.setAttribute("points", segment.map(xy).join(" "));
        line2.setAttribute("fill", "none");
        line2.setAttribute("stroke", color);
        line2.setAttribute("stroke-width", "2");
        line2.setAttribute("vector-effect", "non-scaling-stroke");
      }
      svg.append(line2);
    });
    return svg;
  }
  function bandGraph(points) {
    const height = 60;
    const svg = svgGraph(height, "1\uBD84\uB9C8\uB2E4 \uCD5C\uB300\xB7\uCD5C\uC18C \uC778\uC6D0 \uBC94\uC704");
    const present = sampled(points);
    const max = Math.max(...present.map((point) => point.countMax)) || 1;
    const yAt = (value) => height - 3 - value / max * (height - 6);
    segments(points.map((point) => point.countAvg)).forEach((segment) => {
      const xy = (index, value) => `${xAt(index, points.length).toFixed(1)},${yAt(value).toFixed(1)}`;
      const top = segment.map((index) => xy(index, points[index].countMax));
      const bottom = [...segment].reverse().map((index) => xy(index, points[index].countMin));
      const band = document.createElementNS(SVG_NS2, "polygon");
      band.setAttribute("points", [...top, ...bottom].join(" "));
      band.setAttribute("fill", SPREAD_BAND_COLOR);
      const line2 = document.createElementNS(SVG_NS2, "polyline");
      line2.setAttribute(
        "points",
        segment.map((index) => xy(index, Number(points[index].countAvg))).join(" ")
      );
      line2.setAttribute("fill", "none");
      line2.setAttribute("stroke", SPREAD_COLOR);
      line2.setAttribute("stroke-width", "2");
      line2.setAttribute("vector-effect", "non-scaling-stroke");
      svg.append(band, line2);
    });
    return svg;
  }
  function segments(values) {
    const result = [];
    let current2 = [];
    values.forEach((value, index) => {
      if (value === null) {
        if (current2.length > 0) {
          result.push(current2);
        }
        current2 = [];
      } else {
        current2.push(index);
      }
    });
    if (current2.length > 0) {
      result.push(current2);
    }
    return result;
  }
  function showMessage(foldId, text) {
    if (foldId === "aux-observe") {
      byId5("aux-observe-rate").replaceChildren(text);
      return;
    }
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = text;
    byId5(`${foldId}-body`).replaceChildren(empty);
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/live/scheduler.js
  function createSnapshotScheduler({
    load,
    onResult,
    maxInFlight = 2,
    intervalMs = 2e3,
    now = () => Date.now()
  }) {
    const cards = /* @__PURE__ */ new Map();
    let inFlight = 0;
    let paused = false;
    const ensure = (id) => {
      if (!cards.has(id)) {
        cards.set(id, {
          visible: false,
          running: false,
          requestedAt: -Infinity,
          loading: false
        });
      }
      return cards.get(id);
    };
    function startLoad(id, card2) {
      card2.loading = true;
      card2.requestedAt = now();
      inFlight += 1;
      Promise.resolve().then(() => load(id)).then(
        (value) => onResult(id, true, value),
        () => onResult(id, false)
      ).finally(() => {
        card2.loading = false;
        inFlight -= 1;
      });
    }
    return {
      /** 카드가 화면에 들어오거나 나갔을 때 */
      setVisible(id, visible) {
        ensure(id).visible = visible;
      },
      /** 캠이 가동 중인지(RUNNING만 미리보기를 읽는다) */
      setRunning(id, running) {
        ensure(id).running = running;
      },
      /** 카드가 사라졌을 때 */
      remove(id) {
        cards.delete(id);
      },
      /** 탭이 숨겨지면 멈추고, 다시 보이면 이어간다 */
      setPaused(value) {
        paused = value;
      },
      /**
       * 지금 읽을 차례인 카드를 읽기 시작한다. 짧은 주기(예: 0.5초)로 부른다.
       * @returns {number[]} 이번에 읽기 시작한 카드 번호
       */
      tick() {
        if (paused) {
          return [];
        }
        const current2 = now();
        const due = [...cards.entries()].filter(
          ([, card2]) => card2.visible && card2.running && !card2.loading && current2 - card2.requestedAt >= intervalMs
        ).sort((first, second) => first[1].requestedAt - second[1].requestedAt);
        const started = [];
        for (const [id, card2] of due) {
          if (inFlight >= maxInFlight) {
            break;
          }
          startLoad(id, card2);
          started.push(id);
        }
        return started;
      },
      /** 시험·진단용: 지금 읽는 중인 요청 수 */
      inFlightCount() {
        return inFlight;
      }
    };
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/live/preview.js
  var TICK_MS = 500;
  var SNAPSHOT_TIMEOUT_MS = 5e3;
  var STATUS_TEXT = {
    STOPPED: "\uC815\uC9C0 \xB7 \uAC00\uB3D9\uD558\uBA74 \uBBF8\uB9AC\uBCF4\uAE30\uAC00 \uBCF4\uC785\uB2C8\uB2E4",
    PREPARING: "\uC900\uBE44 \uC911",
    ERROR: "\uC624\uB958 \xB7 \uC601\uC0C1\uC744 \uBCFC \uC218 \uC5C6\uC2B5\uB2C8\uB2E4"
  };
  function createPreviewManager({ onOpen, intervalSec }) {
    const entries = /* @__PURE__ */ new Map();
    const scheduler = createSnapshotScheduler({
      load: loadSnapshot,
      onResult: showResult,
      ...intervalSec > 0 ? { intervalMs: intervalSec * 1e3 } : {}
    });
    const observer = new IntersectionObserver((records) => {
      records.forEach((record) => {
        const id = Number(record.target.dataset.cameraId);
        scheduler.setVisible(id, record.isIntersecting);
      });
    });
    window.setInterval(() => scheduler.tick(), TICK_MS);
    document.addEventListener("visibilitychange", () => scheduler.setPaused(document.hidden));
    scheduler.setPaused(document.hidden);
    async function loadSnapshot(id) {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), SNAPSHOT_TIMEOUT_MS);
      try {
        const { blob } = await download(`/live/${id}/snapshot`, void 0, {
          signal: controller.signal,
          cache: "no-store",
          toast: false
        });
        return URL.createObjectURL(blob);
      } finally {
        window.clearTimeout(timer);
      }
    }
    function showResult(id, ok, objectUrl) {
      const entry = entries.get(id);
      if (!entry) {
        if (ok) {
          URL.revokeObjectURL(objectUrl);
        }
        return;
      }
      if (!ok) {
        entry.badge.hidden = false;
        return;
      }
      if (entry.objectUrl) {
        URL.revokeObjectURL(entry.objectUrl);
      }
      entry.objectUrl = objectUrl;
      entry.img.src = objectUrl;
      entry.img.hidden = false;
      entry.badge.hidden = true;
      entry.placeholder.hidden = true;
    }
    return {
      /**
       * 카드의 영상 칸을 채운다. 목록을 다시 그릴 때마다 새 칸으로 부르며, 이미 받아 둔 마지막 화면은 바로 보여 준다.
       * @param {HTMLElement} el 영상 칸
       * @param {{id: number, status: string}} camera
       */
      bind(el, camera) {
        const id = camera.id;
        const previous = entries.get(id);
        if (previous) {
          observer.unobserve(previous.el);
        }
        el.dataset.cameraId = String(id);
        el.classList.add("snap-live");
        el.replaceChildren();
        const img = document.createElement("img");
        img.alt = "";
        img.hidden = true;
        const placeholder = document.createElement("span");
        placeholder.className = "snap-text";
        const badge = document.createElement("span");
        badge.className = "snap-lost";
        badge.textContent = "\uB04A\uAE40";
        badge.hidden = true;
        el.append(img, placeholder, badge);
        const running = camera.status === "RUNNING";
        placeholder.textContent = running ? "\uBBF8\uB9AC\uBCF4\uAE30\uB97C \uBD88\uB7EC\uC624\uB294 \uC911" : STATUS_TEXT[camera.status] ?? "";
        const entry = { el, img, badge, placeholder, objectUrl: previous?.objectUrl ?? null };
        if (running && entry.objectUrl) {
          img.src = entry.objectUrl;
          img.hidden = false;
          placeholder.hidden = true;
        }
        if (!running && entry.objectUrl) {
          URL.revokeObjectURL(entry.objectUrl);
          entry.objectUrl = null;
        }
        entries.set(id, entry);
        scheduler.setRunning(id, running);
        scheduler.setVisible(id, false);
        observer.observe(el);
        el.onclick = () => onOpen(id);
      },
      /** 목록에서 빠진 카드의 요청과 받아 둔 화면을 정리한다 */
      prune(activeIds) {
        [...entries.keys()].filter((id) => !activeIds.has(id)).forEach((id) => {
          const entry = entries.get(id);
          observer.unobserve(entry.el);
          if (entry.objectUrl) {
            URL.revokeObjectURL(entry.objectUrl);
          }
          entries.delete(id);
          scheduler.remove(id);
        });
      }
    };
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/pages/stats-main/panel.js
  var NO_DATA3 = "\uB370\uC774\uD130 \uC5C6\uC74C";
  var TOP_ZONES2 = 5;
  var OTHER_COLOR = "#4a5768";
  var DIRECTIONS3 = { N: "\uBD81(N)", E: "\uB3D9(E)", S: "\uB0A8(S)", W: "\uC11C(W)" };
  var byId6 = (id) => document.getElementById(id);
  function timeOf(statAt) {
    return statAt ? formatDateTime(statAt).slice(11) : "";
  }
  function renderGraphLink(regionId) {
    const link = byId6("graph-link");
    const url2 = new URL(link.href);
    url2.search = new URLSearchParams({
      targetType: "REGION",
      targetId: String(regionId)
    }).toString();
    link.href = url2.toString();
  }
  function renderTarget(name, cameraCount) {
    byId6("stat-target").textContent = cameraCount === null ? name : `${name} \xB7 \uCEA0 ${cameraCount}\uB300`;
  }
  function renderZonePanel(items, tab, levels2) {
    const entries = zoneEntries(items, tab, levels2);
    const total = entries.reduce((sum2, entry) => sum2 + entry.value, 0);
    const latest = items.map((item) => item.statAt).filter(Boolean).sort().pop();
    byId6("zone-time").textContent = latest ? `${timeOf(latest)} \uAE30\uC900` : "";
    const donut = byId6("zone-donut");
    const list = byId6("zone-list");
    if (items.length === 0 || tab !== "level" && total === 0 && !items.some((item) => item.level)) {
      donut.style.background = "";
      byId6("zone-total").textContent = "-";
      list.replaceChildren(emptyText());
      return;
    }
    donut.style.background = conic(entries, total);
    byId6("zone-total").textContent = formatNumber(total) + (tab === "count" ? "\uBA85" : tab === "event" ? "\uAC74" : "\uACF3");
    const max = Math.max(...entries.map((entry) => entry.value), 1);
    list.replaceChildren(...entries.map((entry) => listRow(entry, max)));
  }
  function zoneEntries(items, tab, levels2) {
    if (tab === "level") {
      const rows = levels2.map(({ level, name }) => ({
        label: name,
        value: items.filter((item) => item.level === level).length,
        color: levelColor(level)
      }));
      rows.push({
        label: NO_DATA3,
        value: items.filter((item) => !item.level).length,
        color: OTHER_COLOR
      });
      return rows.filter((row4) => row4.value > 0);
    }
    const valueOf = (item) => tab === "event" ? item.todayEventCount : item.countAvg === null ? 0 : Math.round(Number(item.countAvg));
    const sorted = items.map((item) => ({ label: item.name, value: valueOf(item), color: levelColor(item.level) })).sort((a, b) => b.value - a.value);
    const top = sorted.slice(0, TOP_ZONES2);
    const rest = sorted.slice(TOP_ZONES2).reduce((sum2, row4) => sum2 + row4.value, 0);
    if (sorted.length > TOP_ZONES2) {
      top.push({ label: "\uAE30\uD0C0", value: rest, color: OTHER_COLOR });
    }
    return top;
  }
  function conic(entries, total) {
    if (total === 0) {
      return "";
    }
    let from = 0;
    const stops = entries.filter((entry) => entry.value > 0).map((entry) => {
      const to = from + entry.value / total * 100;
      const stop = `${entry.color} ${from}% ${to}%`;
      from = to;
      return stop;
    });
    return `conic-gradient(${stops.join(", ")})`;
  }
  function listRow({ label, value, color }, max) {
    const row4 = document.createElement("div");
    const head = document.createElement("div");
    head.className = "row-between";
    const name = document.createElement("span");
    const dot = document.createElement("i");
    dot.className = "dot";
    dot.style.background = color;
    name.append(dot, label);
    const amount = document.createElement("b");
    amount.textContent = formatNumber(value);
    head.append(name, amount);
    const bar4 = document.createElement("div");
    bar4.className = "bar";
    const fill = document.createElement("i");
    fill.style.width = `${Math.round(value / max * 100)}%`;
    fill.style.background = color;
    bar4.append(fill);
    row4.append(head, bar4);
    return row4;
  }
  function emptyText() {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = NO_DATA3;
    return empty;
  }
  function levelChip(level, levels2) {
    const chip = document.createElement("span");
    const found = levels2.find((candidate) => candidate.level === level);
    chip.className = "chip " + (found ? "l" + level : "off");
    chip.textContent = found ? found.name : NO_DATA3;
    return chip;
  }
  function renderSummaryCount(summary, liveTotal) {
    const count = liveTotal ?? summary?.currentCount ?? (summary?.countAvg === null || summary?.countAvg === void 0 ? null : Math.round(Number(summary.countAvg)));
    byId6("sum-count").textContent = count === null || count === void 0 ? "-" : `${formatNumber(count)}\uBA85`;
  }
  function renderSummary(summary, levels2) {
    const hasStat = summary.statAt !== null && summary.statAt !== void 0;
    byId6("summary-time").textContent = hasStat ? `${timeOf(summary.statAt)} \xB7 1\uBD84 \uD3C9\uADE0` : "";
    const fill = (id, text) => {
      byId6(id).textContent = text;
    };
    renderSummaryCount(summary, nowTotal());
    fill("sum-density", hasStat ? formatDecimal(summary.density, 2) : "-");
    byId6("sum-level").replaceChildren(hasStat ? levelChip(summary.level, levels2) : NO_DATA3);
    fill("sum-cameras", `${summary.runningCameraCount} / ${summary.cameraCount}\uB300`);
    fill("sum-events", `${formatNumber(summary.todayEventCount)}\uAC74`);
    fill(
      "sum-max",
      summary.todayMaxCount === null ? "-" : `${formatNumber(summary.todayMaxCount)}\uBA85`
    );
    fill("flow-in", hasStat ? `+${formatNumber(summary.inflow)}` : "-");
    fill("flow-out", hasStat ? `\u2212${formatNumber(summary.outflow)}` : "-");
    fill("flow-dir", DIRECTIONS3[summary.mainDirection] ?? "-");
  }
  function renderLevelRules(levels2) {
    const thresholds = levels2.filter((level) => Number(level.minDensity) > 0).map((level) => level.minDensity);
    byId6("level-rule").textContent = thresholds.length > 0 ? `${thresholds.join(" / ")} \uBA85/\u33A1` : "";
    byId6("level-rules").replaceChildren(
      ...levels2.map(({ name, color, minDensity }, index) => {
        const item = document.createElement("li");
        const dot = document.createElement("i");
        dot.className = "dot";
        dot.style.background = color;
        const next = levels2[index + 1];
        const text = Number(minDensity) > 0 ? `${name} ${Number(minDensity)} \uBA85/\u33A1 \uC774\uC0C1` : `${name} ${next ? Number(next.minDensity) : ""} \uBA85/\u33A1 \uBBF8\uB9CC`;
        item.append(dot, text);
        return item;
      })
    );
  }
  function renderMapLegend(levels2) {
    const legend = byId6("map-legend");
    const make = (name, color) => {
      const item = document.createElement("span");
      const dot = document.createElement("i");
      dot.className = "dot";
      dot.style.background = color;
      item.append(dot, name);
      return item;
    };
    legend.replaceChildren(
      ...levels2.map(({ name, color }) => make(name, color)),
      make("\uD1B5\uACC4 \uC5C6\uC74C", OTHER_COLOR)
    );
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/pages/stats-main/deck.js
  var MIN_MAP_HEIGHT = 64;
  var EXPAND_BELOW_MAP_HEIGHT = 360;
  var RECENT_BAR_HEIGHT = 40;
  var WARN_LEVEL = 2;
  var STATUS_CHIPS = {
    STOPPED: { text: "\uC815\uC9C0", css: "off" },
    PREPARING: { text: "\uC900\uBE44 \uC911", css: "prep" },
    RUNNING: { text: "\uAC00\uB3D9 \uC911", css: "run" },
    ERROR: { text: "\uC624\uB958", css: "err" }
  };
  var byId7 = (id) => document.getElementById(id);
  function createDeck({ levels: levels2, onReload, onResize, onOpenLive }) {
    const dash = byId7("dash");
    const body = byId7("dash-body");
    const cardsBox = byId7("deck-cards");
    const sortSelect = byId7("deck-sort");
    let cameras = [];
    let visibleZoneIds = /* @__PURE__ */ new Set();
    const previews = createPreviewManager({
      // 관리자 앱이 환경변수 CARD_SNAPSHOT_INTERVAL_SEC를 템플릿으로 내려 준다
      intervalSec: Number(dash.dataset.snapshotIntervalSec),
      onOpen: (cameraId) => {
        const camera = cameras.find((item) => item.id === cameraId);
        if (camera) {
          onOpenLive(camera);
        }
      }
    });
    sortSelect.addEventListener("change", render3);
    byId7("deck-toggle").addEventListener(
      "click",
      () => setExpanded(!dash.classList.contains("expanded"))
    );
    initGrip();
    function render3() {
      const shown = sortCameras(
        cameras.filter((camera) => visibleZoneIds.has(camera.zoneId)),
        sortSelect.value
      );
      byId7("deck-count").textContent = String(shown.length);
      const built = shown.map((camera) => card(camera, levels2, onReload));
      cardsBox.replaceChildren(...built.map((item) => item.article));
      built.forEach((item) => previews.bind(item.snapshot, item.camera));
      previews.prune(new Set(shown.map((camera) => camera.id)));
    }
    function setExpanded(expanded) {
      dash.classList.toggle("expanded", expanded);
      byId7("deck-toggle").textContent = expanded ? "\uC9C0\uB3C4\uC640 \uAC19\uC774 \uBCF4\uAE30" : "\uC804\uCCB4 \uD3BC\uCE58\uAE30";
      body.style.height = expanded ? `${MIN_MAP_HEIGHT}px` : "";
      body.style.minHeight = "";
      onResize();
    }
    function initGrip() {
      const grip = byId7("deck-grip");
      grip.addEventListener("dblclick", () => setExpanded(!dash.classList.contains("expanded")));
      grip.addEventListener("pointerdown", (event) => {
        grip.setPointerCapture(event.pointerId);
        const top = body.getBoundingClientRect().top;
        const move = (moveEvent) => {
          const mapHeight = Math.min(
            Math.max(moveEvent.clientY - top, MIN_MAP_HEIGHT),
            window.innerHeight - 200
          );
          const expanded = mapHeight < EXPAND_BELOW_MAP_HEIGHT;
          dash.classList.toggle("expanded", expanded);
          byId7("deck-toggle").textContent = expanded ? "\uC9C0\uB3C4\uC640 \uAC19\uC774 \uBCF4\uAE30" : "\uC804\uCCB4 \uD3BC\uCE58\uAE30";
          body.style.height = `${mapHeight}px`;
          body.style.minHeight = expanded ? "0" : `${mapHeight}px`;
        };
        const stop = () => {
          grip.removeEventListener("pointermove", move);
          grip.removeEventListener("pointerup", stop);
          grip.removeEventListener("pointercancel", stop);
          onResize();
        };
        grip.addEventListener("pointermove", move);
        grip.addEventListener("pointerup", stop);
        grip.addEventListener("pointercancel", stop);
      });
    }
    return {
      /** GET /manage/cameras 결과를 받는다 */
      setCameras(list) {
        cameras = list;
        render3();
      },
      /** 그 구역의 캠(구역당 1대). 없으면 undefined */
      cameraByZone(zoneId) {
        return cameras.find((camera) => camera.zoneId === zoneId);
      },
      /** 지도 화면 안 구역 id가 바뀌었을 때 */
      setVisibleZones(zoneIds) {
        if (dash.classList.contains("expanded")) {
          return;
        }
        visibleZoneIds = zoneIds;
        render3();
      }
    };
  }
  function sortCameras(list, mode) {
    const copy = [...list];
    if (mode === "name") {
      return copy.sort((a, b) => a.name.localeCompare(b.name, "ko"));
    }
    return copy.sort((a, b) => {
      if (!a.stat && !b.stat) {
        return a.name.localeCompare(b.name, "ko");
      }
      if (!a.stat || !b.stat) {
        return a.stat ? -1 : 1;
      }
      return b.stat.density - a.stat.density;
    });
  }
  function card(camera, levels2, onReload) {
    const article = document.createElement("article");
    article.className = "camcard";
    const head = document.createElement("header");
    const titleRow = document.createElement("div");
    titleRow.className = "row-between";
    const name = document.createElement("strong");
    name.textContent = camera.name;
    titleRow.append(name, levelChip(camera.stat?.level, levels2));
    const place = document.createElement("span");
    place.className = "muted small";
    place.textContent = `${camera.regionPath} \xB7 ${formatNumber(Math.round(camera.areaM2))}\u33A1`;
    head.append(titleRow, place);
    const snapshot = document.createElement("div");
    snapshot.className = "snap";
    const meta = document.createElement("div");
    meta.className = "meta";
    const people = labeled2("\uC778\uC6D0", camera.stat ? formatNumber(currentOf(camera.stat)) : "-");
    bindNowCount(people.querySelector("b"), camera.zoneId, people.querySelector("b").textContent);
    meta.append(
      statusPart(camera),
      people,
      labeled2("\uC774\uBCA4\uD2B8", formatNumber(camera.todayEventCount))
    );
    article.append(head, snapshot, recentBlock(camera, levels2), meta);
    if (camera.status === "ERROR" && camera.errorMessage) {
      const error = document.createElement("div");
      error.className = "err-msg";
      error.textContent = camera.errorMessage;
      article.append(error);
    }
    article.append(actions(camera, onReload));
    return { article, snapshot, camera };
  }
  function currentOf(stat) {
    return stat.currentCount ?? Math.round(stat.countAvg);
  }
  function statusPart(camera) {
    const wrap = document.createElement("span");
    const chip = document.createElement("span");
    const info = STATUS_CHIPS[camera.status] ?? STATUS_CHIPS.STOPPED;
    chip.className = "chip " + info.css;
    chip.textContent = camera.status === "PREPARING" && camera.progress !== null ? `${info.text} ${camera.progress}%` : info.text;
    wrap.append("\uC0C1\uD0DC ", chip);
    return wrap;
  }
  function labeled2(label, value) {
    const span2 = document.createElement("span");
    const strong = document.createElement("b");
    strong.textContent = value;
    span2.append(`${label} `, strong);
    return span2;
  }
  function recentBlock(camera, levels2) {
    const recent = camera.recent10m;
    const box = document.createElement("div");
    box.className = "recent";
    const head = document.createElement("div");
    head.className = "recent-head";
    const title = document.createElement("span");
    title.className = "muted";
    title.textContent = "\uCD5C\uADFC 10\uBD84";
    const now = document.createElement("span");
    if (recent.length > 0) {
      const latest = Math.round(recent[recent.length - 1].countAvg);
      const value = document.createElement("b");
      value.textContent = formatNumber(latest);
      now.append(value, "\uBA85");
      if (recent.length > 1) {
        const change = latest - Math.round(recent[0].countAvg);
        const delta = document.createElement("span");
        delta.className = "recent-delta";
        delta.textContent = change === 0 ? " 0" : ` ${change > 0 ? "\u25B2" : "\u25BC"}${formatNumber(Math.abs(change))}`;
        now.append(delta);
      }
    }
    head.append(title, now);
    const values = recent.map((point) => point.countAvg);
    const warnDensity = levels2.find((level) => level.level === WARN_LEVEL)?.minDensity;
    const warn = warnDensity ? Number(warnDensity) * camera.areaM2 : null;
    const bars = levelBars(
      recent.map((point) => ({ value: point.countAvg, level: point.level })),
      {
        height: RECENT_BAR_HEIGHT,
        max: niceMax(values),
        warn,
        label: "\uCD5C\uADFC 10\uBD84 \uC778\uC6D0, \uD63C\uC7A1 \uB2E8\uACC4 \uC0C9"
      }
    );
    const foot = document.createElement("div");
    foot.className = "recent-foot muted";
    const range = recent.length > 0 ? `\uCD5C\uB300 ${formatNumber(Math.round(Math.max(...values)))} \xB7 \uCD5C\uC18C ${formatNumber(Math.round(Math.min(...values)))}` : "\uB370\uC774\uD130 \uC5C6\uC74C";
    foot.append(span("-10\uBD84"), span(range), span("\uC9C0\uAE08"));
    box.append(head, bars, foot);
    return box;
  }
  function span(text) {
    const element = document.createElement("span");
    element.textContent = text;
    return element;
  }
  function actions(camera, onReload) {
    const footer = document.createElement("footer");
    const canStart = camera.status === "STOPPED" || camera.status === "ERROR";
    const canStop = camera.status !== "STOPPED";
    if (canStart) {
      footer.append(
        actionButton(
          camera.status === "ERROR" ? "\uB2E4\uC2DC \uC2DC\uC791" : "\uAC00\uB3D9",
          camera.id,
          "start",
          onReload
        )
      );
    }
    if (canStop) {
      footer.append(actionButton("\uC815\uC9C0", camera.id, "stop", onReload));
    }
    return footer;
  }
  function actionButton(text, cameraId, action, onReload) {
    const button2 = document.createElement("button");
    button2.type = "button";
    button2.className = "btn secondary sm";
    button2.textContent = text;
    button2.addEventListener("click", async () => {
      button2.disabled = true;
      try {
        await post(`/api/v1/manage/cameras/${cameraId}/${action}`);
      } catch {
      }
      await onReload();
    });
    return button2;
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/pages/stats-main/hourly-levels.js
  var HOURLY_LEVELS_API = "/api/v1/dashboard/hourly-levels";
  var NO_DATA4 = "\uB370\uC774\uD130 \uC5C6\uC74C";
  var LOAD_ERROR3 = "\uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.";
  var MIN_BAR_PERCENT = 8;
  var EMPTY_BAR_PERCENT = 4;
  var byId8 = (id) => document.getElementById(id);
  function createHourlyLevelsPanel() {
    const box = byId8("hourly-levels");
    const bars = byId8("hourly-levels-bars");
    const message2 = byId8("hourly-levels-message");
    let regionId = null;
    let loadedRegionId = null;
    let latestRequestId2 = 0;
    box.addEventListener("toggle", () => {
      if (box.open) {
        load();
      }
    });
    function setRegion(id) {
      regionId = id;
      if (box.open && loadedRegionId !== id) {
        load();
      }
    }
    function refresh2() {
      if (box.open) {
        load();
      }
    }
    async function load() {
      if (regionId === null) {
        return;
      }
      const requestId = ++latestRequestId2;
      const requestedRegionId = regionId;
      try {
        const items = await get(
          HOURLY_LEVELS_API,
          { targetType: "REGION", targetId: String(requestedRegionId) },
          { toast: false }
        );
        if (requestId !== latestRequestId2) {
          return;
        }
        loadedRegionId = requestedRegionId;
        render3(items);
      } catch {
        if (requestId === latestRequestId2) {
          bars.replaceChildren();
          message2.textContent = LOAD_ERROR3;
          message2.hidden = false;
        }
      }
    }
    function render3(items) {
      const densities = items.filter((item) => item.density !== null).map((item) => Number(item.density));
      const max = densities.length > 0 ? Math.max(...densities) : 0;
      bars.replaceChildren(...items.map((item) => bar3(item, max)));
      message2.textContent = NO_DATA4;
      message2.hidden = densities.length > 0;
    }
    return { setRegion, refresh: refresh2 };
  }
  function bar3(item, max) {
    const element = document.createElement("span");
    element.className = "hour-bar";
    if (item.density === null) {
      element.classList.add("empty");
      element.style.height = `${EMPTY_BAR_PERCENT}%`;
      element.title = `${item.hour}\uC2DC \xB7 ${NO_DATA4}`;
      return element;
    }
    const density = Number(item.density);
    const percent = max > 0 ? Math.max(MIN_BAR_PERCENT, density / max * 100) : MIN_BAR_PERCENT;
    element.style.height = `${percent}%`;
    element.style.background = levelColor(item.level);
    element.title = `${item.hour}\uC2DC \xB7 \uBC00\uC9D1\uB3C4 ${formatDecimal(density, 2)} \xB7 ${item.level}\uB2E8\uACC4`;
    return element;
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/pages/stats-main/visit-pattern.js
  var VISIT_PATTERN_API = "/api/v1/dashboard/visit-pattern";
  var WEEKDAYS2 = ["\uC6D4", "\uD654", "\uC218", "\uBAA9", "\uAE08", "\uD1A0", "\uC77C"];
  var HOURS = 24;
  var NO_DATA5 = "\uB370\uC774\uD130 \uC5C6\uC74C";
  var LOAD_ERROR4 = "\uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.";
  var MIN_ALPHA = 0.08;
  var MAX_ALPHA = 0.88;
  var byId9 = (id) => document.getElementById(id);
  function createVisitPatternPanel() {
    const box = byId9("visit-pattern");
    const grid = byId9("visit-pattern-grid");
    const message2 = byId9("visit-pattern-message");
    let regionId = null;
    let loadedRegionId = null;
    let latestRequestId2 = 0;
    box.addEventListener("toggle", () => {
      if (box.open) {
        load();
      }
    });
    function setRegion(id) {
      regionId = id;
      if (box.open && loadedRegionId !== id) {
        load();
      }
    }
    async function load() {
      if (regionId === null) {
        return;
      }
      const requestId = ++latestRequestId2;
      const requestedRegionId = regionId;
      try {
        const pattern = await get(
          VISIT_PATTERN_API,
          { targetType: "REGION", targetId: String(requestedRegionId) },
          { toast: false }
        );
        if (requestId !== latestRequestId2) {
          return;
        }
        loadedRegionId = requestedRegionId;
        render3(pattern);
      } catch {
        if (requestId === latestRequestId2) {
          grid.replaceChildren();
          message2.textContent = LOAD_ERROR4;
          message2.hidden = false;
        }
      }
    }
    function render3(pattern) {
      const rows = WEEKDAYS2.map((label, index) => ({
        label,
        values: pattern.cells.slice(index * HOURS, (index + 1) * HOURS).map((cell2) => cell2.avgCount)
      }));
      rows.push({ label: "\uD3C9\uC77C", values: pattern.weekdayAvg, separated: true });
      rows.push({ label: "\uC8FC\uB9D0", values: pattern.weekendAvg });
      const numbers = rows.flatMap((row4) => row4.values).filter((value) => value !== null).map(Number);
      const min = numbers.length > 0 ? Math.min(...numbers) : 0;
      const max = numbers.length > 0 ? Math.max(...numbers) : 0;
      grid.replaceChildren(...rows.flatMap((row4) => rowElements(row4, min, max)));
      message2.textContent = NO_DATA5;
      message2.hidden = numbers.length > 0;
    }
    return { setRegion };
  }
  function rowElements(row4, min, max) {
    const label = document.createElement("span");
    label.className = row4.separated ? "muted pattern-label separated" : "muted pattern-label";
    label.textContent = row4.label;
    const cells = row4.values.map((value, hour) => {
      const cell2 = document.createElement("span");
      cell2.className = row4.separated ? "pattern-cell separated" : "pattern-cell";
      if (value === null) {
        cell2.classList.add("empty");
        cell2.title = `${row4.label} ${hour}\uC2DC \xB7 ${NO_DATA5}`;
        return cell2;
      }
      const number = Number(value);
      const ratio = max > min ? (number - min) / (max - min) : 1;
      cell2.style.background = `rgba(79, 140, 255, ${(MIN_ALPHA + ratio * (MAX_ALPHA - MIN_ALPHA)).toFixed(2)})`;
      cell2.title = `${row4.label} ${hour}\uC2DC \xB7 \uD3C9\uADE0 ${formatDecimal(number, 1)}\uBA85`;
      return cell2;
    });
    return [label, ...cells];
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/pages/stats-main/peak-hours.js
  var PEAK_HOURS_API = "/api/v1/dashboard/peak-hours";
  var DEFAULT_PERIOD = "WEEK";
  var NO_DATA6 = "\uB370\uC774\uD130 \uC5C6\uC74C";
  var LOAD_ERROR5 = "\uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.";
  var byId10 = (id) => document.getElementById(id);
  function createPeakHoursPanel() {
    const box = byId10("peak-trend");
    const tabs = [...document.querySelectorAll("#peak-periods [data-period]")];
    const list = byId10("peak-list");
    let regionId = null;
    let period = DEFAULT_PERIOD;
    let loadedKey = null;
    let latestRequestId2 = 0;
    box.addEventListener("toggle", () => {
      if (box.open) {
        load();
      }
    });
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        period = tab.dataset.period;
        renderTabs();
        load();
      });
    });
    renderTabs();
    function setRegion(id) {
      regionId = id;
      if (box.open && loadedKey !== key()) {
        load();
      }
    }
    function key() {
      return `${regionId}:${period}`;
    }
    function renderTabs() {
      tabs.forEach((tab) => {
        const on = tab.dataset.period === period;
        tab.className = on ? "chip run" : "chip off";
        tab.setAttribute("aria-selected", String(on));
      });
    }
    async function load() {
      if (regionId === null) {
        return;
      }
      const requestId = ++latestRequestId2;
      const requestedKey = key();
      try {
        const items = await get(
          PEAK_HOURS_API,
          { targetType: "REGION", targetId: String(regionId), period },
          { toast: false }
        );
        if (requestId !== latestRequestId2) {
          return;
        }
        loadedKey = requestedKey;
        render3(items);
      } catch {
        if (requestId === latestRequestId2) {
          list.replaceChildren(message(LOAD_ERROR5));
        }
      }
    }
    function render3(items) {
      list.replaceChildren(...items.length === 0 ? [message(NO_DATA6)] : items.map(row2));
    }
    return { setRegion };
  }
  function row2(item) {
    const element = document.createElement("div");
    element.className = "row";
    const rank = document.createElement("b");
    rank.className = "rank";
    rank.textContent = String(item.rank);
    const hour = document.createElement("span");
    hour.className = "grow";
    hour.textContent = `${item.hour}~${item.hour + 1}\uC2DC`;
    const count = document.createElement("b");
    count.textContent = `${formatNumber(Math.round(Number(item.avgCount)))}\uBA85`;
    element.append(rank, hour, count);
    return element;
  }
  function message(text) {
    const element = document.createElement("span");
    element.className = "muted";
    element.textContent = text;
    return element;
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/pages/stats-main/confirm-dialog.js
  function createConfirmDialog() {
    const modal3 = document.getElementById("dash-confirm");
    const title = document.getElementById("dash-confirm-title");
    const message2 = document.getElementById("dash-confirm-message");
    const error = document.getElementById("dash-confirm-error");
    const ok = document.getElementById("dash-confirm-ok");
    let current2 = null;
    let working = false;
    modal3.querySelectorAll("[data-close]").forEach((button2) => button2.addEventListener("click", close));
    modal3.addEventListener("mousedown", (event) => {
      if (event.target === modal3) {
        close();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal3.hidden) {
        close();
      }
    });
    ok.addEventListener("click", confirm);
    function open(options) {
      current2 = options;
      title.textContent = options.title;
      message2.textContent = options.message;
      ok.textContent = options.okLabel;
      showError2("");
      ok.disabled = false;
      modal3.hidden = false;
      ok.focus();
    }
    function close() {
      if (!working) {
        modal3.hidden = true;
        current2 = null;
      }
    }
    async function confirm() {
      if (!current2 || working) {
        return;
      }
      working = true;
      ok.disabled = true;
      try {
        await current2.onConfirm();
        working = false;
        modal3.hidden = true;
        current2 = null;
      } catch (failure) {
        working = false;
        ok.disabled = false;
        if (!(failure instanceof ApiError)) {
          showError2("\uC694\uCCAD\uC744 \uBCF4\uB0B4\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uC5F0\uACB0\uC744 \uD655\uC778\uD558\uACE0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.");
          return;
        }
        showError2(current2.errorMessages?.[failure.code] ?? failure.message);
        current2.onRejected?.(failure);
      }
    }
    function showError2(text) {
      error.textContent = text;
      error.hidden = !text;
    }
    return { open };
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/pages/stats-main/map-menu.js
  var EDGE_GAP_PX = 8;
  function createMapMenu({ onClose } = {}) {
    const menu = document.getElementById("map-menu");
    document.addEventListener("mousedown", (event) => {
      if (!menu.hidden && !menu.contains(event.target)) {
        close();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !menu.hidden) {
        close();
      }
    });
    window.addEventListener("blur", close);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    function open({ x, y, title, items }) {
      if (items.length === 0) {
        close();
        return;
      }
      const heading = document.createElement("div");
      heading.className = "map-menu-title";
      heading.textContent = title;
      menu.replaceChildren(heading, ...items.map(buildItem));
      menu.hidden = false;
      const rect2 = menu.getBoundingClientRect();
      const left = Math.max(
        EDGE_GAP_PX,
        Math.min(x, window.innerWidth - rect2.width - EDGE_GAP_PX)
      );
      const top = Math.max(
        EDGE_GAP_PX,
        Math.min(y, window.innerHeight - rect2.height - EDGE_GAP_PX)
      );
      menu.style.left = `${left}px`;
      menu.style.top = `${top}px`;
      menu.querySelector("button:not([disabled])")?.focus({ preventScroll: true });
    }
    function close() {
      const wasOpen = !menu.hidden;
      menu.hidden = true;
      if (wasOpen) {
        onClose?.();
      }
    }
    function buildItem(item) {
      const button2 = document.createElement("button");
      button2.type = "button";
      button2.className = "map-menu-item" + (item.danger ? " danger" : "");
      button2.setAttribute("role", "menuitem");
      const label = document.createElement("span");
      label.textContent = item.label;
      button2.append(label);
      if (item.disabled) {
        button2.disabled = true;
        if (item.hint) {
          const hint = document.createElement("small");
          hint.textContent = item.hint;
          button2.append(hint);
        }
      } else {
        button2.addEventListener("click", () => {
          close();
          item.onClick();
        });
      }
      return button2;
    }
    return { open, close, isOpen: () => !menu.hidden };
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/pages/stats-main/zone-edit.js
  var ERROR_MESSAGES = {
    INVALID_POLYGON: "\uB2E4\uAC01\uD615\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uC120\uC774 \uACB9\uCE58\uC9C0 \uC54A\uAC8C \uC138 \uC810 \uC774\uC0C1\uC73C\uB85C \uB2E4\uC2DC \uADF8\uB824 \uC8FC\uC138\uC694.",
    OUT_OF_SERVICE_AREA: "\uC11C\uBE44\uC2A4 \uC9C0\uC5ED \uBC16\uC785\uB2C8\uB2E4. \uC11C\uBE44\uC2A4 \uC9C0\uC5ED \uC548\uC5D0\uC11C \uB2E4\uC2DC \uADF8\uB824 \uC8FC\uC138\uC694.",
    DUPLICATE_ZONE_NAME: "\uC774\uBBF8 \uC0AC\uC6A9 \uC911\uC778 \uAD6C\uC5ED \uC774\uB984\uC785\uB2C8\uB2E4.",
    DONG_CHANGE_NOT_ALLOWED: "\uB2E4\uB978 \uB3D9\uC73C\uB85C \uBC14\uB00C\uC5B4 \uC800\uC7A5\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uAC19\uC740 \uB3D9 \uC548\uC5D0\uC11C\uB9CC \uBAA8\uC591\uC744 \uBC14\uAFC0 \uC218 \uC788\uC2B5\uB2C8\uB2E4."
  };
  function createZoneEdit({ getLayer, dongName, onChanged, onActiveChange }) {
    const panel = document.getElementById("zone-edit");
    const form = document.getElementById("zone-edit-form");
    const title = document.getElementById("zone-edit-title");
    const area = document.getElementById("zone-edit-area");
    const dong = document.getElementById("zone-edit-dong");
    const error = document.getElementById("zone-edit-error");
    const nameInput = document.getElementById("zone-edit-name");
    const nameError = document.getElementById("zone-edit-name-error");
    const submit2 = document.getElementById("zone-edit-submit");
    let edit = null;
    let previewRequest = 0;
    document.getElementById("zone-edit-cancel").addEventListener("click", () => cancel());
    nameInput.addEventListener("input", updateSubmit);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      save2();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && edit) {
        cancel();
      }
    });
    function begin(zone) {
      edit = { zone, boundary: null, shapeOk: true };
      title.textContent = `'${zone.name}' \uC218\uC815`;
      nameInput.value = zone.name;
      area.textContent = `${formatNumber(Math.round(zone.areaM2))}\u33A1`;
      dong.textContent = dongName();
      showError2("");
      setNameError("");
      panel.hidden = false;
      onActiveChange?.(true);
      updateSubmit();
      getLayer().startZoneEdit(zone.id, onShapeEdited);
    }
    async function onShapeEdited(boundary) {
      if (!edit) {
        return;
      }
      const request2 = ++previewRequest;
      const { zone } = edit;
      edit.boundary = boundary;
      edit.shapeOk = false;
      showError2("");
      updateSubmit();
      try {
        const preview = await post(
          "/api/v1/manage/zones/preview",
          { boundary },
          { toast: false }
        );
        if (!edit || request2 !== previewRequest) {
          return;
        }
        area.textContent = `${formatNumber(Math.round(zone.areaM2))}\u33A1 \u2192 ${formatNumber(Math.round(preview.areaM2))}\u33A1`;
        dong.textContent = preview.dongName;
        if (preview.dongId === zone.dongId) {
          edit.shapeOk = true;
        } else {
          showError2(ERROR_MESSAGES.DONG_CHANGE_NOT_ALLOWED);
        }
      } catch (failure) {
        if (edit && request2 === previewRequest) {
          reportFailure(failure, showError2, setNameError);
        }
      }
      updateSubmit();
    }
    async function save2() {
      if (!edit) {
        return;
      }
      const { zone } = edit;
      const name = nameInput.value.trim();
      if (!name) {
        setNameError("\uAD6C\uC5ED \uC774\uB984\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.");
        return;
      }
      const body = {};
      if (name !== zone.name) {
        body.name = name;
      }
      if (edit.boundary) {
        body.boundary = edit.boundary;
      }
      if (Object.keys(body).length === 0) {
        showToast("\uBC14\uB010 \uB0B4\uC6A9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.");
        cancel();
        return;
      }
      submit2.disabled = true;
      try {
        const updated = await patch(`/api/v1/manage/zones/${zone.id}`, body, { toast: false });
        finish();
        showToast(`'${updated.name}' \uAD6C\uC5ED\uC744 \uC218\uC815\uD588\uC2B5\uB2C8\uB2E4.`);
        await onChanged();
      } catch (failure) {
        reportFailure(
          failure,
          (message2) => failure.code === "DUPLICATE_ZONE_NAME" ? setNameError(message2) : showError2(message2),
          setNameError
        );
        updateSubmit();
      }
    }
    async function cancel() {
      if (!edit) {
        return;
      }
      finish();
      await onChanged();
    }
    function finish() {
      previewRequest++;
      getLayer()?.stopZoneEdit();
      edit = null;
      panel.hidden = true;
      onActiveChange?.(false);
    }
    function reportFailure(failure, show, showName) {
      if (!(failure instanceof ApiError)) {
        showToast("\uC694\uCCAD\uC744 \uBCF4\uB0B4\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uC5F0\uACB0\uC744 \uD655\uC778\uD558\uACE0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.");
        return;
      }
      if (failure.status === 401) {
        return;
      }
      const fieldMessage = failure.fieldErrors.find((item) => item.field === "name")?.message;
      if (fieldMessage) {
        showName(fieldMessage);
      } else if (ERROR_MESSAGES[failure.code]) {
        show(ERROR_MESSAGES[failure.code]);
      } else if (failure.status === 400) {
        show(failure.message);
      } else {
        showToast(failure.message);
      }
    }
    function showError2(message2) {
      error.textContent = message2;
      error.hidden = !message2;
    }
    function setNameError(message2) {
      nameError.textContent = message2;
      nameError.hidden = !message2;
      nameInput.classList.toggle("err", Boolean(message2));
    }
    function updateSubmit() {
      submit2.disabled = edit === null || !edit.shapeOk || nameInput.value.trim() === "";
    }
    return {
      begin,
      /** 고치는 중이면 true. 이 동안은 지도의 구역·지역 클릭, 우클릭 메뉴가 동작하지 않고 경계를 다시 그리지 않는다 */
      isActive: () => edit !== null,
      /** 지역이 바뀌어 지도가 새로 만들어질 때: 하던 일을 버린다(지도가 새로 그려지므로 원래 모양은 저절로 돌아온다) */
      reset() {
        previewRequest++;
        edit = null;
        panel.hidden = true;
        onActiveChange?.(false);
      }
    };
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/map/zone-draw-tool.js
  var DRAFT_STYLE = { color: "#76a7ff", weight: 2.5, fillColor: "#4f8cff", fillOpacity: 0.2 };
  function createZoneDrawTool(map2, { onDrawn }) {
    let draft = null;
    map2.on("pm:create", (event) => {
      removeDraft();
      draft = event.layer;
      draft.setStyle(DRAFT_STYLE);
      onDrawn(draft.toGeoJSON().geometry);
    });
    function removeDraft() {
      if (draft) {
        draft.remove();
        draft = null;
      }
    }
    return {
      /** 다각형 그리기를 시작한다. 이미 그린 초안은 지운다. */
      startDraw() {
        removeDraft();
        map2.pm.enableDraw("Polygon", { pathOptions: DRAFT_STYLE, finishOn: null });
      },
      /** 그리는 중이거나 그려 둔 초안을 지운다. */
      cancel() {
        map2.pm.disableDraw();
        removeDraft();
      }
    };
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/pages/stats-main/zone-register.js
  var ERROR_MESSAGES2 = {
    INVALID_POLYGON: "\uB2E4\uAC01\uD615\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uC120\uC774 \uACB9\uCE58\uC9C0 \uC54A\uAC8C \uC138 \uC810 \uC774\uC0C1\uC73C\uB85C \uB2E4\uC2DC \uADF8\uB824 \uC8FC\uC138\uC694.",
    OUT_OF_SERVICE_AREA: "\uC11C\uBE44\uC2A4 \uC9C0\uC5ED \uBC16\uC785\uB2C8\uB2E4. \uC11C\uBE44\uC2A4 \uC9C0\uC5ED \uC548\uC5D0\uC11C \uB2E4\uC2DC \uADF8\uB824 \uC8FC\uC138\uC694.",
    DUPLICATE_ZONE_NAME: "\uC774\uBBF8 \uC0AC\uC6A9 \uC911\uC778 \uAD6C\uC5ED \uC774\uB984\uC785\uB2C8\uB2E4."
  };
  function createZoneRegister({ onRegistered }) {
    const confirmModal = document.getElementById("zone-reg-confirm");
    const panel = document.getElementById("zone-reg");
    const guide = document.getElementById("zone-reg-guide");
    const form = document.getElementById("zone-reg-form");
    const area = document.getElementById("zone-reg-area");
    const dong = document.getElementById("zone-reg-dong");
    const error = document.getElementById("zone-reg-error");
    const nameInput = document.getElementById("zone-reg-name");
    const nameError = document.getElementById("zone-reg-name-error");
    const submit2 = document.getElementById("zone-reg-submit");
    const hint = document.getElementById("zone-reg-hint");
    let tool = null;
    let active = false;
    let draft = null;
    let previewRequest = 0;
    let suppressed = false;
    let available = false;
    confirmModal.querySelectorAll("[data-close]").forEach((button2) => button2.addEventListener("click", closeConfirm));
    confirmModal.addEventListener("mousedown", (event) => {
      if (event.target === confirmModal) {
        closeConfirm();
      }
    });
    document.getElementById("zone-reg-ok").addEventListener("click", () => {
      closeConfirm();
      startDraw();
    });
    document.getElementById("zone-reg-cancel").addEventListener("click", cancel);
    document.getElementById("zone-reg-guide-cancel").addEventListener("click", cancel);
    document.getElementById("zone-reg-redraw").addEventListener("click", startDraw);
    nameInput.addEventListener("input", updateSubmit);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      register();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") {
        return;
      }
      if (!confirmModal.hidden) {
        closeConfirm();
      } else if (active) {
        cancel();
      }
    });
    function begin() {
      if (!active && confirmModal.hidden) {
        confirmModal.hidden = false;
        document.getElementById("zone-reg-ok").focus();
      }
    }
    function closeConfirm() {
      confirmModal.hidden = true;
    }
    function startDraw() {
      previewRequest++;
      tool.cancel();
      draft = null;
      active = true;
      panel.hidden = false;
      refreshHint();
      guide.hidden = false;
      form.hidden = true;
      nameInput.value = "";
      showError2("");
      setNameError("");
      tool.startDraw();
    }
    function cancel() {
      previewRequest++;
      tool?.cancel();
      active = false;
      draft = null;
      panel.hidden = true;
      refreshHint();
    }
    function refreshHint() {
      hint.hidden = !available || active || suppressed;
    }
    async function preview(boundary) {
      guide.hidden = true;
      form.hidden = false;
      draft = null;
      area.textContent = "-";
      dong.textContent = "-";
      showError2("");
      setNameError("");
      updateSubmit();
      const request2 = ++previewRequest;
      try {
        const result = await post(
          "/api/v1/manage/zones/preview",
          { boundary },
          { toast: false }
        );
        if (request2 !== previewRequest) {
          return;
        }
        draft = { boundary };
        area.textContent = `${formatNumber(Math.round(result.areaM2))}\u33A1`;
        dong.textContent = result.dongName;
      } catch (failure) {
        if (request2 !== previewRequest) {
          return;
        }
        reportFailure(failure, showError2, setNameError);
      }
      updateSubmit();
    }
    async function register() {
      if (!draft) {
        return;
      }
      const name = nameInput.value.trim();
      if (!name) {
        setNameError("\uAD6C\uC5ED \uC774\uB984\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.");
        return;
      }
      submit2.disabled = true;
      try {
        const created = await post(
          "/api/v1/manage/zones",
          { name, boundary: draft.boundary },
          { toast: false }
        );
        cancel();
        showToast(`'${created.name}' \uAD6C\uC5ED\uC744 \uB4F1\uB85D\uD588\uC2B5\uB2C8\uB2E4.`);
        await onRegistered(created);
      } catch (failure) {
        reportFailure(
          failure,
          (message2) => failure.code === "DUPLICATE_ZONE_NAME" ? setNameError(message2) : showError2(message2),
          setNameError
        );
        updateSubmit();
      }
    }
    function reportFailure(failure, show, showName) {
      if (!(failure instanceof ApiError)) {
        showToast("\uC694\uCCAD\uC744 \uBCF4\uB0B4\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uC5F0\uACB0\uC744 \uD655\uC778\uD558\uACE0 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.");
        return;
      }
      if (failure.status === 401) {
        return;
      }
      const fieldMessage = failure.fieldErrors.find((item) => item.field === "name")?.message;
      if (fieldMessage) {
        showName(fieldMessage);
      } else if (ERROR_MESSAGES2[failure.code]) {
        show(ERROR_MESSAGES2[failure.code]);
      } else if (failure.status === 400) {
        show(failure.message);
      } else {
        showToast(failure.message);
      }
    }
    function showError2(message2) {
      error.textContent = message2;
      error.hidden = !message2;
    }
    function setNameError(message2) {
      nameError.textContent = message2;
      nameError.hidden = !message2;
      nameInput.classList.toggle("err", Boolean(message2));
    }
    function updateSubmit() {
      submit2.disabled = draft === null || nameInput.value.trim() === "";
    }
    return {
      /** 지도가 새로 만들어질 때마다 부른다(지역이 바뀌면 지도를 새로 만든다). 하던 일은 취소한다. */
      attach(map2) {
        cancel();
        closeConfirm();
        tool = createZoneDrawTool(map2, { onDrawn: preview });
      },
      /** 메뉴 `구역 등록`: 확인 창을 연다 */
      begin,
      /** 동 단계일 때만 켠다. 켜져 있고 쉬는 중이면 '빈 곳을 우클릭하면 구역을 등록할 수 있습니다' 안내를 보인다 */
      setAvailable(on) {
        available = on;
        refreshHint();
      },
      /** 구역을 수정하는 동안 true로 둔다(안내 문구를 숨긴다) */
      setSuppressed(on) {
        suppressed = on;
        refreshHint();
      },
      /** 그리는 중이거나 미리보기를 보고 있으면 true */
      isActive() {
        return active;
      },
      cancel
    };
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/pages/stats-main/trend.js
  var TREND_API = "/api/v1/dashboard/trend";
  var DAYS2 = 7;
  var LOAD_ERROR6 = "\uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.";
  var RATES = [
    ["weekRate", "\uC9C0\uB09C\uC8FC \uB300\uBE44"],
    ["monthRate", "\uC9C0\uB09C\uB2EC \uB300\uBE44"],
    ["yearRate", "\uC9C0\uB09C\uD574 \uB300\uBE44"]
  ];
  var byId11 = (id) => document.getElementById(id);
  function createTrendPanel() {
    const box = byId11("peak-trend");
    const list = byId11("trend-list");
    let regionId = null;
    let loadedRegionId = null;
    let latestRequestId2 = 0;
    box.addEventListener("toggle", () => {
      if (box.open) {
        load();
      }
    });
    function setRegion(id) {
      regionId = id;
      if (box.open && loadedRegionId !== id) {
        load();
      }
    }
    async function load() {
      if (regionId === null) {
        return;
      }
      const requestId = ++latestRequestId2;
      const requestedRegionId = regionId;
      try {
        const trend = await get(
          TREND_API,
          { targetType: "REGION", targetId: String(requestedRegionId) },
          { toast: false }
        );
        if (requestId !== latestRequestId2) {
          return;
        }
        loadedRegionId = requestedRegionId;
        list.replaceChildren(
          ...RATES.map(
            ([field, label]) => row3(label, trend[field], graphLink(requestedRegionId))
          )
        );
      } catch {
        if (requestId === latestRequestId2) {
          const message2 = document.createElement("span");
          message2.className = "muted";
          message2.textContent = LOAD_ERROR6;
          list.replaceChildren(message2);
        }
      }
    }
    return { setRegion };
  }
  function graphLink(regionId) {
    const today = /* @__PURE__ */ new Date();
    const params = new URLSearchParams({
      targetType: "REGION",
      targetId: String(regionId),
      interval: "1d",
      from: toDateText2(addDays2(today, -DAYS2)),
      to: toDateText2(today)
    });
    return url(`/stats/graph?${params.toString()}`);
  }
  function row3(label, rate, href) {
    const element = document.createElement("a");
    element.className = "row trend-row";
    element.href = href;
    const name = document.createElement("span");
    name.className = "grow";
    name.textContent = label;
    const value = document.createElement("b");
    if (rate === null) {
      value.className = "muted";
      value.textContent = "-";
    } else {
      const text = formatSigned(rate, 1);
      const up = text.startsWith("+");
      const down = text.startsWith("\u2212");
      value.className = up ? "trend-up" : down ? "trend-down" : "";
      const mark = up ? "\u25B2 " : down ? "\u25BC " : "";
      value.textContent = `${mark}${text}%`;
    }
    element.append(name, value);
    return element;
  }
  function addDays2(date, days) {
    const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    copy.setDate(copy.getDate() + days);
    return copy;
  }
  function toDateText2(date) {
    const pad4 = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad4(date.getMonth() + 1)}-${pad4(date.getDate())}`;
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/map/flow-layer.js
  var NEIGHBOR_COLOR = "#76a7ff";
  var OUTSIDE_COLOR = "#9aa7b8";
  var MIN_WEIGHT = 2;
  var MAX_EXTRA_WEIGHT = 7;
  var SIDE_OFFSET_PX = 6;
  var END_GAP_PX = 16;
  var OUTSIDE_LENGTH_PX = 56;
  var HEAD_PX = 9;
  var DIRECTION_VECTORS = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
  var DIRECTION_NAMES = { N: "\uBD81", E: "\uB3D9", S: "\uB0A8", W: "\uC11C" };
  function createFlowLayer(map2) {
    const group = L.layerGroup().addTo(map2);
    let current2 = null;
    map2.on("zoomend", redraw);
    function show(flows, zones) {
      current2 = { flows, zones };
      redraw();
    }
    function clear() {
      current2 = null;
      group.clearLayers();
    }
    function redraw() {
      group.clearLayers();
      if (!current2) {
        return;
      }
      const byId14 = new Map(current2.zones.map((zone) => [zone.id, zone]));
      const max = Math.max(1, ...current2.flows.map((flow) => flow.count));
      current2.flows.forEach((flow) => {
        const from = byId14.get(flow.fromZoneId);
        if (!from) {
          return;
        }
        const to = flow.toZoneId === null ? null : byId14.get(flow.toZoneId);
        const points = to ? neighborPoints(from, to) : outsidePoints(from, flow.direction);
        const weight = MIN_WEIGHT + MAX_EXTRA_WEIGHT * (flow.count / max);
        const isNeighbor = flow.toZoneId !== null;
        const style = {
          color: isNeighbor ? NEIGHBOR_COLOR : OUTSIDE_COLOR,
          weight,
          opacity: 0.9,
          dashArray: isNeighbor ? null : "6 6"
        };
        const line2 = L.polyline(points.map(toLatLng), style);
        const head = L.polygon(arrowHead(points[0], points[1], weight).map(toLatLng), {
          ...style,
          dashArray: null,
          fillColor: style.color,
          fillOpacity: 0.9,
          weight: 1
        });
        const label = tooltip2(from, to, flow);
        line2.bindTooltip(label, { sticky: true });
        head.bindTooltip(label, { sticky: true });
        group.addLayer(line2);
        group.addLayer(head);
      });
    }
    function point(zone) {
      return map2.latLngToLayerPoint(L.latLng(Number(zone.centerLat), Number(zone.centerLng)));
    }
    function toLatLng(layerPoint) {
      return map2.layerPointToLatLng(layerPoint);
    }
    function neighborPoints(from, to) {
      const a = point(from);
      const b = point(to);
      const length = a.distanceTo(b) || 1;
      const unit = L.point((b.x - a.x) / length, (b.y - a.y) / length);
      const side = L.point(-unit.y * SIDE_OFFSET_PX, unit.x * SIDE_OFFSET_PX);
      const gap = Math.min(END_GAP_PX, length / 3);
      return [a.add(unit.multiplyBy(gap)).add(side), b.subtract(unit.multiplyBy(gap)).add(side)];
    }
    function outsidePoints(from, direction2) {
      const a = point(from);
      const [dx, dy] = DIRECTION_VECTORS[direction2] ?? [0, -1];
      const unit = L.point(dx, dy);
      return [
        a.add(unit.multiplyBy(END_GAP_PX)),
        a.add(unit.multiplyBy(END_GAP_PX + OUTSIDE_LENGTH_PX))
      ];
    }
    return { show, clear };
  }
  function arrowHead(start2, end, weight) {
    const length = start2.distanceTo(end) || 1;
    const unit = L.point((end.x - start2.x) / length, (end.y - start2.y) / length);
    const size = HEAD_PX + weight;
    const back = end.subtract(unit.multiplyBy(size));
    const side = L.point(-unit.y * size * 0.55, unit.x * size * 0.55);
    return [end, back.add(side), back.subtract(side)];
  }
  function tooltip2(from, to, flow) {
    const box = document.createElement("div");
    const title = document.createElement("b");
    title.textContent = to ? `${from.name} \u2192 ${to.name}` : `${from.name} \u2192 ${flow.toZoneId === null ? "\uAD00\uCE21 \uBC94\uC704 \uBC16" : "\uC9C0\uC5ED \uBC16 \uC774\uC6C3"}(${DIRECTION_NAMES[flow.direction]}\uCABD)`;
    const body = document.createElement("div");
    body.textContent = `${formatNumber(flow.count)}\uBA85(\uCD94\uC815)`;
    box.append(title, body);
    return box;
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/pages/stats-main/flow-tool.js
  var FLOWS_API = "/api/v1/map/flows";
  var HOUR_MS = 60 * 60 * 1e3;
  var PERIOD_HOURS = { "1h": 1, "24h": 24, "7d": 24 * 7, "30d": 24 * 30 };
  var DONG_ONLY = "\uB3D9\uC744 \uACE0\uB974\uBA74 \uC4F8 \uC218 \uC788\uC2B5\uB2C8\uB2E4";
  var LOAD_ERROR7 = "\uC774\uB3D9 \uD750\uB984\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.";
  var byId12 = (id) => document.getElementById(id);
  function createFlowTool() {
    const toggle = byId12("flow-toggle");
    const period = byId12("flow-period");
    const status = byId12("flow-status");
    let layer2 = null;
    let regionId = null;
    let enabled = false;
    let on = false;
    let zones = [];
    let latestRequestId2 = 0;
    toggle.addEventListener("click", () => {
      on = !on;
      render3();
      if (on) {
        load();
      } else {
        layer2?.clear();
      }
    });
    period.addEventListener("change", () => {
      if (on) {
        load();
      }
    });
    render3();
    function setRegion(map2, id, isDong) {
      layer2 = createFlowLayer(map2);
      regionId = id;
      enabled = isDong;
      if (!enabled) {
        on = false;
      }
      render3();
    }
    function refresh2(zoneItems2) {
      zones = zoneItems2;
      if (on) {
        load();
      }
    }
    function render3() {
      toggle.disabled = !enabled;
      toggle.title = enabled ? "" : DONG_ONLY;
      toggle.classList.toggle("on", on);
      toggle.setAttribute("aria-pressed", String(on));
      period.hidden = !on;
      status.hidden = true;
    }
    async function load() {
      if (regionId === null || !layer2) {
        return;
      }
      const requestId = ++latestRequestId2;
      const to = /* @__PURE__ */ new Date();
      const from = new Date(to.getTime() - PERIOD_HOURS[period.value] * HOUR_MS);
      try {
        const flows = await get(
          FLOWS_API,
          { regionId: String(regionId), from: toLocalText(from), to: toLocalText(to) },
          { toast: false }
        );
        if (requestId !== latestRequestId2 || !on) {
          return;
        }
        layer2.show(flows, zones);
        status.textContent = flows.length === 0 ? "\uC774 \uAE30\uAC04\uC5D0 \uC774\uB3D9\uC774 \uC5C6\uC2B5\uB2C8\uB2E4." : "";
        status.hidden = flows.length > 0;
      } catch {
        if (requestId === latestRequestId2) {
          layer2.clear();
          status.textContent = LOAD_ERROR7;
          status.hidden = false;
        }
      }
    }
    return { setRegion, refresh: refresh2 };
  }
  function toLocalText(date) {
    const pad4 = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad4(date.getMonth() + 1)}-${pad4(date.getDate())}T${pad4(date.getHours())}:${pad4(date.getMinutes())}`;
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/pages/stats-main/heatmap-tool.js
  var HEATMAP_API = "/api/v1/map/heatmap";
  var DEFAULT_DAYS = 28;
  var PLAY_INTERVAL_MS = 1e3;
  var HEAT_COLOR = "#4f8cff";
  var MIN_OPACITY = 0.12;
  var MAX_OPACITY = 0.8;
  var ITEM_UNITS = {
    COUNT: ["\uD3C9\uADE0 \uC778\uC6D0", "\uBA85", 0],
    DENSITY: ["\uD3C9\uADE0 \uBC00\uC9D1\uB3C4", "\uBA85/\u33A1", 2],
    INFLOW: ["\uC2DC\uAC04\uB2F9 \uC720\uC785", "\uBA85", 1],
    OUTFLOW: ["\uC2DC\uAC04\uB2F9 \uC720\uCD9C", "\uBA85", 1]
  };
  var TOO_LONG = "\uAE30\uAC04\uC740 \uCD5C\uB300 1\uB144\uAE4C\uC9C0 \uACE0\uB97C \uC218 \uC788\uC2B5\uB2C8\uB2E4.";
  var REVERSED = "\uB05D \uB0A0\uC9DC\uB294 \uC2DC\uC791 \uB0A0\uC9DC\uBCF4\uB2E4 \uC55E\uC124 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.";
  var LOAD_ERROR8 = "\uD788\uD2B8\uB9F5\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.";
  var byId13 = (id) => document.getElementById(id);
  function createHeatmapTool() {
    const toggle = byId13("heatmap-toggle");
    const box = byId13("heatmap-box");
    const fromInput = byId13("heatmap-from");
    const toInput = byId13("heatmap-to");
    const itemSelect = byId13("heatmap-item");
    const dayTypeSelect = byId13("heatmap-day-type");
    const slider = byId13("heatmap-hour");
    const hourLabel = byId13("heatmap-hour-label");
    const playButton = byId13("heatmap-play");
    const range = byId13("heatmap-range");
    const status = byId13("heatmap-status");
    let layer2 = null;
    let regionId = null;
    let on = false;
    let data = null;
    let playTimer = null;
    let latestRequestId2 = 0;
    setDefaultPeriod();
    slider.value = String((/* @__PURE__ */ new Date()).getHours());
    toggle.addEventListener("click", () => {
      on = !on;
      render3();
      if (on) {
        load();
      } else {
        stop();
        data = null;
        layer2?.paintBoundaries(null);
      }
    });
    [fromInput, toInput, itemSelect, dayTypeSelect].forEach(
      (input) => input.addEventListener("change", load)
    );
    slider.addEventListener("input", paint);
    playButton.addEventListener("click", () => playTimer ? stop() : play());
    render3();
    function setRegion(statusLayer, id) {
      layer2 = statusLayer;
      regionId = id;
      data = null;
      if (on) {
        load();
      }
    }
    function setDefaultPeriod() {
      const yesterday = addDays3(/* @__PURE__ */ new Date(), -1);
      fromInput.value = toDateText3(addDays3(yesterday, -(DEFAULT_DAYS - 1)));
      toInput.value = toDateText3(yesterday);
    }
    function render3() {
      toggle.classList.toggle("on", on);
      toggle.setAttribute("aria-pressed", String(on));
      box.hidden = !on;
    }
    async function load() {
      if (!on || regionId === null || !layer2) {
        return;
      }
      const invalid = validate2();
      if (invalid) {
        showStatus(invalid);
        return;
      }
      const requestId = ++latestRequestId2;
      const params = {
        regionId: String(regionId),
        from: fromInput.value,
        to: toDateText3(addDays3(parseDate(toInput.value), 1)),
        item: itemSelect.value,
        dayType: dayTypeSelect.value
      };
      try {
        const response = await get(HEATMAP_API, params, { toast: false });
        if (requestId !== latestRequestId2 || !on) {
          return;
        }
        data = response;
        showStatus(response.min === null ? "\uC774 \uAE30\uAC04\uC5D0 \uB370\uC774\uD130\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4." : "");
        paint();
      } catch (error) {
        if (requestId === latestRequestId2) {
          data = null;
          layer2.paintBoundaries(/* @__PURE__ */ new Map());
          showStatus(error?.message || LOAD_ERROR8);
        }
      }
    }
    function validate2() {
      const from = parseDate(fromInput.value);
      const to = parseDate(toInput.value);
      if (!from || !to) {
        return "\uAE30\uAC04\uC744 \uACE8\uB77C \uC8FC\uC138\uC694.";
      }
      if (to < from) {
        return REVERSED;
      }
      const limit = new Date(from.getFullYear() + 1, from.getMonth(), from.getDate());
      return addDays3(to, 1) > limit ? TOO_LONG : null;
    }
    function paint() {
      const hour = Number(slider.value);
      hourLabel.textContent = `${hour}\uC2DC`;
      if (!data) {
        return;
      }
      const [label, unit, decimals] = ITEM_UNITS[itemSelect.value];
      const min = data.min === null ? 0 : Number(data.min);
      const max = data.max === null ? 0 : Number(data.max);
      range.textContent = data.min === null ? "" : `${formatDecimal(min, decimals)} ~ ${formatDecimal(max, decimals)}${unit}`;
      const painted = /* @__PURE__ */ new Map();
      data.units.forEach((unitId) => {
        const value = data.values[String(unitId)]?.[hour];
        if (value === null || value === void 0) {
          return;
        }
        const number = Number(value);
        const ratio = max > min ? (number - min) / (max - min) : 1;
        painted.set(unitId, {
          color: HEAT_COLOR,
          fillOpacity: MIN_OPACITY + ratio * (MAX_OPACITY - MIN_OPACITY),
          label: `${hour}\uC2DC ${label} ${formatDecimal(number, decimals)}${unit}`
        });
      });
      layer2.paintBoundaries(painted);
    }
    function play() {
      playButton.textContent = "\uC815\uC9C0";
      playButton.setAttribute("aria-pressed", "true");
      playTimer = window.setInterval(() => {
        slider.value = String((Number(slider.value) + 1) % 24);
        paint();
      }, PLAY_INTERVAL_MS);
    }
    function stop() {
      window.clearInterval(playTimer);
      playTimer = null;
      playButton.textContent = "\uC7AC\uC0DD";
      playButton.setAttribute("aria-pressed", "false");
    }
    function showStatus(text) {
      status.textContent = text;
      status.hidden = text === "";
    }
    return { setRegion };
  }
  function addDays3(date, days) {
    const copy = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    copy.setDate(copy.getDate() + days);
    return copy;
  }
  function parseDate(text) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text ?? "");
    return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
  }
  function toDateText3(date) {
    const pad4 = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad4(date.getMonth() + 1)}-${pad4(date.getDate())}`;
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/pages/stats-main.js
  var REFRESH_MS = 6e4;
  var STALE_MS = 15e4;
  var STREAM_DEBOUNCE_MS = 300;
  var LEVEL_LABELS2 = ["\uC2DC\xB7\uB3C4", "\uC2DC\xB7\uAD70\xB7\uAD6C", "\uC74D\xB7\uBA74\xB7\uB3D9"];
  var EMD = "EMD";
  var isAdmin = document.getElementById("dash").dataset.admin === "true";
  var selects = ["filter-sido", "filter-sigungu", "filter-emd"].map(
    (id) => document.getElementById(id)
  );
  var backButton = document.getElementById("map-back");
  var levels = [];
  var path = [];
  var map = null;
  var layer = null;
  var deck = null;
  var abnormalPanel = createAbnormalPanel();
  var hourlyLevelsPanel = createHourlyLevelsPanel();
  var visitPatternPanel = createVisitPatternPanel();
  var peakHoursPanel = createPeakHoursPanel();
  var trendPanel = createTrendPanel();
  var flowTool = createFlowTool();
  var heatmapTool = createHeatmapTool();
  var mapMenu = isAdmin ? createMapMenu({ onClose: () => layer?.releaseZone() }) : null;
  var confirmDialog = isAdmin ? createConfirmDialog() : null;
  var zoneRegister = isAdmin ? createZoneRegister({ onRegistered: onZoneRegistered }) : null;
  var zoneEdit = isAdmin ? createZoneEdit({
    getLayer: () => layer,
    dongName: () => path[path.length - 1].name,
    onChanged: () => refresh(),
    // 구역을 수정하는 동안에는 하단 안내 문구('빈 곳을 우클릭하면 구역을 등록할 수 있습니다')를 숨긴다
    onActiveChange: (active) => zoneRegister?.setSuppressed(active)
  }) : null;
  var zoneShapeList = [];
  var cameraForm = isAdmin ? initCameraForm({ onSaved: () => refresh() }) : null;
  var auxPanel = null;
  var zoneItems = [];
  var zoneTab = "count";
  var renderedRegionId = null;
  var stream = null;
  var streamConnected = false;
  var streamTimer = null;
  var lastRefreshAt = 0;
  var lastSummary = null;
  var childrenCache = /* @__PURE__ */ new Map();
  start();
  async function start() {
    levels = await get("/api/v1/meta/levels");
    auxPanel = createAuxMetricsPanel(levels);
    renderMapLegend(levels);
    renderLevelRules(levels);
    initPanelToggle();
    initZoneTabs();
    initExportModal();
    document.getElementById("export-open").addEventListener("click", openExport);
    window.addEventListener("popstate", () => selectFromUrl());
    if (isAdmin) {
      initLiveView();
      deck = createDeck({
        levels,
        onReload: loadCameras,
        onOpenLive: openLiveView,
        onResize: () => {
          layer?.refreshSize();
          updateVisibleZones();
        }
      });
    }
    onNowCounts(() => renderSummaryCount(lastSummary, nowTotal()));
    await selectFromUrl();
    window.setInterval(pollIfNeeded, REFRESH_MS);
  }
  function connectStream(regionId) {
    stream?.close();
    streamConnected = false;
    const source = new EventSource(url(`/api/v1/stats/stream?regionId=${regionId}`));
    stream = source;
    source.addEventListener("open", () => setStreamConnected(true));
    source.addEventListener("error", () => setStreamConnected(false));
    source.addEventListener("now", (event) => {
      if (stream !== source) {
        return;
      }
      try {
        setNowCounts(JSON.parse(event.data).items ?? []);
      } catch {
      }
    });
    source.addEventListener("stat", () => {
      if (stream !== source) {
        return;
      }
      window.clearTimeout(streamTimer);
      streamTimer = window.setTimeout(refreshSafely, STREAM_DEBOUNCE_MS);
    });
  }
  function setStreamConnected(connected) {
    streamConnected = connected;
    document.getElementById("stream-status").hidden = connected;
  }
  function pollIfNeeded() {
    if (!streamConnected || Date.now() - lastRefreshAt > STALE_MS) {
      refreshSafely();
    }
  }
  async function refreshSafely() {
    try {
      await refresh();
    } catch {
    }
  }
  async function children(parentId) {
    const key = parentId ?? "root";
    if (!childrenCache.has(key)) {
      childrenCache.set(
        key,
        await get("/api/v1/regions", parentId === null ? void 0 : { parentId })
      );
    }
    return childrenCache.get(key);
  }
  async function findPath(regionId) {
    let frontier = (await children(null)).map((region) => [region]);
    for (let depth = 0; depth < LEVEL_LABELS2.length && frontier.length > 0; depth++) {
      const hit = frontier.find((candidate) => candidate[depth].id === regionId);
      if (hit) {
        return hit;
      }
      if (depth === LEVEL_LABELS2.length - 1) {
        break;
      }
      const next = [];
      for (const candidate of frontier) {
        const kids = await children(candidate[depth].id);
        kids.forEach((kid) => next.push([...candidate, kid]));
      }
      frontier = next;
    }
    return null;
  }
  async function selectFromUrl() {
    const regionId = Number(new URLSearchParams(window.location.search).get("regionId"));
    let found = regionId ? await findPath(regionId) : null;
    if (!found) {
      const top = await children(null);
      found = top.length > 0 ? [top[0]] : [];
    }
    await applyPath(found, false);
  }
  async function applyPath(newPath, pushUrl) {
    path = newPath;
    if (path.length === 0) {
      return;
    }
    const target = path[path.length - 1];
    if (pushUrl) {
      const url2 = new URL(window.location.href);
      url2.searchParams.set("regionId", String(target.id));
      window.history.pushState(null, "", url2);
    }
    await renderFilter();
    await loadRegion();
  }
  async function renderFilter() {
    for (let depth = 0; depth < selects.length; depth++) {
      const select = selects[depth];
      const options = depth === 0 ? await children(null) : path[depth - 1] ? await children(path[depth - 1].id) : [];
      select.replaceChildren(...optionList(options, depth));
      select.value = path[depth] ? String(path[depth].id) : "";
      select.disabled = options.length === 0 || depth > 0 && !path[depth - 1];
      select.onchange = () => onFilterChange(depth, select.value);
    }
  }
  function optionList(regions, depth) {
    const list = regions.map((region) => {
      const option2 = document.createElement("option");
      option2.value = String(region.id);
      option2.textContent = region.name;
      return option2;
    });
    if (depth > 0) {
      const all = document.createElement("option");
      all.value = "";
      all.textContent = `${LEVEL_LABELS2[depth]} \uC804\uCCB4`;
      list.unshift(all);
    }
    return list;
  }
  async function onFilterChange(depth, value) {
    const base = path.slice(0, depth);
    if (value !== "") {
      const options = depth === 0 ? await children(null) : await children(path[depth - 1].id);
      base.push(options.find((region) => String(region.id) === value));
    }
    await applyPath(base, true);
  }
  function openExport() {
    const target = path[path.length - 1];
    if (!target) {
      return;
    }
    const today = /* @__PURE__ */ new Date();
    const from = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const to = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    openExportModal({ region: { id: target.id, name: target.name }, interval: "1h", from, to });
  }
  async function loadRegion() {
    const target = path[path.length - 1];
    renderBackButton();
    renderGraphLink(target.id);
    const resetView = renderedRegionId !== target.id;
    if (resetView) {
      map = createRegionMap(document.getElementById("dash-map"), target, map);
      layer = createStatusLayer(map, {
        onSelectRegion: selectChildRegion,
        onSelectSibling: selectSiblingRegion,
        onZoneMenu: isAdmin ? openZoneMenu : void 0,
        onEmptyMenu: isAdmin ? openEmptyMenu : void 0,
        // 구역을 그리거나 고치는 중에는 지도의 지역·구역 클릭과 우클릭을 무시한다
        isBusy: isMapBusy,
        onViewStart: () => mapMenu?.close(),
        onViewChange: updateVisibleZones,
        // 관리자 앱: 구역 핀을 누르면 그 구역 캠의 실시간 보기 창(SCR-A-008)
        // 사용자 앱: onPinClick이 없으면 구역 정보 팝업(인원·밀집도·단계, SCR-C-003)
        onPinClick: isAdmin ? openLiveForZone : void 0,
        levels
      });
      renderedRegionId = target.id;
      zoneEdit?.reset();
      zoneRegister?.attach(map);
      connectStream(target.id);
      abnormalPanel.setRegion(target.id);
      hourlyLevelsPanel.setRegion(target.id);
      visitPatternPanel.setRegion(target.id);
      peakHoursPanel.setRegion(target.id);
      trendPanel.setRegion(target.id);
      flowTool.setRegion(map, target.id, target.level === EMD);
      heatmapTool.setRegion(layer, target.id);
      auxPanel.setRegion(target.id);
    }
    await refresh();
  }
  backButton.addEventListener("click", () => {
    if (path.length > 1) {
      applyPath(path.slice(0, -1), true);
    }
  });
  function renderBackButton() {
    const parent = path.length > 1 ? path[path.length - 2] : null;
    backButton.hidden = parent === null;
    if (parent) {
      backButton.textContent = `\u2190 ${parent.name}`;
    }
  }
  async function selectChildRegion(id) {
    const target = path[path.length - 1];
    const child = (await children(target.id)).find((region) => region.id === id);
    if (child) {
      await applyPath([...path, child], true);
    }
  }
  async function onZoneRegistered(created) {
    const target = path[path.length - 1];
    if (target.level === EMD && created.dongId !== target.id) {
      showToast("\uB2E4\uB978 \uB3D9\uC5D0 \uB4F1\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uD574\uB2F9 \uB3D9\uC744 \uC120\uD0DD\uD558\uBA74 \uC9C0\uB3C4\uC5D0 \uBCF4\uC785\uB2C8\uB2E4.");
    }
    await refresh();
  }
  function isMapBusy() {
    return zoneRegister?.isActive() === true || zoneEdit?.isActive() === true;
  }
  function openZoneMenu(zoneId, event) {
    const zone = zoneShapeList.find((candidate) => candidate.id === zoneId);
    if (zone && path[path.length - 1].level === EMD) {
      layer.holdZone(zoneId);
      mapMenu.open({
        x: event.clientX,
        y: event.clientY,
        title: zone.name,
        items: buildZoneMenu(zone)
      });
    }
  }
  function openEmptyMenu(latLng, event) {
    const target = path[path.length - 1];
    if (target.level === EMD) {
      mapMenu.open({
        x: event.clientX,
        y: event.clientY,
        title: target.name,
        items: buildEmptyMenu()
      });
    }
  }
  function buildZoneMenu(zone) {
    const items = [{ label: "\uAD6C\uC5ED \uC218\uC815", onClick: () => zoneEdit.begin(zone) }];
    const camera = deck?.cameraByZone(zone.id);
    const running = camera && (camera.status === "RUNNING" || camera.status === "PREPARING" || camera.runRequested);
    items.push({
      label: "\uAD6C\uC5ED \uC0AD\uC81C",
      danger: true,
      disabled: Boolean(running),
      hint: ZONE_DELETE_BLOCKED,
      onClick: () => askDeleteZone(zone)
    });
    if (camera) {
      items.push({
        label: "\uCEA0 \uC218\uC815",
        disabled: camera.status !== "STOPPED" || Boolean(camera.runRequested),
        hint: CAMERA_EDIT_BLOCKED,
        onClick: () => cameraForm.openEdit(camera)
      });
      items.push({
        label: "\uCEA0 \uC0AD\uC81C",
        danger: true,
        disabled: camera.status !== "STOPPED" || Boolean(camera.runRequested),
        // 가동 요청 안내는 정지 상태인데 요청만 남은 때(캠 관리 화면과 같은 규칙). 가동 중·준비 중이면 정지부터 하라고 안내한다
        hint: camera.status === "STOPPED" && camera.runRequested ? CAMERA_RUN_PENDING : CAMERA_DELETE_BLOCKED,
        onClick: () => askDeleteCamera(camera)
      });
    }
    return items;
  }
  var CAMERA_DELETE_BLOCKED = "\uC815\uC9C0 \uC0C1\uD0DC\uC5D0\uC11C\uB9CC \uC0AD\uC81C\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uBA3C\uC800 \uC815\uC9C0\uD574 \uC8FC\uC138\uC694.";
  var CAMERA_RUN_PENDING = "\uAC00\uB3D9 \uC694\uCCAD \uCC98\uB9AC \uC911\uC785\uB2C8\uB2E4. \uC7A0\uC2DC \uB4A4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uAC70\uB098 \uC815\uC9C0\uD574 \uC8FC\uC138\uC694";
  var CAMERA_EDIT_BLOCKED = "\uC815\uC9C0 \uC0C1\uD0DC\uC5D0\uC11C\uB9CC \uACE0\uCE60 \uC218 \uC788\uC2B5\uB2C8\uB2E4. \uBA3C\uC800 \uC815\uC9C0\uD574 \uC8FC\uC138\uC694.";
  var ZONE_DELETE_BLOCKED = "\uAC00\uB3D9 \uC911\uC774\uAC70\uB098 \uAC00\uB3D9\uC744 \uC694\uCCAD\uD55C \uCEA0\uC774 \uC788\uC5B4 \uC0AD\uC81C\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uCEA0\uC744 \uBA3C\uC800 \uC815\uC9C0\uD574 \uC8FC\uC138\uC694.";
  function askDeleteZone(zone) {
    confirmDialog.open({
      title: "\uAD6C\uC5ED \uC0AD\uC81C",
      message: `'${zone.name}' \uAD6C\uC5ED\uC744 \uC0AD\uC81C\uD560\uAE4C\uC694? \uAC00\uB3D9 \uC774\uB825\uC774 \uC788\uC73C\uBA74 \uAE30\uB85D\uC740 \uB0A8\uACE0 \uBAA9\uB85D\uC5D0\uC11C\uB9CC \uC0AC\uB77C\uC9D1\uB2C8\uB2E4.`,
      okLabel: "\uC0AD\uC81C",
      errorMessages: { CAMERA_RUNNING: ZONE_DELETE_BLOCKED },
      // 서버가 거절하면(가동 중, 이미 지워짐) 화면 값이 낡았다는 뜻이라 다시 읽어 메뉴 항목을 새로 맞춘다
      onRejected: () => refreshSafely(),
      onConfirm: async () => {
        await del(`/api/v1/manage/zones/${zone.id}`, { toast: false });
        showToast(`'${zone.name}' \uAD6C\uC5ED\uC744 \uC0AD\uC81C\uD588\uC2B5\uB2C8\uB2E4.`);
        await refreshSafely();
      }
    });
  }
  function askDeleteCamera(camera) {
    confirmDialog.open({
      title: "\uCEA0 \uC0AD\uC81C",
      message: "\uC774 \uCEA0\uC744 \uC0AD\uC81C\uD560\uAE4C\uC694? \uAC00\uB3D9\uD55C \uC801\uC774 \uC788\uC73C\uBA74 \uC9C0\uB09C \uB179\uD654\xB7\uD1B5\uACC4\uB294 \uB0A8\uC2B5\uB2C8\uB2E4.",
      okLabel: "\uC0AD\uC81C",
      errorMessages: { CAMERA_NOT_STOPPED: CAMERA_DELETE_BLOCKED },
      // 서버가 거절하면(그 사이 가동됨 등) 화면 값이 낡았다는 뜻이라 다시 읽어 메뉴 항목을 새로 맞춘다
      onRejected: () => refreshSafely(),
      onConfirm: async () => {
        await del(`/api/v1/manage/cameras/${camera.id}`, { toast: false });
        showToast(`'${camera.name}' \uCEA0\uC744 \uC0AD\uC81C\uD588\uC2B5\uB2C8\uB2E4.`);
        await refreshSafely();
      }
    });
  }
  function buildEmptyMenu() {
    const items = [{ label: "\uAD6C\uC5ED \uB4F1\uB85D", onClick: () => zoneRegister.begin() }];
    return items;
  }
  async function selectSiblingRegion(id) {
    const parent = path.length >= 2 ? path[path.length - 2] : null;
    const sibling = parent ? (await children(parent.id)).find((region) => region.id === id) : null;
    if (sibling) {
      await applyPath([...path.slice(0, -1), sibling], true);
    }
  }
  async function refresh() {
    const target = path[path.length - 1];
    const isDong = target.level === EMD;
    const [summary, zones, child, zoneShapes] = await Promise.all([
      get("/api/v1/dashboard/summary", { targetType: "REGION", targetId: target.id }),
      get("/api/v1/map/status", { regionId: target.id, unit: "ZONE" }),
      get("/api/v1/map/status", { regionId: target.id, unit: "CHILD" }),
      isDong ? get("/api/v1/zones", { dongId: target.id }) : Promise.resolve([])
    ]);
    lastRefreshAt = Date.now();
    if (target !== path[path.length - 1]) {
      return;
    }
    zoneItems = zones.items;
    zoneShapeList = zoneShapes;
    renderTarget(target.name, summary.cameraCount);
    lastSummary = summary;
    renderSummary(summary, levels);
    renderZonePanel(zoneItems, zoneTab, levels);
    auxPanel.refresh(zoneItems);
    hourlyLevelsPanel.refresh();
    const statusById = new Map(child.items.map((item) => [item.id, item]));
    if (zoneEdit?.isActive()) {
    } else if (isDong) {
      layer.showBoundaries(
        zoneShapes.map((zone) => ({
          id: zone.id,
          name: zone.name,
          boundary: zone.boundary,
          item: statusById.get(zone.id),
          zoom: true
        })),
        true
      );
    } else {
      const kids = await children(target.id);
      layer.showBoundaries(
        kids.map((region) => ({
          id: region.id,
          name: region.name,
          boundary: region.boundary,
          item: statusById.get(region.id)
        })),
        true
      );
    }
    const parent = path.length >= 2 ? path[path.length - 2] : null;
    const siblings = isDong && parent ? (await children(parent.id)).filter((region) => region.id !== target.id) : [];
    if (target !== path[path.length - 1]) {
      return;
    }
    layer.showOutlines(target, siblings);
    zoneRegister?.setAvailable(isDong);
    layer.showPins(zoneItems);
    flowTool.refresh(zoneItems);
    if (isAdmin) {
      await loadCameras();
    }
    updateVisibleZones();
  }
  async function loadCameras() {
    const target = path[path.length - 1];
    const cameras = await get("/api/v1/manage/cameras", { regionId: target.id });
    deck.setCameras(cameras);
    updateLiveView(cameras);
    updateVisibleZones();
  }
  function openLiveForZone(zoneId) {
    if (isMapBusy()) {
      return;
    }
    const camera = deck?.cameraByZone(zoneId);
    if (!camera) {
      cameraForm.openRegister(zoneId);
    } else if (camera.status !== "RUNNING") {
      showToast("\uAC00\uB3D9 \uC911\uC778 \uCEA0\uC774 \uC544\uB2C8\uB77C \uC2E4\uC2DC\uAC04 \uC601\uC0C1\uC744 \uBCFC \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.");
    } else {
      openLiveView(camera);
    }
  }
  function updateVisibleZones() {
    if (deck && layer) {
      deck.setVisibleZones(layer.visibleZoneIds());
    }
  }
  function initZoneTabs() {
    const buttons = document.querySelectorAll("[data-zone-tab]");
    buttons.forEach((button2) => {
      button2.addEventListener("click", () => {
        zoneTab = button2.dataset.zoneTab;
        buttons.forEach((other) => {
          const on = other === button2;
          other.classList.toggle("primary", on);
          other.classList.toggle("secondary", !on);
        });
        renderZonePanel(zoneItems, zoneTab, levels);
      });
    });
  }
  function initPanelToggle() {
    const panel = document.getElementById("stat-panel");
    const open = document.getElementById("panel-open");
    const setCollapsed = (collapsed) => {
      panel.hidden = collapsed;
      open.hidden = !collapsed;
      layer?.refreshSize();
    };
    document.getElementById("panel-collapse").addEventListener("click", () => setCollapsed(true));
    open.addEventListener("click", () => setCollapsed(false));
  }
})();
