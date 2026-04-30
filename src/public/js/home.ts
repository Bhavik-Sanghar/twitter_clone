declare const user_name: string;

declare const profile_pic_url: string;

declare const user_id: string;


//tweet time formatting
document.querySelectorAll(".tweet-time").forEach((el) => {
  const rawTime = el.getAttribute("data-time");
  if (rawTime) {
    el.textContent = formatTimeToLocal(rawTime);
  }
});

(document.getElementById("logout") as HTMLHeadElement).addEventListener(
  "click",
  async (e) => {
    const response = await fetch("/logout");
    const res = await response.json();

    if (response.status == 201) {
      window.location.href = `${res.redirecturl}`;
    } else {
      console.log(res.message);
      window.location.href = `${res.redirecturl}`;
    }
  },
);

(document.getElementById("gotoProfile") as HTMLHeadElement).addEventListener(
  "click",
  () => {
    window.location.href = `/user/profile/${user_name}`;
  },
);

const imageInput = document.getElementById("tweet_img") as HTMLInputElement;

imageInput.addEventListener("change", function () {
  const file = this.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = document.getElementById(
        "image-preview",
      ) as HTMLImageElement;
      const container = document.getElementById(
        "image-preview-container",
      ) as HTMLDivElement;
      preview.src = e.target?.result as string;
      container.style.display = "block";
    };
    reader.readAsDataURL(file);
  }
});

const removeImg = document.getElementById("remove-img") as HTMLButtonElement;

removeImg.addEventListener("click", () => {
  const previewContainer = document.getElementById(
    "image-preview-container",
  ) as HTMLDivElement;
  const previewImage = document.getElementById(
    "image-preview",
  ) as HTMLImageElement;
  const imageInput = document.getElementById("tweet_image") as HTMLInputElement;

  previewContainer.style.display = "none";

  previewImage.src = "";

  imageInput.value = "";
});

(document.getElementById("tweetForm") as HTMLFormElement).addEventListener(
  "submit",
  async (e) => {
    e.preventDefault();

    const form = e.currentTarget as HTMLFormElement;
    const submitBtn = form.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;

    submitBtn.disabled = true;
    submitBtn.innerText = "Posting...";

    const formData = new FormData(form);

    try {
      const response = await fetch("/user/tweets/create", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const result = await response.json();
      if (response.ok) {
        showToast("Tweet posted!");
        window.location.reload();
      } else {
        showToast(result.message || "Error posting tweet");
        submitBtn.disabled = false;
      }
    } catch (err) {
      console.error("Upload failed", err);
      submitBtn.disabled = false;
    } finally {
      submitBtn.innerText = "Tweet";
    }
  },
);

(document.getElementById("serch_user") as HTMLInputElement)?.addEventListener(
  "input",
  async (e) => {
    const query = (e.target as HTMLInputElement).value.trim();
    const resultsContainer = document.querySelector(
      ".search_results",
    ) as HTMLDivElement;

    if (query.length === 0) {
      resultsContainer.innerHTML = "";
      return;
    }

    try {
      const response = await fetch(
        `/user/search/users?q=${encodeURIComponent(query)}`,
      );
      const results = await response.json();

      resultsContainer.innerHTML = results
        .map((user: any) => {
          return `
                <div class="search_result_item" data-username="${user.user_name}">
                    <img src="/${user.profile_pic_url}" alt="${user.user_name}'s profile picture" class="search_result_avatar">
                    <b>${user.first_name} ${user.last_name} (<span>${user.user_name}</span>)</b>
                </div>
            `;
        })
        .join("");

      resultsContainer
        .querySelectorAll(".search_result_item")
        .forEach((item) => {
          item.addEventListener("click", () => {
            const username = item.getAttribute("data-username");
            if (username) {
              window.location.href = `/user/profile/${username}`;
            }
          });
        });
    } catch (error) {
      console.error("Search error:", error);
    }
  },
);

