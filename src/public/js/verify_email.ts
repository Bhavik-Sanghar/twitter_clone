const email_verify_form = document.getElementById(
  "verification_form",
) as HTMLFormElement;

email_verify_form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const otp = (document.getElementById("otp") as HTMLInputElement).value.trim();
  const password = (
    document.getElementById("password") as HTMLInputElement
  ).value.trim();
  const captcha = (
    document.getElementById("captcha_inp") as HTMLInputElement
  ).value.trim();

  const password_errot = document.getElementById(
    "password_error",
  ) as HTMLParagraphElement;
  const otp_error = document.getElementById(
    "otp_error",
  ) as HTMLParagraphElement;
  const captcha_error = document.getElementById(
    "captcha_error",
  ) as HTMLParagraphElement;
  const require_error = document.getElementById(
    "require_error",
  ) as HTMLParagraphElement;

  if (!otp || !password || !captcha) {
    require_error.innerHTML = `All field required`;
  } else {
    require_error.innerHTML = ``;
  }

  const submit = await fetch("/user/getVefied", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      otp: otp,
      password: password,
      captcha_inp: captcha,
    }),
  });

  const res = await submit.json();

  if (submit.status == 201) {
    showToast(res.message, "success");
    window.location.href = res.redirecturl;
  } else if (submit.status == 400) {
    showToast(res.message, "error");
    if(res.message === "CAPTCHA EXPIRED" || res.message === "Invalid CAPTCHA"){
        captcha_error.innerHTML = res.message;
        password_errot.innerHTML = "";
        otp_error.innerHTML = "";
    }else if(res.message === "Current Password is Wrong"){
        password_errot.innerHTML = res.message;
        captcha_error.innerHTML = "";
        otp_error.innerHTML = "";
    }else if(res.message === "OTP is Expire try again" || res.message === "OTP is WRONG try again"){
        otp_error.innerHTML = res.message;
        captcha_error.innerHTML = "";
        password_errot.innerHTML = "";
    }
  } else {
    showToast(res.message, "error");
    require_error.innerHTML = res.message;
    captcha_error.innerHTML = "";
    password_errot.innerHTML = "";
    otp_error.innerHTML = "";
  }

});
