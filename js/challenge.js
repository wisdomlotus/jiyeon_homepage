/* ═══════════════════════════════════════════
   challenge.js — 챌린지 섹션 (리뉴얼)

   구조:
   ┌─ 챌린지 종류 카드 (추가·삭제 가능) ─────────┐
   │  🏃 런닝  💪 버피  🥗 다이어트  [+추가]     │
   └─────────────────────────────────────────┘
   ┌─ 통합 캘린더 ─────────────────────────────┐
   │  날짜 셀에 해당 날의 챌린지 이모지 표시       │
   │  클릭 → 상세 모달 (기록 확인 + 삭제)        │
   └─────────────────────────────────────────┘
═══════════════════════════════════════════ */

var calYear, calMonth;
(function () {
  var n = new Date();
  calYear  = n.getFullYear();
  calMonth = n.getMonth() + 1;
})();

/* ════════════════════════════════
   챌린지 종류 카드
════════════════════════════════ */
function renderChallengeTypes() {
  const el = document.getElementById('challenge-types');
  if (!el) return;

  if (challengeTypes.length === 0) {
    el.innerHTML = `<p style="color:var(--text-light);font-size:0.88rem;padding:12px 0;">
      챌린지가 없어요. 오른쪽 아래 ✏️ 버튼으로 추가해 보세요!
    </p>`;
    return;
  }

  el.innerHTML = challengeTypes.map(ct => {
    // 이달 기록 수
    const count = Object.keys(challengeRecords).filter(key => {
      const [y, m] = key.split('-').map(Number);
      return y === calYear && m === calMonth && challengeRecords[key][ct.id] !== undefined;
    }).length;

    // 진행 기간 표시
    const periodStr = (ct.startDate && ct.endDate)
      ? `<div class="ct-period">${formatPeriod(ct.startDate, ct.endDate)}</div>`
      : (ct.startDate ? `<div class="ct-period">${formatDate(ct.startDate)} ~</div>` : '');

    const delBtn = isAdmin
      ? `<button class="ct-delete-btn" onclick="deleteChallengeType('${ct.id}')" title="챌린지 삭제">✕</button>`
      : '';

    return `
      <div class="ct-card">
        <span class="ct-emoji">${ct.emoji}</span>
        <div class="ct-info">
          <div class="ct-label">${ct.label}</div>
          <div class="ct-meta">${ct.unit} · 이달 ${count}회</div>
          ${periodStr}
        </div>
        ${delBtn}
      </div>`;
  }).join('');
}

/* ════════════════════════════════
   통합 캘린더
════════════════════════════════ */
function renderCalendar() {
  const days = ['일','월','화','수','목','금','토'];
  const hdr  = document.getElementById('cal-header');
  if (!hdr) return;

  hdr.innerHTML = days.map(d => `<div class="cal-day-header">${d}</div>`).join('');
  document.getElementById('cal-label').textContent = `${calYear}년 ${calMonth}월`;

  const firstDay = new Date(calYear, calMonth - 1, 1).getDay();
  const lastDate = new Date(calYear, calMonth, 0).getDate();
  const today    = new Date();

  let cells = '';
  for (let i = 0; i < firstDay; i++) cells += `<div class="cal-cell empty"></div>`;

  for (let d = 1; d <= lastDate; d++) {
    const key    = `${calYear}-${calMonth}-${d}`;
    const recs   = challengeRecords[key] || {};
    const isToday = today.getFullYear() === calYear &&
                    today.getMonth() + 1 === calMonth &&
                    today.getDate() === d;

    // 기록 있는 챌린지 이모지만 표시
    const emojis = challengeTypes
      .filter(ct => recs[ct.id] !== undefined)
      .map(ct => `<span title="${ct.label}: ${recs[ct.id]}">${ct.emoji}</span>`)
      .join('');

    const hasRec = emojis.length > 0;
    cells += `
      <div class="cal-cell${isToday ? ' today' : ''}${hasRec ? ' has-challenge' : ''}"
           onclick="showChallengeDay('${key}')">
        <div class="day-num">${d}</div>
        <div class="cal-icons" style="font-size:0.82rem;gap:1px;">${emojis}</div>
      </div>`;
  }
  document.getElementById('cal-body').innerHTML = cells;
}

/* ── 월 이동 ── */
function prevMonth() {
  calMonth--;
  if (calMonth < 1) { calMonth = 12; calYear--; }
  renderChallengeTypes();
  renderCalendar();
}
function nextMonth() {
  calMonth++;
  if (calMonth > 12) { calMonth = 1; calYear++; }
  renderChallengeTypes();
  renderCalendar();
}

/* ════════════════════════════════
   날짜 클릭 → 상세 모달
════════════════════════════════ */
function showChallengeDay(key) {
  const recs = challengeRecords[key] || {};
  const entries = challengeTypes.filter(ct => recs[ct.id] !== undefined);

  const [y, m, d] = key.split('-');
  const dateLabel  = `${y}년 ${m}월 ${d}일`;

  if (entries.length === 0) {
    // 기록 없는 날 클릭 시 — admin이면 빠른 입력 안내
    if (isAdmin) {
      document.getElementById('modal-content-area').innerHTML = `
        <div class="modal-title">📅 ${dateLabel}</div>
        <div class="modal-date" style="color:var(--text-light);">기록이 없는 날이에요</div>
        <div style="margin-top:16px;">
          <button class="btn-save" onclick="closeModalBtn(); openWriteFormDate('${key}')">
            ✏️ 이 날 기록 추가
          </button>
        </div>`;
      openModal();
    }
    return;
  }

  const rows = entries.map(ct => {
    const adminBtns = isAdmin
      ? `<div style="display:flex;gap:6px;flex-shrink:0;">
           <button class="rec-edit-btn" onclick="editChallengeRec('${key}','${ct.id}')">✏️</button>
           <button class="delete-btn" style="padding:3px 10px;" onclick="deleteChallengeRec('${key}','${ct.id}')">🗑️</button>
         </div>`
      : '';
    return `
      <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--peach-pale);">
        <span style="font-size:1.4rem;min-width:28px;">${ct.emoji}</span>
        <div style="flex:1;">
          <div style="font-weight:800;font-size:0.9rem;color:var(--text-dark);">${ct.label}</div>
          <div style="font-size:0.85rem;color:var(--text-mid);">${recs[ct.id]}</div>
        </div>
        ${adminBtns}
      </div>`;
  }).join('');

  const addBtn = isAdmin
    ? `<div style="margin-top:14px;">
        <button class="btn-save" style="width:100%;font-size:0.85rem;"
          onclick="closeModalBtn(); openWriteFormDate('${key}')">✏️ 이 날에 더 추가</button>
       </div>`
    : '';

  document.getElementById('modal-content-area').innerHTML = `
    <div class="modal-title">📅 ${dateLabel}</div>
    <div class="modal-date">챌린지 기록</div>
    <div style="margin-top:4px;">${rows}</div>
    ${addBtn}`;
  openModal();
}

/* ════════════════════════════════
   챌린지 기록 추가 폼
════════════════════════════════ */
function challengeForm(prefillDate) {
  const dateVal = prefillDate || todayStr();

  if (challengeTypes.length === 0) {
    return `
      <div class="write-modal-title">🏆 챌린지 기록 추가</div>
      <p style="color:var(--text-light);font-size:0.9rem;margin:12px 0;">
        먼저 챌린지 종류를 추가해 주세요!
      </p>
      <div class="form-actions">
        <button class="btn-cancel" onclick="closeWriteModal()">닫기</button>
        <button class="btn-save"   onclick="closeWriteModal(); openAddChallengeTypeForm()">+ 챌린지 추가</button>
      </div>`;
  }

  const typeOptions = challengeTypes.map(ct =>
    `<label class="ct-check-label">
      <input type="checkbox" class="ct-check" value="${ct.id}" onchange="toggleChallengeInput('${ct.id}')">
      <span>${ct.emoji} ${ct.label}</span>
    </label>
    <div id="ct-input-${ct.id}" style="display:none;margin:4px 0 8px 28px;">
      <input type="text" id="ct-val-${ct.id}"
        placeholder="${ct.unit} 값 입력 (예: 5${ct.unit})"
        style="width:100%;border:1.5px solid var(--peach-light);border-radius:10px;padding:7px 12px;font-family:var(--font-main);font-size:0.85rem;outline:none;">
    </div>`
  ).join('');

  return `
    <div class="write-modal-title">🏆 챌린지 기록 추가</div>
    <div class="form-group">
      <label>날짜 <span style="color:var(--peach);">*</span></label>
      <input type="date" id="c-date" value="${dateVal}">
    </div>
    <div class="form-group">
      <label>기록할 챌린지 <span style="color:var(--peach);">*</span></label>
      <div id="ct-checks" style="display:flex;flex-direction:column;gap:4px;margin-top:4px;">
        ${typeOptions}
      </div>
    </div>
    <div class="form-msg" id="c-msg">날짜와 챌린지를 하나 이상 선택해 주세요!</div>
    <div class="form-actions">
      <button class="btn-cancel" onclick="closeWriteModal()">취소</button>
      <button class="btn-save"   onclick="saveChallenge()">저장</button>
    </div>
    <hr style="border:none;border-top:1.5px solid var(--peach-pale);margin:20px 0 14px;">
    <p style="font-size:0.82rem;color:var(--text-light);margin-bottom:10px;">챌린지 종류 관리</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      <button class="btn-cancel" style="font-size:0.8rem;padding:6px 14px;"
        onclick="closeWriteModal(); openAddChallengeTypeForm()">+ 챌린지 추가</button>
    </div>`;
}

function toggleChallengeInput(id) {
  const cb  = document.querySelector(`.ct-check[value="${id}"]`);
  const box = document.getElementById(`ct-input-${id}`);
  if (!cb || !box) return;
  box.style.display = cb.checked ? 'block' : 'none';
  if (cb.checked) {
    const inp = document.getElementById(`ct-val-${id}`);
    if (inp) inp.focus();
  }
}

function saveChallenge() {
  const date = document.getElementById('c-date').value;
  if (!date) { document.getElementById('c-msg').style.display = 'block'; return; }

  const checked = Array.from(document.querySelectorAll('.ct-check:checked'));
  if (checked.length === 0) { document.getElementById('c-msg').style.display = 'block'; return; }

  const key = dateToKey(date);
  if (!challengeRecords[key]) challengeRecords[key] = {};

  checked.forEach(cb => {
    const id  = cb.value;
    const inp = document.getElementById(`ct-val-${id}`);
    const val = (inp ? inp.value.trim() : '') || '기록';
    challengeRecords[key][id] = val;
  });

  saveChallengeRecsLS();
  closeWriteModal();
  renderChallengeTypes();
  renderCalendar();
}

/* ── 날짜 지정 열기 (모달에서 버튼 클릭 시) ── */
function openWriteFormDate(key) {
  const [y, m, d] = key.split('-');
  const dateStr = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  document.getElementById('write-form-content').innerHTML = challengeForm(dateStr);
  document.getElementById('write-overlay').classList.add('open');
}

/* ════════════════════════════════
   기간 포맷 헬퍼
════════════════════════════════ */
function formatDate(str) {
  if (!str) return '';
  const d = new Date(str + 'T00:00:00');
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
}
function formatPeriod(start, end) {
  return `${formatDate(start)} ~ ${formatDate(end)}`;
}

/* ════════════════════════════════
   챌린지 종류 추가 폼
════════════════════════════════ */
function openAddChallengeTypeForm() {
  document.getElementById('write-form-content').innerHTML = `
    <div class="write-modal-title">➕ 챌린지 종류 추가</div>
    <div class="form-group">
      <label>이모지 <span style="color:var(--peach);">*</span></label>
      <input type="text" id="ct-emoji" placeholder="예: 🏊" maxlength="2" style="width:80px;">
    </div>
    <div class="form-group">
      <label>이름 <span style="color:var(--peach);">*</span></label>
      <input type="text" id="ct-name" placeholder="예: 수영">
    </div>
    <div class="form-group">
      <label>단위 <span style="color:var(--peach);">*</span></label>
      <input type="text" id="ct-unit" placeholder="예: m / 분 / 칼로리">
    </div>
    <div class="form-group">
      <label>진행 기간 <span style="font-size:0.78rem;color:var(--text-light);">(선택)</span></label>
      <div style="display:flex;gap:8px;align-items:center;">
        <input type="date" id="ct-start" style="flex:1;">
        <span style="color:var(--text-light);font-size:0.88rem;flex-shrink:0;">~</span>
        <input type="date" id="ct-end" style="flex:1;">
      </div>
    </div>
    <div class="form-msg" id="ct-msg">이모지·이름·단위를 모두 입력해 주세요!</div>
    <div class="form-actions">
      <button class="btn-cancel" onclick="closeWriteModal()">취소</button>
      <button class="btn-save"   onclick="saveChallengeType()">추가</button>
    </div>`;
  document.getElementById('write-overlay').classList.add('open');
  setTimeout(() => { const el = document.getElementById('ct-emoji'); if (el) el.focus(); }, 80);
}

function saveChallengeType() {
  const emoji     = document.getElementById('ct-emoji').value.trim();
  const name      = document.getElementById('ct-name').value.trim();
  const unit      = document.getElementById('ct-unit').value.trim();
  const startDate = document.getElementById('ct-start').value;
  const endDate   = document.getElementById('ct-end').value;

  if (!emoji || !name || !unit) {
    document.getElementById('ct-msg').style.display = 'block'; return;
  }

  const id = name.replace(/[^a-zA-Z0-9가-힣]/g, '') + Date.now();
  challengeTypes.push({ id, emoji, label: name, unit, startDate, endDate });
  saveChallengeTypesLS();
  closeWriteModal();
  renderChallengeTypes();
  renderCalendar();
}

/* ════════════════════════════════
   챌린지 삭제
════════════════════════════════ */
function deleteChallengeType(id) {
  const ct = challengeTypes.find(c => c.id === id);
  if (!ct) return;
  if (!confirmDelete(`"${ct.emoji} ${ct.label}" 챌린지를 삭제할까요?\n(이 챌린지의 모든 기록도 사라져요)`)) return;

  challengeTypes = challengeTypes.filter(c => c.id !== id);

  // 기록에서도 해당 챌린지 제거
  Object.keys(challengeRecords).forEach(key => {
    delete challengeRecords[key][id];
    if (Object.keys(challengeRecords[key]).length === 0) delete challengeRecords[key];
  });

  saveChallengeTypesLS();
  saveChallengeRecsLS();
  renderChallengeTypes();
  renderCalendar();
}

function deleteChallengeRec(key, id) {
  const ct = challengeTypes.find(c => c.id === id);
  const label = ct ? `${ct.emoji} ${ct.label}` : id;
  if (!confirmDelete(`"${label}" 기록을 삭제할까요?`)) return;

  if (challengeRecords[key]) {
    delete challengeRecords[key][id];
    if (Object.keys(challengeRecords[key]).length === 0) delete challengeRecords[key];
  }

  saveChallengeRecsLS();
  closeModalBtn();
  renderChallengeTypes();
  renderCalendar();
}

function editChallengeRec(key, id) {
  const ct = challengeTypes.find(c => c.id === id);
  if (!ct) return;
  const currentVal = (challengeRecords[key] && challengeRecords[key][id]) || '';
  const [y, m, d] = key.split('-');

  document.getElementById('write-form-content').innerHTML = `
    <div class="write-modal-title">✏️ 기록 수정</div>
    <div class="rec-edit-info">
      <span>${ct.emoji} ${ct.label}</span>
      <span style="color:var(--text-light);">${y}년 ${m}월 ${d}일</span>
    </div>
    <div class="form-group" style="margin-top:14px;">
      <label>${ct.label} (${ct.unit})</label>
      <input type="text" id="edit-rec-val" value="${currentVal}"
             placeholder="${ct.unit} 값 입력"
             onkeydown="if(event.key==='Enter') updateChallengeRec('${key}','${ct.id}')">
    </div>
    <div class="form-actions">
      <button class="btn-cancel" onclick="closeWriteModal(); showChallengeDay('${key}')">취소</button>
      <button class="btn-save"   onclick="updateChallengeRec('${key}','${ct.id}')">저장</button>
    </div>`;
  closeModalBtn();
  document.getElementById('write-overlay').classList.add('open');
  setTimeout(() => {
    const el = document.getElementById('edit-rec-val');
    if (el) { el.focus(); el.select(); }
  }, 120);
}

function updateChallengeRec(key, id) {
  const el = document.getElementById('edit-rec-val');
  if (!el) return;
  const val = el.value.trim();
  if (!val) { el.focus(); return; }
  if (!challengeRecords[key]) challengeRecords[key] = {};
  challengeRecords[key][id] = val;
  saveChallengeRecsLS();
  closeWriteModal();
  renderChallengeTypes();
  renderCalendar();
}

/* ════════════════════════════════
   섹션 진입 시 렌더
   (app.js showPage에서 호출)
════════════════════════════════ */
function renderChallengeSection() {
  renderChallengeTypes();
  renderCalendar();
}
