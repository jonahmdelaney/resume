const ENDPOINT = "https://script.google.com/macros/s/AKfycbwgWAtFnaufrr23LRNIWjbvPdHvZLdyReGiRYoNUJrL0MO4McAFd7RqfzKKdGbCUTIk/exec";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setStatus(msg, ok = true) {
  const el = document.getElementById("form-status");
  if (!el) return;
  el.classList.remove("visually-hidden");
  el.textContent = msg;
  el.style.color = ok ? "inherit" : "crimson";
}

async function submitContact(e) {
  e.preventDefault();
  const form = e.currentTarget;

  const email = form.email.value.trim();
  const subject = form.subject.value.trim();
  const message = form.message.value.trim();
  const hp = form.hp.value.trim(); // honeypot

  // bot check
  if (hp) {
    setStatus("Thanks! Your message has been sent.");
    form.reset();
    return;
  }

  // quick validations
  if (!EMAIL_RE.test(email)) { setStatus("Please enter a valid email address.", false); return; }
  if (!subject) { setStatus("Please add a subject.", false); return; }
  if (!message) { setStatus("Please write a message.", false); return; }

  // disable button while sending
  const btn = document.getElementById("send-btn");
  const prevLabel = btn ? btn.textContent : "";
  if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }

  try {
    const body = new URLSearchParams({ email, subject, message, hp });

    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body
    });

    const data = await res.json().catch(() => ({}));
    if (data && data.ok) {
      setStatus("Thanks! Your message has been sent.");
      form.reset();
    } else {
      setStatus("Sorry—couldn’t send your message. " + (data?.error || "Unknown error."), false);
    }
  } catch {
    setStatus("Network error. Please try again.", false);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = prevLabel; }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  if (form) form.addEventListener("submit", submitContact);
});
