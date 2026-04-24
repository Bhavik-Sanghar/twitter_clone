
(document.getElementById("login_form") as HTMLFormElement).addEventListener(
  "submit",
  async (e) => {
    e.preventDefault();
    let isVal = true;

    const identifier = (
      document.getElementById("identifier") as HTMLInputElement
    ).value.trim();
    const password = (
      document.getElementById("password") as HTMLInputElement
    ).value.trim();

    const remember_me = (
        document.getElementById("rememberMe") as HTMLInputElement
    ).checked;

    if (!identifier || !password) {
        isVal = false;
      (
        document.getElementById("require_error") as HTMLParagraphElement
      ).innerHTML = `Please fill all values..`;
    } else {
      (
        document.getElementById("require_error") as HTMLParagraphElement
      ).innerHTML = ``;
    }

    if(isVal){
        const response = await fetch("/login" , {
            method : "POST",
            headers : {
                "Content-Type" : "application/json"
            },
            body : JSON.stringify({
                identifier : identifier,
                password : password,
                remember_me : remember_me
            })
        })

        const res = await response.json();

        if(response.status == 201){
            window.location.href = `${res.redirecturl}`;
        }else{
            (document.getElementById("login_error") as HTMLParagraphElement).innerHTML = `${res.message}`
        }
    }
  },
);
