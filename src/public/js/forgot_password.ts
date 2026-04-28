(
  document.getElementById("forgot_password_form") as HTMLFormElement
).addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = (
    document.getElementById("email") as HTMLInputElement
  ).value.trim();

  const response = await fetch("/forgot-password", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
    }),
  });

  const res = await response.json();
  if (response.status == 201) {
      window.location.href = `/emailPage`;
  } else {
    (document.getElementById("search_error") as HTMLDivElement).innerHTML =
      `${res.message}`;
  }
});