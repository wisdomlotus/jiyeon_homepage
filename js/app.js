/* ═══════════════════════════════════════════
   app.js — 공통 앱 로직
   (페이지 전환 / 관리자 / 모달 / 댓글 / 헬퍼)
═══════════════════════════════════════════ */

/* ── 관리자 설정 (비밀번호 변경 시 이 값을 수정) ── */
const ADMIN_PASSWORD = 'jiyeon0418';
var isAdmin = false;
var currentPage = 'home';

/* ════════════════════════════════
   페이지 전환
════════════════════════════════ */
function showPage(name) {
  currentPage = name;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  const tab = document.getElementById('tab-' + name);
  if (tab) tab.classList.add('active');
  window.scrollTo(0, 0);
  updateFab();

  if (name === 'workout')   { renderWorkoutCalendar(); renderWorkoutList(); }
  if (name === 'challenge') { renderChallengeSection(); }
  if (name === 'som')       { renderSomCalendar(); renderSomGallery(); renderSomComments(); }
  if (name === 'diary')     { renderDiary(); }
}

/* ════════════════════════════════
   관리자 FAB
════════════════════════════════ */
function updateFab() {
  const fab = document.getElementById('admin-fab');
  if (!fab) return;
  if (isAdmin) {
    fab.className = 'admin-fab unlocked';
    fab.textContent = '✏️';
    fab.title = '새 기록 추가';
    document.body.classList.add('admin-mode');
  } else {
    fab.className = 'admin-fab locked';
    fab.textContent = '🔐';
    fab.title = '관리자 로그인';
    document.body.classList.remove('admin-mode');
  }
}

function handleFab() {
  if (isAdmin) {
    if (currentPage === 'home') return;
    openWriteForm(currentPage);
  } else {
    openLoginForm();
  }
}

function logout() {
  isAdmin = false;
  closeWriteModal();
  updateFab();
  // 현재 페이지 다시 렌더 (삭제 버튼 숨김)
  if (currentPage === 'workout')   { renderWorkoutList(); }
  if (currentPage === 'challenge') { renderChallengeSection(); }
  if (currentPage === 'som')       { renderSomGallery(); renderSomComments(); }
  if (currentPage === 'diary')     { renderDiary(); }
}

/* ════════════════════════════════
   로그인 폼
════════════════════════════════ */
function openLoginForm() {
  document.getElementById('write-form-content').innerHTML = `
    <div class="write-modal-title">🔐 관리자 로그인</div>
    <div class="form-group">
      <label>비밀번호</label>
      <input type="password" id="pw-input" placeholder="비밀번호 입력"
        onkeydown="if(event.key==='Enter') doLogin()">
      <div class="form-msg" id="pw-msg">비밀번호가 틀렸어요 🙅‍♀️</div>
    </div>
    <div style="margin-top:6px;">
      <small style="font-size:0.78rem;color:var(--text-light);">
        기본 비밀번호: jiyeon0418 (js/app.js에서 변경 가능)
      </small>
    </div>
    <div class="form-actions">
      <button class="btn-cancel" onclick="closeWriteModal()">취소</button>
      <button class="btn-save"   onclick="doLogin()">로그인</button>
    </div>`;
  document.getElementById('write-overlay').classList.add('open');
  setTimeout(() => { const el = document.getElementById('pw-input'); if (el) el.focus(); }, 120);
}

function doLogin() {
  const el = document.getElementById('pw-input');
  if (!el) return;
  if (el.value === ADMIN_PASSWORD) {
    isAdmin = true;
    closeWriteModal();
    updateFab();
    // 솜 페이지: 갤러리·댓글 다시 렌더해서 삭제 버튼 표시
    if (currentPage === 'som') { renderSomGallery(); renderSomComments(); }
    if (currentPage !== 'home') openWriteForm(currentPage);
  } else {
    const msg = document.getElementById('pw-msg');
    if (msg) msg.style.display = 'block';
    el.value = '';
    el.focus();
  }
}

/* ════════════════════════════════
   쓰기 오버레이
════════════════════════════════ */
function openWriteForm(type) {
  if (type === 'challenge') {
    document.getElementById('write-form-content').innerHTML = challengeForm();
    document.getElementById('write-overlay').classList.add('open');
    return;
  }
  const formFns = { workout: workoutForm, som: somForm, diary: diaryForm };
  const fn = formFns[type];
  if (!fn) return;
  document.getElementById('write-form-content').innerHTML = fn();
  document.getElementById('write-overlay').classList.add('open');
  if (type === 'diary') initEmojiPicker();
  if (type === 'som')   initSomPhotoInput();
}

function closeWriteModal() {
  document.getElementById('write-overlay').classList.remove('open');
  somPhotoBase64 = null;
}

/* ════════════════════════════════
   뷰 모달 (기존 항목 보기)
════════════════════════════════ */
function openModal()     { document.getElementById('modal-overlay').classList.add('open'); }
function closeModalBtn() { document.getElementById('modal-overlay').classList.remove('open'); }
function closeModal(e)   { if (e.target === document.getElementById('modal-overlay')) closeModalBtn(); }

/* ════════════════════════════════
   댓글
════════════════════════════════ */
function commentHTML(comments, key) {
  return `
    <div class="comment-section">
      <h4>💬 응원 댓글 (${comments.length})</h4>
      <div class="comment-list" id="clist-${key}">
        ${comments.map(c => `
          <div class="comment-item">
            <strong>${c.name}</strong>${c.text}
            <span class="ctime">${c.time}</span>
          </div>`).join('')}
      </div>
      <div class="comment-form">
        <input type="text" id="cinput-${key}" placeholder="응원 메시지를 남겨주세요 💬">
        <button onclick="submitComment('${key}', event)">남기기</button>
      </div>
    </div>`;
}

function submitComment(key, event) {
  event && event.stopPropagation();
  const input = document.getElementById('cinput-' + key);
  const val = input ? input.value.trim() : '';
  if (!val) return;
  const list = document.getElementById('clist-' + key);
  const now = new Date();
  const t = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
  if (list) {
    list.innerHTML += `<div class="comment-item"><strong>나</strong>${val}<span class="ctime">${t}</span></div>`;
    list.scrollTop = list.scrollHeight;
  }
  if (input) input.value = '';
}

function addComment(type) {
  if (type === 'som') submitComment('som-main');
}

/* ════════════════════════════════
   헬퍼 함수
════════════════════════════════ */
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function dateToLabel(str) {
  const d = new Date(str + 'T00:00:00');
  const days = ['일','월','화','수','목','금','토'];
  return `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일 (${days[d.getDay()]})`;
}

function dateToKey(str) {
  const [y, m, d] = str.split('-').map(Number);
  return `${y}-${m}-${d}`;
}

function confirmDelete(msg) {
  return window.confirm(msg || '정말 삭제할까요?');
}

/* ════════════════════════════════
   초기화
════════════════════════════════ */
(function init() {
  updateFab();
  renderWorkoutCalendar();
  renderWorkoutList();
})();
