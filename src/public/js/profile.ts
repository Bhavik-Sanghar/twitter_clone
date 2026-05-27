//tweet time formatting
document.querySelectorAll(".tweet-time").forEach((el) => {
  const rawTime = el.getAttribute("data-time");
  if (rawTime) {
    el.textContent = formatTimeToLocal(rawTime);
  }
});

(document.getElementById("editProfile") as HTMLButtonElement)?.addEventListener(
  "click",
  () => {
    window.location.href = "/user/profile_edit";
  },
);

(document.getElementById("verify_email") as HTMLSpanElement)?.addEventListener(
  "click",
  () => {
    window.location.href = "/user/getVerfied";
  },
);

//profile tab switch
const tweet_tab = document.getElementById("tweet_tab") as HTMLDivElement;
const replies_tab = document.getElementById("replies_tab") as HTMLDivElement;


