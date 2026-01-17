let video = document.getElementById("video");
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: "environment" }
  });
  video.srcObject = stream;
}

function capture() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);
  canvas.toBlob(blob => {
    scanReceipt(blob);
  });
}

function scanReceipt(imageBlob) {
  Tesseract.recognize(
    imageBlob,
    "jpn",
    { logger: m => console.log(m) }
  ).then(({ data: { text } }) => {
    console.log(text);
    parseReceipt(text);
  });
}

/* ⭐ QUAN TRỌNG: parse tiền chuẩn cho hóa đơn Nhật */
function parseReceipt(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  // Ưu tiên dòng có keyword
  const keywords = ["合計", "支払", "税込", "お支払"];
  let amount = null;

  for (let line of lines) {
    if (keywords.some(k => line.includes(k))) {
      const m = line.match(/([0-9]{1,3}(?:[,\.][0-9]{3})+)/);
      if (m) {
        amount = m[1].replace(/[,\.]/g, "");
        break;
      }
    }
  }

  // fallback: số lớn nhất
  if (!amount) {
    const nums = lines
      .join(" ")
      .match(/[0-9]{1,3}(?:[,\.][0-9]{3})+/g);

    if (nums) {
      amount = nums
        .map(n => parseInt(n.replace(/[,\.]/g, "")))
        .sort((a, b) => b - a)[0];
    }
  }

  document.getElementById("amount").value = amount || "";

  // shop = dòng đầu
  document.getElementById("shop").value = lines[0] || "";

  document.getElementById("date").value =
    new Date().toISOString().split("T")[0];
}
