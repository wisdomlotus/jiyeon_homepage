/* ═══════════════════════════════════════════
   workout.js — 운동일지 섹션
   기능: 캘린더 렌더 / 목록 / 상세 / 추가 / 수정 / 삭제
═══════════════════════════════════════════ */

var calYearWorkout, calMonthWorkout;
(function() {
  var n = new Date();
  calYearWorkout  = n.getFullYear();
  calMonthWorkout = n.getMonth() + 1;
})();

/* ── 캘린더 렌더 ── */
function renderWorkoutCalendar() {
  const days = ['일','월','화','수','목','금','토'];
  const hdr  = document.getElementById('cal-header-workout');
  if (!hdr) return;
  hdr.innerHTML = days.map(d => `<div class="cal-day-header">${d}</div>`).join('');
  document.getElementById('cal-label-workout').textContent =
    `${calYearWorkout}년 ${calMonthWorkout}월`;

  const firstDay = new Date(calYearWorkout, calMonthWorkout - 1, 1).getDay();
  const lastDate = new Date(calYearWorkout, calMonthWorkout, 0).getDate();
  const today    = new Date();

  let cells = '';
  for (let i = 0; i < firstDay; i++) cells += `<div class="cal-cell empty"></div>`;
  for (let d = 1; d <= lastDate; d++) {
    const key = `${calYearWorkout}-${calMonthWorkout}-${d}`;
    const w = workoutData[key];
    const isToday = today.getFullYear() === calYearWorkout &&
                    today.getMonth() + 1 === calMonthWorkout &&
                    today.getDate() === d;
    cells += `
      <div class="cal-cell${isToday ? ' today' : ''}${w ? ' has-workout' : ''}"
           onclick="showWorkoutDetail('${key}')">
        <div class="day-num">${d}</div>
        <div class="cal-icons">${w ? '🏋️' : ''}</div>
      </div>`;
  }
  document.getElementById('cal-body-workout').innerHTML = cells;
}

/* ── 상세 보기 ── */
function showWorkoutDetail(key) {
  const w    = workoutData[key];
  const area = document.getElementById('workout-detail-area');
  if (!w) { area.innerHTML = ''; return; }

  const adminBtns = isAdmin ? `
    <div class="admin-actions">
      <button class="rec-edit-btn" onclick="editWorkout('${key}')">✏️ 수정</button>
      <button class="delete-btn"   onclick="deleteWorkout('${key}')">🗑️ 삭제</button>
    </div>` : '';

  area.innerHTML = `
    <div class="card" style="cursor:default; border-color:var(--peach-light);">
      <div class="card-date">📅 ${w.dateLabel}</div>
      <div class="card-title">🏋️ ${w.title}</div>
      <div class="card-body">${w.wod}</div>
      <div class="card-record">${w.record}</div>
      <div style="margin-top:10px;">${w.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
      <div style="margin-top:10px;font-size:0.88rem;color:var(--text-mid);">${w.memo}</div>
      ${adminBtns}
      ${commentHTML(w.comments, 'workout-' + key)}
    </div>`;
}

/* ── 목록 렌더 ── */
function renderWorkoutList() {
  const el = document.getElementById('workout-list');
  if (!el) return;
  const entries = Object.entries(workoutData)
    .filter(([key]) => {
      const [y, m] = key.split('-').map(Number);
      return y === calYearWorkout && m === calMonthWorkout;
    })
    .sort((a, b) => {
      const pa = a[0].split('-').map(Number);
      const pb = b[0].split('-').map(Number);
      return (pb[0]*10000 + pb[1]*100 + pb[2]) - (pa[0]*10000 + pa[1]*100 + pa[2]);
    });

  if (entries.length === 0) {
    el.innerHTML = `<div style="text-align:center;color:var(--text-light);padding:24px;">이달의 운동 기록이 없어요 💪</div>`;
    return;
  }
  el.innerHTML = entries.map(([key, w]) => `
    <div class="card" onclick="showWorkoutDetail('${key}'); document.getElementById('workout-detail-area').scrollIntoView({behavior:'smooth'});">
      <div class="card-date">📅 ${w.dateLabel}</div>
      <div class="card-title">${w.title}</div>
      <div class="card-body">${w.wod}</div>
      <div class="card-record">${w.record}</div>
      <div style="margin-top:10px;">
        ${w.tags.map(t => `<span class="tag">${t}</span>`).join('')}
        ${w.comments.length ? `<span class="tag mint">💬 ${w.comments.length}</span>` : ''}
        ${isAdmin ? `
          <button class="rec-edit-btn" onclick="event.stopPropagation(); editWorkout('${key}')">✏️</button>
          <button class="delete-btn"   onclick="event.stopPropagation(); deleteWorkout('${key}')">🗑️</button>` : ''}
      </div>
    </div>`).join('');
}

/* ── 월 이동 ── */
function prevMonthWorkout() {
  calMonthWorkout--;
  if (calMonthWorkout < 1) { calMonthWorkout = 12; calYearWorkout--; }
  renderWorkoutCalendar(); renderWorkoutList();
  document.getElementById('workout-detail-area').innerHTML = '';
}
function nextMonthWorkout() {
  calMonthWorkout++;
  if (calMonthWorkout > 12) { calMonthWorkout = 1; calYearWorkout++; }
  renderWorkoutCalendar(); renderWorkoutList();
  document.getElementById('workout-detail-area').innerHTML = '';
}

/* ════════════════════════════════
   운동 추가 폼
════════════════════════════════ */
function workoutForm() {
  return `
    <div class="write-modal-title">🏋️ 운동 기록 추가</div>
    <div class="form-group">
      <label>날짜</label>
      <input type="date" id="w-date" value="${todayStr()}">
    </div>
    <div class="form-group">
      <label>운동 이름 <span style="color:var(--peach);">*</span></label>
      <input type="text" id="w-title" placeholder="예: Fran, Annie, Grace …">
    </div>
    <div class="form-group">
      <label>WOD 내용</label>
      <textarea id="w-wod" placeholder="예: 21-15-9 / 스러스터 + 풀업"></textarea>
    </div>
    <div class="form-group">
      <label>나의 기록</label>
      <input type="text" id="w-record" placeholder="예: 🔥 7분 32초">
    </div>
    <div class="form-group">
      <label>태그 (쉼표로 구분)</label>
      <input type="text" id="w-tags" placeholder="예: 스러스터, 풀업">
    </div>
    <div class="form-group">
      <label>메모</label>
      <textarea id="w-memo" placeholder="오늘 운동 소감을 자유롭게 적어요"></textarea>
    </div>
    <div class="form-msg" id="w-msg">운동 이름은 필수예요!</div>
    <div class="form-actions">
      <button class="btn-cancel" onclick="closeWriteModal()">취소</button>
      <button class="btn-save"   onclick="saveWorkout()">저장</button>
    </div>`;
}

function saveWorkout() {
  const date   = document.getElementById('w-date').value;
  const title  = document.getElementById('w-title').value.trim();
  if (!date || !title) {
    document.getElementById('w-msg').style.display = 'block'; return;
  }
  const wod    = document.getElementById('w-wod').value.trim();
  const record = document.getElementById('w-record').value.trim();
  const tags   = document.getElementById('w-tags').value
                   .split(',').map(t => t.trim()).filter(Boolean);
  const memo   = document.getElementById('w-memo').value.trim();

  const key = dateToKey(date);
  workoutData[key] = { dateLabel: dateToLabel(date), title, wod, record, memo, tags, comments: [] };
  saveWorkoutLS();
  closeWriteModal();
  renderWorkoutCalendar();
  renderWorkoutList();
}

/* ════════════════════════════════
   운동 수정
════════════════════════════════ */
function keyToDateStr(key) {
  const [y, m, d] = key.split('-');
  return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

function editWorkout(key) {
  const w = workoutData[key];
  if (!w || !isAdmin) return;
  document.getElementById('write-form-content').innerHTML = `
    <div class="write-modal-title">✏️ 운동 기록 수정</div>
    <div class="form-group">
      <label>날짜</label>
      <input type="text" value="${w.dateLabel}" disabled
             style="background:var(--peach-pale);color:var(--text-mid);">
    </div>
    <div class="form-group">
      <label>운동 이름 <span style="color:var(--peach);">*</span></label>
      <input type="text" id="w-title" value="${w.title}">
    </div>
    <div class="form-group">
      <label>WOD 내용</label>
      <textarea id="w-wod">${w.wod}</textarea>
    </div>
    <div class="form-group">
      <label>나의 기록</label>
      <input type="text" id="w-record" value="${w.record}">
    </div>
    <div class="form-group">
      <label>태그 (쉼표로 구분)</label>
      <input type="text" id="w-tags" value="${w.tags.join(', ')}">
    </div>
    <div class="form-group">
      <label>메모</label>
      <textarea id="w-memo">${w.memo}</textarea>
    </div>
    <div class="form-msg" id="w-msg">운동 이름은 필수예요!</div>
    <div class="form-actions">
      <button class="btn-cancel" onclick="closeWriteModal()">취소</button>
      <button class="btn-save"   onclick="updateWorkout('${key}')">저장</button>
    </div>`;
  document.getElementById('write-overlay').classList.add('open');
  setTimeout(() => { const el = document.getElementById('w-title'); if (el) el.focus(); }, 100);
}

function updateWorkout(key) {
  const title = document.getElementById('w-title').value.trim();
  if (!title) { document.getElementById('w-msg').style.display = 'block'; return; }
  const wod    = document.getElementById('w-wod').value.trim();
  const record = document.getElementById('w-record').value.trim();
  const tags   = document.getElementById('w-tags').value.split(',').map(t => t.trim()).filter(Boolean);
  const memo   = document.getElementById('w-memo').value.trim();

  workoutData[key] = { ...workoutData[key], title, wod, record, tags, memo };
  saveWorkoutLS();
  closeWriteModal();
  renderWorkoutCalendar();
  renderWorkoutList();
  showWorkoutDetail(key);
}

/* ════════════════════════════════
   운동 삭제
════════════════════════════════ */
function deleteWorkout(key) {
  if (!confirmDelete(`"${workoutData[key] && workoutData[key].title}" 기록을 삭제할까요?`)) return;
  delete workoutData[key];
  saveWorkoutLS();
  document.getElementById('workout-detail-area').innerHTML = '';
  renderWorkoutCalendar();
  renderWorkoutList();
}
