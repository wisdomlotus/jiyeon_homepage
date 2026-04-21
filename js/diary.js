/* ═══════════════════════════════════════════
   diary.js — 요즘의 나 섹션
   기능: 목록 / 모달 보기 / 추가 / 삭제
═══════════════════════════════════════════ */

var selectedEmoji = '😊';

const DIARY_EMOJIS = [
  '😊','😄','😌','🥰','😆','😎',
  '😤','😢','😴','🌸','☕','🌙',
  '🌟','💪','🎉','🤔','😅','🥺'
];

/* ════════════════════════════════
   일기 목록 렌더
════════════════════════════════ */
function renderDiary() {
  const el = document.getElementById('diary-list');
  if (!el) return;

  if (diaryData.length === 0) {
    el.innerHTML = `<div style="text-align:center;color:var(--text-light);padding:40px;">
      아직 기록이 없어요 📝<br>
      <span style="font-size:0.85rem;">오른쪽 아래 ✏️ 버튼으로 첫 일기를 써보세요!</span>
    </div>`;
    return;
  }

  el.innerHTML = diaryData.map(d => `
    <div class="diary-card" onclick="openDiaryModal(${d.id})">
      <div class="diary-emoji-box">${d.emoji}</div>
      <div class="diary-right">
        <div class="diary-date">📅 ${d.date} · ${d.mood}</div>
        <div class="diary-preview">${d.preview}</div>
        <div style="margin-top:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          ${d.comments.length ? `<span class="tag mint">💬 ${d.comments.length}</span>` : ''}
          ${isAdmin ? `<button class="delete-btn" onclick="event.stopPropagation(); deleteDiary(${d.id})">🗑️ 삭제</button>` : ''}
        </div>
      </div>
    </div>`).join('');
}

/* ── 일기 모달 ── */
function openDiaryModal(id) {
  const d = diaryData.find(x => x.id === id);
  if (!d) return;

  const adminBtns = isAdmin ? `
    <div class="admin-actions" style="margin-top:14px;">
      <button class="delete-btn" onclick="closeModalBtn(); deleteDiary(${d.id})">🗑️ 이 일기 삭제</button>
    </div>` : '';

  document.getElementById('modal-content-area').innerHTML = `
    <div class="modal-title">${d.emoji} ${d.mood}</div>
    <div class="modal-date">📅 ${d.date}</div>
    <div class="modal-content">${d.full.replace(/\n/g, '<br>')}</div>
    ${adminBtns}
    ${commentHTML(d.comments, 'diary-' + id)}`;
  openModal();
}

/* ════════════════════════════════
   일기 추가 폼
════════════════════════════════ */
function diaryForm() {
  return `
    <div class="write-modal-title">📝 오늘의 기록</div>
    <div class="form-group">
      <label>날짜 <span style="color:var(--peach);">*</span></label>
      <input type="date" id="d-date" value="${todayStr()}">
    </div>
    <div class="form-group">
      <label>기분 이모지</label>
      <div class="emoji-row" id="emoji-row"></div>
    </div>
    <div class="form-group">
      <label>기분 한 마디</label>
      <input type="text" id="d-mood" placeholder="예: 기분 좋음 / 조금 지침 / 설레는 날">
    </div>
    <div class="form-group">
      <label>오늘의 이야기 <span style="color:var(--peach);">*</span></label>
      <textarea id="d-full" style="min-height:130px;"
        placeholder="오늘 있었던 일, 느낀 점을 자유롭게 적어요"></textarea>
    </div>
    <div class="form-msg" id="d-msg">날짜와 내용은 필수예요!</div>
    <div class="form-actions">
      <button class="btn-cancel" onclick="closeWriteModal()">취소</button>
      <button class="btn-save"   onclick="saveDiary()">저장</button>
    </div>`;
}

function initEmojiPicker() {
  const row = document.getElementById('emoji-row');
  if (!row) return;
  selectedEmoji = '😊';
  row.innerHTML = DIARY_EMOJIS.map(e => `
    <button class="emoji-btn${e === selectedEmoji ? ' selected' : ''}"
            onclick="selectEmoji(this,'${e}')">${e}</button>`).join('');
}

function selectEmoji(btn, e) {
  selectedEmoji = e;
  document.querySelectorAll('#emoji-row .emoji-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function saveDiary() {
  const date = document.getElementById('d-date').value;
  const full = document.getElementById('d-full').value.trim();
  if (!date || !full) {
    document.getElementById('d-msg').style.display = 'block'; return;
  }
  const mood    = document.getElementById('d-mood').value.trim() || '기록';
  const preview = full.length > 60 ? full.slice(0, 60) + '...' : full;
  const newId   = Date.now(); // 100 초과하는 고유값

  diaryData.unshift({
    id: newId, date: dateToLabel(date),
    emoji: selectedEmoji, mood, preview, full, comments: []
  });
  saveDiaryLS();
  closeWriteModal();
  renderDiary();
}

/* ════════════════════════════════
   일기 삭제
════════════════════════════════ */
function deleteDiary(id) {
  const entry = diaryData.find(d => d.id === id);
  const label = entry ? entry.date : '이 일기';
  if (!confirmDelete(`"${label}" 를 삭제할까요?`)) return;

  diaryData = diaryData.filter(d => d.id !== id);
  saveDiaryLS();
  renderDiary();
}
