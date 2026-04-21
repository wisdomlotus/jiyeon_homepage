/* ═══════════════════════════════════════════
   data.js — 기본 데이터 + localStorage 관리
═══════════════════════════════════════════ */

/* ── 기본 데이터 (초기값 / 삭제해도 복원되지 않음) ── */
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

/* ── 챌린지 종류 (추가/삭제 가능) ── */
const defaultChallengeTypes = [
  { id: "running", emoji: "🏃", label: "런닝",     unit: "km" },
  { id: "burpee",  emoji: "💪", label: "버피",     unit: "개" },
  { id: "diet",    emoji: "🥗", label: "다이어트",  unit: "kg" }
];

/* ── 챌린지 기록 (날짜 → 챌린지ID → 값) ── */
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

/* ── 전역 작업용 변수 ── */
var workoutData      = {};
var diaryData        = [];
var somEvents        = {};
var somGallery       = [];
var somComments      = [];
var somNotice = { emoji: "💉", text: "다음 예방접종: 2025년 7월 10일" };  // 솜 알림바
var challengeTypes   = [];   // [{id, emoji, label, unit}]
var challengeRecords = {};   // {"2025-4-1": {running:"5km", burpee:"50개"}}

/* ── 초기 로드 ── */
function loadData() {
  try {
    const sW  = JSON.parse(localStorage.getItem('jiyeon_workout') || 'null');
    const sD  = JSON.parse(localStorage.getItem('jiyeon_diary')   || 'null');
    const sE  = JSON.parse(localStorage.getItem('jiyeon_somEvt')  || 'null');
    const sG  = JSON.parse(localStorage.getItem('jiyeon_somGal')  || 'null');
    const sC  = JSON.parse(localStorage.getItem('jiyeon_chall')   || 'null');

    // 운동일지: 기본 + 추가분 병합
    workoutData = Object.assign({}, defaultWorkoutData, sW || {});

    // 일기: 기본 + 추가분 (최신순 정렬)
    const extraDiary = sD || [];
    diaryData = extraDiary.concat(defaultDiaryData);

    // 솜 이벤트
    somEvents = Object.assign({}, defaultSomEvents, sE || {});

    // 솜 갤러리 (업로드 사진)
    somGallery = sG || [];

    // 솜 알림바 (이모지 + 내용)
    const sNV = localStorage.getItem('jiyeon_notice');
    if (sNV) { try { somNotice = JSON.parse(sNV); } catch(e) {} }

    // 솜 댓글 (localStorage에 영구 저장)
    const sSC = JSON.parse(localStorage.getItem('jiyeon_somComments') || 'null');
    if (sSC) {
      somComments = sSC; // 저장본 있으면 그대로 사용 (삭제 반영)
    } else {
      somComments = JSON.parse(JSON.stringify(defaultSomComments));
    }

    // 챌린지 종류
    const sCT = JSON.parse(localStorage.getItem('jiyeon_challTypes') || 'null');
    challengeTypes = sCT || JSON.parse(JSON.stringify(defaultChallengeTypes));

    // 챌린지 기록
    const sCR = JSON.parse(localStorage.getItem('jiyeon_challRecs_all') || 'null');
    if (sCR) {
      challengeRecords = sCR;
    } else {
      challengeRecords = JSON.parse(JSON.stringify(defaultChallengeRecords));
    }
  } catch (e) {
    console.warn('데이터 로드 오류, 기본값 사용', e);
    workoutData      = Object.assign({}, defaultWorkoutData);
    diaryData        = defaultDiaryData.slice();
    somEvents        = Object.assign({}, defaultSomEvents);
    somGallery       = [];
    somComments      = JSON.parse(JSON.stringify(defaultSomComments));
    challengeTypes   = JSON.parse(JSON.stringify(defaultChallengeTypes));
    challengeRecords = JSON.parse(JSON.stringify(defaultChallengeRecords));
  }
}

/* ── 저장 함수 ── */
function saveWorkoutLS() {
  const extra = {};
  Object.keys(workoutData).forEach(k => {
    if (!defaultWorkoutData[k]) extra[k] = workoutData[k];
  });
  // 기본 데이터 중 삭제된 것도 저장 (deleted 마킹)
  localStorage.setItem('jiyeon_workout', JSON.stringify(extra));
  // 삭제 목록도 저장
  localStorage.setItem('jiyeon_workout_all', JSON.stringify(workoutData));
}

function saveDiaryLS() {
  const extra = diaryData.filter(d => d.id > 100);
  localStorage.setItem('jiyeon_diary', JSON.stringify(extra));
  // 삭제된 기본 항목 ID 저장
  const deletedIds = defaultDiaryData.filter(d => !diaryData.find(x => x.id === d.id)).map(d => d.id);
  localStorage.setItem('jiyeon_diary_deleted', JSON.stringify(deletedIds));
}

function saveSomEvtLS() {
  const extra = {};
  Object.keys(somEvents).forEach(k => {
    if (!defaultSomEvents[k]) extra[k] = somEvents[k];
  });
  localStorage.setItem('jiyeon_somEvt', JSON.stringify(extra));
  // 전체 상태(삭제 포함)
  localStorage.setItem('jiyeon_somEvt_all', JSON.stringify(somEvents));
}

function saveSomCommentsLS() {
  localStorage.setItem('jiyeon_somComments', JSON.stringify(somComments));
}

function saveSomGalLS() {
  try {
    localStorage.setItem('jiyeon_somGal', JSON.stringify(somGallery));
  } catch (e) {
    alert('사진 저장 공간이 부족해요. 이전 사진을 삭제해 보세요 📷');
  }
}

function saveNoticeLS() {
  localStorage.setItem('jiyeon_notice', JSON.stringify(somNotice));
}

function saveChallengeTypesLS() {
  localStorage.setItem('jiyeon_challTypes', JSON.stringify(challengeTypes));
}

function saveChallengeRecsLS() {
  localStorage.setItem('jiyeon_challRecs_all', JSON.stringify(challengeRecords));
}

/* ── 실행 ── */
loadData();

// 삭제된 기본 항목 반영
(function applyDeleted() {
  try {
    // 운동일지: all 저장본이 있으면 우선 사용
    const allW = JSON.parse(localStorage.getItem('jiyeon_workout_all') || 'null');
    if (allW) workoutData = allW;

    // 일기: 삭제 ID 반영
    const deletedIds = JSON.parse(localStorage.getItem('jiyeon_diary_deleted') || '[]');
    if (deletedIds.length) {
      diaryData = diaryData.filter(d => !deletedIds.includes(d.id));
    }

    // 솜 이벤트: all 저장본 우선
    const allE = JSON.parse(localStorage.getItem('jiyeon_somEvt_all') || 'null');
    if (allE) somEvents = allE;

    // 챌린지: 이미 loadData()에서 all 저장본 사용 중이므로 별도 처리 불필요
  } catch (e) { /* 무시 */ }
})();
