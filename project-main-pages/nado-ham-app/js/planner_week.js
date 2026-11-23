// 달력 주간 보기: 월간 달력과 같은 일정(PLAN)과 목표 활동을 7일(일~토) 한 줄로 보여 준다.
// 날짜별로 시간 순으로 정렬하고, 주가 두 달에 걸치면 두 달 데이터를 함께 가져온다. 제목은 textContent 로 넣어 HTML 로 해석되지 않게 한다.
const WEEK_DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];
const WEEK_MIN_DATE = new Date(2025, 0, 1);         // 월간 달력의 선택 범위와 같다(2025-01 ~ 2030-12)
const WEEK_MAX_DATE = new Date(2030, 11, 31);
const WEEK_MODE_KEY = 'nadoham_calendar_view';

let view_mode = 'month';        // 'month' | 'week'
let week_start = null;          // 지금 보는 주의 일요일(Date)
let week_seq = 0;               // 요청 번호(늦게 도착한 이전 주 응답이 새 주를 덮어쓰지 않게 한다)

document.addEventListener('DOMContentLoaded', function () {
    if (!document.getElementById('week_view')) {
        return;
    }

    document.addEventListener('click', onWeekViewClick);
    setUpWeekDrag();

    let saved = null;
    try {
        saved = window.localStorage.getItem(WEEK_MODE_KEY);
    } catch (error) {
        saved = null;
    }
    if (saved === 'week') {
        setViewMode('week');
    }
});

function onWeekViewClick(event) {
    let target = event.target;
    if (!target.closest) {
        return;
    }

    let toggle = target.closest('.view_toggle button');
    if (toggle) {
        setViewMode(toggle.dataset.view);
        return;
    }

    if (target.closest('#week_view .week_prev')) {
        moveWeek(-7);
    } else if (target.closest('#week_view .week_next')) {
        moveWeek(7);
    } else if (target.closest('#week_view .week_today')) {
        week_start = startOfWeek(new Date());
        renderWeekView();
    }

    let edit = target.closest('#week_view button.week_edit');
    if (edit) {
        toggleWeekEditor(edit.closest('li.week_goal'));
        return;
    }
    if (target.closest('#week_view .week_editor')) {
        return;
    }

    let write = target.closest('#week_view a.week_write');
    if (write) {
        event.preventDefault();
        showWritePlanView(write.dataset.year, write.dataset.month, write.dataset.date);
        return;
    }

    let title = target.closest('#week_view a.title');
    if (title) {
        event.preventDefault();
        fetchGetPlan(title.dataset.no);
    }
}

// 목표 활동 칩을 다른 날 칸으로 끌어다 놓으면 그 날짜로 옮긴다(시각은 그대로). 지난 날짜 칸에는 놓을 수 없다
function setUpWeekDrag() {
    let grid = document.getElementById('week_grid');
    let dragged = null;

    grid.addEventListener('dragstart', event => {
        let chip = event.target.closest && event.target.closest('li.week_goal[draggable="true"]');
        if (!chip) {
            return;
        }
        dragged = chip;
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', chip.dataset.activity);
    });
    grid.addEventListener('dragend', () => {
        dragged = null;
        grid.querySelectorAll('.drop_ok').forEach(column => column.classList.remove('drop_ok'));
    });
    grid.addEventListener('dragover', event => {
        let column = event.target.closest && event.target.closest('li.week_day');
        if (dragged && column && column.dataset.date >= formatDate(startOfToday())) {
            event.preventDefault();
            grid.querySelectorAll('.drop_ok').forEach(item => item.classList.remove('drop_ok'));
            column.classList.add('drop_ok');
        }
    });
    grid.addEventListener('drop', event => {
        let column = event.target.closest && event.target.closest('li.week_day');
        if (!dragged || !column || column.dataset.date < formatDate(startOfToday())) {
            return;
        }
        event.preventDefault();
        let chip = dragged;
        dragged = null;
        if (column.dataset.date !== chip.dataset.date) {
            moveGoalActivity(chip.dataset.activity, column.dataset.date, chip.dataset.time);
        }
    });
}

function startOfWeek(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
}

function addDays(date, days) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function inWeekRange(start) {
    return addDays(start, 6) >= WEEK_MIN_DATE && start <= WEEK_MAX_DATE;
}

function moveWeek(days) {
    let next = addDays(week_start, days);
    if (!inWeekRange(next)) {
        return;
    }

    week_start = next;
    renderWeekView();
}

// 월간 ↔ 주간 전환. 주간으로 갈 때는 선택한 날(없으면 보고 있는 달의 1일, 이번 달이면 오늘)이 있는 주를 보여 주고,
// 월간으로 돌아올 때는 그 주의 중간(수요일)이 속한 달을 보여 준다.
function setViewMode(mode) {
    let wasWeek = view_mode === 'week';
    view_mode = mode === 'week' ? 'week' : 'month';

    document.body.classList.toggle('week_mode', view_mode === 'week');
    document.querySelectorAll('.view_toggle button').forEach(button => {
        let active = button.dataset.view === view_mode;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
    });
    document.getElementById('week_view').hidden = view_mode !== 'week';

    try {
        window.localStorage.setItem(WEEK_MODE_KEY, view_mode);
    } catch (error) {
        // 저장할 수 없어도 화면은 그대로 동작한다
    }

    if (view_mode === 'week') {
        let base;
        let today = new Date();
        if (selected_date !== null) {
            base = new Date(current_year, current_month, selected_date);
        } else if (today.getFullYear() === current_year && today.getMonth() === current_month) {
            base = today;
        } else {
            base = new Date(current_year, current_month, 1);
        }
        week_start = startOfWeek(base);
        renderWeekView();

    } else if (wasWeek && week_start) {
        let middle = addDays(week_start, 3);
        if (middle.getFullYear() !== current_year || middle.getMonth() !== current_month) {
            switchMonthTo(middle.getFullYear(), middle.getMonth());
        }
    }
}

// 주간 보기에서 월간으로 돌아올 때 보여 줄 달로 바꾼다(월간 달력의 달 이동과 같은 순서)
function switchMonthTo(year, month) {
    setCurrentCalender(year, month, 1, new Date(year, month, 1).getDay());
    setCurrentYearAndMonthSelectUI();
    resetDaySelection();
    removeCalenderTr();
    addCalenderTr();
    fetchGetCurrentMonthPlans();
}

// 일정을 고치거나 지운 뒤 월간 데이터를 다시 불러올 때 주간 화면도 같이 갱신한다
function refreshWeekView() {
    if (view_mode === 'week' && week_start) {
        renderWeekView();
    }
}

function weekLabel(start) {
    let end = addDays(start, 6);
    let startText = `${start.getFullYear()}년 ${start.getMonth() + 1}월 ${start.getDate()}일`;
    let endText = start.getMonth() === end.getMonth() ? `${end.getDate()}일` : `${end.getMonth() + 1}월 ${end.getDate()}일`;

    return `${startText} ~ ${endText}`;
}

// 주간 화면을 그린다: 먼저 빈 7칸과 안내를 그리고, 데이터가 오면 칸을 채운다
async function renderWeekView() {
    let requestNo = ++week_seq;
    let start = week_start;
    let days = [];
    for (let i = 0; i < 7; i++) {
        days.push(addDays(start, i));
    }

    document.getElementById('week_label').textContent = weekLabel(start);
    document.querySelector('#week_view .week_prev').disabled = !inWeekRange(addDays(start, -7));
    document.querySelector('#week_view .week_next').disabled = !inWeekRange(addDays(start, 7));

    let grid = document.getElementById('week_grid');
    let message = document.getElementById('week_message');
    grid.replaceChildren(...days.map(day => buildWeekColumn(day)));
    message.textContent = '일정을 불러오는 중...';

    let months = [];
    days.forEach(day => {
        let key = `${day.getFullYear()}-${day.getMonth() + 1}`;
        if (!months.includes(key)) {
            months.push(key);
        }
    });

    try {
        let results = await Promise.all(months.map(async key => {
            let [year, month] = key.split('-').map(Number);
            let [plans, goals] = await Promise.all([fetchWeekJson(`/planner/plans?year=${year}&month=${month}`), fetchWeekJson(`/goal/calendar?year=${year}&month=${month}`)]);

            return {year, month, plans: (plans && plans.plans) || [], goals: (goals && goals.items) || []};
        }));
        if (requestNo !== week_seq) {
            return;
        }

        let total = 0;
        days.forEach((day, index) => {
            let list = grid.children[index].querySelector('ul.week_items');
            let entries = [];
            let busy = [];
            results.forEach(result => {
                if (result.year !== day.getFullYear() || result.month !== day.getMonth() + 1) {
                    return;
                }
                result.plans.filter(plan => plan.date === day.getDate()).forEach(plan => {
                    entries.push({time: plan.start_time || '', element: buildWeekPlan(plan)});
                    if (plan.start_time) {
                        let start = toMinutes(plan.start_time);
                        let end = plan.end_time ? toMinutes(plan.end_time) : start + 60;
                        busy.push([start, end < start ? 24 * 60 : end]);
                    }
                });
                result.goals.filter(item => item.day === day.getDate()).forEach(item => {
                    entries.push({time: item.startTime || '', element: buildWeekGoal(item, day)});
                    let start = toMinutes(item.startTime);
                    busy.push([start, start + item.minutes]);
                });
            });

            // 시간이 없는 일정이 위, 나머지는 시작 시각 순
            entries.sort((a, b) => a.time.localeCompare(b.time));
            entries.forEach(entry => list.appendChild(entry.element));
            if (day >= startOfToday()) {
                list.appendChild(buildFreeLine(freeSlots(busy)));
            }
            grid.children[index].classList.toggle('empty', entries.length === 0);
            total += entries.length;
        });

        message.textContent = total === 0 ? '이번 주에는 일정이 없어요.' : '';

    } catch (error) {
        if (requestNo === week_seq) {
            message.textContent = '일정을 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요.';
        }
        console.log('renderWeekView() COMMUNICATION ERROR!! ', error);
    }
}

async function fetchWeekJson(url) {
    let response = await fetch(url);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    return response.json();
}

function buildWeekColumn(day) {
    let today = new Date();
    let column = document.createElement('li');
    column.className = 'week_day';
    column.dataset.date = formatDate(day);
    column.classList.toggle('today', day.getFullYear() === today.getFullYear() && day.getMonth() === today.getMonth() && day.getDate() === today.getDate());
    column.classList.toggle('sun', day.getDay() === 0);
    column.classList.toggle('sat', day.getDay() === 6);

    let head = document.createElement('div');
    head.className = 'week_day_head';

    let name = document.createElement('span');
    name.className = 'week_day_name';
    name.textContent = `${day.getMonth() + 1}/${day.getDate()} (${WEEK_DAY_NAMES[day.getDay()]})`;

    let write = document.createElement('a');
    write.className = 'week_write';
    write.href = '#none';
    write.title = '이 날에 일정 추가';
    write.textContent = '+';
    write.dataset.year = String(day.getFullYear());
    write.dataset.month = String(day.getMonth() + 1);
    write.dataset.date = String(day.getDate());

    head.append(name, write);

    let list = document.createElement('ul');
    list.className = 'week_items';

    column.append(head, list);

    return column;
}

function buildWeekPlan(plan) {
    let li = document.createElement('li');
    li.className = 'week_plan';

    let link = document.createElement('a');
    link.className = 'title';
    link.href = '#none';
    link.dataset.no = plan.no;
    link.textContent = planTimeLabel(plan) + plan.title;
    li.appendChild(link);

    return li;
}

// 목표 활동은 월간 달력과 같은 칩(과정별 색, 읽기 전용)으로 보여 주고 누르면 오늘 탭으로 간다
// 아직 하지 않은 활동은 다른 날 칸으로 끌어다 놓거나 ✎ 로 날짜·시각을 고칠 수 있다(오늘부터 목표 기간 안에서만, 서버가 다시 검사한다)
function buildWeekGoal(item, day) {
    let li = document.createElement('li');
    li.className = 'goal_chip week_goal';
    li.dataset.course = item.courseCode;
    li.classList.toggle('finished', item.status !== 'PLANNED');
    li.classList.toggle('conflict', item.conflict);

    let link = document.createElement('a');
    link.className = 'goal_link';
    link.href = '/goal';
    link.title = goalChipNote(item);
    link.textContent = goalChipText(item);
    li.appendChild(link);

    if (item.status === 'PLANNED' && day >= startOfToday()) {
        li.draggable = true;
        li.dataset.activity = String(item.activityNo);
        li.dataset.date = formatDate(day);
        li.dataset.time = item.startTime;

        let edit = document.createElement('button');
        edit.type = 'button';
        edit.className = 'week_edit';
        edit.title = '날짜·시각 고치기';
        edit.textContent = '✎';
        li.appendChild(edit);
    }

    return li;
}

function startOfToday() {
    let now = new Date();

    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function formatDate(day) {
    return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
}

// 활동 이동·시간 수정(오늘 탭과 같은 API). 성공하면 주간·월간 화면을 다시 불러온다
async function moveGoalActivity(activityNo, date, time) {
    let message = document.getElementById('week_message');
    let response = await fetch(`/goal/activity/${activityNo}/move`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({date: date, time: time})
    });
    let data = await response.json().catch(() => ({}));
    if (!response.ok) {
        message.textContent = data.message || '활동을 옮기지 못했어요.';
        return false;
    }

    renderWeekView();
    if (typeof fetchGetCurrentMonthPlans === 'function') {
        fetchGetCurrentMonthPlans();
    }

    return true;
}

// 칩 안에 날짜·시각 편집 줄을 연다(이미 열려 있으면 닫는다)
function toggleWeekEditor(chip) {
    let open = chip.querySelector('.week_editor');
    if (open) {
        open.remove();
        return;
    }

    let editor = document.createElement('span');
    editor.className = 'week_editor';

    let date = document.createElement('input');
    date.type = 'date';
    date.value = chip.dataset.date;
    date.min = formatDate(startOfToday());
    let time = document.createElement('input');
    time.type = 'time';
    time.value = chip.dataset.time;
    let save = document.createElement('button');
    save.type = 'button';
    save.className = 'week_save';
    save.textContent = '저장';
    save.addEventListener('click', async () => {
        save.disabled = true;
        let ok = await moveGoalActivity(chip.dataset.activity, date.value, time.value);
        if (!ok) {
            save.disabled = false;
        }
    });
    editor.append(date, time, save);
    chip.appendChild(editor);
}

// 하루의 빈 시간(07:00~23:00 사이에서 30분 이상 비는 구간). 일정은 종료 시간까지, 없으면 60분, 목표 활동은 소요 시간만큼 차지한다
const FREE_FROM = 7 * 60;
const FREE_TO = 23 * 60;
const FREE_MIN = 30;

function toMinutes(text) {
    let [hour, minute] = text.split(':').map(Number);

    return hour * 60 + minute;
}

function freeSlots(busy) {
    let sorted = busy.slice().sort((a, b) => a[0] - b[0]);
    let slots = [];
    let cursor = FREE_FROM;
    sorted.forEach(([start, end]) => {
        if (start - cursor >= FREE_MIN) {
            slots.push([cursor, Math.min(start, FREE_TO)]);
        }
        cursor = Math.max(cursor, end);
    });
    if (FREE_TO - cursor >= FREE_MIN) {
        slots.push([cursor, FREE_TO]);
    }

    return slots;
}

function minutesLabel(total) {
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function buildFreeLine(slots) {
    let li = document.createElement('li');
    li.className = 'week_free';
    li.textContent = slots.length === 0
        ? '빈 시간 없음'
        : '빈 시간 ' + slots.slice(0, 3).map(slot => `${minutesLabel(slot[0])}~${minutesLabel(slot[1])}`).join(', ') + (slots.length > 3 ? ' …' : '');

    return li;
}
