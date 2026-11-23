(() => {
  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/common/toast.js
  var CONTAINER_ID = "toast-stack";
  var NOTICE_CONTAINER_ID = "notice-stack";
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
  function showLinkToast({ href, dotClass, title, note }, durationMs = DEFAULT_DURATION_MS) {
    const toast = document.createElement("a");
    toast.className = "toast toast-link";
    toast.href = href;
    toast.setAttribute("role", "alert");
    const dot = document.createElement("span");
    dot.className = `dot ${dotClass}`;
    const strong = document.createElement("b");
    strong.textContent = title;
    const small = document.createElement("span");
    small.className = "muted";
    small.textContent = note;
    toast.append(dot, strong, small);
    getContainer(NOTICE_CONTAINER_ID, "toast-stack toast-stack-top").append(toast);
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

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/common/sse.js
  function connectStream(path, handlers, { onOpen, onError } = {}) {
    const source = new EventSource(url(path));
    if (onOpen) {
      source.addEventListener("open", onOpen);
    }
    if (onError) {
      source.addEventListener("error", onError);
    }
    Object.entries(handlers).forEach(([name, handler]) => {
      source.addEventListener(name, (message) => {
        try {
          handler(JSON.parse(message.data));
        } catch {
        }
      });
    });
    return { close: () => source.close() };
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/common/notifications.js
  var TYPE_LABEL = { CONGESTION: "\uD63C\uC7A1", SURGE: "\uAE09\uC99D", CAM_FAULT: "\uCEA0 \uC774\uC0C1" };
  var LEVEL_LABEL = { 2: "\uC8FC\uC758", 3: "\uC704\uD5D8" };
  var LEVEL_DOT = { 2: "l2", 3: "l3" };
  var MAX_BADGE = 99;
  var EVENT_TOAST_MS = 1e4;
  var badge = document.getElementById("unchecked-badge");
  function startNotifications() {
    connectStream("/api/v1/notifications/stream", {
      "unchecked-count": ({ count }) => renderBadge(count),
      "event-created": (event) => {
        showLinkToast(toastOf(event), EVENT_TOAST_MS);
        window.dispatchEvent(new CustomEvent("we:event-created", { detail: event }));
      },
      "camera-status": (status) => window.dispatchEvent(new CustomEvent("we:camera-status", { detail: status }))
    });
  }
  async function loadUncheckedCount() {
    try {
      const { count } = await get("/api/v1/events/unchecked-count", void 0, { toast: false });
      renderBadge(count);
    } catch {
    }
  }
  function renderBadge(count) {
    if (!badge) {
      return;
    }
    badge.hidden = count <= 0;
    badge.textContent = count > MAX_BADGE ? `${MAX_BADGE}+` : String(count);
  }
  function toastOf({ id, type, zoneName, level }) {
    const label = TYPE_LABEL[type] ?? type;
    const tail = type === "CONGESTION" ? ` ${LEVEL_LABEL[level] ?? ""}`.trimEnd() : "";
    return {
      href: url(`/events?eventId=${encodeURIComponent(id)}`),
      dotClass: type === "CONGESTION" ? LEVEL_DOT[level] ?? "l2" : type === "SURGE" ? "surge" : "off",
      title: `[${label}] ${zoneName}${tail}`,
      note: "\uBC29\uAE08"
    };
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/common/header.js
  var LEGEND_UNIT = "\uBA85/\u33A1";
  initMenus();
  loadLegend();
  if (document.querySelector('[data-header="admin"]') !== null) {
    loadUncheckedCount();
    startNotifications();
  }
  async function loadLegend() {
    const legend = document.getElementById("level-legend");
    if (!legend) {
      return;
    }
    const isAdmin = document.querySelector('[data-header="admin"]') !== null;
    try {
      const levels = await get("/api/v1/meta/levels", void 0, { toast: false });
      legend.replaceChildren(...levels.map((level) => legendItem(level, isAdmin)));
      if (isAdmin) {
        const unit = document.createElement("span");
        unit.className = "muted";
        unit.textContent = LEGEND_UNIT;
        legend.append(unit);
      }
    } catch (error) {
      console.error(error);
    }
  }
  function legendItem({ name, color, minDensity }, showThreshold) {
    const item = document.createElement("span");
    const dot = document.createElement("i");
    dot.className = "dot";
    dot.style.background = color;
    const hasThreshold = showThreshold && Number(minDensity) > 0;
    item.append(dot, hasThreshold ? `${name} ${Number(minDensity)}\u2191` : name);
    return item;
  }
  function initMenus() {
    const menus = document.querySelectorAll("[data-menu]");
    menus.forEach((menu) => {
      const toggle = menu.querySelector("[data-menu-toggle]");
      const list = menu.querySelector("[data-menu-list]");
      toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        const opening = list.hidden;
        closeAll(menus);
        setOpen(menu, opening);
      });
    });
    document.addEventListener("click", (event) => {
      menus.forEach((menu) => {
        if (!menu.contains(event.target)) {
          setOpen(menu, false);
        }
      });
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeAll(menus);
      }
    });
  }
  function closeAll(menus) {
    menus.forEach((menu) => setOpen(menu, false));
  }
  function setOpen(menu, open) {
    menu.querySelector("[data-menu-list]").hidden = !open;
    menu.querySelector("[data-menu-toggle]").setAttribute("aria-expanded", String(open));
  }
})();
