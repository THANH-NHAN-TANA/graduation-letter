const CONFIG = {
  graduateName: "Nguyễn Thành Nhân",
  major: "Mạng máy tính và Truyền thông",
  majorEnglish: "Computer Networks & Communications",
  studentClass: "MMTT2022.2",
  cohort: "K17",
  graduationDate: "2026-11-27T13:30:00+07:00",
  ceremonyStart: "13:30",
  ceremonyEnd: "15:30",
  photoStart: "15:30",
  photoEnd: "17:00",
  school: "Trường Đại học Công nghệ Thông tin · ĐHQG-HCM",
  address: "Khu phố 6 · Linh Trung · TP. Thủ Đức",
  meetingPoint: "Trước cột cờ Tòa E",
  phone: "0368274638",
  zaloUrl: "https://zalo.me/0368274638",
  googleMapsUrl: "https://maps.google.com/?q=Truong+Dai+hoc+Cong+nghe+Thong+tin+DHQG-HCM",
  profileImage: "assets/profile.png",
  secondaryImage: "assets/graduate-alt.png",
  music: "assets/music.mp3",
  firebase: {
    apiKey: "AIzaSyDHM39O6NeBBDi4rOlS7FBy4aKTqJ625hg",
    authDomain: "letter-45c76.firebaseapp.com",
    projectId: "letter-45c76",
    storageBucket: "letter-45c76.firebasestorage.app",
    messagingSenderId: "590526520247",
    appId: "1:590526520247:web:e2f3cc0dd6623498512632",
    measurementId: "G-QVMEZ1HVRW",
    wishesCollection: "graduation-wishes"
  },
  timeline: [
    { hop: "01", time: "13:30", title: "LỄ TỐT NGHIỆP", description: "Bắt đầu buổi lễ tốt nghiệp chính thức.", active: true },
    { hop: "02", time: "15:30", title: "GẶP GỠ VÀ CHỤP ẢNH", description: "Bạn bè và gia đình cùng chụp ảnh tại điểm hẹn." },
    { hop: "03", time: "17:00", title: "KẾT THÚC", description: "Gửi lời cảm ơn và khép lại một ngày đáng nhớ." }
  ]
};

const state = {
  guestName: "bạn",
  audioContext: null,
  audioNodes: [],
  musicAudio: null,
  musicOn: false,
  countdownExpired: false,
  firebaseReady: false,
  firebaseApi: null,
  firebaseDb: null,
  wishes: []
};

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
const wait = (milliseconds) => new Promise(resolve => window.setTimeout(resolve, milliseconds));
const eventDate = new Date(CONFIG.graduationDate);
const year = eventDate.getFullYear();

function escapeHTML(value) {
  return String(value).replace(/[&<>'"]/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[character]);
}

function formatDate(date, options = {}) {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...options
  }).format(date);
}

function fillText(selector, value) {
  qsa(selector).forEach(element => { element.textContent = value; });
}

function fillStaticConfig() {
  document.title = `${CONFIG.graduateName} · Thiệp mời tốt nghiệp`;
  fillText("[data-graduate-name]", CONFIG.graduateName);
  fillText("[data-major]", CONFIG.major);
  fillText("[data-major-english]", CONFIG.majorEnglish);
  fillText("[data-student-class]", CONFIG.studentClass);
  fillText("[data-cohort]", CONFIG.cohort);
  fillText("[data-config-year]", year);
  fillText("[data-school]", CONFIG.school);
  fillText("[data-address]", CONFIG.address);
  fillText("[data-meeting-point]", CONFIG.meetingPoint);
  fillText("[data-event-date]", formatDate(eventDate));
  fillText("[data-event-day]", formatDate(eventDate));
  fillText("[data-ceremony-time]", `${CONFIG.ceremonyStart}–${CONFIG.ceremonyEnd}`);
  fillText("[data-photo-time]", `${CONFIG.photoStart}–${CONFIG.photoEnd}`);

  const nameParts = CONFIG.graduateName.trim().split(/\s+/);
  fillText("[data-graduate-family]", nameParts[0] || "");
  fillText("[data-graduate-middle]", nameParts.slice(1, -1).join(" "));
  fillText("[data-graduate-last]", nameParts.at(-1));
  qs(".hero-copy h1")?.setAttribute("aria-label", CONFIG.graduateName);

  qsa("[data-image='profile']").forEach(image => {
    image.src = CONFIG.profileImage;
    image.alt = `Ảnh tốt nghiệp của ${CONFIG.graduateName}`;
  });
  qsa("[data-image='secondary']").forEach(image => { image.src = CONFIG.secondaryImage; });
  qs("#class-badge").textContent = `${CONFIG.cohort} · ${CONFIG.studentClass}`;
  qs("#maps-link").href = CONFIG.googleMapsUrl;
  qs("#meeting-map-link").href = CONFIG.googleMapsUrl;
  qs("#navigate-link").href = CONFIG.googleMapsUrl;
  qsa("[data-zalo-link]").forEach(link => { link.href = CONFIG.zaloUrl; });
  qsa("[data-call-link]").forEach(link => { link.href = `tel:${CONFIG.phone}`; });
  qsa("[data-phone-link]").forEach(link => {
    link.textContent = CONFIG.phone;
    link.href = `tel:${CONFIG.phone}`;
  });

  qs("#route-list").innerHTML = CONFIG.timeline.map(item => `
    <li class="${item.active ? "active" : ""}">
      <span class="route-time">MỐC ${item.hop} · ${item.time}</span>
      <h3>${escapeHTML(item.title)}</h3>
      <p>${escapeHTML(item.hop === "02" ? `${item.description} ${CONFIG.meetingPoint}.` : item.description)}</p>
      <small>${item.active ? "● MỐC CHÍNH" : "● ĐÃ LÊN LỊCH"}</small>
    </li>
  `).join("");

  const nameInput = qs("#client-name");
  const guestFromUrl = new URLSearchParams(window.location.search).get("guest");
  if (guestFromUrl) nameInput.value = guestFromUrl.slice(0, 32);
  setupCalendarLinks();
}

function personalizeGuest(name) {
  state.guestName = name.trim();
  fillText("[data-guest-name]", state.guestName);
  fillText("[data-opening-guest]", state.guestName);
  qs("#final-console").textContent = `Thân gửi ${state.guestName},\n\nCảm ơn bạn đã nhận lời mời.\nMình rất mong được gặp bạn trong ngày tốt nghiệp.\n\nNgười gửi: ${CONFIG.graduateName}\nTrạng thái: Hẹn gặp nhau ngày 27.11.2026 🎓`;
  const wishName = qs("#wish-name");
  if (wishName && document.activeElement !== wishName) {
    wishName.value = state.guestName === "bạn" ? "" : state.guestName;
  }
}

async function appendHandshake(line, status = "") {
  const output = qs("#handshake-log");
  output.classList.add("active");
  const paragraph = document.createElement("p");
  paragraph.className = `handshake-line ${status}`;
  paragraph.style.animationDelay = `${output.children.length * 90}ms`;
  output.append(paragraph);
  paragraph.textContent = line;
}

async function establishConnection(event) {
  event.preventDefault();
  const input = qs("#client-name");
  const error = qs("#connect-error");
  const guestName = input.value.trim();
  if (!guestName) {
    error.textContent = "Vui lòng nhập tên của bạn trước khi mở thư.";
    input.setAttribute("aria-invalid", "true");
    input.focus();
    return;
  }

  input.removeAttribute("aria-invalid");
  error.textContent = "";
  const submit = qs("#connect-form button");
  submit.disabled = true;
  qs("#handshake-log").textContent = "";
  personalizeGuest(guestName);
  try { localStorage.setItem("grad-network-guest", guestName); } catch (_) { /* private mode */ }

  document.body.classList.add("connecting");
  await appendHandshake(`> chuẩn bị thư mời cho ${guestName}...`);
  await appendHandshake("> kiểm tra lời chúc ........ OK", "success");
  await appendHandshake("> ngày tốt nghiệp ........ SẴN SÀNG", "success");
  await appendHandshake(`> Hẹn gặp ${guestName}!`, "success");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  await wait(reduceMotion ? 80 : 380);
  document.body.classList.add("opening-invitation");
  qs("#letter-opening").setAttribute("aria-hidden", "false");
  await wait(reduceMotion ? 120 : 1650);
  document.body.classList.remove("connecting", "opening-invitation");
  document.body.classList.add("connected");
  qs("#letter-opening").setAttribute("aria-hidden", "true");
  qs("#connect-gate").setAttribute("aria-hidden", "true");
  qs("#app-shell").setAttribute("aria-hidden", "false");
  window.scrollTo(0, 0);
  qsa(".reveal").forEach(element => revealObserver.observe(element));
  startMusic(false).catch(() => {});
}

function updateCountdown() {
  const difference = eventDate.getTime() - Date.now();
  const remaining = Math.max(0, difference);
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const values = { days, hours, minutes, seconds };

  Object.entries(values).forEach(([key, value]) => {
    const output = qs(`#count-${key}`);
    output.textContent = String(value).padStart(2, "0");
  });

  const message = qs("#countdown-message");
  if (difference <= 0) {
    if (!state.countdownExpired) {
      state.countdownExpired = true;
      qs(".packet-label").textContent = "HÔM NAY";
      message.classList.add("text-green");
    }
    message.textContent = "CHÚC MỪNG NGÀY TỐT NGHIỆP! 🎓";
  } else {
    message.textContent = `${days > 0 ? `Còn ${days} ngày nữa, ` : "Sắp đến giờ tốt nghiệp, "}${state.guestName} nhớ giữ lịch nhé!`;
  }
}

function formatCalendarDate(date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function getEventEndDate() {
  const start = CONFIG.graduationDate.slice(0, 10);
  return new Date(`${start}T${CONFIG.photoEnd}:00+07:00`);
}

function setupCalendarLinks() {
  const end = getEventEndDate();
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Lễ tốt nghiệp · ${CONFIG.graduateName}`,
    dates: `${formatCalendarDate(eventDate)}/${formatCalendarDate(end)}`,
    details: `Lễ tốt nghiệp ${CONFIG.ceremonyStart}–${CONFIG.ceremonyEnd}. Điểm hẹn chụp ảnh: ${CONFIG.meetingPoint}, từ ${CONFIG.photoStart}–${CONFIG.photoEnd}. Ngành ${CONFIG.major}.`,
    location: `${CONFIG.school}, ${CONFIG.address}`
  });
  qs("#calendar-link").href = `https://calendar.google.com/calendar/render?${params}`;
}

function downloadICS() {
  const end = getEventEndDate();
  const stamp = new Date();
  const escapeICS = (value) => String(value).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  const content = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Graduation Network//Invitation//VI",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:graduation-${eventDate.getTime()}@graduation-net`,
    `DTSTAMP:${formatCalendarDate(stamp)}`,
    `DTSTART:${formatCalendarDate(eventDate)}`,
    `DTEND:${formatCalendarDate(end)}`,
    `SUMMARY:${escapeICS(`Lễ tốt nghiệp · ${CONFIG.graduateName}`)}`,
    `LOCATION:${escapeICS(`${CONFIG.school}, ${CONFIG.address}`)}`,
    `DESCRIPTION:${escapeICS(`Lễ tốt nghiệp ${CONFIG.ceremonyStart}–${CONFIG.ceremonyEnd}. Điểm hẹn chụp ảnh: ${CONFIG.meetingPoint}, ${CONFIG.photoStart}–${CONFIG.photoEnd}. Ngành ${CONFIG.major}.`)}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([content], { type: "text/calendar;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "graduation-event.ics";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  showToast("EVENT.ICS DOWNLOADED ✓");
}

function hasFirebaseConfig() {
  return Boolean(CONFIG.firebase.apiKey && CONFIG.firebase.projectId && CONFIG.firebase.appId);
}

function getLocalWishes() {
  try { return JSON.parse(localStorage.getItem("grad-network-wishes")) || []; }
  catch (_) { return []; }
}

function saveLocalWishes(wishes) {
  try { localStorage.setItem("grad-network-wishes", JSON.stringify(wishes)); }
  catch (_) { showToast("Không thể lưu lời chúc trên trình duyệt này"); }
}

function formatWishTime(timestamp) {
  if (!timestamp) return "Vừa xong";
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Vừa xong";
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).format(date);
}

function renderWishes(wishes = state.wishes) {
  state.wishes = wishes;
  const log = qs("#packet-log");
  qs("#packet-count").textContent = `${wishes.length} lời chúc`;
  if (!wishes.length) {
    log.innerHTML = '<div class="empty-log">Chưa có lời chúc nào.<br>Hãy là người gửi lời chúc đầu tiên nhé.</div>';
    return;
  }
  log.innerHTML = wishes.map((wish, index) => `
    <article class="wish-packet">
      <header><span>LỜI CHÚC #${String(wishes.length - index).padStart(3, "0")}</span><span>${escapeHTML(formatWishTime(wish.createdAt || wish.time))}</span></header>
      <dl><dt>TỪ</dt><dd>${escapeHTML(wish.source)}</dd><dt>GỬI</dt><dd>${escapeHTML(CONFIG.graduateName)}</dd></dl>
      <p>${escapeHTML(wish.payload)}</p>
    </article>
  `).join("");
}

async function initializeFirebaseWishes() {
  if (!hasFirebaseConfig()) {
    renderWishes(getLocalWishes().slice().reverse());
    return false;
  }

  try {
    const [firebaseAppModule, firestore] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js")
    ]);
    const firebaseApp = firebaseAppModule.getApps().length
      ? firebaseAppModule.getApp()
      : firebaseAppModule.initializeApp(CONFIG.firebase);
    state.firebaseApi = firestore;
    state.firebaseDb = firestore.getFirestore(firebaseApp);
    state.firebaseReady = true;

    const wishesQuery = firestore.query(
      firestore.collection(state.firebaseDb, CONFIG.firebase.wishesCollection),
      firestore.orderBy("createdAt", "desc"),
      firestore.limit(100)
    );
    firestore.onSnapshot(wishesQuery, snapshot => {
      renderWishes(snapshot.docs.map(document => ({ id: document.id, ...document.data() })));
    }, error => {
      console.error("Firebase wishes sync failed:", error);
      state.firebaseReady = false;
      renderWishes(getLocalWishes().slice().reverse());
      showToast("Firebase chưa kết nối · đang lưu cục bộ");
    });
    return true;
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    state.firebaseReady = false;
    renderWishes(getLocalWishes().slice().reverse());
    return false;
  }
}

async function addWish(wish) {
  if (!state.firebaseReady || !state.firebaseApi || !state.firebaseDb) {
    const wishes = getLocalWishes();
    wishes.push({ ...wish, time: new Date().toISOString() });
    saveLocalWishes(wishes);
    renderWishes(wishes.slice().reverse());
    return;
  }

  await state.firebaseApi.addDoc(
    state.firebaseApi.collection(state.firebaseDb, CONFIG.firebase.wishesCollection),
    {
      source: wish.source,
      payload: wish.payload,
      createdAt: state.firebaseApi.serverTimestamp()
    }
  );
}

async function submitWish(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const source = qs("#wish-name").value.trim();
  const payload = qs("#wish-message").value.trim();
  const status = qs("#wish-status");
  if (!source || !payload) return;
  personalizeGuest(source);
  try { localStorage.setItem("grad-network-guest", source); } catch (_) { /* private mode */ }
  const button = qs("button[type='submit']", form);
  button.disabled = true;
  for (const line of ["Đang viết lời chúc...", "Đang gửi...", "Đã nhận ✓"]) {
    status.textContent = line;
    await wait(300);
  }
  try {
    await addWish({ source, payload });
    qs("#wish-message").value = "";
    status.textContent = state.firebaseReady
      ? "Đã gửi lời chúc để mọi người cùng xem 💚"
      : "Đã lưu lời chúc trên thiết bị này 💚";
  } catch (error) {
    console.error("Unable to send wish:", error);
    status.textContent = "Chưa gửi được lời chúc. Vui lòng thử lại nhé.";
    showToast("GỬI LỜI CHÚC THẤT BẠI");
  } finally {
    button.disabled = false;
  }
}

function createAudioStream() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) throw new Error("Web Audio không được hỗ trợ");
  const context = new AudioContext();
  const gain = context.createGain();
  gain.gain.value = 0.16;
  gain.connect(context.destination);
  const notes = [110, 164.81, 220, 261.63];
  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const voiceGain = context.createGain();
    oscillator.type = index % 2 ? "sine" : "triangle";
    oscillator.frequency.value = frequency;
    voiceGain.gain.value = index === 0 ? .45 : .12;
    oscillator.connect(voiceGain).connect(gain);
    oscillator.start();
    state.audioNodes.push(oscillator, voiceGain);
  });
  state.audioContext = context;
  state.audioNodes.push(gain);
}

async function playConfiguredMusic() {
  if (!CONFIG.music) return false;
  if (!state.musicAudio) {
    state.musicAudio = new Audio(CONFIG.music);
    state.musicAudio.loop = true;
    state.musicAudio.volume = 0.45;
  }
  await state.musicAudio.play();
  return true;
}

async function startMusic(userInitiated = true) {
  if (state.musicOn) return;
  try {
    let usingMp3 = false;
    try {
      usingMp3 = await playConfiguredMusic();
    } catch (_) {
      state.musicAudio?.pause();
    }
    if (!usingMp3) {
      if (!state.audioContext) createAudioStream();
      await state.audioContext.resume();
    }
    state.musicOn = true;
    qs("#music-button").classList.add("playing");
    qs("#music-button").setAttribute("aria-pressed", "true");
    qs("#music-label").textContent = usingMp3 ? "ON · MP3" : "ON · NHẠC NỀN";
    if (userInitiated) showToast(usingMp3 ? "MP3 ĐANG PHÁT" : "NHẠC NỀN ĐÃ BẬT");
  } catch (_) {
    qs("#music-label").textContent = "OFF · NHẤN ĐỂ THỬ LẠI";
  }
}

async function stopMusic() {
  state.musicAudio?.pause();
  if (state.audioContext) await state.audioContext.suspend();
  state.musicOn = false;
  qs("#music-button").classList.remove("playing");
  qs("#music-button").setAttribute("aria-pressed", "false");
  qs("#music-label").textContent = "OFF · NHẠC NỀN";
}

function showToast(message) {
  const toast = qs("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

async function copyShareUrl(url) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return;
  }
  const input = document.createElement("textarea");
  input.value = url;
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.append(input);
  input.select();
  const copied = document.execCommand("copy");
  input.remove();
  if (!copied) throw new Error("COPY_NOT_SUPPORTED");
}

async function shareInvitation() {
  const shareData = {
    title: `${CONFIG.graduateName} · Thiệp mời tốt nghiệp`,
    text: `Mời ${state.guestName} tham dự lễ tốt nghiệp của ${CONFIG.graduateName}`,
    url: window.location.href
  };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }
    await copyShareUrl(window.location.href);
    showToast("LINK COPIED ✓");
  } catch (error) {
    if (error?.name !== "AbortError") showToast("Không thể chia sẻ · hãy copy URL thủ công");
  }
}

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .12, rootMargin: "0px 0px -4% 0px" });

fillStaticConfig();
try { personalizeGuest(localStorage.getItem("grad-network-guest") || "bạn"); }
catch (_) { personalizeGuest("bạn"); }
initializeFirebaseWishes();
updateCountdown();
window.setInterval(updateCountdown, 1000);

qs("#connect-form").addEventListener("submit", establishConnection);
qs("#ics-button").addEventListener("click", downloadICS);
qs("#wish-name").addEventListener("input", event => {
  const name = event.target.value.trim();
  if (name) personalizeGuest(name);
});
qs("#wish-form").addEventListener("submit", submitWish);
qs("#share-button").addEventListener("click", shareInvitation);
qs("#music-button").addEventListener("click", () => state.musicOn ? stopMusic() : startMusic(true));
window.addEventListener("keydown", event => {
  if (event.key === "Escape" && !document.body.classList.contains("connected")) qs("#connect-form input")?.focus();
});
