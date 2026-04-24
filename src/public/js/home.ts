(document.getElementById("logout") as HTMLHeadElement).addEventListener("click" , async (e) => {
    const response = await fetch("/logout");
    const res = await response.json();

    if(response.status == 201){
        window.location.href = `${res.redirecturl}`
    }else{
        console.log(res.message);
        window.location.href = `${res.redirecturl}`
    }
});

(document.getElementById("gotoProfile") as HTMLHeadElement).addEventListener("click" , ()=> {
    window.location.href = `/user/profile`
})