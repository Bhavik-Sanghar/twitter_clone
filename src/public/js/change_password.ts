(
  document.getElementById("changePasswordForm") as HTMLFormElement
).addEventListener("submit", async (e) => {
  e.preventDefault();

  var isVal = true;

  const cuurent_password = (
    document.getElementById("currentPassword") as HTMLInputElement
  ).value.trim();
  const new_password = (
    document.getElementById("newPassword") as HTMLInputElement
  ).value.trim();
  const confirm_new_password = (
    document.getElementById("confirmPassword") as HTMLInputElement
  ).value.trim();

  const new_password_error = document.getElementById(
    "new_password_error",
  ) as HTMLParagraphElement;
  const confirm_password_error = document.getElementById(
    "confirm_password_error",
  ) as HTMLParagraphElement;
  const current_password_error = document.getElementById(
    "current_password_error",
  ) as HTMLParagraphElement;

  const error = document.getElementById("errorMessage") as HTMLDivElement;

  let passwordRegex: RegExp =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@!%*?&])[A-Za-z\d@!%*?&]{8,15}$/;

  if (!passwordRegex.test(new_password)) {
    isVal = false;
    new_password_error.innerHTML = `New Password should be atleast 8 char long and include Capital , Small and Number and One Speacial Charter`;
  } else {
    new_password_error.innerHTML = ``;
  }

  if (new_password !== confirm_new_password) {
    isVal = false;
    confirm_password_error.innerHTML = `Confirm Password should match with Password`;
  } else {
    confirm_password_error.innerHTML = ``;
  }

  if (!cuurent_password || !new_password || !confirm_new_password) {
    isVal = false;
    error.innerHTML = `All field Required !!`;
  } else {
    error.innerHTML = ``;
  }

  if (isVal) {
    const response = await fetch("/user/changePassword", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cuurent_password,
        new_password,
      }),
    });

    const res = await response.json();

    if(response.status == 201){
        showToast(res.message , "success");
        window.location.href = res.redirecturl;
    }
    if(response.status == 400){
        showToast(res.message , "error");
        current_password_error.innerHTML = res.message
    }
    else{
        showToast(res.message , "info");
    }   
  }
});
