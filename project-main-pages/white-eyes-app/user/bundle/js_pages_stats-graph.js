(() => {
  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/user/js/common/toast.js
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

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/user/js/common/api.js
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
  function url(path2) {
    const meta = document.querySelector('meta[name="context-path"]');
    const contextPath = (meta?.content ?? "/").replace(/\/$/, "");
    return contextPath + path2;
  }
  function get(path2, params, options2) {
    return request("GET", path2, { params, ...options2 });
  }
  function download(path2, params, options2) {
    return request("GET", path2, { params, ...options2, file: true });
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

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/user/js/common/format.js
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

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/user/js/chart/chart-theme.js
  var GRID_COLOR = "#1e2a38";
  var TICK_COLOR = "#8b98a9";
  var COUNT_COLOR = "#818cf8";
  var COUNT_FILL = "rgba(129, 140, 248, .16)";
  var INFLOW_COLOR = "#a5b4fc";
  var OUTFLOW_COLOR = "#4f46e5";
  var LEVEL_COLORS = { 1: "#34a37f", 2: "#c98a1c", 3: "#d9475a" };
  var DEMO_FILL = "rgba(129, 140, 248, .07)";
  var CONGESTION_FILL = "rgba(239, 77, 85, .15)";
  function shadePlugin(flags, fill) {
    return {
      id: "shade",
      beforeDatasetsDraw(chart2) {
        if (!flags.some(Boolean)) {
          return;
        }
        const {
          ctx,
          chartArea: area,
          scales: { x }
        } = chart2;
        const step = flags.length > 1 ? Math.abs(x.getPixelForValue(1) - x.getPixelForValue(0)) : area.right - area.left;
        ctx.save();
        ctx.fillStyle = fill;
        flags.forEach((flag, index) => {
          if (!flag) {
            return;
          }
          const center = x.getPixelForValue(index);
          const left = Math.max(area.left, center - step / 2);
          const right = Math.min(area.right, center + step / 2);
          ctx.fillRect(left, area.top, right - left, area.bottom - area.top);
        });
        ctx.restore();
      }
    };
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/user/js/chart/panel-charts.js
  var LEVEL_NAMES = { 1: "\uC815\uC0C1", 2: "\uC8FC\uC758", 3: "\uC704\uD5D8" };
  var CONGESTED_LEVEL = 2;
  var DIRECTIONS = [
    ["N", "\uBD81"],
    ["E", "\uB3D9"],
    ["S", "\uB0A8"],
    ["W", "\uC11C"]
  ];
  function createPanelCharts(canvases) {
    const charts = {};
    function update(labels, titles, points) {
      const counts = points.map((point) => numberOrNull(point.countAvg));
      const levels = points.map((point) => point.level ?? null);
      const inflow = points.map((point) => flowSum(point.inflow));
      const outflow = points.map((point) => flowSum(point.outflow));
      const congested = levels.map((level) => level !== null && level >= CONGESTED_LEVEL);
      draw("level", {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              data: counts,
              backgroundColor: levels.map((level) => LEVEL_COLORS[level] ?? GRID_COLOR),
              borderRadius: 3,
              maxBarThickness: 22
            }
          ]
        },
        options: options(
          titles,
          (context) => {
            const level = levels[context.dataIndex];
            return `\uC778\uC6D0 ${countText(context.parsed.y)} \xB7 ${LEVEL_NAMES[level] ?? "\uB2E8\uACC4 \uC5C6\uC74C"}`;
          },
          { yTitle: "\uBA85" }
        )
      });
      draw("count", {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              data: counts,
              borderColor: COUNT_COLOR,
              backgroundColor: COUNT_FILL,
              fill: true,
              borderWidth: 3,
              pointRadius: 0,
              pointHoverRadius: 4,
              spanGaps: false,
              tension: 0.2
            }
          ]
        },
        options: options(titles, (context) => `\uC778\uC6D0 \uD3C9\uADE0 ${countText(context.parsed.y)}`, {
          yTitle: "\uBA85",
          hideX: true
        }),
        plugins: [shadePlugin(congested, CONGESTION_FILL)]
      });
      draw("flow", {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "\uC720\uC785",
              data: inflow,
              backgroundColor: INFLOW_COLOR,
              stack: "flow",
              borderRadius: 2,
              maxBarThickness: 22
            },
            {
              label: "\uC720\uCD9C",
              data: outflow.map((value) => value === null ? null : -value),
              backgroundColor: OUTFLOW_COLOR,
              stack: "flow",
              borderRadius: 2,
              maxBarThickness: 22
            }
          ]
        },
        options: options(
          titles,
          (context) => `${context.dataset.label} ${countText(Math.abs(context.parsed.y))}`,
          {
            yTitle: "\uBA85",
            stacked: true,
            absoluteTicks: true
          }
        ),
        plugins: [shadePlugin(congested, CONGESTION_FILL)]
      });
      const totals = DIRECTIONS.map(([key]) => [
        directionSum(points, "inflow", key),
        directionSum(points, "outflow", key)
      ]);
      draw("direction", {
        type: "bar",
        data: {
          labels: DIRECTIONS.map(([, name]) => name),
          datasets: [
            {
              label: "\uC720\uC785",
              data: totals.map(([sum]) => sum),
              backgroundColor: INFLOW_COLOR,
              borderRadius: 3,
              maxBarThickness: 12
            },
            {
              label: "\uC720\uCD9C",
              data: totals.map(([, sum]) => sum),
              backgroundColor: OUTFLOW_COLOR,
              borderRadius: 3,
              maxBarThickness: 12
            }
          ]
        },
        options: {
          ...options(
            null,
            (context) => `${context.dataset.label} ${countText(context.parsed.x)}`,
            {}
          ),
          indexAxis: "y",
          scales: {
            x: {
              beginAtZero: true,
              grid: { color: GRID_COLOR },
              ticks: { color: TICK_COLOR }
            },
            y: { grid: { display: false }, ticks: { color: TICK_COLOR } }
          }
        }
      });
      return totals.some(([inSum, outSum]) => inSum > 0 || outSum > 0);
    }
    function draw(key, config) {
      charts[key]?.destroy();
      charts[key] = new window.Chart(canvases[key], config);
    }
    return { update };
  }
  function options(titles, label, { yTitle, hideX = false, stacked = false, absoluteTicks = false }) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            ...titles ? { title: (contexts) => titles[contexts[0].dataIndex] } : {},
            label
          }
        }
      },
      scales: {
        x: {
          display: !hideX,
          stacked,
          grid: { display: false },
          ticks: { color: TICK_COLOR, maxTicksLimit: 12 }
        },
        y: {
          stacked,
          beginAtZero: true,
          grid: { color: GRID_COLOR },
          ticks: {
            color: TICK_COLOR,
            ...absoluteTicks ? { callback: (value) => formatNumber(Math.abs(value)) } : {}
          },
          title: { display: Boolean(yTitle), text: yTitle, color: TICK_COLOR }
        }
      }
    };
  }
  function numberOrNull(value) {
    return value === null || value === void 0 ? null : Number(value);
  }
  function flowSum(flow) {
    return flow ? Object.values(flow).reduce((sum, value) => sum + value, 0) : null;
  }
  function directionSum(points, field, direction) {
    return points.reduce((sum, point) => sum + (point[field]?.[direction] ?? 0), 0);
  }
  function countText(value) {
    return value === null || value === void 0 ? "\uB370\uC774\uD130 \uC5C6\uC74C" : `${formatNumber(Math.round(value))}\uBA85`;
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/user/js/chart/series-chart.js
  var DENSITY_DASH = [5, 4];
  var COMPARE_COLORS = [
    "#4f8cff",
    "#f59e0b",
    "#3bc99b",
    "#ef4d55",
    "#a78bfa",
    "#22c3e6",
    "#f472b6",
    "#facc15",
    "#94a3b8",
    "#fb923c"
  ];
  var SERIES_ITEMS = {
    count: {
      label: "\uC778\uC6D0",
      axis: "count",
      color: "#818cf8",
      width: 3,
      unit: "\uBA85",
      bandColor: "rgba(129, 140, 248, .16)"
    },
    density: {
      label: "\uBC00\uC9D1\uB3C4",
      axis: "density",
      color: "#e0e7ff",
      width: 2,
      unit: "\uBA85/\u33A1",
      decimals: 2,
      dash: DENSITY_DASH
    },
    inflow: { label: "\uC720\uC785", axis: "count", color: "#a5b4fc", width: 2, unit: "\uBA85" },
    outflow: { label: "\uC720\uCD9C", axis: "count", color: "#4f46e5", width: 2, unit: "\uBA85" },
    dwellAvgSec: {
      label: "\uD3C9\uADE0 \uCCB4\uB958",
      axis: "dwell",
      color: "#a78bfa",
      width: 2,
      unit: "\uCD08",
      decimals: 1
    }
  };
  var AXES = {
    count: { position: "left", title: "\uBA85" },
    density: { position: "right", title: "\uBA85/\u33A1" },
    dwell: { position: "right", title: "\uCD08" }
  };
  function createSeriesChart(canvas2, { onPointClick: onPointClick2, clickable = () => true } = {}) {
    let chart2 = null;
    function update(labels, titles, seriesByItem, demo = []) {
      const keys = Object.keys(seriesByItem);
      const datasets = keys.flatMap((key) => {
        const item = SERIES_ITEMS[key];
        const series = seriesByItem[key];
        const line = lineDataset(key, item.label, series.values, item.color, item.width);
        if (!item.bandColor || !series.high || !series.low) {
          return [line];
        }
        const edge = {
          bandOf: key,
          yAxisID: item.axis,
          borderWidth: 0,
          pointRadius: 0,
          pointHoverRadius: 0,
          spanGaps: false,
          tension: 0.2
        };
        return [
          line,
          {
            ...edge,
            label: `${item.label} \uCD5C\uB300`,
            data: series.high,
            backgroundColor: item.bandColor,
            fill: "+1"
          },
          {
            ...edge,
            label: `${item.label} \uCD5C\uC18C`,
            data: series.low,
            backgroundColor: item.bandColor,
            fill: false
          }
        ];
      });
      const usedAxes = new Set(keys.map((key) => SERIES_ITEMS[key].axis));
      const demoTitles = titles.map(
        (title, index) => demo[index] ? `${title} \xB7 \uC2DC\uC5F0\uC6A9` : title
      );
      draw(labels, demoTitles, datasets, usedAxes, demo, (context) => {
        const key = context.dataset.itemKey;
        const series = seriesByItem[key];
        const index = context.dataIndex;
        return tooltipLine(key, context.parsed.y, series.high?.[index], series.low?.[index]);
      });
    }
    function compare(labels, titles, key, seriesList) {
      const item = SERIES_ITEMS[key];
      const datasets = seriesList.map(
        (series, index) => lineDataset(
          key,
          series.name,
          series.values,
          COMPARE_COLORS[index % COMPARE_COLORS.length],
          2
        )
      );
      draw(
        labels,
        titles,
        datasets,
        /* @__PURE__ */ new Set([item.axis]),
        [],
        (context) => `${context.dataset.label} ${valueText(key, context.parsed.y)}`
      );
    }
    function lineDataset(key, label, data, color, width) {
      return {
        itemKey: key,
        label,
        data,
        yAxisID: SERIES_ITEMS[key].axis,
        borderColor: color,
        backgroundColor: color,
        borderWidth: width,
        pointRadius: 0,
        pointHoverRadius: 5,
        spanGaps: false,
        tension: 0.2,
        borderDash: SERIES_ITEMS[key].dash ?? []
      };
    }
    function draw(labels, titles, datasets, usedAxes, demo, tooltipLabel) {
      const scales = {
        x: { grid: { color: GRID_COLOR }, ticks: { color: TICK_COLOR, maxTicksLimit: 12 } }
      };
      Object.entries(AXES).forEach(([id, axis]) => {
        scales[id] = {
          display: usedAxes.has(id),
          position: axis.position,
          beginAtZero: true,
          grid: {
            color: GRID_COLOR,
            drawOnChartArea: id === "count" || !usedAxes.has("count")
          },
          ticks: { color: TICK_COLOR },
          title: { display: true, text: axis.title, color: TICK_COLOR }
        };
      });
      const config = {
        type: "line",
        data: { labels, datasets },
        plugins: [shadePlugin(demo, DEMO_FILL)],
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          interaction: { mode: "index", intersect: false },
          // 값이 없는 점(null)도 누를 수 있게 x 위치로 점을 찾는다
          onClick: (event) => {
            const index = pointIndexAt(event);
            if (onPointClick2 && index !== null) {
              onPointClick2(index, { x: event.x, y: event.y });
            }
          },
          onHover: (event) => {
            const index = onPointClick2 ? pointIndexAt(event) : null;
            canvas2.style.cursor = index !== null && clickable(index) ? "pointer" : "";
          },
          scales,
          plugins: {
            legend: {
              position: "bottom",
              align: "start",
              labels: {
                color: TICK_COLOR,
                boxWidth: 10,
                boxHeight: 10,
                filter: (legendItem, data) => !data.datasets[legendItem.datasetIndex].bandOf
              }
            },
            tooltip: {
              filter: (context) => !context.dataset.bandOf,
              callbacks: {
                title: (contexts) => titles[contexts[0].dataIndex],
                label: tooltipLabel
              }
            }
          }
        }
      };
      if (chart2) {
        chart2.destroy();
      }
      chart2 = new window.Chart(canvas2, config);
    }
    function pointIndexAt(event) {
      const area = chart2?.chartArea;
      const count = chart2?.data.labels.length ?? 0;
      if (!area || count === 0 || event.x < area.left || event.x > area.right || event.y < area.top || event.y > area.bottom) {
        return null;
      }
      const index = Math.round(chart2.scales.x.getValueForPixel(event.x));
      return Math.min(Math.max(index, 0), count - 1);
    }
    return { update, compare };
  }
  function tooltipLine(key, value, high, low) {
    const item = SERIES_ITEMS[key];
    if (value === null || value === void 0) {
      return `${item.label} \uB370\uC774\uD130 \uC5C6\uC74C`;
    }
    const format = (number) => formatValue(item, number);
    if (!item.bandColor) {
      return `${item.label} ${format(value)}${item.unit}`;
    }
    const range = high === null || high === void 0 || low === null || low === void 0 ? "" : ` (\uCD5C\uB300 ${format(high)} \xB7 \uCD5C\uC18C ${format(low)})`;
    return `${item.label} \uD3C9\uADE0 ${format(value)}${item.unit}${range}`;
  }
  function valueText(key, value) {
    const item = SERIES_ITEMS[key];
    return value === null || value === void 0 ? "\uB370\uC774\uD130 \uC5C6\uC74C" : `${formatValue(item, value)}${item.unit}`;
  }
  function formatValue(item, number) {
    return item.decimals ? formatDecimal(number, item.decimals) : formatNumber(Math.round(number));
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/user/js/export/export-modal.js
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
    modal.querySelectorAll("[data-export-close]").forEach((button) => button.addEventListener("click", closeExportModal));
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
  function openExportModal({ zone: zone2 = null, region = null, interval: interval2, from: from2, to: to2 }) {
    if (!modal) {
      return;
    }
    scopes = [];
    if (zone2) {
      const name = zone2.deleted ? `${zone2.name} (\uC0AD\uC81C\uB428)` : zone2.name;
      scopes.push({ scope: "ZONE", targetId: zone2.id, label: `\uAD6C\uC5ED \xB7 ${name}` });
    }
    if (region) {
      scopes.push({ scope: "REGION", targetId: region.id, label: `\uC9C0\uC5ED \xB7 ${region.name}` });
    }
    scopes.push({ scope: "ALL", targetId: null, label: "\uC804\uCCB4" });
    const scopeSelect = byId("export-scope");
    scopeSelect.replaceChildren(
      ...scopes.map((entry, index) => {
        const option = document.createElement("option");
        option.value = String(index);
        option.textContent = entry.label;
        return option;
      })
    );
    scopeSelect.value = "0";
    byId("export-sum").checked = false;
    byId("export-interval").value = INTERVALS[interval2] ? interval2 : "1h";
    byId("export-from").value = toInputValue(from2);
    byId("export-end").value = toInputValue(new Date(to2.getTime() - MINUTE_MS));
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
    const from2 = parseLocal(byId("export-from").value);
    const end = parseLocal(byId("export-end").value);
    if (!from2 || !end) {
      return { reason: "\uC2DC\uC791\xB7\uB05D \uC2DC\uAC01\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694." };
    }
    const to2 = new Date(end.getTime() + MINUTE_MS);
    if (to2 <= from2) {
      return { reason: "\uB05D \uC2DC\uAC01\uC740 \uC2DC\uC791 \uC2DC\uAC01\uBCF4\uB2E4 \uB4A4\uC5EC\uC57C \uD569\uB2C8\uB2E4." };
    }
    const interval2 = byId("export-interval").value;
    const spec = INTERVALS[interval2];
    if (to2 > shift(from2, spec.max)) {
      return { reason: `${spec.label} \uB2E8\uC704\uB294 \uCD5C\uB300 ${spec.maxLabel}\uAE4C\uC9C0 \uB0B4\uB824\uBC1B\uC744 \uC218 \uC788\uC2B5\uB2C8\uB2E4.` };
    }
    const items2 = itemBoxes().filter((box) => box.checked).map((box) => box.value);
    if (items2.length === 0) {
      return { reason: "\uD56D\uBAA9\uC744 \uD558\uB098 \uC774\uC0C1 \uACE8\uB77C \uC8FC\uC138\uC694." };
    }
    return { from: from2, to: to2, interval: interval2, items: items2 };
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
    const button = byId("export-submit");
    button.disabled = true;
    hideError();
    try {
      const { blob, fileName } = await download(EXPORT_API, params, { toast: false });
      save(blob, fileName ?? "stats.xlsx");
      closeExportModal();
    } catch (error) {
      showError(errorText(error));
    } finally {
      button.disabled = false;
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
  function showError(message) {
    const notice = byId("export-error");
    notice.textContent = message;
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
  var pad2 = (value) => String(value).padStart(2, "0");
  function toInputValue(date) {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
  }
  function parseLocal(text) {
    const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(text ?? "");
    if (!match) {
      return null;
    }
    const [, year, month, day, hour, minute] = match;
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/user/js/pages/stats-graph/drill.js
  var HOUR_MS = 36e5;
  function drillDown(interval2, at) {
    const year = at.getFullYear();
    const month = at.getMonth();
    const day = at.getDate();
    switch (interval2) {
      case "1y":
        return { interval: "1M", from: new Date(year, 0, 1), to: new Date(year + 1, 0, 1) };
      case "1M":
        return {
          interval: "1d",
          from: new Date(year, month, 1),
          to: new Date(year, month + 1, 1)
        };
      case "1w":
        return {
          interval: "1d",
          from: new Date(year, month, day),
          to: new Date(year, month, day + 7)
        };
      case "1d":
        return {
          interval: "1h",
          from: new Date(year, month, day),
          to: new Date(year, month, day + 1)
        };
      case "1h": {
        const from2 = new Date(year, month, day, at.getHours());
        return { interval: "1m", from: from2, to: new Date(from2.getTime() + HOUR_MS) };
      }
      default:
        return null;
    }
  }
  function crumbLabel(interval2, at, parentInterval) {
    const year = at.getFullYear();
    const month = at.getMonth() + 1;
    const day = at.getDate();
    switch (interval2) {
      case "1y":
        return `${year}\uB144`;
      case "1M":
        return parentInterval === "1y" ? `${month}\uC6D4` : `${year}\uB144 ${month}\uC6D4`;
      case "1w":
        return `${year}\uB144 ${month}\uC6D4 ${day}\uC77C \uC8FC`;
      case "1d":
        return parentInterval === "1M" ? `${day}\uC77C` : parentInterval === "1w" ? `${month}\uC6D4 ${day}\uC77C` : `${year}\uB144 ${month}\uC6D4 ${day}\uC77C`;
      case "1h":
        return `${at.getHours()}\uC2DC`;
      default:
        return "";
    }
  }

  // ../../../../../../../../../lyh/git_home/project-main-pages/white-eyes-app/user/js/pages/stats-graph.js
  var SERIES_API = "/api/v1/stats/series";
  var CHILDREN_API = "/api/v1/stats/children";
  var COMPARE_ITEM_KEYS = {
    COUNT: "count",
    DENSITY: "density",
    INFLOW: "inflow",
    OUTFLOW: "outflow",
    DWELL: "dwellAvgSec"
  };
  var LEVEL_LABELS = ["\uC2DC\xB7\uB3C4", "\uC2DC\xB7\uAD70\xB7\uAD6C", "\uC74D\xB7\uBA74\xB7\uB3D9"];
  var DEFAULT_INTERVAL = "1h";
  var MINUTE_MS2 = 6e4;
  var INTERVALS2 = {
    "1m": { label: "1\uBD84", max: { days: 1 }, maxLabel: "1\uC77C" },
    "1h": { label: "1\uC2DC\uAC04", max: { days: 31 }, maxLabel: "31\uC77C" },
    "1d": { label: "1\uC77C", max: { years: 1 }, maxLabel: "1\uB144" },
    "1w": { label: "1\uC8FC", max: { years: 3 }, maxLabel: "3\uB144" },
    "1M": { label: "1\uC6D4", max: { years: 5 }, maxLabel: "5\uB144" },
    "1y": { label: "1\uB144", max: { years: 10 }, maxLabel: "10\uB144" }
  };
  var FIELD_LABELS = {
    targetType: "\uB300\uC0C1",
    targetId: "\uB300\uC0C1",
    regionId: "\uB300\uC0C1",
    item: "\uD56D\uBAA9",
    interval: "\uB2E8\uC704",
    from: "\uC2DC\uC791",
    to: "\uB05D"
  };
  var DEFAULT_ERROR_MESSAGE3 = "\uC77C\uC2DC\uC801\uC778 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD574 \uC8FC\uC138\uC694.";
  var NO_MINUTE_MESSAGE = "1\uBD84 \uB370\uC774\uD130 \uC5C6\uC74C";
  var PLAYBACK_ZONE_ONLY_MESSAGE = "\uB2E4\uC2DC\uBCF4\uAE30\uB294 \uAD6C\uC5ED\uC744 \uACE8\uB790\uC744 \uB54C\uB9CC \uBCFC \uC218 \uC788\uC2B5\uB2C8\uB2E4.";
  var LOAD_FAILED_MESSAGE = "\uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.";
  var IS_ADMIN = document.querySelector('[data-header="admin"]') !== null;
  var byId2 = (id) => document.getElementById(id);
  var regionSelects = ["target-sido", "target-sigungu", "target-emd"].map(byId2);
  var zoneSelect = byId2("target-zone");
  var tabs = document.querySelectorAll("#interval-tabs [data-interval]");
  var itemBoxes2 = document.querySelectorAll('#graph-items input[type="checkbox"]');
  var itemGroup = byId2("graph-items");
  var compareToggle = byId2("compare-toggle");
  var compareItemSelect = byId2("compare-item");
  var omittedNotice = byId2("compare-omitted");
  var fromInput = byId2("period-from");
  var endInput = byId2("period-end");
  var errorNotice = byId2("graph-error");
  var emptyNotice = byId2("graph-empty");
  var demoBadge = byId2("demo-badge");
  var drillPath = byId2("drill-path");
  var pointMenu = byId2("point-menu");
  var canvas = byId2("series-chart");
  var bandToggle = byId2("band-toggle");
  var panelsBox = byId2("graph-panels");
  var directionEmpty = byId2("direction-empty");
  var panels = createPanelCharts({
    level: byId2("level-chart"),
    count: byId2("count-chart"),
    flow: byId2("flow-chart"),
    direction: byId2("direction-chart")
  });
  var chart = createSeriesChart(canvas, {
    onPointClick,
    // 사용자 앱의 1분 점은 누를 수 없다(FNC-C-013 처리 순서 6)
    clickable: () => IS_ADMIN || interval !== "1m"
  });
  var childrenCache = /* @__PURE__ */ new Map();
  var zonesCache = /* @__PURE__ */ new Map();
  var path = [];
  var zone = null;
  var interval = DEFAULT_INTERVAL;
  var from = null;
  var to = null;
  var items = [];
  var comparing = false;
  var compareResult = { series: [], omitted: 0 };
  var pointTimes = [];
  var trail = [];
  var latestRequestId = 0;
  var latestMenuRequestId = 0;
  start();
  async function start() {
    const params = new URLSearchParams(window.location.search);
    interval = INTERVALS2[params.get("interval")] ? params.get("interval") : DEFAULT_INTERVAL;
    const fromParam = parseLocal2(params.get("from"));
    const toParam = parseLocal2(params.get("to"));
    if (fromParam && toParam) {
      from = fromParam;
      to = toParam;
    } else {
      setDefaultPeriod();
    }
    await selectTarget(params.get("targetType"), Number(params.get("targetId")));
    initTabs();
    initItems();
    bandToggle.addEventListener("change", render);
    initCompare();
    byId2("period-apply").addEventListener("click", applyPeriod);
    initExportModal();
    byId2("export-open").addEventListener("click", openExport);
    initPointMenu();
    renderTabs();
    renderPeriod();
    await load();
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
  async function zonesOf(dongId) {
    if (!zonesCache.has(dongId)) {
      zonesCache.set(dongId, await get("/api/v1/zones", { dongId }));
    }
    return zonesCache.get(dongId);
  }
  async function findPath(regionId) {
    let frontier = (await children(null)).map((region) => [region]);
    for (let depth = 0; depth < LEVEL_LABELS.length && frontier.length > 0; depth++) {
      const hit = frontier.find((candidate) => candidate[depth].id === regionId);
      if (hit) {
        return hit;
      }
      if (depth === LEVEL_LABELS.length - 1) {
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
  async function selectTarget(targetType, targetId) {
    let found = null;
    zone = null;
    if (targetType === "ZONE" && targetId) {
      zone = (await get("/api/v1/zones")).find((candidate) => candidate.id === targetId) ?? null;
      if (!zone) {
        zone = await findDeletedZone(targetId);
      }
      found = zone ? await findPath(zone.dongId) : null;
      if (!found) {
        zone = null;
      }
    } else if (targetType === "REGION" && targetId) {
      found = await findPath(targetId);
    }
    if (!found) {
      const top = await children(null);
      found = top.length > 0 ? [top[0]] : [];
    }
    path = found;
    await renderTargetSelects();
  }
  async function renderTargetSelects() {
    for (let depth = 0; depth < regionSelects.length; depth++) {
      const select = regionSelects[depth];
      const options2 = depth === 0 ? await children(null) : path[depth - 1] ? await children(path[depth - 1].id) : [];
      select.replaceChildren(
        ...optionList(options2, depth > 0 ? `${LEVEL_LABELS[depth]} \uC804\uCCB4` : null)
      );
      select.value = path[depth] ? String(path[depth].id) : "";
      select.disabled = options2.length === 0 || depth > 0 && !path[depth - 1];
      select.onchange = () => onRegionChange(depth, select.value);
    }
    const dong = path[LEVEL_LABELS.length - 1];
    const active = dong ? await zonesOf(dong.id) : [];
    const zones = zone && zone.deleted && zone.dongId === dong?.id ? [...active, zone] : active;
    zoneSelect.replaceChildren(...optionList(zones, "\uAD6C\uC5ED \uC804\uCCB4"));
    zoneSelect.value = zone ? String(zone.id) : "";
    zoneSelect.disabled = zones.length === 0;
    zoneSelect.onchange = () => onZoneChange(zones, zoneSelect.value);
    renderCompareAvailability();
  }
  async function findDeletedZone(zoneId) {
    try {
      const found = await get(`/api/v1/zones/${zoneId}`, void 0, { toast: false });
      return found.deleted ? found : null;
    } catch {
      return null;
    }
  }
  function optionList(entries, allLabel) {
    const list = entries.map((entry) => {
      const option = document.createElement("option");
      option.value = String(entry.id);
      option.textContent = entry.deleted ? `${entry.name} (\uC0AD\uC81C\uB428)` : entry.name;
      return option;
    });
    if (allLabel) {
      const all = document.createElement("option");
      all.value = "";
      all.textContent = allLabel;
      list.unshift(all);
    }
    return list;
  }
  async function onRegionChange(depth, value) {
    const base = path.slice(0, depth);
    if (value !== "") {
      const options2 = depth === 0 ? await children(null) : await children(path[depth - 1].id);
      base.push(options2.find((region) => String(region.id) === value));
    }
    path = base;
    zone = null;
    clearTrail();
    await renderTargetSelects();
    await load();
  }
  async function onZoneChange(zones, value) {
    const previous = zone;
    zone = zones.find((candidate) => String(candidate.id) === value) ?? null;
    if (previous?.deleted && zone?.id !== previous.id) {
      await renderTargetSelects();
    }
    clearTrail();
    renderCompareAvailability();
    await load();
  }
  function currentTarget() {
    if (zone) {
      return { targetType: "ZONE", targetId: zone.id };
    }
    return { targetType: "REGION", targetId: path[path.length - 1].id };
  }
  function openExport() {
    if (path.length === 0) {
      return;
    }
    const region = path[path.length - 1];
    openExportModal({
      zone: zone ? { id: zone.id, name: zone.name, deleted: Boolean(zone.deleted) } : null,
      region: { id: region.id, name: region.name },
      interval,
      from,
      to
    });
  }
  function initTabs() {
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        interval = tab.dataset.interval;
        setDefaultPeriod();
        clearTrail();
        renderTabs();
        renderPeriod();
        load();
      });
    });
  }
  function renderTabs() {
    tabs.forEach((tab) => {
      const on = tab.dataset.interval === interval;
      tab.classList.toggle("on", on);
      tab.setAttribute("aria-selected", String(on));
    });
  }
  function setDefaultPeriod() {
    const now = /* @__PURE__ */ new Date();
    const tomorrow = startOfDay(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    switch (interval) {
      case "1m": {
        to = new Date(Math.floor(now.getTime() / MINUTE_MS2) * MINUTE_MS2 + MINUTE_MS2);
        from = new Date(to.getTime() - 60 * MINUTE_MS2);
        break;
      }
      case "1h":
        from = startOfDay(now);
        to = tomorrow;
        break;
      case "1d":
        to = tomorrow;
        from = shift2(tomorrow, { days: -30 });
        break;
      case "1w": {
        const monday = startOfDay(now);
        monday.setDate(monday.getDate() - (monday.getDay() + 6) % 7);
        from = shift2(monday, { days: -7 * 11 });
        to = tomorrow;
        break;
      }
      case "1M":
        from = shift2(new Date(now.getFullYear(), now.getMonth(), 1), { months: -11 });
        to = tomorrow;
        break;
      default:
        from = new Date(now.getFullYear() - 4, 0, 1);
        to = tomorrow;
    }
  }
  function renderPeriod() {
    fromInput.value = toInputValue2(from);
    endInput.value = toInputValue2(new Date(to.getTime() - MINUTE_MS2));
  }
  function applyPeriod() {
    const newFrom = parseLocal2(fromInput.value);
    const end = parseLocal2(endInput.value);
    if (!newFrom || !end) {
      showError2("\uC2DC\uC791\xB7\uB05D \uC2DC\uAC01\uC744 \uC785\uB825\uD574 \uC8FC\uC138\uC694.");
      return;
    }
    from = newFrom;
    to = new Date(end.getTime() + MINUTE_MS2);
    clearTrail();
    load();
  }
  function initItems() {
    itemBoxes2.forEach((box) => {
      box.addEventListener("change", () => {
        if (selectedItems().length === 0) {
          box.checked = true;
          return;
        }
        render();
      });
    });
  }
  function selectedItems() {
    return [...itemBoxes2].filter((box) => box.checked).map((box) => box.value);
  }
  function initCompare() {
    compareToggle.addEventListener("change", () => {
      comparing = compareToggle.checked;
      renderCompareControls();
      load();
    });
    compareItemSelect.addEventListener("change", load);
    renderCompareControls();
  }
  function renderCompareAvailability() {
    const available = !zone && path.length > 0;
    compareToggle.disabled = !available;
    compareToggle.closest("label").title = available ? "" : "\uB300\uC0C1\uC774 \uC9C0\uC5ED\uC77C \uB54C\uB9CC \uC4F8 \uC218 \uC788\uC2B5\uB2C8\uB2E4";
    if (!available && comparing) {
      comparing = false;
      compareToggle.checked = false;
      renderCompareControls();
    }
  }
  function renderCompareControls() {
    compareItemSelect.hidden = !comparing;
    itemGroup.classList.toggle("is-disabled", comparing);
    itemGroup.setAttribute("aria-disabled", String(comparing));
    omittedNotice.hidden = true;
  }
  async function onPointClick(index, position) {
    const atText = pointTimes[index];
    if (!atText) {
      return;
    }
    const at = new Date(atText);
    if (interval === "1m") {
      if (!IS_ADMIN) {
        return;
      }
      if (zone) {
        window.location.href = playbackUrl(atText);
      } else {
        showPointMenu(index, position, [], PLAYBACK_ZONE_ONLY_MESSAGE);
      }
      return;
    }
    if (interval !== "1h") {
      drillInto(at);
      return;
    }
    const requestId = ++latestMenuRequestId;
    if (!IS_ADMIN) {
      const available2 = await hasMinuteData(at);
      if (requestId !== latestMenuRequestId) {
        return;
      }
      if (available2) {
        drillInto(at);
      } else {
        showPointMenu(
          index,
          position,
          [],
          available2 === null ? LOAD_FAILED_MESSAGE : NO_MINUTE_MESSAGE
        );
      }
      return;
    }
    const minuteButton = menuButton("1\uBD84 \uB2E8\uC704\uB85C \uBCF4\uAE30", () => drillInto(at));
    minuteButton.setAttribute("aria-disabled", "true");
    const playbackLink = menuLink("\uB2E4\uC2DC\uBCF4\uAE30", zone ? playbackUrl(atText) : null);
    showPointMenu(
      index,
      position,
      [minuteButton, playbackLink],
      zone ? null : PLAYBACK_ZONE_ONLY_MESSAGE
    );
    const available = await hasMinuteData(at);
    if (requestId !== latestMenuRequestId || pointMenu.hidden) {
      return;
    }
    if (available) {
      minuteButton.removeAttribute("aria-disabled");
    } else {
      addMenuNotice(available === null ? LOAD_FAILED_MESSAGE : NO_MINUTE_MESSAGE);
    }
  }
  function drillInto(at) {
    const next = drillDown(interval, at);
    if (!next) {
      return;
    }
    if (trail.length === 0) {
      trail.push({
        interval,
        from,
        to,
        label: `${INTERVALS2[interval].label} \uB2E8\uC704`,
        clickedInterval: null
      });
    }
    const parent = trail[trail.length - 1];
    trail.push({
      ...next,
      label: crumbLabel(interval, at, parent.clickedInterval),
      clickedInterval: interval
    });
    showView(next);
  }
  function backTo(index) {
    const view = trail[index];
    trail = index === 0 ? [] : trail.slice(0, index + 1);
    showView(view);
  }
  function showView(view) {
    interval = view.interval;
    from = view.from;
    to = view.to;
    renderTrail();
    renderTabs();
    renderPeriod();
    load();
  }
  function clearTrail() {
    trail = [];
    renderTrail();
  }
  function renderTrail() {
    const parts = [];
    trail.forEach((step, index) => {
      if (index > 0) {
        const separator = document.createElement("span");
        separator.setAttribute("aria-hidden", "true");
        separator.textContent = "\u203A";
        parts.push(separator);
      }
      if (index === trail.length - 1) {
        const current = document.createElement("b");
        current.setAttribute("aria-current", "page");
        current.textContent = step.label;
        parts.push(current);
      } else {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = step.label;
        button.addEventListener("click", () => backTo(index));
        parts.push(button);
      }
    });
    drillPath.replaceChildren(...parts);
  }
  async function hasMinuteData(at) {
    const hour = drillDown("1h", at);
    try {
      const response = await get(
        SERIES_API,
        {
          ...currentTarget(),
          interval: "1m",
          from: toInputValue2(hour.from),
          to: toInputValue2(hour.to)
        },
        { toast: false }
      );
      return response.items.some((point) => point.sampleSec > 0);
    } catch {
      return null;
    }
  }
  function playbackUrl(atText) {
    return `${url("/playback")}?zoneId=${zone.id}&at=${encodeURIComponent(atText)}`;
  }
  function menuButton(label, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn secondary sm";
    button.textContent = label;
    button.addEventListener("click", () => {
      if (button.getAttribute("aria-disabled") !== "true") {
        onClick();
      }
    });
    return button;
  }
  function menuLink(label, href) {
    const link = document.createElement("a");
    link.className = "btn secondary sm";
    link.textContent = label;
    if (href) {
      link.href = href;
    } else {
      link.setAttribute("aria-disabled", "true");
    }
    return link;
  }
  function initPointMenu() {
    document.addEventListener("click", (event) => {
      if (!pointMenu.hidden && !pointMenu.contains(event.target) && event.target !== canvas) {
        hidePointMenu();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        hidePointMenu();
      }
    });
  }
  function showPointMenu(index, position, actions, notice) {
    byId2("point-menu-title").textContent = tooltipTitle(pointTimes[index]);
    const summary = byId2("point-menu-summary");
    summary.textContent = comparing ? "" : pointSummary(items[index]);
    summary.hidden = summary.textContent === "";
    byId2("point-menu-actions").replaceChildren(...actions);
    const noticeLine = byId2("point-menu-notice");
    noticeLine.textContent = notice ?? "";
    noticeLine.hidden = !notice;
    pointMenu.hidden = false;
    const box = pointMenu.parentElement;
    const x = canvas.offsetLeft + position.x;
    const y = canvas.offsetTop + position.y;
    const gap = 12;
    const left = x + gap + pointMenu.offsetWidth > box.clientWidth ? x - gap - pointMenu.offsetWidth : x + gap;
    pointMenu.style.left = `${Math.max(left, 0)}px`;
    pointMenu.style.top = `${Math.max(Math.min(y - pointMenu.offsetHeight / 2, box.clientHeight - pointMenu.offsetHeight), 0)}px`;
  }
  function addMenuNotice(text) {
    const noticeLine = byId2("point-menu-notice");
    noticeLine.textContent = noticeLine.hidden ? text : `${noticeLine.textContent} ${text}`;
    noticeLine.hidden = false;
  }
  function hidePointMenu() {
    latestMenuRequestId++;
    pointMenu.hidden = true;
  }
  function pointSummary(point) {
    const count = point ? valueOf(point, "countAvg") : null;
    if (count === null) {
      return "\uB370\uC774\uD130 \uC5C6\uC74C";
    }
    const density = valueOf(point, "density");
    const densityText = density === null ? "" : ` \xB7 \uBC00\uC9D1\uB3C4 ${formatDecimal(density, 2)}`;
    return `\uC778\uC6D0 \uD3C9\uADE0 ${formatNumber(Math.round(count))}\uBA85${densityText}`;
  }
  function validatePeriod() {
    if (to <= from) {
      return "\uB05D \uC2DC\uAC01\uC740 \uC2DC\uC791 \uC2DC\uAC01\uBCF4\uB2E4 \uB4A4\uC5EC\uC57C \uD569\uB2C8\uB2E4.";
    }
    const spec = INTERVALS2[interval];
    if (to > shift2(from, spec.max)) {
      return `${spec.label} \uB2E8\uC704\uB294 \uCD5C\uB300 ${spec.maxLabel}\uAE4C\uC9C0 \uC870\uD68C\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.`;
    }
    return null;
  }
  async function load() {
    if (path.length === 0) {
      return;
    }
    const invalid = validatePeriod();
    if (invalid) {
      showError2(invalid);
      return;
    }
    const target = currentTarget();
    const query = { ...target, interval, from: toInputValue2(from), to: toInputValue2(to) };
    const url2 = new URL(window.location.href);
    Object.entries(query).forEach(([name, value]) => url2.searchParams.set(name, String(value)));
    window.history.replaceState(null, "", url2);
    const requestId = ++latestRequestId;
    hideError2();
    hidePointMenu();
    try {
      if (comparing) {
        const childrenQuery = {
          regionId: target.targetId,
          item: compareItemSelect.value,
          interval,
          from: query.from,
          to: query.to
        };
        const response = await get(CHILDREN_API, childrenQuery, { toast: false });
        if (requestId === latestRequestId) {
          compareResult = response;
          render();
        }
      } else {
        const response = await get(SERIES_API, query, { toast: false });
        if (requestId === latestRequestId) {
          items = response.items;
          render();
        }
      }
    } catch (error) {
      if (requestId === latestRequestId) {
        items = [];
        compareResult = { series: [], omitted: 0 };
        render();
        showError2(errorText2(error));
      }
    }
  }
  function render() {
    const bandUsable = !comparing && selectedItems().includes("count");
    bandToggle.disabled = !bandUsable;
    bandToggle.closest("label").title = bandUsable ? "" : "\uC778\uC6D0 \uD56D\uBAA9\uC744 \uCF1C\uACE0 \uD558\uC704 \uBE44\uAD50\uB97C \uB048 \uC0C1\uD0DC\uC5D0\uC11C\uB9CC \uC4F8 \uC218 \uC788\uC2B5\uB2C8\uB2E4";
    if (comparing) {
      renderCompare();
      return;
    }
    omittedNotice.hidden = true;
    panelsBox.hidden = false;
    const keys = selectedItems();
    const seriesByItem = {};
    keys.forEach((key) => {
      seriesByItem[key] = key === "count" && bandToggle.checked ? {
        values: items.map((point) => valueOf(point, "countAvg")),
        high: items.map((point) => valueOf(point, "countMax")),
        low: items.map((point) => valueOf(point, "countMin"))
      } : {
        values: items.map(
          (point) => valueOf(point, key === "count" ? "countAvg" : key)
        )
      };
    });
    pointTimes = items.map((point) => point.at);
    const demo = items.map((point) => Boolean(point.isDemo));
    demoBadge.hidden = !demo.some(Boolean);
    const labels = items.map((point) => axisLabel(point.at));
    const titles = items.map((point) => tooltipTitle(point.at));
    chart.update(labels, titles, seriesByItem, demo);
    const hasFlow = panels.update(labels, titles, items);
    directionEmpty.hidden = hasFlow;
    emptyNotice.hidden = !errorNotice.hidden || items.some((point) => point.sampleSec > 0);
  }
  function renderCompare() {
    const { series, omitted } = compareResult;
    const points = series.length > 0 ? series[0].points : [];
    pointTimes = points.map((point) => point.at);
    demoBadge.hidden = true;
    panelsBox.hidden = true;
    chart.compare(
      points.map((point) => axisLabel(point.at)),
      points.map((point) => tooltipTitle(point.at)),
      COMPARE_ITEM_KEYS[compareItemSelect.value],
      series.map((child) => ({
        name: child.name,
        values: child.points.map(
          (point) => point.value === null ? null : Number(point.value)
        )
      }))
    );
    omittedNotice.textContent = `\uB098\uBA38\uC9C0 ${omitted}\uAC1C \uC0DD\uB7B5`;
    omittedNotice.hidden = !(omitted > 0);
    const hasValue = series.some((child) => child.points.some((point) => point.value !== null));
    emptyNotice.hidden = !errorNotice.hidden || hasValue;
  }
  function valueOf(point, key) {
    if (key === "inflow" || key === "outflow") {
      return flowSum(point[key]);
    }
    const value = point[key];
    return value === null || value === void 0 ? null : Number(value);
  }
  function axisLabel(at) {
    const text = formatDateTime(at);
    switch (interval) {
      case "1m":
      case "1h":
        return to.getTime() - from.getTime() > 24 * 60 * MINUTE_MS2 ? text.slice(5) : text.slice(11);
      case "1d":
      case "1w":
        return text.slice(5, 10);
      case "1M":
        return text.slice(0, 7);
      default:
        return text.slice(0, 4);
    }
  }
  function tooltipTitle(at) {
    const start2 = new Date(at);
    const text = formatDateTime(start2);
    switch (interval) {
      case "1m":
        return `${text} ~ ${formatDateTime(new Date(start2.getTime() + MINUTE_MS2)).slice(11)}`;
      case "1h":
        return `${text} ~ ${formatDateTime(new Date(start2.getTime() + 60 * MINUTE_MS2)).slice(11)}`;
      case "1d":
        return text.slice(0, 10);
      case "1w":
        return `${text.slice(0, 10)} ~ ${formatDateTime(shift2(start2, { days: 6 })).slice(5, 10)}`;
      case "1M":
        return text.slice(0, 7);
      default:
        return text.slice(0, 4);
    }
  }
  function errorText2(error) {
    if (!(error instanceof ApiError)) {
      console.error(error);
      return DEFAULT_ERROR_MESSAGE3;
    }
    if (error.fieldErrors.length > 0) {
      const details = error.fieldErrors.map(
        (fieldError) => `${FIELD_LABELS[fieldError.field] ?? fieldError.field}: ${fieldError.message}`
      );
      return `${error.message} (${details.join(" / ")})`;
    }
    return error.message;
  }
  function showError2(message) {
    errorNotice.textContent = message;
    errorNotice.hidden = false;
    emptyNotice.hidden = true;
  }
  function hideError2() {
    errorNotice.hidden = true;
    errorNotice.textContent = "";
  }
  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
  function shift2(date, { years = 0, months = 0, days = 0 }) {
    const result = new Date(date.getTime());
    const day = result.getDate();
    result.setDate(1);
    result.setFullYear(result.getFullYear() + years, result.getMonth() + months, 1);
    const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
    result.setDate(Math.min(day, lastDay) + days);
    return result;
  }
  var pad3 = (value) => String(value).padStart(2, "0");
  function toInputValue2(date) {
    return `${date.getFullYear()}-${pad3(date.getMonth() + 1)}-${pad3(date.getDate())}T${pad3(date.getHours())}:${pad3(date.getMinutes())}`;
  }
  function parseLocal2(text) {
    const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?$/.exec(text ?? "");
    if (!match) {
      return null;
    }
    const [, year, month, day, hour = "0", minute = "0", second = "0"] = match;
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    );
  }
})();
