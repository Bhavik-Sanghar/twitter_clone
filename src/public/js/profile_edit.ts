(document.getElementById("edit_profile") as HTMLFormElement).addEventListener(
  "submit",
  async (e) => {
    e.preventDefault();
    
    const formData = new FormData(
      document.getElementById("edit_profile") as HTMLFormElement,
    );

    const response = await fetch("/user/editUserProfile" , {
        method : "POST",
        body : formData
    })

    const res = await response.json();

    if(response.status == 201){
        window.location.href = `${res.redirecturl}`
    }
    if(response.status == 400){
        window.alert(`${res.message || res.error}`);
    }
    else{
        window.alert(`${res.message}`);
    }
  },
);
