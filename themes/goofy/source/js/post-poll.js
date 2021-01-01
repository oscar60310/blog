API_ENDPOINT = "https://api.cptsai.com";

async function vote(type) {
  await fetch(`${API_ENDPOINT}/blog/feedback/vote/${identifier}`, {
    method: "PUT",
    body: JSON.stringify({ type }),
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
}

document.querySelectorAll(".poll-options>button").forEach((dom) => {
  dom.addEventListener("click", function () {
    document.querySelector(".poll-options").innerHTML = "謝謝。";
    vote(this.value === "y" ? "UP" : "DOWN");
  });
});

async function fetchVoteStatus() {
  const res = await fetch(`${API_ENDPOINT}/blog/feedback/vote/${identifier}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  const { voteType } = await res.json();
  const setSelected = (selector) => {
    document.querySelector(selector).className = "selected";
    document.querySelector(selector).disabled = true;
  };
  if (voteType === "UP") setSelected('.poll-options>button[value="y"]');
  else if (voteType === "DOWN") setSelected('.poll-options>button[value="n"]');
}

async function adddView() {
  await fetch(`${API_ENDPOINT}/blog/feedback/view/${identifier}`, {
    method: "POST",
    credentials: "include",
  });
}

async function fetchAnalysis() {
  const { login } = await (
    await fetch(`${API_ENDPOINT}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
  ).json();
  if (!login) return;
  const analysis = await (
    await fetch(`${API_ENDPOINT}/blog/feedback/analysis/${identifier}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
  ).json();

  document.querySelector(
    '.poll-options>button[value="y"]'
  ).innerHTML = `有 (${analysis.vote.upCount})`;
  document.querySelector(
    '.poll-options>button[value="n"]'
  ).innerHTML = `沒有 (${analysis.vote.downCount})`;
  document.querySelector(
    ".thank"
  ).innerHTML += ` Total: ${analysis.totalView} / Unique: ${analysis.uniqueView}`;
}

fetchVoteStatus();
adddView();
fetchAnalysis();
