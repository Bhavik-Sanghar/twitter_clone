function showToast(message: string, type = "info") {
  const container = document.getElementById("toast-container")!;

  // Create toast element
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;

  // Add to container
  container.appendChild(toast);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => {
      toast.remove();
    }, 500); // Wait for fade-out animation to finish
  }, 3000);
}

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

declare const user_name: string;

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

document.querySelectorAll(".like-tweet-form").forEach((form) => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const currentForm = e.currentTarget as HTMLFormElement;
    const tweetIdInput = currentForm.querySelector(
      'input[name="tweet_id"]',
    ) as HTMLInputElement;
    const tweetId = tweetIdInput?.value;

    const countSpan = currentForm.querySelector(
      ".count_likes",
    ) as HTMLSpanElement;
    const heartSpan = currentForm.querySelector(
      ".heart-icon",
    ) as HTMLSpanElement;

    if (!tweetId) return;

    try {
      const response = await fetch(`/user/tweets/like_dislike/${tweetId}`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        let currentLikes = parseInt(countSpan.innerText);

        if (result.message === "Tweet liked") {
          countSpan.innerText = (currentLikes + 1).toString();
          heartSpan.innerText = "❤️";
        } else {
          countSpan.innerText = (currentLikes - 1).toString();
          heartSpan.innerText = "🤍";
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  });
});

document.querySelectorAll(".retweet-form").forEach((form) => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const currentForm = e.currentTarget as HTMLFormElement;
    const tweetIdInput = currentForm.querySelector(
      'input[name="tweet_id"]',
    ) as HTMLInputElement;
    const tweetId = tweetIdInput?.value;

    const countSpan = currentForm.querySelector(
      ".count_retweets",
    ) as HTMLSpanElement;
    const retweetSpan = currentForm.querySelector(
      ".retweet-icon",
    ) as HTMLSpanElement;

    if (!tweetId) return;

    try {
      const response = await fetch(`/user/tweets/retweet/${tweetId}`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        let currentRetweets = parseInt(countSpan.innerText);

        if (result.message === "Tweet Retweeted!!") {
          countSpan.innerText = (currentRetweets + 1).toString();
          retweetSpan.innerText = "🔂";
        } else {
          countSpan.innerText = (currentRetweets - 1).toString();
          retweetSpan.innerText = "🔁";
        }
      }
    } catch (error) {
      console.error("Error Retweeting:", error);
    }
  });
});

document.querySelectorAll(".comment-form").forEach((form) => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const currentForm = e.currentTarget as HTMLFormElement;
    const tweetIdInput = currentForm.querySelector(
      'input[name="tweet_id"]',
    ) as HTMLInputElement;

    const tweetId = tweetIdInput?.value;

    if (!tweetId) return;

    const comment_display = document.getElementById(
      `comment-section-${tweetId}`,
    ) as HTMLDivElement;
    const comment_list = document.getElementById(
      `comments-list-${tweetId}`,
    ) as HTMLDivElement;

    if (comment_display.style.display === "block") {
      comment_display.style.display = "none";
      return; 
    }


    try {
      const response = await fetch(
        `/user/tweets/comments/getComments/${tweetId}`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      if (response.ok) {
        const result = await response.json();
        const comment_display = document.getElementById(
          `comment-section-${tweetId}`,
        ) as HTMLDivElement;
        comment_display.style.display = "block";
        comment_list.innerHTML = ""; 


        result.forEach((comment: any) => {
          const comment_div = document.createElement("div");
          comment_div.innerHTML = `
          <span class="comment-user-avatar">
          <img src="/${comment.profile_pic_url}">
          </span>
          <a href="/user/profile/${comment.user_name}">
          <span class="comment-user">${comment.user_name}</span>
          </a>
          <span class="comment-text">${comment.content}</span> 
          <span class="comment-time">${new Date(
            comment.created_at,
          ).toLocaleString([], {
            hour: "2-digit",
            minute: "2-digit",
            day: "numeric",
            month: "short",
            year: "numeric",
            hour12: true,
          })}</span>`;
          comment_div.className = "comment-item";
          comment_list.appendChild(comment_div);
        });
      }
    } catch (error) {
      console.error("Error Retweeting:", error);
    }
  });
});

document.addEventListener("click", async (e) => {
  const target = e.target as HTMLElement;

  if (target.classList.contains("reply-btn")) {
    const tweetId = target.getAttribute("data-tweet-id");
    const input = document.getElementById(
      `comment-input-${tweetId}`,
    ) as HTMLInputElement;
    const content = input.value.trim();

    if (!content) return showToast("Write something first!", "error");

    const response = await fetch("/user/tweets/comments/createComment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment_content: content, tweetId: tweetId }),
    });

    const res = await response.json();
    if (response.ok) {
      input.value = "";
      const comment_list = document.getElementById(
        `comments-list-${tweetId}`,
      ) as HTMLDivElement;
      const comment_div = document.createElement("div");
      comment_div.className = "comment-item";
      comment_div.innerHTML = `
        <span class="comment-user">${user_name}</span>
        <span class="comment-text">${content}</span>
        <span class="comment-time">${new Date(Date.now()).toLocaleString([], {
          hour: "2-digit",
          minute: "2-digit",
          day: "numeric",
          month: "short",
          year: "numeric",
          hour12: true,
        })}</span>
    `;

      const comment_count = parseInt(
        document.getElementById(`count_comment_${tweetId}`)!.innerText,
      );
      document.getElementById(`count_comment_${tweetId}`)!.innerText = (
        comment_count + 1
      ).toString();

      comment_list.prepend(comment_div);
      comment_list.scrollTop = 0;
    }
  }
});
