// 오늘 탭: 오늘 할 활동·놓친 활동·다음 예정을 보여 주고 완료 / 5분만 하기 / 다른 날로 옮기기 / 건너뛰기를 처리한다.
// 서버 값은 모두 textContent 로 넣는다. showMessage·postJson·loadGoals 는 goal.js 의 것을 함께 쓴다.
const WEEKDAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];
let today_seq = 0;          // 요청 번호(늦게 도착한 이전 응답이 새 결과를 덮어쓰지 않게 한다)

document.addEventListener('DOMContentLoaded', function () {
    console.log('GOAL TODAY READY!!');

    document.querySelectorAll('.tabs .tab').forEach(function (button) {
        button.addEventListener('click', function () { selectTab(button.dataset.tab); });
    });

    loadToday();
});

function selectTab(name) {
    document.querySelectorAll('.tabs .tab').forEach(function (button) {
        let selected = button.dataset.tab === name;
        button.classList.toggle('selected', selected);
        button.setAttribute('aria-selected', String(selected));
    });
    document.getElementById('tab_today').hidden = name !== 'today';
    document.getElementById('tab_goals').hidden = name !== 'goals';
    showMessage('');
}

function formatDay(isoDate) {
    let parts = isoDate.split('-').map(function (part) { return parseInt(part, 10); });
    let day = new Date(parts[0], parts[1] - 1, parts[2]);

    return parts[1] + '/' + parts[2] + '(' + WEEKDAY_NAMES[day.getDay()] + ')';
}

async function loadToday() {
    let seq = ++today_seq;
    let response = await fetch('/goal/today');
    if (seq !== today_seq) {
        return;
    }
    if (!response.ok) {
        showMessage('오늘 할 일을 불러오지 못했습니다.', true);
        return;
    }

    renderToday(await response.json());
}

function renderToday(data) {
    document.getElementById('today_date').textContent = '오늘 ' + formatDay(data.today);

    let missedWrap = document.getElementById('missed_wrap');
    let missedList = document.getElementById('missed_list');
    missedList.replaceChildren();
    data.missed.forEach(function (card) { missedList.appendChild(buildCard(card, true)); });
    missedWrap.hidden = data.missed.length === 0;

    let todayList = document.getElementById('today_list');
    todayList.replaceChildren();
    data.cards.forEach(function (card) { todayList.appendChild(buildCard(card, false)); });

    renderNextInfo(data);
}

// 오늘 할 활동이 없거나 모두 끝냈을 때 안내 문구와 다음 예정 활동을 보여 준다
function renderNextInfo(data) {
    let info = document.getElementById('next_info');
    info.replaceChildren();

    let hasPlanned = data.cards.some(function (card) { return card.status === 'PLANNED'; });
    let hasGoal = data.activeGoals > 0;
    if (hasPlanned) {
        info.hidden = true;
        return;
    }

    let text = document.createElement('span');
    if (data.next) {
        let prefix = data.cards.length > 0 ? '오늘 할 일을 모두 마쳤어요. ' : '오늘은 예정된 활동이 없어요. ';
        text.textContent = prefix + '다음 활동: ' + formatDay(data.next.date) + ' ' + data.next.startTime
            + ' [' + data.next.theme + '] ' + data.next.title;
    } else if (hasGoal) {
        text.textContent = data.cards.length > 0 ? '오늘 할 일을 모두 마쳤어요.' : '오늘은 예정된 활동이 없어요.';
    } else if (data.pausedGoals > 0) {
        text.textContent = '일시 중지한 목표만 있어요. ';
        let link = document.createElement('button');
        link.type = 'button';
        link.className = 'link_button';
        link.textContent = '목표 탭에서 다시 시작할 수 있어요';
        link.addEventListener('click', function () { selectTab('goals'); });
        text.appendChild(link);
    } else {
        text.textContent = '진행 중인 목표가 없어요. ';
        let link = document.createElement('button');
        link.type = 'button';
        link.className = 'link_button';
        link.textContent = '목표 탭에서 시작해 보세요';
        link.addEventListener('click', function () { selectTab('goals'); });
        text.appendChild(link);
    }
    info.appendChild(text);
    info.hidden = false;
}

function buildCard(card, isMissed) {
    let item = document.createElement('div');
    item.className = 'today_card';
    item.classList.toggle('missed', isMissed);
    item.classList.toggle('finished', card.status !== 'PLANNED');

    let title = document.createElement('strong');
    title.textContent = '[' + card.theme + '] ' + card.title;

    let when = document.createElement('span');
    when.className = 'when';
    let day = isMissed ? formatDay(card.date) : '오늘';
    when.textContent = day + ' ' + card.startTime + ' · ' + card.minutes + '분' + (isMissed ? ' · 놓침' : '');

    let guide = document.createElement('p');
    guide.className = 'guide';
    guide.textContent = card.guide;

    let progress = document.createElement('span');
    progress.className = 'progress';
    progress.textContent = '이번 주 ' + card.weeklyCount + '회 중 ' + card.weeklyDone + '회 완료';

    item.append(title, when, guide, progress);

    if (card.status === 'DONE' || card.status === 'SHORT_DONE') {
        let done = document.createElement('span');
        done.className = 'done_label';
        done.textContent = card.status === 'DONE' ? '완료했어요' : '5분만 하고 완료했어요';
        item.appendChild(done);
        return item;
    }

    let extra = document.createElement('div');
    extra.className = 'extra';
    extra.hidden = true;

    let buttons = document.createElement('div');
    buttons.className = 'buttons';
    if (!isMissed) {
        buttons.appendChild(actionButton('완료', function (button) { return sendAction(card, 'done', button, '완료했어요.'); }));
    }
    buttons.appendChild(actionButton('5분만 하기', function () { showShortVersion(card, extra); }));
    buttons.appendChild(actionButton(isMissed ? '빈 날로 옮기기' : '다른 날로 옮기기', function () { showCandidates(card, extra); }));
    if (isMissed) {
        buttons.appendChild(skipButton(card));
    }

    item.append(buttons, extra);
    return item;
}

function actionButton(label, handler) {
    let button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', function () { handler(button); });

    return button;
}

// 건너뛰기는 되돌릴 수 없어 한 번 더 눌러야 실행된다
function skipButton(card) {
    let button = actionButton('이번엔 건너뛰기', function () {
        if (button.dataset.confirm !== 'yes') {
            button.dataset.confirm = 'yes';
            button.textContent = '정말 건너뛸까요?';
            return;
        }
        sendAction(card, 'skip', button, '이번에는 건너뛰었어요. 다음 활동부터 이어가요.');
    });
    button.classList.add('quiet');

    return button;
}

function showShortVersion(card, extra) {
    extra.replaceChildren();

    let text = document.createElement('p');
    text.className = 'short_guide';
    text.textContent = '같은 목표를 향한 짧은 버전: ' + card.shortGuide;
    let confirm = actionButton('5분 했어요', function (button) {
        return sendAction(card, 'short-done', button, '5분이라도 해냈어요. 실천으로 기록했어요.');
    });
    extra.append(text, confirm);
    extra.hidden = false;
}

async function showCandidates(card, extra) {
    extra.replaceChildren();
    extra.hidden = false;

    let response = await fetch('/goal/activity/' + card.activityNo + '/candidates');
    if (!response.ok) {
        showMessage((await response.json().catch(function () { return {}; })).message || '후보를 불러오지 못했습니다.', true);
        extra.hidden = true;
        return;
    }

    let candidates = (await response.json()).candidates;
    if (candidates.length === 0) {
        let empty = document.createElement('p');
        empty.textContent = '이번 주에 옮길 수 있는 빈 날이 없어요. 5분만 하거나 건너뛰어도 괜찮아요.';
        extra.appendChild(empty);
        return;
    }

    let label = document.createElement('p');
    label.textContent = '옮길 날을 골라 주세요.';
    extra.appendChild(label);
    candidates.forEach(function (candidate) {
        let text = formatDay(candidate.date) + ' ' + candidate.startTime + (candidate.conflict ? ' · "' + candidate.conflictTitle + '" 일정과 겹쳐요' : '');
        let button = actionButton(text, function (self) {
            return sendMove(card, candidate, self);
        });
        button.classList.toggle('conflict', candidate.conflict);
        extra.appendChild(button);
    });
}

function sendMove(card, candidate, button) {
    return send(button, '/goal/activity/' + card.activityNo + '/move', {date: candidate.date, time: candidate.startTime},
        '다른 날로 옮겼어요: ' + formatDay(candidate.date) + ' ' + candidate.startTime);
}

function sendAction(card, action, button, successText) {
    return send(button, '/goal/activity/' + card.activityNo + '/' + action, {}, successText);
}

// 요청 중에는 같은 카드의 버튼을 모두 잠가 두 번 눌러도 한 번만 보낸다. 실패하면 서버 상태를 다시 읽어 화면을 맞춘다
async function send(button, url, body, successText) {
    let card = button.closest('.today_card');
    let buttons = card.querySelectorAll('button');
    buttons.forEach(function (item) { item.disabled = true; });

    let result = await postJson(url, body);
    if (result.ok) {
        showMessage(successText);
    } else {
        showMessage(result.data.message || '처리하지 못했습니다.', true);
    }

    await loadToday();
    if (typeof loadGoals === 'function') {
        loadGoals();
    }
}
