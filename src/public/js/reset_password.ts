(document.getElementById("resetForm") as HTMLFormElement).addEventListener(
  "submit",
  async (e) => {
    e.preventDefault();

    let isVal = true;

    const otp = (
      document.getElementById("otp") as HTMLInputElement
    ).value.trim();

    const password = (
      document.getElementById("newPassword") as HTMLInputElement
    ).value.trim();
    const confirmPassword = (
      document.getElementById("confirmPassword") as HTMLInputElement
    ).value.trim();

    let passwordRegex: RegExp =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@!%*?&])[A-Za-z\d@!%*?&]{8,15}$/;

    if (!passwordRegex.test(password)) {
      isVal = false;
      (
        document.getElementById("password_error") as HTMLParagraphElement
      ).innerHTML =
        `Password should be atleast 8 char long and include Capital , Small and Number and One Speacial Charter`;
    } else {
      (
        document.getElementById("password_error") as HTMLParagraphElement
      ).innerHTML = ``;
    }

    if (password !== confirmPassword) {
      isVal = false;
      (
        document.getElementById("cpassword_error") as HTMLParagraphElement
      ).innerHTML = `Confirm Password should match with password`;
    } else {
      (
        document.getElementById("cpassword_error") as HTMLParagraphElement
      ).innerHTML = ``;
    }
    if (!otp) {
      isVal = false;
      (document.getElementById("otp_error") as HTMLParagraphElement).innerHTML =
        `OTP Require`;
    } else {
      (document.getElementById("otp_error") as HTMLParagraphElement).innerHTML =
        ``;
    }

    if (isVal) {
      const response = await fetch("/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          otp: otp,
          password: password,
        }),
      });

      const res = await response.json();

      if (response.status == 201) {
        window.location.href = `${res.redirecturl}`;
      } else if (response.status == 400) {
        (document.getElementById("errorMessage") as HTMLDivElement).innerHTML =
          `${res.message}`;
      } else if (response.status == 500) {
        (document.getElementById("errorMessage") as HTMLDivElement).innerHTML =
          `${res.message}`;
      }
    }
  },
);

const timerText = document.getElementById("timerText") as HTMLSpanElement;
const resendBtn = document.getElementById("resendBtn") as HTMLButtonElement;
const secondsSpan = document.getElementById("seconds") as HTMLSpanElement;
const resetForm = document.getElementById("resetForm") as HTMLFormElement;
const top_div = document.getElementById("top") as HTMLDivElement;
const time_expire = document.getElementById("message") as HTMLDivElement;

declare const serverExpiry: number;

function startTimer() {
  const distance = serverExpiry - Date.now();
  let timeLeft = Math.floor(distance / 1000);
  resendBtn.style.display = "none";
  timerText.style.display = "inline";

  const timer = setInterval(() => {
    timeLeft--;
    secondsSpan.innerText = timeLeft as unknown as string;
    if (timeLeft <= 0) {
      clearInterval(timer);
      timerText.style.display = "none";
      resetForm.style.display = "none";
      top_div.style.display = "none";
      time_expire.style.display = "block";
      resendBtn.style.display = "inline";
      resendBtn.disabled = false;
    }
  }, 1000);
}

startTimer();

resendBtn.addEventListener("click", async () => {
  const response = await fetch("/resend-otp", {
    method: "POST",
    credentials: "include",
  });
  const data = await response.json();

  if (response.status == 201) {
    window.location.href = `${data.redirecturl}`;
  } else {
    alert("Session expired. Please start over from the Forgot Password page.");
    window.location.href = "/forgot-password";
  }
});
