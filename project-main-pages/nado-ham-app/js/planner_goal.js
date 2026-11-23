// 일정 달력에 목표 활동을 겹쳐 보여 준다(읽기 전용). 활동은 목표별 색(과정 코드로 구분)의 칩으로 그리고,
// 칩을 누르면 오늘 탭(/goal)으로 간다. 제목은 textContent 로 넣어 HTML 로 해석되지 않게 한다.
const GOAL_STATUS_MARKS = {DONE: '✓ ', SHORT_DONE: '✓ '};
const GOAL_STATUS_NOTES = {DONE: '완료', SHORT_DONE: '5분만 하고 완료'};

// 지금 보는 달의 목표 활동을 가져와 달력에 붙인다. 달을 빠르게 넘기면 늦게 온 이전 달 응답은 버린다.
async function fetchGetCurrentMonthGoals(requestedYear, requestedMonth) {
    try {
        let response = await fetch(`/goal/calendar?year=${requestedYear}&month=${requestedMonth + 1}`);
        if (!response.ok) {
            return;
        }

        let items = (await response.json()).items;
        if (requestedYear !== current_year || requestedMonth !== current_month) {
            return;
        }

        month_goals = items;
        items.forEach(item => appendGoalChip(item));
        renderGoalLegend(items);
        renderDayList();

    } catch (error) {
        console.log('fetchGetCurrentMonthGoals() COMMUNICATION ERROR!! ', error);

    }

}

function goalChipText(item) {
    return (GOAL_STATUS_MARKS[item.status] || '') + item.startTime + ' ' + item.title + (item.conflict ? ' ⚠' : '');
}

// 마우스를 올렸을 때 보이는 설명(상태·겹침)
function goalChipNote(item) {
    let note = '[' + item.theme + '] ' + item.title + ' · ' + item.minutes + '분';
    if (GOAL_STATUS_NOTES[item.status]) {
        note += ' · ' + GOAL_STATUS_NOTES[item.status];
    }
    if (item.conflict) {
        note += ' · "' + item.conflictTitle + '" 일정과 같은 시간대예요';
    }

    return note;
}

function appendGoalChip(item) {
    let list = document.querySelector(`#date_${item.day} ul.plan`);
    if (!list) {
        return;
    }

    let wrap = list.parentElement;
    wrap.dataset.count = String(parseInt(wrap.dataset.count || '0', 10) + 1);

    let li = document.createElement('li');
    li.className = 'goal_chip';
    li.dataset.course = item.courseCode;
    li.classList.toggle('finished', item.status !== 'PLANNED');
    li.classList.toggle('conflict', item.conflict);

    let link = document.createElement('a');
    link.className = 'goal_link';
    link.href = '/goal';
    link.title = goalChipNote(item);
    link.textContent = goalChipText(item);
    li.appendChild(link);
    list.appendChild(li);
}

// 달력 위에 이번 달에 나온 목표(색 안내)를 한 줄로 보여 준다. 활동이 없으면 숨긴다.
function renderGoalLegend(items) {
    let legend = document.getElementById('goal_legend');
    if (!legend) {
        return;
    }

    legend.replaceChildren();
    let seen = new Set();
    items.forEach(item => {
        if (seen.has(item.courseCode)) {
            return;
        }
        seen.add(item.courseCode);

        let tag = document.createElement('span');
        tag.className = 'goal_tag';
        tag.dataset.course = item.courseCode;
        tag.textContent = '목표 · ' + item.theme;
        legend.appendChild(tag);
    });
    legend.hidden = seen.size === 0;
}

// 모바일의 날짜별 목록에 붙일 목표 활동 항목
function buildGoalDayItem(item) {
    let li = document.createElement('li');
    li.className = 'goal_chip';
    li.dataset.course = item.courseCode;
    li.classList.toggle('finished', item.status !== 'PLANNED');
    li.classList.toggle('conflict', item.conflict);

    let link = document.createElement('a');
    link.className = 'goal_link';
    link.href = '/goal';
    link.textContent = '[' + item.theme + '] ' + goalChipText(item) + (GOAL_STATUS_NOTES[item.status] ? ' · ' + GOAL_STATUS_NOTES[item.status] : '');
    li.appendChild(link);

    return li;
}
