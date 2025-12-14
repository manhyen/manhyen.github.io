
  (function(){
    const modules = document.getElementById('modules');
    const toast = document.getElementById('toast');
    const toastSub = document.getElementById('toast-sub');

    // helper show toast
    let toastTimer = null;
    function showToast(title, subtitle, timeout=2000){
      toast.querySelector('.title').textContent = title||'Đã sao chép';
      toastSub.textContent = subtitle || '';
      toast.hidden = false;
      requestAnimationFrame(()=> toast.classList.add('show'));
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(()=> {
        toast.classList.remove('show');
        setTimeout(()=> { toast.hidden = true }, 280);
      }, timeout);
    }

    // copy logic
    modules.addEventListener('click', async function(e){
      const btn = e.target.closest('.btn-copy');
      if (!btn) return;
      const card = btn.closest('.card');
      const url = card?.dataset?.url;
      if (!url) return;

      // try Clipboard API
      try {
        if (navigator.clipboard && navigator.clipboard.writeText){
          await navigator.clipboard.writeText(url);
        } else {
          // fallback using textarea
          const ta = document.createElement('textarea');
          ta.value = url;
          ta.style.position='fixed'; ta.style.left='-9999px';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }

        // small inline pill
        const pill = card.querySelector('.copied-pill');
        pill.classList.add('show');
        setTimeout(()=> pill.classList.remove('show'), 1400);

        // nice toast
        showToast('Đã sao chép URL', url, 2600);

        // visual feedback on button
        btn.animate([
          { transform: 'translateY(0) scale(1)' },
          { transform: 'translateY(-3px) scale(1.01)' },
          { transform: 'translateY(0) scale(0.997)' }
        ], { duration: 240, easing: 'cubic-bezier(.2,.9,.2,1)' });

      } catch(err){
        console.error('Copy failed', err);
        showToast('Không thể sao chép', 'Vui lòng cấp quyền clipboard hoặc thử thủ công.');
      }
    });

    // allow pressing Enter on focused button
    modules.addEventListener('keydown', function(e){
      if (e.key === 'Enter'){
        const btn = e.target.closest('.btn-copy');
        if (btn) btn.click();
      }
    });

    // optionally, tap outside to hide toast earlier
    document.addEventListener('click', function(e){
      if (!e.target.closest('.toast') && toast.classList.contains('show')){
        toast.classList.remove('show');
        setTimeout(()=> toast.hidden = true, 280);
      }
    });
  })();
  
  function updateVietnamTime(){
  const now = new Date();
  const vn = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));

  const hh = vn.getHours().toString().padStart(2,"0");
  const mm = vn.getMinutes().toString().padStart(2,"0");
  const ss = vn.getSeconds().toString().padStart(2,"0");

  document.querySelectorAll("[data-vn-time]").forEach(el => {
    el.textContent = `${hh}:${mm}:${ss}`;
  });
}

function updateLast(){
  const now = new Date();
  const vn = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));

  const hh = vn.getHours().toString().padStart(2,"0");
  const mm = vn.getMinutes().toString().padStart(2,"0");
  const ss = vn.getSeconds().toString().padStart(2,"0");

  document.querySelectorAll("[data-last-update]").forEach(el => {
    el.textContent = `${hh}:${mm}:${ss}`;
  });
}

setInterval(updateVietnamTime, 1000);  
updateVietnamTime();
updateLast();

document.addEventListener('contextmenu', event => event.preventDefault());
// Hiện toast đã có: showToast(msg) — dùng chung


// THÔNG TIN THANH TOÁN
const PAY_DATA = {
  momo: { bank: "MOMO", info: "0387577488", owner: "TRAN THI KIM TUYEN" },
  mb:   { bank: "MB Bank", info: "150313", owner: "KHONG MANH YEN" }
};

let CURRENT_AMOUNT = 0;
let CURRENT_TYPE = "momo";

// ẢNH QR TĨNH
const QR_STATIC = {
  momo: {
    50000: "img/momo50k.png",
    100000: "img/momo100k.png",
    200000: "img/momo200k.png"
  },
  mb: {
    50000: "img/mb50k.png",
    100000: "img/mb100k.png",
    200000: "img/mb200k.png"
  }
};

// MỞ POPUP
function openPaymentPro(type) {
  document.getElementById("pay-popup").style.display = "flex";
  document.getElementById("pay-popup").setAttribute("aria-hidden", "false");
  switchPay(type);
}

// ĐÓNG POPUP
function closePay() {
  document.getElementById("pay-popup").style.display = "none";
  document.getElementById("pay-popup").setAttribute("aria-hidden", "true");
}

// ĐỔI TAB
function switchPay(type) {
  CURRENT_TYPE = type;

  document.querySelectorAll(".pay-tab").forEach(btn => btn.classList.remove("active"));
  document.getElementById("tab-" + type).classList.add("active");

  const data = PAY_DATA[type];
  document.getElementById("pay-bank").innerText = data.bank;
  document.getElementById("pay-info").innerText = data.info;
  document.getElementById("pay-owner").innerText = data.owner;

  // nút copy
  document.getElementById("pay-copy").onclick = () => copyBank(data.info);

  updateQR();
}

// CHỌN SỐ TIỀN
function setAmount(v) {
  CURRENT_AMOUNT = v;
  updateQR();
}

// CẬP NHẬT QR (DÙNG ẢNH LOCAL)
function updateQR() {
  const qrList = QR_STATIC[CURRENT_TYPE];

  if (!qrList[CURRENT_AMOUNT]) {
    document.getElementById("qr-img").src = "";
    document.getElementById("downloadQR").removeAttribute("href");
    window.LAST_QR = "";
    return;
  }

  const qr = qrList[CURRENT_AMOUNT];

  document.getElementById("qr-img").src = qr;
  document.getElementById("downloadQR").href = qr;
  window.LAST_QR = qr;
}

// COPY STK
function copyBank(text) {
  navigator.clipboard.writeText(text);
  const btn = document.querySelector("#pay-copy");

  btn.animate(
    [
      { transform: "translateY(0)" },
      { transform: "translateY(-5px)" },
      { transform: "translateY(0)" }
    ],
    { duration: 250 }
  );
}

// COPY FULL
function copyAndNotifyFull() {
  const bank = document.getElementById("pay-bank").innerText;
  const info = document.getElementById("pay-info").innerText;
  const owner = document.getElementById("pay-owner").innerText;

  const text = `${bank} • ${info} • ${owner} • ${CURRENT_AMOUNT}đ`;
  navigator.clipboard.writeText(text);
}

// MỞ QR
function openQR() {
  if (window.LAST_QR) {
    window.open(window.LAST_QR, "_blank");
  }
}