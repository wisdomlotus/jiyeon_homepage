/* ═══════════════════════════════════════════
   data.js — Firebase Firestore 기반 데이터 관리
   (localStorage → 클라우드 DB로 전환)
═══════════════════════════════════════════ */

/* ── ★ Firebase 설정 — 아래 값을 본인 Firebase 프로젝트 값으로 교체하세요 ── */
const firebaseConfig = {
  apiKey:            "AIzaSyBT7uDbyqf92k1wrwm0gVFn_0rlklfu73M",
  authDomain:        "jiyeon-homepage.firebaseapp.com",
  projectId:         "jiyeon-homepage",
  storageBucket:     "jiyeon-homepage.firebasestorage.app",
  messagingSenderId: "450310235454",
  appId:             "1:450310235454:web:58104faeaf4f29a4aaf86f",
  measurementId:     "G-G8WCH135FV"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* ════════════════════════════════
   기본 데이터 (DB 첫 초기화 or 오류 시 사용)
════════════════════════════════ */
const defaultWorkoutData = {
  "2025-4-8": {
    dateLabel: "2025년 4월 8일 (화)", title: "Fran",
    wod: "21-15-9 / 스러스터 + 풀업", record: "🔥 7분 32초",
    memo: "오늘 스러스터 무게 43kg으로 도전! 생각보다 잘 됐다. 풀업도 끊기지 않고 이어서 할 수 있었음.",
    tags: ["스러스터", "풀업"],
    comments: [
      { name: "민지", text: "대박!! 43kg 진짜 대단해 🙌", time: "12:30" },
      { name: "수빈", text: "7분대 미쳤다 🔥🔥", time: "14:02" }
    ]
  },
  "2025-4-7": {
    dateLabel: "2025년 4월 7일 (월)", title: "Annie",
    wod: "50-40-30-20-10 / 더블언더 + 싯업", record: "⏱ 12분 05초",
    memo: "더블언더 아직 연습 중... 한 번씩 막혀서 시간이 좀 나왔다.",
    tags: ["더블언더", "싯업"],
    comments: [{ name: "유나", text: "곧 잘하게 될거야!! 화이팅 💪", time: "20:11" }]
  },
  "2025-4-5": {
    dateLabel: "2025년 4월 5일 (토)", title: "Grace",
    wod: "클린 앤 저크 60회 (43kg)", record: "⚡ 6분 50초",
    memo: "Grace 처음 해봤는데 생각보다 할 만했다! 무게 조금 더 올려도 될 것 같아.",
    tags: ["클린앤저크"], comments: []
  },
  "2025-4-4": {
    dateLabel: "2025년 4월 4일 (금)", title: "Helen",
    wod: "3라운드 / 런닝 400m + 케틀벨 스윙 21개 + 풀업 12개", record: "🏃 14분 22초",
    memo: "런닝 페이스 조절하는 게 아직 어렵다. 다음엔 좀 더 빠르게!",
    tags: ["런닝", "케틀벨", "풀업"],
    comments: [{ name: "지수", text: "운동 열심히 하는 지연이 멋있어 ❤️", time: "19:45" }]
  }
};

const defaultDiaryData = [
  {
    id: 1, date: "2025년 4월 9일 (수)", emoji: "😊", mood: "기분 좋음",
    preview: "오늘은 솜이랑 산책 다녀왔다. 날씨가 너무 좋아서 30분 더 걸었음...",
    full: "오늘은 솜이랑 산책 다녀왔다. 날씨가 너무 좋아서 30분 더 걸었음 ㅋㅋ 솜이가 풀밭에서 뛰어다니는 거 보면서 나도 기분이 좋아졌다. 저녁엔 집에서 파스타 해먹고 영화 봤는데 오랜만에 여유로운 하루였다.",
    comments: [{ name: "혜진", text: "솜이 사진 보여줘~~ 🐶", time: "22:10" }]
  },
  {
    id: 2, date: "2025년 4월 7일 (월)", emoji: "😤", mood: "조금 지침",
    preview: "월요일이라 그런지 운동 끝나고 진짜 방전됐다. 그래도 완주했으니까...",
    full: "월요일이라 그런지 운동 끝나고 진짜 방전됐다. 그래도 완주했으니까 나쁘지 않지! 오늘따라 회사 일도 많아서 머리가 가득 찬 느낌. 빨리 쉬고 싶다.",
    comments: []
  },
  {
    id: 3, date: "2025년 4월 5일 (토)", emoji: "🌸", mood: "설레는 날",
    preview: "친구들이랑 벚꽃 구경 다녀왔다! 올해도 벚꽃은 진짜 예쁘다...",
    full: "친구들이랑 벚꽃 구경 다녀왔다! 올해도 벚꽃은 진짜 예쁘다. 치맥도 먹고 사진도 엄청 찍었는데 다들 너무 예쁘게 나왔음. 이런 날 때문에 사는 것 같아.",
    comments: [
      { name: "민지", text: "나도 같이 갔는데 완전 추억 🌸", time: "21:30" },
      { name: "수빈", text: "사진 공유해줘!!!", time: "21:35" }
    ]
  },
  {
    id: 4, date: "2025년 4월 3일 (목)", emoji: "☕", mood: "잔잔한 하루",
    preview: "카페에서 혼자 책 읽었다. 요즘 자주 가는 카페가 생겼는데 분위기가 너무 좋아...",
    full: "카페에서 혼자 책 읽었다. 요즘 자주 가는 카페가 생겼는데 분위기가 너무 좋아. 창가 자리에 앉아서 두 시간 동안 책 읽고 커피 두 잔 마셨음. 이런 조용한 시간도 필요한 것 같다.",
    comments: []
  }
];

const defaultSomEvents = {
  "2025-4-3":  ["✂️ 미용"],
  "2025-4-10": ["🏥 병원 (정기검진)"],
  "2025-5-15": ["💉 예방접종"],
  "2025-7-10": ["💉 예방접종"],
  "2025-3-20": ["✂️ 미용"],
  "2025-3-5":  ["🏥 병원 (귀 세척)"]
};

const defaultSomComments = [
  { id: 1, name: "유나", text: "솜이 너무 귀여워 🐾", time: "13:20", date: "2025.04.09" },
  { id: 2, name: "지수", text: "솜이야 건강하게 지내~ 💕", time: "15:44", date: "2025.04.09" }
];

const defaultChallengeTypes = [
  { id: "running", emoji: "🏃", label: "런닝",     unit: "km", startDate: "", endDate: "" },
  { id: "burpee",  emoji: "💪", label: "버피",     unit: "개", startDate: "", endDate: "" },
  { id: "diet",    emoji: "🥗", label: "다이어트",  unit: "kg", startDate: "", endDate: "" }
];

const defaultChallengeRecords = {
  "2025-4-1": { running: "5km",   burpee: "50개",  diet: "58.2kg / 샐러드" },
  "2025-4-2": {                   burpee: "50개",  diet: "58.0kg" },
  "2025-4-3": { running: "3.2km" },
  "2025-4-4": { running: "4.5km", burpee: "50개",  diet: "57.8kg" },
  "2025-4-5": {                   burpee: "50개",  diet: "57.9kg" },
  "2025-4-6": { running: "6km" },
  "2025-4-7": { running: "3km",   burpee: "50개",  diet: "57.5kg" },
  "2025-4-8": {                   burpee: "50개",  diet: "57.3kg" },
  "2025-4-9": { running: "5km",   burpee: "50개",  diet: "57.1kg" }
};

/* ════════════════════════════════
   전역 변수
════════════════════════════════ */
var workoutData      = {};
var diaryData        = [];
var somEvents        = {};
var somGallery       = [];
var somComments      = [];
var somNotice        = { emoji: "💉", text: "다음 예방접종: 2025년 7월 10일" };
var challengeTypes   = [];
var challengeRecords = {};

/* ── Firestore 컬렉션 참조 ── */
const MAIN_DOC = db.collection('site').doc('config');
const GAL_COL  = db.collection('gallery');

/* ════════════════════════════════
   저장 함수 — 모두 Firestore에 저장
   (기존 코드와 함수 이름 동일하게 유지)
════════════════════════════════ */
function saveMainData() {
  return MAIN_DOC.set({
    workoutData, diaryData, somEvents, somComments,
    somNotice, challengeTypes, challengeRecords,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  }).catch(e => console.error('저장 오류:', e));
}

function saveWorkoutLS()        { saveMainData(); }
function saveDiaryLS()          { saveMainData(); }
function saveSomEvtLS()         { saveMainData(); }
function saveSomCommentsLS()    { saveMainData(); }
function saveNoticeLS()         { saveMainData(); }
function saveChallengeTypesLS() { saveMainData(); }
function saveChallengeRecsLS()  { saveMainData(); }

/* ── 갤러리는 별도 컬렉션 (사진 용량 때문에 분리) ── */
async function saveSomGalLS() {
  try {
    // 기존 사진 문서 전체 삭제 후 재저장
    const snap  = await GAL_COL.get();
    const batch = db.batch();
    snap.docs.forEach(doc => batch.delete(doc.ref));
    somGallery.forEach((g, i) => {
      batch.set(GAL_COL.doc('p' + String(i).padStart(6, '0')), {
        src: g.src, caption: g.caption, order: i
      });
    });
    await batch.commit();
  } catch(e) {
    console.error('사진 저장 오류:', e);
    alert('사진 저장에 실패했어요. 용량이 너무 클 수 있어요 📷');
  }
}

/* ════════════════════════════════
   기본값 설정 (오류 시 폴백)
════════════════════════════════ */
function useDefaults() {
  workoutData      = Object.assign({}, defaultWorkoutData);
  diaryData        = JSON.parse(JSON.stringify(defaultDiaryData));
  somEvents        = Object.assign({}, defaultSomEvents);
  somGallery       = [];
  somComments      = JSON.parse(JSON.stringify(defaultSomComments));
  somNotice        = { emoji: "💉", text: "다음 예방접종: 2025년 7월 10일" };
  challengeTypes   = JSON.parse(JSON.stringify(defaultChallengeTypes));
  challengeRecords = JSON.parse(JSON.stringify(defaultChallengeRecords));
}

/* ════════════════════════════════
   localStorage → Firestore 마이그레이션
   (Firestore가 처음 비어있을 때 자동 실행)
════════════════════════════════ */
async function migrateFromLS() {
  console.log('🔄 localStorage 데이터를 Firestore로 마이그레이션 중...');
  try {
    const allW = JSON.parse(localStorage.getItem('jiyeon_workout_all') || 'null');
    const allE = JSON.parse(localStorage.getItem('jiyeon_somEvt_all')  || 'null');
    const sCR  = JSON.parse(localStorage.getItem('jiyeon_challRecs_all') || 'null');
    const sCT  = JSON.parse(localStorage.getItem('jiyeon_challTypes')   || 'null');
    const sSC  = JSON.parse(localStorage.getItem('jiyeon_somComments')  || 'null');
    const sD   = JSON.parse(localStorage.getItem('jiyeon_diary')        || 'null');
    const sNV  = localStorage.getItem('jiyeon_notice');

    workoutData      = allW || Object.assign({}, defaultWorkoutData);
    somEvents        = allE || Object.assign({}, defaultSomEvents);
    challengeRecords = sCR  || JSON.parse(JSON.stringify(defaultChallengeRecords));
    challengeTypes   = sCT  || JSON.parse(JSON.stringify(defaultChallengeTypes));
    somComments      = sSC  || JSON.parse(JSON.stringify(defaultSomComments));
    diaryData        = sD
      ? sD.concat(defaultDiaryData)
      : JSON.parse(JSON.stringify(defaultDiaryData));
    if (sNV) { try { somNotice = JSON.parse(sNV); } catch(e2) {} }

    await saveMainData();

    // 갤러리 마이그레이션
    const sG = JSON.parse(localStorage.getItem('jiyeon_somGal') || 'null');
    if (sG && sG.length > 0) { somGallery = sG; await saveSomGalLS(); }

    console.log('✅ 마이그레이션 완료!');
  } catch(e) {
    console.warn('마이그레이션 실패, 기본값으로 시작:', e);
    useDefaults();
    await saveMainData();
  }
}

/* ════════════════════════════════
   초기 데이터 로드 (Firestore)
════════════════════════════════ */
async function loadData() {
  try {
    const doc = await MAIN_DOC.get();

    if (doc.exists) {
      const d = doc.data();
      workoutData      = d.workoutData      || Object.assign({}, defaultWorkoutData);
      diaryData        = d.diaryData        || JSON.parse(JSON.stringify(defaultDiaryData));
      somEvents        = d.somEvents        || Object.assign({}, defaultSomEvents);
      somComments      = d.somComments      || JSON.parse(JSON.stringify(defaultSomComments));
      somNotice        = d.somNotice        || { emoji: "💉", text: "다음 예방접종: 2025년 7월 10일" };
      challengeTypes   = d.challengeTypes   || JSON.parse(JSON.stringify(defaultChallengeTypes));
      challengeRecords = d.challengeRecords || JSON.parse(JSON.stringify(defaultChallengeRecords));
    } else {
      // Firestore 비어있음 → localStorage 마이그레이션 시도
      await migrateFromLS();
    }

    // 갤러리 로드 (별도 컬렉션)
    const galSnap = await GAL_COL.orderBy('order').get();
    somGallery = galSnap.docs.map(d => ({
      src: d.data().src,
      caption: d.data().caption
    }));

  } catch(e) {
    console.warn('Firestore 로드 오류, 기본값으로 시작:', e);
    useDefaults();
  }
}

/* ════════════════════════════════
   실시간 리스너
   — 다른 기기·브라우저에서의 변경을 자동 반영
════════════════════════════════ */
function startListening() {
  // 메인 데이터 리스너
  MAIN_DOC.onSnapshot(snap => {
    // 내가 방금 저장한 변경은 무시 (깜빡임 방지)
    if (!snap.exists || snap.metadata.hasPendingWrites) return;
    const d = snap.data();
    workoutData      = d.workoutData      || workoutData;
    diaryData        = d.diaryData        || diaryData;
    somEvents        = d.somEvents        || somEvents;
    somComments      = d.somComments      || somComments;
    somNotice        = d.somNotice        || somNotice;
    challengeTypes   = d.challengeTypes   || challengeTypes;
    challengeRecords = d.challengeRecords || challengeRecords;
    if (typeof refreshCurrentPage === 'function') refreshCurrentPage();
  });

  // 갤러리 리스너
  GAL_COL.orderBy('order').onSnapshot(snap => {
    if (snap.metadata.hasPendingWrites) return;
    somGallery = snap.docs.map(d => ({
      src: d.data().src,
      caption: d.data().caption
    }));
    if (typeof renderSomGallery === 'function' && currentPage === 'som') {
      renderSomGallery();
    }
  });
}

/* ════════════════════════════════
   앱 시작
   — 데이터 로드 완료 후 appInit() 호출
════════════════════════════════ */
async function startApp() {
  await loadData();
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.style.display = 'none';
  if (typeof appInit === 'function') appInit();
  startListening();
}
startApp();
