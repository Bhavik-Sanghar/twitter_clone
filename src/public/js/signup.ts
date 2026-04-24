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
      !confirmpassword
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
      else{
        (document.getElementById("submit_error") as HTMLParagraphElement).innerHTML = `${response.message}`
      }
    }
  },
);
