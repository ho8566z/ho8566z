// 주간 회고: 끝난 주의 결과를 보여 주고, 다음 주 횟수·시간을 조정해 계획을 만들거나(2~4주 차) 과정을 마무리한다.
// 서버 값은 모두 textContent 로 넣는다. showMessage·postJson·loadGoals·loadToday·formatDay 는 goal.js, goal_today.js 의 것을 함께 쓴다.
let retro_seq = 0;          // 요청 번호(늦게 도착한 이전 응답이 새 결과를 덮어쓰지 않게 한다)

document.addEventListener('DOMContentLoaded', function () {
    console.log('GOAL RETRO READY!!');

    loadRetros();
});

async function loadRetros() {
    let seq = ++retro_seq;
    let response = await fetch('/goal/retro');
    if (seq !== retro_seq) {
        return;
    }
    if (!response.ok) {
        return;
    }

    let retros = (await response.json()).retros;
    let list = document.getElementById('retro_list');
    list.replaceChildren();
    retros.forEach(function (retro) { list.appendChild(buildRetroCard(retro)); });
    document.getElementById('retro_wrap').hidden = retros.length === 0;
}

function buildRetroCard(retro) {
    let card = document.createElement('div');
    card.className = 'retro_card';
    card.dataset.goalNo = String(retro.goalNo);
    card.dataset.weekNo = String(retro.weekNo);

    let title = document.createElement('strong');
    title.textContent = '[' + retro.theme + '] ' + retro.weekNo + '주 차 회고';

    let message = document.createElement('p');
    message.className = 'message_text';
    message.textContent = retro.message;

    let stats = document.createElement('span');
    stats.className = 'stats';
    stats.textContent = '완료 ' + retro.done + ' · 5분만 하고 완료 ' + retro.shortDone + ' · 건너뜀 ' + retro.skipped + ' · 놓침 ' + retro.missed;

    card.append(title, message, stats);

    if (retro.finalWeek) {
        let finish = document.createElement('button');
        finish.type = 'button';
        finish.textContent = '과정 마무리';
        finish.addEventListener('click', function () { finishGoal(retro, card); });
        card.appendChild(finish);
        return card;
    }

    card.appendChild(buildNextForm(retro, card));
    let preview = document.createElement('div');
    preview.className = 'retro_preview';
    preview.hidden = true;
    card.appendChild(preview);

    return card;
}

// 다음 주 조건 입력: 제안값을 채워 두고 사용자가 고친다
function buildNextForm(retro, card) {
    let form = document.createElement('form');
    form.className = 'retro_form';

    let label = document.createElement('p');
    label.textContent = (retro.weekNo + 1) + '주 차 계획을 만들어요. 횟수와 시간은 바꿀 수 있어요.';

    let count = document.createElement('select');
    count.name = 'weekly_count';
    for (let i = 1; i <= 7; i++) {
        let option = document.createElement('option');
        option.value = String(i);
        option.textContent = '주 ' + i + '회';
        count.appendChild(option);
    }
    count.value = String(retro.suggestedWeeklyCount);

    let minutes = document.createElement('input');
    minutes.type = 'number';
    minutes.name = 'minutes';
    minutes.min = '5';
    minutes.max = '120';
    minutes.step = '5';
    minutes.value = String(retro.suggestedMinutes);

    let time = document.createElement('input');
    time.type = 'time';
    time.name = 'start_time';
    time.value = retro.suggestedStartTime;

    let days = document.createElement('fieldset');
    let legend = document.createElement('legend');
    legend.textContent = '가능한 요일';
    days.appendChild(legend);
    ['월', '화', '수', '목', '금', '토', '일'].forEach(function (name, index) {
        let box = document.createElement('input');
        box.type = 'checkbox';
        box.name = 'days';
        box.value = String(index + 1);
        box.checked = index < 5;
        let text = document.createElement('label');
        text.append(box, name);
        days.appendChild(text);
    });

    let countLabel = document.createElement('label');
    countLabel.append('횟수 ', count);
    let minutesLabel = document.createElement('label');
    minutesLabel.append('1회 소요 시간(분) ', minutes);
    let timeLabel = document.createElement('label');
    timeLabel.append('시작 시각 ', time);

    let submit = document.createElement('button');
    submit.type = 'submit';
    submit.textContent = '다음 주 계획 보기';

    form.append(label, countLabel, minutesLabel, timeLabel, days, submit);
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        previewNextWeek(retro, card, form);
    });

    return form;
}

function nextWeekBody(retro, form) {
    let selectedDays = Array.from(form.querySelectorAll('input[name="days"]:checked')).map(function (box) {
        return parseInt(box.value, 10);
    });

    return {
        weekNo: retro.weekNo,
        weeklyCount: parseInt(form.elements['weekly_count'].value, 10),
        minutes: parseInt(form.elements['minutes'].value, 10),
        startTime: form.elements['start_time'].value,
        days: selectedDays
    };
}

async function previewNextWeek(retro, card, form) {
    let result = await postJson('/goal/' + retro.goalNo + '/next/preview', nextWeekBody(retro, form));
    let preview = card.querySelector('.retro_preview');
    if (!result.ok) {
        preview.hidden = true;
        showMessage(result.data.message || '계획을 만들지 못했습니다.', true);
        await refreshAfterRetroError(result.data.code);
        return;
    }

    showMessage('');
    renderNextPreview(retro, card, form, preview, result.data.activities);
}

function renderNextPreview(retro, card, form, preview, activities) {
    preview.replaceChildren();

    let heading = document.createElement('strong');
    heading.textContent = (retro.weekNo + 1) + '주 차 계획 확인';
    let list = document.createElement('ul');

    activities.forEach(function (activity) {
        let item = document.createElement('li');
        item.classList.toggle('conflict', activity.conflict);

        let date = document.createElement('input');
        date.type = 'date';
        date.value = activity.date;
        date.className = 'slot_date';
        let time = document.createElement('input');
        time.type = 'time';
        time.value = activity.startTime;
        time.className = 'slot_time';
        let name = document.createElement('strong');
        name.textContent = activity.title + ' (' + activity.minutes + '분)';
        let guide = document.createElement('span');
        guide.className = 'guide';
        guide.textContent = activity.guide;

        item.append(date, time, name, guide);
        if (activity.conflict) {
            let warn = document.createElement('span');
            warn.className = 'warn';
            warn.textContent = '이 시간에 "' + activity.conflictTitle + '" 일정이 있습니다. 시간을 옮기거나 그대로 시작할 수 있습니다.';
            item.appendChild(warn);
        }
        list.appendChild(item);
    });

    let start = document.createElement('button');
    start.type = 'button';
    start.textContent = '이 계획으로 시작';
    start.addEventListener('click', function () { startNextWeek(retro, form, list, start); });

    preview.append(heading, list, start);
    preview.hidden = false;
}

async function startNextWeek(retro, form, list, button) {
    let body = nextWeekBody(retro, form);
    body.slots = Array.from(list.querySelectorAll('li')).map(function (item) {
        return {date: item.querySelector('.slot_date').value, time: item.querySelector('.slot_time').value};
    });

    button.disabled = true;
    let result = await postJson('/goal/' + retro.goalNo + '/next/start', body);
    button.disabled = false;

    if (!result.ok) {
        showMessage(result.data.message || '시작하지 못했습니다.', true);
        await refreshAfterRetroError(result.data.code);
        return;
    }

    showMessage((retro.weekNo + 1) + '주 차 계획을 시작했어요.');
    await refreshAll();
}

async function finishGoal(retro, card) {
    let button = card.querySelector('button');
    button.disabled = true;
    let result = await postJson('/goal/' + retro.goalNo + '/finish', {});
    button.disabled = false;

    if (!result.ok) {
        showMessage(result.data.message || '마무리하지 못했습니다.', true);
        await refreshAfterRetroError(result.data.code);
        return;
    }

    showMessage('과정을 마무리했어요. 수고했어요!');
    await refreshAll();
}

// 이미 처리됐거나 상태가 바뀐 경우에는 서버 상태를 다시 읽어 화면을 맞춘다
async function refreshAfterRetroError(code) {
    if (code === 'ALREADY_PLANNED' || code === 'RETRO_NOT_READY' || code === 'NO_NEXT_WEEK' || code === 'GOAL_NOT_FOUND' || code === 'INVALID_STATE') {
        await refreshAll();
    }
}

async function refreshAll() {
    await loadRetros();
    await loadToday();
    if (typeof loadGoals === 'function') {
        loadGoals();
    }
}
