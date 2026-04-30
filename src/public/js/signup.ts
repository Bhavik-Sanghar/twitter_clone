
const captcha_image = document.getElementById(
  "captcha_image",
) as HTMLImageElement;
const reload = document.getElementById("reload");

reload?.addEventListener("click", () => {
  reload_captcha();
});

function reload_captcha() {
  (document.getElementById("captcha_inp") as HTMLInputElement).value = "";
  captcha_image.src = `/getcaptcha?t=${Date.now()}`;
}


(document.getElementById("signup_form") as HTMLFormElement).addEventListener(
  "submit",
  async (e) => {
    e.preventDefault();

    let isVal = true;

    const firstName: string = (
      document.getElementById("firstName") as HTMLInputElement
    ).value.trim();

    const lastName: string = (
      document.getElementById("lastName") as HTMLInputElement
    ).value.trim();

    const email: string = (
      document.getElementById("email") as HTMLInputElement
    ).value.trim();

    const user_name: string = (
      document.getElementById("user_name") as HTMLInputElement
    ).value.trim();

    const phone: string = (
      document.getElementById("phone") as HTMLInputElement
    ).value.trim();

    const password: string = (
      document.getElementById("password") as HTMLInputElement
    ).value.trim();

    const confirmpassword: string = (
      document.getElementById("confirmPassword") as HTMLInputElement
    ).value.trim();

    const captcha_inp: string = (
      document.getElementById("captcha_inp") as HTMLInputElement
    ).value.trim();

    const usernameRegex = /^[a-zA-Z_]\w*$/;
    if (!usernameRegex.test(user_name)) {
      isVal = false;
      (
        document.getElementById("user_name_error") as HTMLParagraphElement
      ).innerHTML =
        `User Name cannot be strat with number or username should have any space`;
    } else {
      (
        document.getElementById("user_name_error") as HTMLParagraphElement
      ).innerHTML = ``;
    }

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

    if (password !== confirmpassword) {
      isVal = false;
      (
        document.getElementById("cpassword_error") as HTMLParagraphElement
      ).innerHTML = `Confirm Password should match with password`;
    } else {
      (
        document.getElementById("cpassword_error") as HTMLParagraphElement
      ).innerHTML = ``;
    }

    
    const isUserWithEmailExist = await fetch("/checkEmail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
      }),
    });

    if (isUserWithEmailExist.status != 201) {
      isVal = false;
      let res = await isUserWithEmailExist.json();
      (
        document.getElementById("email_error") as HTMLParagraphElement
      ).innerHTML = `${res.message}`;
    }else{
        (
        document.getElementById("email_error") as HTMLParagraphElement
      ).innerHTML = ``;
    }

    const isUserWithPhoneExist = await fetch("/checkPhone", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: phone,
      }),
    });

    if (isUserWithPhoneExist.status != 201) {
      isVal = false;
      let res = await isUserWithPhoneExist.json();
      (
        document.getElementById("phone_error") as HTMLParagraphElement
      ).innerHTML = `${res.message}`;
    }else{
         (
        document.getElementById("phone_error") as HTMLParagraphElement
      ).innerHTML = ``;
    }

    const isUserWithUserNameExist = await fetch("/checkUserName", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_name: user_name,
      }),
    });

    if (isUserWithUserNameExist.status != 201) {
      isVal = false;
      let res = await isUserWithUserNameExist.json();
      (
        document.getElementById("user_name_error") as HTMLParagraphElement
      ).innerHTML = `${res.message}`;
    }else{
        (
        document.getElementById("user_name_error") as HTMLParagraphElement
      ).innerHTML = ``;
    }

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !password ||
      !confirmpassword ||
      !captcha_inp
    ) {
      isVal = false;
      (
        document.getElementById("required_error") as HTMLParagraphElement
      ).innerHTML = `All fields are required`;
    } else {
      (
        document.getElementById("required_error") as HTMLParagraphElement
      ).innerHTML = ``;
    }

    

    if (isVal) {
      const formData = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        user_name: user_name,
        password: password,
        captcha_inp: captcha_inp,
      };
      const submit = await fetch("/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const response = await submit.json();
      if(submit.status == 201){
        window.location.href = `${response.redirecturl}`
      }
      else if(submit.status == 400){
        (
          document.getElementById("captcha_error") as HTMLParagraphElement
        ).innerHTML = `${response.message}`;
        reload_captcha();
      } 
      else{
        (document.getElementById("submit_error") as HTMLParagraphElement).innerHTML = `${response.message}`
      }
    }
  },
);



const captcha_image = document.getElementById(
  "captcha_image"
) as HTMLImageElement;

const reload = document.getElementById("reload");

reload?.addEventListener("click", () => {
  reload_captcha();
});

function reload_captcha() {
  (document.getElementById("captcha_inp") as HTMLInputElement).value = "";
  captcha_image.src = `/getcaptcha?t=${Date.now()}`;
}

const form = document.getElementById("signup_form") as HTMLFormElement;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  let isVal = true;

  // Inputs
  const firstName = (document.getElementById("firstName") as HTMLInputElement).value.trim();
  const lastName = (document.getElementById("lastName") as HTMLInputElement).value.trim();
  const email = (document.getElementById("email") as HTMLInputElement).value.trim();
  const user_name = (document.getElementById("user_name") as HTMLInputElement).value.trim();
  const phone = (document.getElementById("phone") as HTMLInputElement).value.trim();
  const password = (document.getElementById("password") as HTMLInputElement).value.trim();
  const confirmpassword = (document.getElementById("confirmPassword") as HTMLInputElement).value.trim();
  const captcha_inp = (document.getElementById("captcha_inp") as HTMLInputElement).value.trim();

  // Error elements
  const userErr = document.getElementById("user_name_error") as HTMLParagraphElement;
  const passErr = document.getElementById("password_error") as HTMLParagraphElement;
  const cpassErr = document.getElementById("cpassword_error") as HTMLParagraphElement;
  const emailErr = document.getElementById("email_error") as HTMLParagraphElement;
  const phoneErr = document.getElementById("phone_error") as HTMLParagraphElement;
  const requiredErr = document.getElementById("required_error") as HTMLParagraphElement;
  const captchaErr = document.getElementById("captcha_error") as HTMLParagraphElement;
  const submitErr = document.getElementById("submit_error") as HTMLParagraphElement;

  // Clear old errors
  userErr.innerHTML = "";
  passErr.innerHTML = "";
  cpassErr.innerHTML = "";
  emailErr.innerHTML = "";
  phoneErr.innerHTML = "";
  requiredErr.innerHTML = "";
  captchaErr.innerHTML = "";
  submitErr.innerHTML = "";

  // =========================
  // 🧪 VALIDATIONS
  // =========================

  const usernameRegex = /^[a-zA-Z_]\w*$/;
  if (!usernameRegex.test(user_name)) {
    isVal = false;
    userErr.innerHTML = "Username cannot start with number or contain spaces";
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@!%*?&])[A-Za-z\d@!%*?&]{8,15}$/;

  if (!passwordRegex.test(password)) {
    isVal = false;
    passErr.innerHTML =
      "Password must be 8-15 chars with upper, lower, number & special char";
  }

  if (password !== confirmpassword) {
    isVal = false;
    cpassErr.innerHTML = "Passwords do not match";
  }

  if (!firstName || !lastName || !email || !phone || !password || !confirmpassword || !captcha_inp) {
    isVal = false;
    requiredErr.innerHTML = "All fields are required";
  }

  // ❌ Stop if validation fails
  if (!isVal) return;

  // =========================
  // 🔄 LOADING STATE
  // =========================
  const submitBtn = form.querySelector("button[type='submit']") as HTMLButtonElement;
  submitBtn.disabled = true;
  submitBtn.innerText = "Checking...";

  try {
    // =========================
    // ⚡ PARALLEL API CALLS
    // =========================
    const [emailRes, phoneRes, userRes] = await Promise.all([
      fetch("/checkEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }),
      fetch("/checkPhone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      }),
      fetch("/checkUserName", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_name }),
      }),
    ]);

    // Handle Email
    if (emailRes.status !== 200 && emailRes.status !== 201) {
      isVal = false;
      const res = await emailRes.json();
      emailErr.innerHTML = res.message;
    }

    // Handle Phone
    if (phoneRes.status !== 200 && phoneRes.status !== 201) {
      isVal = false;
      const res = await phoneRes.json();
      phoneErr.innerHTML = res.message;
    }

    // Handle Username
    if (userRes.status !== 200 && userRes.status !== 201) {
      isVal = false;
      const res = await userRes.json();
      userErr.innerHTML = res.message;
    }

    // ❌ Stop if any API validation fails
    if (!isVal) {
      submitBtn.disabled = false;
      submitBtn.innerText = "Sign Up";
      return;
    }

    // =========================
    // 🚀 FINAL SUBMIT
    // =========================
    submitBtn.innerText = "Submitting...";

    const submit = await fetch("/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        phone,
        user_name,
        password,
        captcha_inp,
      }),
    });

    const response = await submit.json();

    if (submit.status === 201) {
      window.location.href = response.redirecturl;
    } else if (submit.status === 400) {
      captchaErr.innerHTML = response.message;
      reload_captcha();
    } else {
      submitErr.innerHTML = response.message;
    }

  } catch (err) {
    console.error(err);
    submitErr.innerHTML = "Something went wrong. Please try again.";
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = "Sign Up";
  }
});