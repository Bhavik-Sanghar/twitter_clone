//helper fucntion to set timezone as per browser
function formatTimeToLocal(utcString: string) {
  const date = new Date(utcString);
  const options = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  const dateOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  };

  return `${date.toLocaleTimeString([], options as any)} · ${date.toLocaleDateString([], dateOptions as any)}`;
}

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

const processingTweets = new Set();


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

    if (!tweetId || processingTweets.has(tweetId)) return;

    processingTweets.add(tweetId);


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
    } finally {
      processingTweets.delete(tweetId);
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

     if (!tweetId || processingTweets.has(tweetId)) return;

    processingTweets.add(tweetId);

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
    } finally {
      processingTweets.delete(tweetId)
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
    const uniqueIdInput = currentForm.querySelector(
      'input[name="unique_id"]',
    ) as HTMLInputElement;


    const tweetId = tweetIdInput?.value;
    const uniqueId = uniqueIdInput?.value;

    if (!tweetId) return;

    const comment_display = document.getElementById(
      `comment-section-${tweetId}-${uniqueId}`,
    ) as HTMLDivElement;
    const comment_list = document.getElementById(
      `comments-list-${tweetId}-${uniqueId}`,
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
          `comment-section-${tweetId}-${uniqueId}`,
        ) as HTMLDivElement;
        comment_display.style.display = "block";
        comment_list.innerHTML = "";

        result.forEach((comment: any) => {
          const comment_div = document.createElement("div");
          comment_div.innerHTML = `
    <div class="comment-main-content">
        <span class="comment-user-avatar">
            <img src="/${comment.profile_pic_url}">
        </span>
        <div class="comment-details">
            <a href="/user/profile/${comment.user_name}">
                <span class="comment-user">${comment.user_name}</span>
            </a>
            <span class="comment-text">${comment.content}</span>
        </div>
    </div>
    <span class="comment-time" data-time="${comment.created_at}"></span>
`;
          comment_div.className = "comment-item";
          comment_list.appendChild(comment_div);

          //comment time formatting
          document.querySelectorAll(".comment-time").forEach((el) => {
            const rawTime = el.getAttribute("data-time");
            if (rawTime) {
              el.textContent = formatTimeToLocal(rawTime);
            }
          });
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
    const uniqueId = target.getAttribute("data-unique-id");
    console.log(tweetId);

    const input = document.getElementById(
      `comment-input-${tweetId}-${uniqueId}`,
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
        `comments-list-${tweetId}-${uniqueId}`,
      ) as HTMLDivElement;
      const comment_div = document.createElement("div");
      comment_div.className = "comment-item";
      comment_div.innerHTML = `
    <div class="comment-main-content">
        <span class="comment-user-avatar">
            <img src="/${profile_pic_url}">
        </span>
        <div class="comment-details">
            <a href="/user/profile/${user_name}">
                <span class="comment-user">${user_name}</span>
            </a>
            <span class="comment-text">${content}</span>
        </div>
    </div>
    <span class="comment-time" data-time="${new Date().toISOString()}"></span>
`;

      const comment_count = parseInt(
        document.getElementById(`count_comment_${tweetId}`)!.innerText,
      );
      document.getElementById(`count_comment_${tweetId}`)!.innerText = (
        comment_count + 1
      ).toString();

      comment_list.prepend(comment_div);
      //comment time formatting
      document.querySelectorAll(".comment-time").forEach((el) => {
        const rawTime = el.getAttribute("data-time");
        if (rawTime) {
          el.textContent = formatTimeToLocal(rawTime);
        }
      });
      comment_list.scrollTop = 0;
    }
  }
});

//delete tweet
document.querySelectorAll(".del_tweet").forEach((span) => {
  span.addEventListener("click", async () => {
    const tweetId = span.getAttribute("data-tweet-id");
    const response = await fetch(`/user/tweet/${tweetId}/delete`, {
      method: "DELETE",
      credentials: "include",
    });

    const res = await response.json();

    if (response.ok) {
      showToast(res.message , "");
      const tweet_div = document.getElementById(
        `tweet_${tweetId}`,
      ) as HTMLDivElement;
      if (tweet_div) {
        tweet_div.remove();
      }
    } else {
      showToast(res.message || "Error deleting tweet", "error");
    }
  });
});
