(document.getElementById("editProfile") as HTMLButtonElement)?.addEventListener("click" , ()=>{
    window.location.href = "/user/profile_edit"
})

document.querySelectorAll(".like-tweet-form").forEach((form) => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const currentForm = e.currentTarget as HTMLFormElement;
    const tweetIdInput = currentForm.querySelector('input[name="tweet_id"]') as HTMLInputElement;
    const tweetId = tweetIdInput?.value;

    const countSpan = currentForm.querySelector(".count") as HTMLSpanElement;
    const heartSpan = currentForm.querySelector(".heart-icon") as HTMLSpanElement;

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

    const countSpan = currentForm.querySelector(".count_retweets") as HTMLSpanElement;
    const retweetSpan = currentForm.querySelector(
      ".retweet-icon",
    ) as HTMLSpanElement;
    if(!tweetId) return

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
          comment_div.innerHTML = ` <span class="comment-user">${comment.user_name}</span>
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
