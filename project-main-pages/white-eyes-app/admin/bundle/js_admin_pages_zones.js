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
  function put(path, body, options) {
    return request("PUT", path, { body, ...options });
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

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/common/format.js
  function isBlank(value) {
    return value === null || value === void 0 || value === "" || Number.isNaN(Number(value));
  }
  function formatNumber(value) {
    return isBlank(value) ? "-" : Number(value).toLocaleString("ko-KR");
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/map/map-view.js
  var TILE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
  var TILE_ATTRIBUTION = "\xA9 OpenStreetMap contributors";
  var MAX_ZOOM = 19;
  function createMap(element, { center, zoom }) {
    const map = L.map(element, { center, zoom, zoomControl: false, attributionControl: true });
    L.tileLayer(TILE_URL, { maxZoom: MAX_ZOOM, attribution: TILE_ATTRIBUTION }).addTo(map);
    new ResetControl({ center, zoom }).addTo(map);
    return map;
  }
  var ResetControl = L.Control.extend({
    options: { position: "bottomright" },
    initialize(home) {
      this.home = home;
    },
    onAdd(map) {
      const box = L.DomUtil.create("div", "map-ctrl");
      box.append(
        button("+", "\uD655\uB300", () => map.zoomIn()),
        button("\u2212", "\uCD95\uC18C", () => map.zoomOut()),
        button("\uCD08\uAE30\uD654", "\uCC98\uC74C \uC704\uCE58\uB85C", () => map.setView(this.home.center, this.home.zoom))
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

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/map/zone-draw.js
  var DEFAULT_VIEW = { center: [36.3504, 127.3845], zoom: 13 };
  var DONG_STYLE = {
    color: "#7d8a9b",
    weight: 2,
    dashArray: "8 6",
    fill: false,
    interactive: false
  };
  var ZONE_STYLE = { color: "#3bc99b", weight: 2, fillColor: "#3bc99b", fillOpacity: 0.18 };
  var ZONE_SELECTED_STYLE = {
    color: "#76a7ff",
    weight: 3,
    fillColor: "#4f8cff",
    fillOpacity: 0.28
  };
  var DRAFT_STYLE = { color: "#76a7ff", weight: 2.5, fillColor: "#4f8cff", fillOpacity: 0.2 };
  function createZoneMap(element, { onZoneClick, onDrawn }) {
    const map = createMap(element, DEFAULT_VIEW);
    const dongLayer = L.geoJSON(null, { style: DONG_STYLE }).addTo(map);
    const zoneLayers = /* @__PURE__ */ new Map();
    let draft2 = null;
    let selectedId = null;
    let editing = null;
    map.on("pm:create", (event) => {
      removeDraft();
      draft2 = event.layer;
      draft2.setStyle(DRAFT_STYLE);
      onDrawn(draft2.toGeoJSON().geometry);
    });
    function removeDraft() {
      if (draft2) {
        draft2.remove();
        draft2 = null;
      }
    }
    function applyStyle(id, layer) {
      layer.setStyle(id === selectedId ? ZONE_SELECTED_STYLE : ZONE_STYLE);
    }
    return {
      /** 동 경계(GeoJSON)를 점선으로 그리고 지도를 그 크기에 맞춘다. boundary가 없으면 처음 위치로. */
      showDong(boundary) {
        dongLayer.clearLayers();
        if (!boundary) {
          map.setView(DEFAULT_VIEW.center, DEFAULT_VIEW.zoom);
          return;
        }
        dongLayer.addData(boundary);
        map.fitBounds(dongLayer.getBounds(), { padding: [30, 30] });
      },
      /** 구역 다각형을 모두 새로 그린다. zones는 /api/v1/zones 응답 항목. */
      showZones(zones2) {
        zoneLayers.forEach((layer) => layer.remove());
        zoneLayers.clear();
        zones2.forEach((zone) => this.addZone(zone));
      },
      addZone(zone) {
        const layer = L.geoJSON(zone.boundary, { style: ZONE_STYLE });
        layer.on("click", () => {
          if (editing || map.pm.globalDrawModeEnabled()) {
            return;
          }
          onZoneClick(zone.id);
        });
        layer.bindTooltip(zone.name, { sticky: true });
        layer.addTo(map);
        zoneLayers.set(zone.id, layer);
        applyStyle(zone.id, layer);
      },
      /** 구역 하나를 강조하고 그 구역으로 지도를 맞춘다. null이면 강조를 푼다. */
      select(zoneId) {
        selectedId = zoneId;
        zoneLayers.forEach((layer2, id) => applyStyle(id, layer2));
        const layer = zoneLayers.get(zoneId);
        if (layer) {
          layer.bringToFront();
          map.fitBounds(layer.getBounds(), { padding: [60, 60], maxZoom: 18 });
        }
      },
      /**
       * 구역 하나의 꼭짓점 편집을 시작한다(FNC-A-015). 꼭짓점을 끌거나 더하거나 지울 때마다 onChange가 새 GeoJSON Polygon으로 불린다.
       * 선이 서로 겹치게 옮기는 것은 막는다.
       */
      startEdit(zoneId, onChange) {
        this.stopEdit();
        const layer = zoneLayers.get(zoneId);
        const polygon = layer ? layer.getLayers()[0] : null;
        if (!polygon) {
          return;
        }
        polygon.setStyle(DRAFT_STYLE);
        polygon.bringToFront();
        polygon.pm.enable({ allowSelfIntersection: false });
        const handler = () => onChange(polygon.toGeoJSON().geometry);
        polygon.on("pm:edit", handler);
        editing = { polygon, handler };
      },
      /** 꼭짓점 편집을 끝낸다. 고친 모양을 버리려면 호출한 쪽이 showZones로 다시 그린다. */
      stopEdit() {
        if (!editing) {
          return;
        }
        editing.polygon.off("pm:edit", editing.handler);
        editing.polygon.pm.disable();
        editing = null;
      },
      /** 다각형 그리기를 시작한다. 이미 그린 초안은 지운다. */
      startDraw() {
        removeDraft();
        map.pm.enableDraw("Polygon", { pathOptions: DRAFT_STYLE, finishOn: null });
      },
      /** 그리는 중이거나 그려 둔 초안을 지운다. */
      cancelDraw() {
        map.pm.disableDraw();
        removeDraft();
      }
    };
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/admin/js/admin/pages/zones.js
  var ERROR_MESSAGES = {
    INVALID_POLYGON: "\uB2E4\uAC01\uD615\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uC120\uC774 \uACB9\uCE58\uC9C0 \uC54A\uAC8C \uC138 \uC810 \uC774\uC0C1\uC73C\uB85C \uB2E4\uC2DC \uADF8\uB824 \uC8FC\uC138\uC694.",
    OUT_OF_SERVICE_AREA: "\uC11C\uBE44\uC2A4 \uC9C0\uC5ED \uBC16\uC785\uB2C8\uB2E4. \uC11C\uBE44\uC2A4 \uC9C0\uC5ED \uC548\uC5D0\uC11C \uB2E4\uC2DC \uADF8\uB824 \uC8FC\uC138\uC694.",
    DUPLICATE_ZONE_NAME: "\uC774\uBBF8 \uC0AC\uC6A9 \uC911\uC778 \uAD6C\uC5ED \uC774\uB984\uC785\uB2C8\uB2E4.",
    CAMERA_RUNNING: "\uAC00\uB3D9 \uC911\uC774\uAC70\uB098 \uAC00\uB3D9\uC744 \uC694\uCCAD\uD55C \uCEA0\uC774 \uC788\uC5B4 \uC0AD\uC81C\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uCEA0\uC744 \uBA3C\uC800 \uC815\uC9C0\uD574 \uC8FC\uC138\uC694.",
    DONG_CHANGE_NOT_ALLOWED: "\uB2E4\uB978 \uB3D9\uC73C\uB85C \uBC14\uB00C\uC5B4 \uC800\uC7A5\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uAC19\uC740 \uB3D9 \uC548\uC5D0\uC11C\uB9CC \uBAA8\uC591\uC744 \uBC14\uAFC0 \uC218 \uC788\uC2B5\uB2C8\uB2E4."
  };
  var citySelect = document.getElementById("region-city");
  var districtSelect = document.getElementById("region-district");
  var dongSelect = document.getElementById("region-dong");
  var listTitle = document.getElementById("zone-list-title");
  var listElement = document.getElementById("zone-list");
  var drawButton = document.getElementById("draw-start");
  var drawGuide = document.getElementById("draw-guide");
  var draftForm = document.getElementById("zone-draft");
  var draftArea = document.getElementById("draft-area");
  var draftDong = document.getElementById("draft-dong");
  var draftError = document.getElementById("draft-error");
  var draftName = document.getElementById("draft-name");
  var draftNameError = document.getElementById("draft-name-error");
  var draftSubmit = document.getElementById("draft-submit");
  var redrawButton = document.getElementById("draft-redraw");
  var editForm = document.getElementById("zone-edit");
  var editArea = document.getElementById("edit-area");
  var editDong = document.getElementById("edit-dong");
  var editError = document.getElementById("edit-error");
  var editName = document.getElementById("edit-name");
  var editNameError = document.getElementById("edit-name-error");
  var editSubmit = document.getElementById("edit-submit");
  var deleteModal = document.getElementById("delete-modal");
  var deleteForm = document.getElementById("delete-form");
  var deleteError = document.getElementById("delete-error");
  var deleteConfirm = document.getElementById("delete-confirm");
  var deleteZoneTarget = null;
  var DIRECTIONS = ["N", "E", "S", "W"];
  var neighborModal = document.getElementById("neighbor-modal");
  var neighborForm = document.getElementById("neighbor-form");
  var neighborError = document.getElementById("neighbor-error");
  var neighborSave = document.getElementById("neighbor-save");
  var neighborSelects = Object.fromEntries(
    DIRECTIONS.map((direction) => [direction, document.getElementById(`neighbor-${direction}`)])
  );
  var neighborZone = null;
  var regions = /* @__PURE__ */ new Map();
  var selectedDong = null;
  var zones = [];
  var selectedZoneId = null;
  var draft = null;
  var edit = null;
  var zoneMap = createZoneMap(document.getElementById("zone-map"), {
    onZoneClick: selectZone,
    onDrawn: previewDrawn
  });
  citySelect.addEventListener(
    "change",
    () => onRegionChange(citySelect, districtSelect, [dongSelect])
  );
  districtSelect.addEventListener("change", () => onRegionChange(districtSelect, dongSelect, []));
  dongSelect.addEventListener("change", onDongChange);
  drawButton.addEventListener("click", startDraw);
  redrawButton.addEventListener("click", startDraw);
  draftForm.addEventListener("submit", (event) => {
    event.preventDefault();
    register();
  });
  draftName.addEventListener("input", () => {
    setNameError("");
    updateSubmit();
  });
  editForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveEdit();
  });
  editName.addEventListener("input", () => {
    setEditNameError("");
    updateEditSubmit();
  });
  document.getElementById("edit-cancel").addEventListener("click", () => cancelEdit(true));
  loadRegions(null, citySelect);
  async function loadRegions(parentId, select) {
    const items = await get("/api/v1/regions", parentId === null ? void 0 : { parentId });
    items.forEach((region) => {
      regions.set(region.id, region);
      select.append(new Option(region.name, region.id));
    });
    select.disabled = false;
  }
  async function onRegionChange(select, next, rest) {
    resetSelect(next);
    rest.forEach(resetSelect);
    clearZones();
    if (select.value) {
      await loadRegions(Number(select.value), next);
    }
  }
  function resetSelect(select) {
    const placeholder = select.options[0];
    select.replaceChildren(placeholder);
    select.value = "";
    select.disabled = true;
  }
  async function onDongChange() {
    cancelDraft();
    cancelEdit(false);
    if (!dongSelect.value) {
      clearZones();
      return;
    }
    selectedDong = regions.get(Number(dongSelect.value));
    zoneMap.showDong(selectedDong.boundary);
    await loadZones();
  }
  function clearZones() {
    cancelDraft();
    cancelEdit(false);
    selectedDong = null;
    zones = [];
    selectedZoneId = null;
    zoneMap.showDong(null);
    zoneMap.showZones([]);
    renderList();
  }
  async function loadZones() {
    zones = await get("/api/v1/zones", { dongId: selectedDong.id });
    selectedZoneId = null;
    zoneMap.showZones(zones);
    renderList();
  }
  function renderList() {
    listTitle.textContent = selectedDong ? `${selectedDong.name} \uAD6C\uC5ED ${zones.length}\uAC1C` : "\uB3D9\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694";
    if (zones.length === 0) {
      const empty = document.createElement("p");
      empty.className = "zone-empty";
      empty.textContent = selectedDong ? "\uB4F1\uB85D\uB41C \uAD6C\uC5ED\uC774 \uC5C6\uC2B5\uB2C8\uB2E4. \uC0C8 \uAD6C\uC5ED\uC744 \uADF8\uB824 \uC8FC\uC138\uC694." : "";
      listElement.replaceChildren(empty);
      return;
    }
    listElement.replaceChildren(...zones.map(zoneRow));
  }
  function zoneRow(zone) {
    const row = document.createElement("div");
    row.className = "zone-row" + (zone.id === selectedZoneId ? " sel" : "");
    row.addEventListener("click", () => selectZone(zone.id));
    const info = document.createElement("div");
    info.className = "info";
    const name = document.createElement("div");
    name.className = "name";
    name.textContent = zone.name;
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `${formatNumber(Math.round(zone.areaM2))}\u33A1 \xB7 \uCEA0 ${zone.hasCamera ? "\uC788\uC74C" : "\uC5C6\uC74C"}`;
    info.append(name, meta);
    const actions = document.createElement("div");
    actions.className = "row-actions";
    actions.append(neighborButton(zone), editButton(zone), deleteButton(zone));
    row.append(info, actions);
    return row;
  }
  function neighborButton(zone) {
    const button2 = document.createElement("button");
    button2.type = "button";
    button2.className = "btn secondary sm";
    button2.textContent = "\uC774\uC6C3";
    button2.addEventListener("click", (event) => {
      event.stopPropagation();
      openNeighborModal(zone);
    });
    return button2;
  }
  function editButton(zone) {
    const button2 = document.createElement("button");
    button2.type = "button";
    button2.className = "btn secondary sm";
    button2.textContent = "\uC218\uC815";
    button2.addEventListener("click", (event) => {
      event.stopPropagation();
      startEdit(zone);
    });
    return button2;
  }
  function deleteButton(zone) {
    const button2 = document.createElement("button");
    button2.type = "button";
    button2.className = "btn danger sm";
    button2.textContent = "\uC0AD\uC81C";
    button2.addEventListener("click", (event) => {
      event.stopPropagation();
      openDeleteModal(zone);
    });
    return button2;
  }
  function selectZone(zoneId) {
    if (edit && zoneId !== edit.zone.id) {
      return;
    }
    selectedZoneId = zoneId;
    zoneMap.select(zoneId);
    renderList();
  }
  function startDraw() {
    cancelDraft();
    cancelEdit(true);
    drawGuide.hidden = false;
    zoneMap.startDraw();
  }
  function cancelDraft() {
    zoneMap.cancelDraw();
    draft = null;
    drawGuide.hidden = true;
    draftForm.hidden = true;
    draftName.value = "";
    showDraftError("");
    setNameError("");
  }
  async function previewDrawn(boundary) {
    drawGuide.hidden = true;
    draft = null;
    draftForm.hidden = false;
    draftArea.textContent = "-";
    draftDong.textContent = "-";
    showDraftError("");
    setNameError("");
    updateSubmit();
    try {
      const preview = await post("/api/v1/manage/zones/preview", { boundary }, { toast: false });
      draft = { boundary, dongId: preview.dongId };
      draftArea.textContent = `${formatNumber(Math.round(preview.areaM2))}\u33A1`;
      draftDong.textContent = preview.dongName;
    } catch (error) {
      showError(error, showDraftError);
    }
    updateSubmit();
  }
  async function register() {
    if (!draft) {
      return;
    }
    const name = draftName.value.trim();
    if (!name) {
      setNameError("\uAD6C\uC5ED \uC774\uB984\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.");
      return;
    }
    draftSubmit.disabled = true;
    try {
      const created = await post(
        "/api/v1/manage/zones",
        { name, boundary: draft.boundary },
        { toast: false }
      );
      await afterRegistered(created);
    } catch (error) {
      showError(
        error,
        (message) => error.code === "DUPLICATE_ZONE_NAME" ? setNameError(message) : showDraftError(message),
        setNameError
      );
      updateSubmit();
    }
  }
  async function afterRegistered(created) {
    cancelDraft();
    showToast(`'${created.name}' \uAD6C\uC5ED\uC744 \uB4F1\uB85D\uD588\uC2B5\uB2C8\uB2E4.`);
    if (selectedDong && created.dongId === selectedDong.id) {
      await loadZones();
      selectZone(created.id);
    } else {
      showToast("\uB2E4\uB978 \uB3D9\uC5D0 \uB4F1\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uD574\uB2F9 \uB3D9\uC744 \uC120\uD0DD\uD558\uBA74 \uBAA9\uB85D\uC5D0 \uBCF4\uC785\uB2C8\uB2E4.");
    }
  }
  function showError(error, show, showName) {
    if (!(error instanceof ApiError) || error.status === 401) {
      return;
    }
    const fieldMessage = error.fieldErrors.find((item) => item.field === "name")?.message;
    if (fieldMessage) {
      showName(fieldMessage);
    } else if (ERROR_MESSAGES[error.code]) {
      show(ERROR_MESSAGES[error.code]);
    } else if (error.status === 400) {
      show(error.message);
    } else {
      showToast(error.message);
    }
  }
  function showDraftError(message) {
    draftError.textContent = message;
    draftError.hidden = !message;
  }
  function setNameError(message) {
    draftNameError.textContent = message;
    draftNameError.hidden = !message;
    draftName.classList.toggle("err", Boolean(message));
  }
  function updateSubmit() {
    draftSubmit.disabled = draft === null || draftName.value.trim() === "";
  }
  function startEdit(zone) {
    cancelDraft();
    cancelEdit(true);
    edit = { zone, boundary: null, shapeOk: true };
    selectZone(zone.id);
    editForm.hidden = false;
    document.getElementById("edit-title").textContent = `'${zone.name}' \uC218\uC815`;
    editName.value = zone.name;
    editArea.textContent = `${formatNumber(Math.round(zone.areaM2))}\u33A1`;
    editDong.textContent = selectedDong ? selectedDong.name : "-";
    showEditError("");
    setEditNameError("");
    updateEditSubmit();
    zoneMap.startEdit(zone.id, onShapeEdited);
  }
  var editPreviewRequest = 0;
  async function onShapeEdited(boundary) {
    if (!edit) {
      return;
    }
    const request2 = ++editPreviewRequest;
    const { zone } = edit;
    edit.boundary = boundary;
    edit.shapeOk = false;
    showEditError("");
    updateEditSubmit();
    try {
      const preview = await post("/api/v1/manage/zones/preview", { boundary }, { toast: false });
      if (!edit || request2 !== editPreviewRequest) {
        return;
      }
      editArea.textContent = `${formatNumber(Math.round(zone.areaM2))}\u33A1 \u2192 ${formatNumber(Math.round(preview.areaM2))}\u33A1`;
      editDong.textContent = preview.dongName;
      if (preview.dongId === zone.dongId) {
        edit.shapeOk = true;
      } else {
        showEditError(ERROR_MESSAGES.DONG_CHANGE_NOT_ALLOWED);
      }
    } catch (error) {
      if (edit && request2 === editPreviewRequest) {
        showError(error, showEditError);
      }
    }
    updateEditSubmit();
  }
  async function saveEdit() {
    if (!edit) {
      return;
    }
    const { zone } = edit;
    const name = editName.value.trim();
    if (!name) {
      setEditNameError("\uAD6C\uC5ED \uC774\uB984\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.");
      return;
    }
    const body = {};
    if (name !== zone.name) {
      body.name = name;
    }
    if (edit.boundary) {
      body.boundary = edit.boundary;
    }
    editSubmit.disabled = true;
    try {
      const updated = await patch(`/api/v1/manage/zones/${zone.id}`, body, { toast: false });
      zoneMap.stopEdit();
      edit = null;
      editForm.hidden = true;
      showToast(`'${updated.name}' \uAD6C\uC5ED\uC744 \uC218\uC815\uD588\uC2B5\uB2C8\uB2E4.`);
      await loadZones();
      selectZone(updated.id);
    } catch (error) {
      showError(
        error,
        (message) => error.code === "DUPLICATE_ZONE_NAME" ? setEditNameError(message) : showEditError(message),
        setEditNameError
      );
      updateEditSubmit();
    }
  }
  function cancelEdit(restore) {
    if (!edit) {
      return;
    }
    editPreviewRequest++;
    zoneMap.stopEdit();
    edit = null;
    editForm.hidden = true;
    if (restore) {
      zoneMap.showZones(zones);
      zoneMap.select(selectedZoneId);
    }
  }
  function showEditError(message) {
    editError.textContent = message;
    editError.hidden = !message;
  }
  function setEditNameError(message) {
    editNameError.textContent = message;
    editNameError.hidden = !message;
    editName.classList.toggle("err", Boolean(message));
  }
  function updateEditSubmit() {
    if (!edit) {
      editSubmit.disabled = true;
      return;
    }
    const nameChanged = editName.value.trim() !== edit.zone.name && editName.value.trim() !== "";
    editSubmit.disabled = !edit.shapeOk || !(nameChanged || edit.boundary !== null);
  }
  function openDeleteModal(zone) {
    deleteZoneTarget = zone;
    document.getElementById("delete-message").textContent = `'${zone.name}' \uAD6C\uC5ED\uC744 \uC0AD\uC81C\uD560\uAE4C\uC694?`;
    showDeleteError("");
    deleteConfirm.disabled = false;
    deleteModal.hidden = false;
  }
  function closeDeleteModal() {
    deleteModal.hidden = true;
    deleteZoneTarget = null;
  }
  async function confirmDelete(event) {
    event.preventDefault();
    if (!deleteZoneTarget) {
      return;
    }
    const zone = deleteZoneTarget;
    deleteConfirm.disabled = true;
    try {
      const result = await del(`/api/v1/manage/zones/${zone.id}`, { toast: false });
      if (edit && edit.zone.id === zone.id) {
        cancelEdit(false);
      }
      closeDeleteModal();
      showToast(
        result.mode === "SOFT" ? `'${zone.name}' \uAD6C\uC5ED\uC744 \uC0AD\uC81C\uD588\uC2B5\uB2C8\uB2E4. \uAC00\uB3D9 \uAE30\uB85D\uC740 \uB0A8\uC544 \uC788\uC2B5\uB2C8\uB2E4.` : `'${zone.name}' \uAD6C\uC5ED\uC744 \uC0AD\uC81C\uD588\uC2B5\uB2C8\uB2E4.`
      );
      await loadZones();
    } catch (error) {
      showError(error, showDeleteError);
      deleteConfirm.disabled = false;
    }
  }
  function showDeleteError(message) {
    deleteError.textContent = message;
    deleteError.hidden = !message;
  }
  deleteForm.addEventListener("submit", confirmDelete);
  deleteModal.querySelectorAll("[data-close]").forEach((button2) => button2.addEventListener("click", closeDeleteModal));
  deleteModal.addEventListener("mousedown", (event) => {
    if (event.target === deleteModal) {
      closeDeleteModal();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !deleteModal.hidden) {
      closeDeleteModal();
    }
  });
  async function openNeighborModal(zone) {
    neighborZone = zone;
    document.getElementById("neighbor-zone-name").textContent = zone.name;
    document.getElementById("neighbor-center").textContent = zone.name;
    showNeighborError("");
    neighborModal.hidden = false;
    neighborSave.disabled = true;
    DIRECTIONS.forEach(
      (direction) => neighborSelects[direction].replaceChildren(new Option("\uBD88\uB7EC\uC624\uB294 \uC911\u2026", ""))
    );
    try {
      const [all, current] = await Promise.all([
        get("/api/v1/zones"),
        get(`/api/v1/manage/zones/${zone.id}/neighbors`)
      ]);
      const candidates = all.filter((other) => other.id !== zone.id).map((other) => ({ ...other, distance: distanceMeters(zone, other) })).sort((first, second) => first.distance - second.distance);
      DIRECTIONS.forEach((direction) => {
        const select = neighborSelects[direction];
        select.replaceChildren(
          new Option("\uC5C6\uC74C(\uAD00\uCE21 \uBC94\uC704 \uBC16)", ""),
          ...candidates.map(
            (other) => new Option(`${other.name} (${formatDistance(other.distance)})`, other.id)
          )
        );
        select.value = current[direction] ? String(current[direction].id) : "";
      });
      neighborSave.disabled = false;
    } catch {
      DIRECTIONS.forEach(
        (direction) => neighborSelects[direction].replaceChildren(new Option("\uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4", ""))
      );
    }
  }
  function closeNeighborModal() {
    neighborModal.hidden = true;
    neighborZone = null;
    zoneMap.select(selectedZoneId);
  }
  async function saveNeighbors(event) {
    event.preventDefault();
    if (!neighborZone) {
      return;
    }
    const body = Object.fromEntries(
      DIRECTIONS.map((direction) => [
        direction,
        neighborSelects[direction].value ? Number(neighborSelects[direction].value) : null
      ])
    );
    neighborSave.disabled = true;
    showNeighborError("");
    try {
      await put(`/api/v1/manage/zones/${neighborZone.id}/neighbors`, body, { toast: false });
      closeNeighborModal();
      showToast("\uC774\uC6C3\uC744 \uC800\uC7A5\uD588\uC2B5\uB2C8\uB2E4. \uC0C1\uB300 \uAD6C\uC5ED\uC758 \uBC18\uB300 \uBC29\uD5A5\uB3C4 \uD568\uAED8 \uBC14\uB00C\uC5C8\uC2B5\uB2C8\uB2E4.");
    } catch (error) {
      if (error instanceof ApiError && error.status !== 401) {
        showNeighborError(
          error.status === 404 ? "\uAD6C\uC5ED\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. \uBAA9\uB85D\uC744 \uC0C8\uB85C \uBD88\uB7EC\uC628 \uB4A4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694." : error.message
        );
      }
      neighborSave.disabled = false;
    }
  }
  function showNeighborError(message) {
    neighborError.textContent = message;
    neighborError.hidden = !message;
  }
  function distanceMeters(from, to) {
    const metersPerDegree = 111320;
    const dy = (Number(to.centerLat) - Number(from.centerLat)) * metersPerDegree;
    const dx = (Number(to.centerLng) - Number(from.centerLng)) * metersPerDegree * Math.cos(Number(from.centerLat) * Math.PI / 180);
    return Math.hypot(dx, dy);
  }
  function formatDistance(meters) {
    return meters >= 1e3 ? `${(meters / 1e3).toFixed(1)}km` : `${Math.round(meters)}m`;
  }
  DIRECTIONS.forEach((direction) => {
    neighborSelects[direction].addEventListener("change", () => {
      const id = Number(neighborSelects[direction].value);
      zoneMap.select(id || neighborZone?.id || null);
    });
  });
  neighborForm.addEventListener("submit", saveNeighbors);
  neighborModal.querySelectorAll("[data-close]").forEach((button2) => button2.addEventListener("click", closeNeighborModal));
  neighborModal.addEventListener("mousedown", (event) => {
    if (event.target === neighborModal) {
      closeNeighborModal();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !neighborModal.hidden) {
      closeNeighborModal();
    }
  });
})();
