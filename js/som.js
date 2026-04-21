/* ═══════════════════════════════════════════
   som.js — 솜 섹션
   기능:
   • 캘린더 (일정 추가·삭제)
   • 갤러리 (사진 업로드 / 삭제 — 목록 + 모달)
   • 응원 메시지 (이름+메시지 / 영구저장 / 삭제)
═══════════════════════════════════════════ */

var calYearSom, calMonthSom;
(function () {
  var n = new Date();
  calYearSom  = n.getFullYear();
  calMonthSom = n.getMonth() + 1;
})();

var somPhotoBase64 = null; // 업로드 임시 저장

/* ════════════════════════════════
   솜 캘린더
════════════════════════════════ */
/* ════════════════════════════════
   솜 알림바 (이모지 + 내용 자유 수정)
════════════════════════════════ */
function renderVaccineNotice() {
  const emojiEl = document.getElementById('notice-emoji');
  const textEl  = document.getElementById('notice-text');
  if (emojiEl) emojiEl.textContent = somNotice.emoji || '📌';
  if (textEl)  textEl.textContent  = somNotice.text  || '일정을 입력해 주세요';
}

function openNoticeEdit() {
  if (!isAdmin) return;
  document.getElementById('write-form-content').innerHTML = `
    <div class="write-modal-title">📌 알림 내용 수정</div>
    <div class="form-group">
      <label>이모지 <span style="color:var(--peach);">*</span></label>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;">
        ${['💉','🏥','✂️','🛁','🦷','🦮','🐾','📅','⚠️','🌟'].map(e =>
          `<button type="button" class="notice-emoji-btn${somNotice.emoji===e?' selected':''}"
             onclick="selectNoticeEmoji(this,'${e}')">${e}</button>`
        ).join('')}
      </div>
      <input type="text" id="notice-emoji-input" value="${somNotice.emoji || '📌'}"
             maxlength="2" placeholder="직접 입력" style="width:80px;margin-top:8px;">
    </div>
    <div class="form-group">
      <label>내용 <span style="color:var(--peach);">*</span></label>
      <input type="text" id="notice-text-input" value="${somNotice.text || ''}"
             placeholder="예: 다음 예방접종: 2025년 7월 10일"
             onkeydown="if(event.key==='Enter') saveNotice()">
    </div>
    <div class="form-actions">
      <button class="btn-cancel" onclick="closeWriteModal()">취소</button>
      <button class="btn-save"   onclick="saveNotice()">저장</button>
    </div>`;
  document.getElementById('write-overlay').classList.add('open');
  setTimeout(() => { const el = document.getElementById('notice-text-input'); if (el) el.focus(); }, 120);
}

function selectNoticeEmoji(btn, emoji) {
  document.querySelectorAll('.notice-emoji-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  const inp = document.getElementById('notice-emoji-input');
  if (inp) inp.value = emoji;
}

function saveNotice() {
  const emojiEl = document.getElementById('notice-emoji-input');
  const textEl  = document.getElementById('notice-text-input');
  if (!emojiEl || !textEl) return;
  const emoji = emojiEl.value.trim() || '📌';
  const text  = textEl.value.trim();
  if (!text) { textEl.focus(); return; }
  somNotice = { emoji, text };
  saveNoticeLS();
  closeWriteModal();
  renderVaccineNotice();
}

function renderSomCalendar() {
  renderVaccineNotice();
  const days = ['일','월','화','수','목','금','토'];
  const hdr  = document.getElementById('cal-header-som');
  if (!hdr) return;
  hdr.innerHTML = days.map(d => `<div class="cal-day-header">${d}</div>`).join('');
  document.getElementById('cal-label-som').textContent = `${calYearSom}년 ${calMonthSom}월`;

  const firstDay = new Date(calYearSom, calMonthSom - 1, 1).getDay();
  const lastDate = new Date(calYearSom, calMonthSom, 0).getDate();
  const today    = new Date();

  let cells = '';
  for (let i = 0; i < firstDay; i++) cells += `<div class="cal-cell empty"></div>`;
  for (let d = 1; d <= lastDate; d++) {
    const key    = `${calYearSom}-${calMonthSom}-${d}`;
    const events = somEvents[key] || [];
    const isToday = today.getFullYear() === calYearSom &&
                    today.getMonth() + 1 === calMonthSom &&
                    today.getDate() === d;
    cells += `
      <div class="cal-cell${isToday ? ' today' : ''}${events.length ? ' has-workout' : ''}"
           onclick="showSomDetail('${key}')">
        <div class="day-num">${d}</div>
        <div class="cal-icons" style="font-size:0.85rem;">
          ${events.map(e => e.split(' ')[0]).join('')}
        </div>
      </div>`;
  }
  document.getElementById('cal-body-som').innerHTML = cells;
}

function showSomDetail(key) {
  const events = somEvents[key];
  if (!events || !events.length) return;
  const [y, m, d] = key.split('-');

  const rows = events.map((e, idx) => {
    const delBtn = isAdmin
      ? `<button class="delete-btn" style="padding:3px 10px;margin-left:8px;"
           onclick="deleteSomEvent('${key}',${idx})">🗑️</button>`
      : '';
    return `<div style="display:flex;align-items:center;padding:7px 0;border-bottom:1px solid var(--peach-pale);">
      <span style="flex:1;font-size:0.95rem;">${e}</span>${delBtn}
    </div>`;
  }).join('');

  document.getElementById('modal-content-area').innerHTML = `
    <div class="modal-title">📅 ${y}년 ${m}월 ${d}일</div>
    <div class="modal-date">솜이 일정</div>
    <div style="margin-top:4px;">${rows}</div>`;
  openModal();
}

function prevMonthSom() {
  calMonthSom--;
  if (calMonthSom < 1) { calMonthSom = 12; calYearSom--; }
  renderSomCalendar();
}
function nextMonthSom() {
  calMonthSom++;
  if (calMonthSom > 12) { calMonthSom = 1; calYearSom++; }
  renderSomCalendar();
}

/* ════════════════════════════════
   솜 갤러리 (업로드 사진)
════════════════════════════════ */
function renderSomGallery() {
  const grid = document.getElementById('som-gallery');
  if (!grid) return;

  if (somGallery.length === 0) {
    grid.innerHTML = `
      <div class="gallery-empty">
        <span style="font-size:2.5rem;">📷</span>
        <p>아직 사진이 없어요<br>
          <span style="font-size:0.8rem;">관리자 모드에서 ✏️ 버튼을 눌러 추가해보세요</span>
        </p>
      </div>`;
    return;
  }

  let html = '';
  somGallery.forEach((g, i) => {
    html += `
      <div class="gallery-item som-real-photo" onclick="openSomRealPhoto(${i})">
        <img src="${g.src}" alt="${g.caption}">
        <button class="som-photo-del-btn" title="삭제"
          onclick="event.stopPropagation(); deleteSomPhoto(${i})">🗑️</button>
      </div>`;
  });

  grid.innerHTML = html;
}

/* ── 업로드 사진 모달 (삭제 버튼 포함) ── */
function openSomRealPhoto(i) {
  const g = somGallery[i];
  if (!g) return;

  const delBtn = isAdmin
    ? `<div style="margin-top:14px;">
        <button class="delete-btn" onclick="closeModalBtn(); deleteSomPhoto(${i})">
          🗑️ 이 사진 삭제
        </button>
       </div>`
    : '';

  document.getElementById('modal-content-area').innerHTML = `
    <div class="modal-title">🐩 솜이 사진</div>
    <img src="${g.src}" style="width:100%;border-radius:12px;margin:14px 0;display:block;" alt="">
    <div class="modal-content" style="font-size:0.9rem;">${g.caption}</div>
    ${delBtn}`;
  openModal();
}

/* ════════════════════════════════
   솜 응원 메시지 (영구저장 + 삭제)
════════════════════════════════ */
function renderSomComments() {
  const list = document.getElementById('som-comment-list');
  if (!list) return;

  if (somComments.length === 0) {
    list.innerHTML = `<div style="text-align:center;color:var(--text-light);padding:16px;font-size:0.85rem;">
      아직 응원 메시지가 없어요 🐾<br>첫 번째 메시지를 남겨보세요!
    </div>`;
  } else {
    list.innerHTML = somComments.map((c, idx) => {
      const delBtn = isAdmin
        ? `<button class="som-comment-del" onclick="deleteSomComment(${idx})" title="삭제">🗑️</button>`
        : '';
      return `
        <div class="som-comment-item" id="scom-${idx}">
          <div class="scom-header">
            <strong class="scom-name">${c.name || '익명'}</strong>
            <span class="scom-time">${c.date ? c.date + ' ' : ''}${c.time}</span>
            ${delBtn}
          </div>
          <div class="scom-text">${c.text}</div>
        </div>`;
    }).join('');
  }
}

/* ── 응원 메시지 작성 ── */
function submitSomMessage() {
  const nameEl = document.getElementById('som-name-input');
  const msgEl  = document.getElementById('som-msg-input');
  if (!nameEl || !msgEl) return;

  const name = nameEl.value.trim();
  const text = msgEl.value.trim();
  if (!text) {
    msgEl.focus(); return;
  }

  const now  = new Date();
  const time = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
  const date = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`;

  somComments.push({
    id:   Date.now(),
    name: name || '익명',
    text,
    time,
    date
  });

  saveSomCommentsLS();
  nameEl.value = '';
  msgEl.value  = '';
  renderSomComments();

  // 새 댓글 위치로 스크롤
  const list = document.getElementById('som-comment-list');
  if (list) list.lastElementChild && list.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ── 응원 메시지 삭제 (관리자 전용) ── */
function deleteSomComment(idx) {
  if (!isAdmin) return;
  const c = somComments[idx];
  if (!c) return;
  if (!confirmDelete(`"${c.name}"의 메시지를 삭제할까요?`)) return;
  somComments.splice(idx, 1);
  saveSomCommentsLS();
  renderSomComments();
}

/* ════════════════════════════════
   솜 추가 폼 (일정 / 사진)
════════════════════════════════ */
function somForm() {
  return `
    <div class="write-modal-title">🐩 솜이 기록 추가</div>
    <div class="form-group">
      <label>기록 종류</label>
      <select id="s-type" onchange="toggleSomType()">
        <option value="event">📅 일정 / 이벤트</option>
        <option value="photo">📷 사진 업로드</option>
      </select>
    </div>

    <div id="s-event-area">
      <div class="form-group">
        <label>날짜 <span style="color:var(--peach);">*</span></label>
        <input type="date" id="s-date" value="${todayStr()}">
      </div>
      <div class="form-group">
        <label>빠른 선택</label>
        <select id="s-preset" onchange="applyPreset()">
          <option value="">-- 선택하면 자동 입력 --</option>
          <option value="✂️ 미용">✂️ 미용</option>
          <option value="🏥 병원">🏥 병원</option>
          <option value="💉 예방접종">💉 예방접종</option>
          <option value="🛁 목욕">🛁 목욕</option>
          <option value="🦮 산책">🦮 산책</option>
          <option value="🦷 스케일링">🦷 스케일링</option>
        </select>
      </div>
      <div class="form-group">
        <label>직접 입력 <span style="color:var(--peach);">*</span></label>
        <input type="text" id="s-event" placeholder="예: ✂️ 미용 (한남동 살롱)">
      </div>
    </div>

    <div id="s-photo-area" style="display:none;">
      <div class="form-group">
        <label>사진 설명</label>
        <input type="text" id="s-photo-caption" placeholder="예: 목욕 후 솜이 🛁">
      </div>
      <div class="form-group">
        <label>사진 선택 <span style="color:var(--peach);">*</span></label>
        <label class="photo-upload-label" for="s-photo-input">
          📷 여기를 눌러 사진을 선택하세요
          <br><span style="font-size:0.78rem;font-weight:400;">JPG / PNG / HEIC 지원 · 자동 압축됨</span>
        </label>
        <input type="file" id="s-photo-input" accept="image/*"
               style="display:none;" onchange="handleSomPhoto(this)">
        <div class="photo-preview-grid" id="s-photo-preview"></div>
      </div>
    </div>

    <div class="form-msg" id="s-msg">내용을 입력해 주세요!</div>
    <div class="form-actions">
      <button class="btn-cancel" onclick="closeWriteModal()">취소</button>
      <button class="btn-save"   onclick="saveSom()">저장</button>
    </div>`;
}

function initSomPhotoInput() { somPhotoBase64 = null; }

function toggleSomType() {
  const t = document.getElementById('s-type').value;
  document.getElementById('s-event-area').style.display = (t === 'event') ? '' : 'none';
  document.getElementById('s-photo-area').style.display = (t === 'photo') ? '' : 'none';
  somPhotoBase64 = null;
  const prev = document.getElementById('s-photo-preview');
  if (prev) prev.innerHTML = '';
}

function applyPreset() {
  const v = document.getElementById('s-preset').value;
  if (v) document.getElementById('s-event').value = v;
}

/* ── 사진 처리 (Canvas 압축, 최대 800px JPEG 0.75) ── */
function handleSomPhoto(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const preview = document.getElementById('s-photo-preview');
  if (preview) preview.innerHTML = '<span style="font-size:0.82rem;color:var(--text-light);">처리 중…</span>';

  const reader = new FileReader();
  reader.onload = function(e) {
    compressSomPhoto(e.target.result, function(compressed) {
      somPhotoBase64 = compressed;
      if (preview) {
        preview.innerHTML = `
          <img class="photo-preview-item" src="${compressed}" alt="미리보기">
          <span style="font-size:0.78rem;color:var(--text-mid);align-self:center;">✓ 선택됨</span>`;
      }
    });
  };
  reader.onerror = function() {
    if (preview) preview.innerHTML = '<span style="color:#e05050;font-size:0.82rem;">파일 읽기 실패</span>';
  };
  reader.readAsDataURL(file);
}

function compressSomPhoto(dataUrl, callback) {
  const img = new Image();
  img.onload = function() {
    const MAX = 800;
    let w = img.width, h = img.height;
    if (w > MAX || h > MAX) {
      const ratio = Math.min(MAX / w, MAX / h);
      w = Math.round(w * ratio); h = Math.round(h * ratio);
    }
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    callback(canvas.toDataURL('image/jpeg', 0.75));
  };
  img.onerror = function() { callback(dataUrl); };
  img.src = dataUrl;
}

function saveSom() {
  const type = document.getElementById('s-type').value;
  if (type === 'event') {
    const date  = document.getElementById('s-date').value;
    const event = document.getElementById('s-event').value.trim();
    if (!date || !event) { document.getElementById('s-msg').style.display = 'block'; return; }
    const key = dateToKey(date);
    if (!somEvents[key]) somEvents[key] = [];
    somEvents[key].push(event);
    saveSomEvtLS();
    closeWriteModal();
    renderSomCalendar();
  } else {
    if (!somPhotoBase64) {
      const msg = document.getElementById('s-msg');
      msg.textContent = '사진을 선택해 주세요!'; msg.style.display = 'block'; return;
    }
    const caption = (document.getElementById('s-photo-caption').value.trim()) || '솜이 사진';
    somGallery.push({ src: somPhotoBase64, caption });
    saveSomGalLS();
    closeWriteModal();
    renderSomGallery();
    somPhotoBase64 = null;
  }
}

/* ════════════════════════════════
   삭제
════════════════════════════════ */
function deleteSomEvent(key, idx) {
  if (!confirmDelete('이 일정을 삭제할까요?')) return;
  if (somEvents[key]) {
    somEvents[key].splice(idx, 1);
    if (somEvents[key].length === 0) delete somEvents[key];
  }
  saveSomEvtLS();
  closeModalBtn();
  renderSomCalendar();
}

function deleteSomPhoto(i) {
  if (!confirmDelete('이 사진을 삭제할까요?')) return;
  somGallery.splice(i, 1);
  saveSomGalLS();
  renderSomGallery();
}
