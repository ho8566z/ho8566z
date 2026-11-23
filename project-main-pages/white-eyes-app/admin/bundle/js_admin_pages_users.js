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

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/admin/user-detail.js
  var USERS_API = "/api/v1/users";
  var DEFAULT_ERROR_MESSAGE2 = "\uC77C\uC2DC\uC801\uC778 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.";
  var NOT_FOUND_MESSAGE = "\uC0AC\uC6A9\uC790\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4";
  var WITHDRAWN_STATUS = "WITHDRAWN";
  var WITHDRAWN_SAVE_MESSAGE = "\uD0C8\uD1F4\uD55C \uACC4\uC815\uC740 \uC218\uC815\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4";
  var WITHDRAWN_RESET_MESSAGE = "\uD0C8\uD1F4\uD55C \uACC4\uC815\uC740 \uBE44\uBC00\uBC88\uD638\uB97C \uC7AC\uC124\uC815\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4";
  var EMPTY_VALUE = "";
  var COPY_LABEL = "\uBCF5\uC0AC";
  var COPIED_LABEL = "\uBCF5\uC0AC\uB428";
  var STATUS_LABELS = { PENDING: "\uBBF8\uC2B9\uC778", ACTIVE: "\uC2B9\uC778\uB428", WITHDRAWN: "\uD0C8\uD1F4" };
  var detailModal = document.getElementById("user-detail-modal");
  var detailForm = document.getElementById("user-detail-form");
  var formError = document.getElementById("user-detail-error");
  var saveButton = document.getElementById("user-detail-save");
  var withdrawnNotice = document.getElementById("user-detail-withdrawn");
  var closeButton = detailModal.querySelector("[data-detail-close]");
  var title = document.getElementById("user-detail-title");
  var subtitle = document.getElementById("user-detail-sub");
  var nameInput = document.getElementById("user-detail-name");
  var emailInput = document.getElementById("user-detail-email");
  var phoneInput = document.getElementById("user-detail-phone");
  var resetButton = document.getElementById("user-detail-reset");
  var tempBox = document.getElementById("user-temp-password-box");
  var tempPassword = document.getElementById("user-temp-password");
  var copyButton = document.getElementById("user-temp-copy");
  var confirmModal = document.getElementById("user-reset-confirm-modal");
  var confirmMessage = document.getElementById("user-reset-confirm-message");
  var confirmOk = document.getElementById("user-reset-confirm-ok");
  var current = null;
  var resetting = false;
  var saving = false;
  var changed = false;
  var onClosed = () => {
  };
  function openUserDetail(user, onChanged) {
    current = user;
    changed = false;
    onClosed = onChanged;
    title.textContent = user.loginId;
    subtitle.textContent = `${STATUS_LABELS[user.status] ?? user.status} \xB7 \uAC00\uC785 ${user.createdAt?.slice(0, 10) ?? ""}`;
    nameInput.value = user.name ?? EMPTY_VALUE;
    emailInput.value = user.email ?? EMPTY_VALUE;
    phoneInput.value = user.phone ?? EMPTY_VALUE;
    clearFormErrors();
    hideTempPassword();
    const withdrawn = user.status === WITHDRAWN_STATUS;
    applyWithdrawn(withdrawn);
    detailModal.hidden = false;
    (withdrawn ? closeButton : nameInput).focus();
  }
  function applyWithdrawn(withdrawn) {
    [nameInput, emailInput, phoneInput].forEach((input) => {
      input.readOnly = withdrawn;
    });
    resetButton.disabled = withdrawn;
    saveButton.disabled = withdrawn;
    withdrawnNotice.hidden = !withdrawn;
  }
  function closeDetail() {
    if (resetting || saving) {
      return;
    }
    hideTempPassword();
    detailModal.hidden = true;
    current = null;
    if (changed) {
      changed = false;
      onClosed();
    }
  }
  async function save(event) {
    event.preventDefault();
    if (!current || saving || resetting) {
      return;
    }
    clearFormErrors();
    saving = true;
    saveButton.disabled = true;
    try {
      await patch(
        `${USERS_API}/${current.id}`,
        {
          name: nameInput.value.trim(),
          email: emailInput.value.trim(),
          phone: phoneInput.value.trim()
        },
        { toast: false }
      );
      changed = true;
      saving = false;
      closeDetail();
      return;
    } catch (error) {
      saving = false;
      if (error instanceof ApiError && error.fieldErrors.length > 0) {
        error.fieldErrors.forEach(({ field, message }) => showFieldError(field, message));
      } else if (error instanceof ApiError && error.status === 404) {
        handleError(error);
      } else if (error instanceof ApiError && error.status === 409) {
        changed = true;
        applyWithdrawn(true);
        showFieldError("", WITHDRAWN_SAVE_MESSAGE);
        return;
      } else {
        if (!(error instanceof ApiError)) {
          console.error(error);
        }
        showFieldError("", error instanceof ApiError ? error.message : DEFAULT_ERROR_MESSAGE2);
      }
    }
    saveButton.disabled = false;
  }
  function clearFormErrors() {
    formError.hidden = true;
    formError.textContent = "";
    detailForm.querySelectorAll("[data-error-for]").forEach((hint) => {
      hint.hidden = true;
      hint.textContent = "";
    });
    detailForm.querySelectorAll(".input.err").forEach((input) => input.classList.remove("err"));
  }
  function showFieldError(field, message) {
    const hint = detailForm.querySelector(`[data-error-for="${field}"]`);
    if (!hint) {
      formError.textContent = message;
      formError.hidden = false;
      return;
    }
    hint.textContent = message;
    hint.hidden = false;
    detailForm.elements[field]?.classList?.add("err");
  }
  function openConfirm() {
    confirmMessage.textContent = `'${current.loginId}' \uC0AC\uC6A9\uC790\uC758 \uBE44\uBC00\uBC88\uD638\uB97C \uC7AC\uC124\uC815\uD560\uAE4C\uC694? \uC784\uC2DC \uBE44\uBC00\uBC88\uD638\uAC00 \uBC1C\uAE09\uB418\uACE0 \uC774\uC804 \uBE44\uBC00\uBC88\uD638\uB294 \uC4F8 \uC218 \uC5C6\uC73C\uBA70, \uC5F4\uB824 \uC788\uB294 \uBAA8\uB4E0 \uC138\uC158\uC774 \uC885\uB8CC\uB429\uB2C8\uB2E4.`;
    confirmOk.disabled = false;
    confirmModal.hidden = false;
    confirmOk.focus();
  }
  function closeConfirm() {
    if (resetting) {
      return;
    }
    confirmModal.hidden = true;
    if (current) {
      resetButton.focus();
    }
  }
  async function reset() {
    if (!current || resetting) {
      return;
    }
    resetting = true;
    confirmOk.disabled = true;
    try {
      const result = await post(`${USERS_API}/${current.id}/reset-password`, void 0, {
        toast: false
      });
      showTempPassword(result.temporaryPassword);
      changed = true;
    } catch (error) {
      handleError(error);
    }
    resetting = false;
    closeConfirm();
  }
  function handleError(error) {
    if (error instanceof ApiError && error.status === 404) {
      showToast(NOT_FOUND_MESSAGE);
      changed = true;
      resetting = false;
      confirmModal.hidden = true;
      closeDetail();
      return;
    }
    if (error instanceof ApiError && error.status === 409) {
      changed = true;
      applyWithdrawn(true);
      showToast(WITHDRAWN_RESET_MESSAGE);
      return;
    }
    showToast(error instanceof ApiError ? error.message : DEFAULT_ERROR_MESSAGE2);
  }
  function showTempPassword(value) {
    tempPassword.textContent = value;
    copyButton.textContent = COPY_LABEL;
    tempBox.hidden = false;
  }
  function hideTempPassword() {
    tempPassword.textContent = "";
    tempBox.hidden = true;
  }
  async function copyTempPassword() {
    try {
      await navigator.clipboard.writeText(tempPassword.textContent);
      copyButton.textContent = COPIED_LABEL;
    } catch {
      window.getSelection()?.selectAllChildren(tempPassword);
    }
  }
  detailModal.querySelectorAll("[data-detail-close]").forEach((button) => button.addEventListener("click", closeDetail));
  detailModal.addEventListener("mousedown", (event) => {
    if (event.target === detailModal && tempBox.hidden) {
      closeDetail();
    }
  });
  confirmModal.querySelectorAll("[data-reset-close]").forEach((button) => button.addEventListener("click", closeConfirm));
  confirmModal.addEventListener("mousedown", (event) => {
    if (event.target === confirmModal) {
      closeConfirm();
    }
  });
  detailForm.addEventListener("submit", save);
  resetButton.addEventListener("click", openConfirm);
  confirmOk.addEventListener("click", reset);
  copyButton.addEventListener("click", copyTempPassword);
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }
    if (!confirmModal.hidden) {
      closeConfirm();
    } else if (!detailModal.hidden) {
      closeDetail();
    }
  });

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/admin/pages/users.js
  var USERS_API2 = "/api/v1/users";
  var DEFAULT_ERROR_MESSAGE3 = "\uC77C\uC2DC\uC801\uC778 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.";
  var STATUS_CHANGED_MESSAGE = "\uC0C1\uD0DC\uAC00 \uBC14\uB00C\uC5C8\uC2B5\uB2C8\uB2E4";
  var EMPTY_VALUE2 = "-";
  var ACTIVE_LABEL = "\uD65C\uB3D9 \uC911";
  var PAGE_WINDOW = 2;
  var STATUS_LABELS2 = { PENDING: "\uBBF8\uC2B9\uC778", ACTIVE: "\uC815\uC0C1", WITHDRAWN: "\uD0C8\uD1F4" };
  var STATUS_CHIPS = { PENDING: "prep", ACTIVE: "done", WITHDRAWN: "off" };
  var SORT_MARKS = { asc: "\u2191", desc: "\u2193", none: "\u2195" };
  var FIRST_DIRECTIONS = { createdAt: "desc", lastActiveAt: "desc", loginId: "asc" };
  var FIELD_LABELS = {
    keyword: "\uAC80\uC0C9\uC5B4",
    status: "\uC0C1\uD0DC",
    joinedFrom: "\uAC00\uC785\uC77C \uC2DC\uC791",
    joinedTo: "\uAC00\uC785\uC77C \uB05D",
    active: "\uD65C\uB3D9 \uC911",
    sort: "\uC815\uB82C",
    page: "\uD398\uC774\uC9C0",
    size: "\uD45C\uC2DC \uAC1C\uC218"
  };
  var form = document.getElementById("user-search-form");
  var submitButton = form.querySelector('button[type="submit"]');
  var tableBody = document.getElementById("user-table-body");
  var sortButtons = document.querySelectorAll("#user-table button[data-sort]");
  var truncatedNotice = document.getElementById("user-list-truncated");
  var emptyNotice = document.getElementById("user-list-empty");
  var errorNotice = document.getElementById("user-list-error");
  var pagination = document.getElementById("user-pagination");
  var totalText = document.getElementById("user-total");
  var confirmModal2 = document.getElementById("user-confirm-modal");
  var confirmTitle = document.getElementById("user-confirm-title");
  var confirmMessage2 = document.getElementById("user-confirm-message");
  var confirmOk2 = document.getElementById("user-confirm-ok");
  var state = { filters: {}, size: 20, sortField: "createdAt", sortDirection: "desc", page: 0 };
  var confirmAction = null;
  var confirming = false;
  var latestRequestId = 0;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    readForm();
    state.page = 0;
    loadUsers();
  });
  sortButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const field = button.dataset.sort;
      if (state.sortField === field) {
        state.sortDirection = state.sortDirection === "asc" ? "desc" : "asc";
      } else {
        state.sortField = field;
        state.sortDirection = FIRST_DIRECTIONS[field] ?? "asc";
      }
      state.page = 0;
      loadUsers();
    });
  });
  readForm();
  loadUsers();
  function readForm() {
    const filters = {};
    for (const name of ["keyword", "status", "joinedFrom", "joinedTo", "active"]) {
      const value = form.elements.namedItem(name).value.trim();
      if (value !== "") {
        filters[name] = value;
      }
    }
    state.filters = filters;
    state.size = Number(form.elements.namedItem("size").value);
  }
  async function loadUsers() {
    const requestId = ++latestRequestId;
    submitButton.disabled = true;
    errorNotice.hidden = true;
    errorNotice.textContent = "";
    try {
      const page = await get(
        USERS_API2,
        {
          ...state.filters,
          sort: `${state.sortField},${state.sortDirection}`,
          page: state.page,
          size: state.size
        },
        { toast: false }
      );
      if (requestId === latestRequestId) {
        render(page);
      }
    } catch (error) {
      if (requestId === latestRequestId) {
        showError(error);
      }
    } finally {
      if (requestId === latestRequestId) {
        submitButton.disabled = false;
      }
    }
  }
  function render(page) {
    tableBody.replaceChildren(...page.items.map(toRow));
    emptyNotice.hidden = page.items.length > 0;
    truncatedNotice.hidden = !page.truncated;
    totalText.textContent = `\uCD1D ${formatNumber(page.totalElements)}\uBA85`;
    renderSortState();
    renderPagination(page);
  }
  function toRow(user) {
    const row = document.createElement("tr");
    row.dataset.userId = String(user.id);
    row.append(
      cell(user.loginId),
      cell(user.name),
      statusCell(user.status),
      cell(formatDateTime(user.createdAt)),
      cell(formatDateTime(user.lastActiveAt)),
      activeCell(user.active),
      actionsCell(user)
    );
    row.addEventListener("click", (event) => {
      if (!event.target.closest("button")) {
        openUserDetail(user, loadUsers);
      }
    });
    return row;
  }
  function actionsCell(user) {
    const td = document.createElement("td");
    td.className = "user-actions";
    const wrap = document.createElement("div");
    wrap.className = "row-actions";
    if (user.status === "PENDING") {
      wrap.append(approveButton(user));
    } else if (user.status === "ACTIVE") {
      wrap.append(unapproveButton(user));
    }
    if (user.active) {
      wrap.append(forceLogoutButton(user));
    }
    td.append(wrap);
    return td;
  }
  function approveButton(user) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn primary sm";
    button.textContent = "\uC2B9\uC778";
    button.addEventListener("click", () => approve(button, user));
    return button;
  }
  async function approve(button, user) {
    button.disabled = true;
    try {
      await post(`${USERS_API2}/${user.id}/approve`, void 0, { toast: false });
      button.closest("tr").replaceWith(toRow({ ...user, status: "ACTIVE" }));
    } catch (error) {
      if (error instanceof ApiError && error.code === "INVALID_STATUS") {
        showToast(STATUS_CHANGED_MESSAGE);
        loadUsers();
        return;
      }
      showToast(error instanceof ApiError ? error.message : DEFAULT_ERROR_MESSAGE3);
      button.disabled = false;
    }
  }
  function unapproveButton(user) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn secondary sm";
    button.textContent = "\uC2B9\uC778 \uCDE8\uC18C";
    button.addEventListener(
      "click",
      () => openConfirm2({
        title: "\uC2B9\uC778 \uCDE8\uC18C",
        message: `'${user.loginId}' \uC0AC\uC6A9\uC790\uC758 \uC2B9\uC778\uC744 \uCDE8\uC18C\uD560\uAE4C\uC694? \uBBF8\uC2B9\uC778 \uC0C1\uD0DC\uB85C \uB3CC\uC544\uAC00\uACE0 \uC5F4\uB824 \uC788\uB294 \uBAA8\uB4E0 \uC138\uC158\uC774 \uC885\uB8CC\uB429\uB2C8\uB2E4.`,
        okLabel: "\uC2B9\uC778 \uCDE8\uC18C",
        run: () => unapprove(user)
      })
    );
    return button;
  }
  async function unapprove(user) {
    try {
      await post(`${USERS_API2}/${user.id}/unapprove`, void 0, { toast: false });
      const row = [...tableBody.rows].find(
        (candidate) => candidate.dataset.userId === String(user.id)
      );
      row?.replaceWith(toRow({ ...user, status: "PENDING", active: false }));
    } catch (error) {
      if (error instanceof ApiError && error.code === "INVALID_STATUS") {
        showToast(STATUS_CHANGED_MESSAGE);
        loadUsers();
        return;
      }
      showToast(error instanceof ApiError ? error.message : DEFAULT_ERROR_MESSAGE3);
    }
  }
  function forceLogoutButton(user) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn secondary sm";
    button.textContent = "\uAC15\uC81C \uB85C\uADF8\uC544\uC6C3";
    button.addEventListener(
      "click",
      () => openConfirm2({
        title: "\uAC15\uC81C \uB85C\uADF8\uC544\uC6C3",
        message: `'${user.loginId}' \uC0AC\uC6A9\uC790\uB97C \uB85C\uADF8\uC544\uC6C3\uC2DC\uD0AC\uAE4C\uC694? \uC5F4\uB824 \uC788\uB294 \uBAA8\uB4E0 \uC138\uC158\uC774 \uC885\uB8CC\uB429\uB2C8\uB2E4.`,
        okLabel: "\uB85C\uADF8\uC544\uC6C3",
        run: () => forceLogout(user)
      })
    );
    return button;
  }
  async function forceLogout(user) {
    try {
      const result = await post(`${USERS_API2}/${user.id}/logout`, void 0, { toast: false });
      showToast(`${result.deletedSessions}\uAC1C \uC138\uC158\uC744 \uC885\uB8CC\uD588\uC2B5\uB2C8\uB2E4`);
      loadUsers();
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : DEFAULT_ERROR_MESSAGE3);
    }
  }
  function openConfirm2(action) {
    confirmAction = action;
    confirmTitle.textContent = action.title;
    confirmMessage2.textContent = action.message;
    confirmOk2.textContent = action.okLabel;
    confirmOk2.disabled = false;
    confirmModal2.hidden = false;
    confirmOk2.focus();
  }
  function closeConfirm2() {
    if (confirming) {
      return;
    }
    confirmModal2.hidden = true;
    confirmAction = null;
  }
  async function runConfirm() {
    if (!confirmAction || confirming) {
      return;
    }
    const action = confirmAction;
    confirming = true;
    confirmOk2.disabled = true;
    await action.run();
    confirming = false;
    closeConfirm2();
  }
  confirmModal2.querySelectorAll("[data-confirm-close]").forEach((button) => button.addEventListener("click", closeConfirm2));
  confirmModal2.addEventListener("mousedown", (event) => {
    if (event.target === confirmModal2) {
      closeConfirm2();
    }
  });
  confirmOk2.addEventListener("click", runConfirm);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !confirmModal2.hidden) {
      closeConfirm2();
    }
  });
  function cell(text) {
    const td = document.createElement("td");
    td.textContent = text ?? EMPTY_VALUE2;
    return td;
  }
  function statusCell(status) {
    const td = document.createElement("td");
    const chip = document.createElement("span");
    chip.className = `chip ${STATUS_CHIPS[status] ?? "off"}`;
    chip.textContent = STATUS_LABELS2[status] ?? status;
    td.append(chip);
    return td;
  }
  function activeCell(active) {
    const td = document.createElement("td");
    if (active) {
      const dot = document.createElement("i");
      dot.className = "dot l1";
      dot.setAttribute("role", "img");
      dot.setAttribute("aria-label", ACTIVE_LABEL);
      dot.title = ACTIVE_LABEL;
      td.append(dot);
    }
    return td;
  }
  function renderSortState() {
    sortButtons.forEach((button) => {
      const field = button.dataset.sort;
      const header = button.closest("th");
      const label = button.dataset.label ?? button.textContent;
      button.dataset.label = label;
      if (field === state.sortField) {
        const ascending = state.sortDirection === "asc";
        header.setAttribute("aria-sort", ascending ? "ascending" : "descending");
        button.textContent = `${label} ${SORT_MARKS[state.sortDirection]}`;
      } else {
        header.setAttribute("aria-sort", "none");
        button.textContent = `${label} ${SORT_MARKS.none}`;
      }
    });
  }
  function renderPagination(page) {
    if (page.totalPages <= 1) {
      pagination.replaceChildren();
      return;
    }
    const buttons = [];
    buttons.push(pageButton("\uC774\uC804", page.page - 1, page.page === 0));
    const first = Math.max(0, page.page - PAGE_WINDOW);
    const last = Math.min(page.totalPages - 1, page.page + PAGE_WINDOW);
    for (let index = first; index <= last; index++) {
      const button = pageButton(String(index + 1), index, index === page.page);
      if (index === page.page) {
        button.setAttribute("aria-current", "page");
      }
      buttons.push(button);
    }
    buttons.push(pageButton("\uB2E4\uC74C", page.page + 1, page.page >= page.totalPages - 1));
    pagination.replaceChildren(...buttons);
  }
  function pageButton(text, targetPage, disabled) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = text;
    button.disabled = disabled;
    button.addEventListener("click", () => {
      state.page = targetPage;
      loadUsers();
    });
    return button;
  }
  function showError(error) {
    if (!(error instanceof ApiError)) {
      console.error(error);
      errorNotice.textContent = DEFAULT_ERROR_MESSAGE3;
    } else if (error.fieldErrors.length > 0) {
      const details = error.fieldErrors.map(
        (fieldError) => `${FIELD_LABELS[fieldError.field] ?? fieldError.field}: ${fieldError.message}`
      );
      errorNotice.textContent = `${error.message} (${details.join(" / ")})`;
    } else {
      errorNotice.textContent = error.message;
    }
    errorNotice.hidden = false;
  }
})();
