import React from "react";
import Icon from "@site/static/img/icon.svg";
import styles from "./styles.module.css";
import BrowserOnly from "@docusaurus/BrowserOnly";
import Translate from "@docusaurus/Translate";

interface Props {
  path: string;
}

const vote = async (id: string, up: boolean) => {
  await fetch(`https://api.cptsai.com/blog/feedback/vote/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: up ? "UP" : "DOWN",
    }),
    credentials: "include",
  });
  window["umami"]?.track(up ? "USEFUL" : "NOT USEFUL", { pageId: id });
};

const addView = async (id: string) => {
  try {
    await fetch(`https://api.cptsai.com/blog/feedback/view/${id}`, {
      method: "POST",
      credentials: "include",
    });
  } catch {}
};

const useHash = (path: string) => {
  const [hash, setHash] = React.useState(null);
  if (!path.endsWith("/")) path += "/";
  if (path.startsWith("/")) path = path.slice(1);
  if (path.startsWith("en")) path = path.slice(2);
  if (path.startsWith("/")) path = path.slice(1);

  const textAsBuffer = new TextEncoder().encode(path);
  window.crypto.subtle.digest("SHA-256", textAsBuffer).then((hashBuffer) => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const digest = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    setHash(digest);
  });
  return hash;
};

const useVoteStatus = (path: string) => {
  const hash = useHash(path);
  const [status, setStatus] = React.useState(null);
  React.useEffect(() => {
    if (hash) {
      fetch(`https://api.cptsai.com/blog/feedback/vote/${hash}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          const { voteType } = data;
          setStatus(voteType || "N/A");
        })
        .catch(() => {
          setStatus("N/A");
        });
    }
  }, [hash]);
  return { hash, status, ready: hash !== null && status !== null };
};

const useIsLogin = () => {
  const [isLogin, setIsLogin] = React.useState(null);
  React.useEffect(() => {
    fetch(`https://api.cptsai.com/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((data) => data.json())
      .then(({ login }) => {
        setIsLogin(login);
      })
      .catch(() => {
        setIsLogin(false);
      });
  }, []);
  return isLogin;
};

const useAnalysis = (id: string) => {
  const isLogin = useIsLogin();
  const [analysis, setAnalysis] = React.useState(null);
  React.useEffect(() => {
    if (isLogin) {
      fetch(`https://api.cptsai.com/blog/feedback/analysis/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })
        .then((data) => data.json())
        .then((res) => setAnalysis(res))
        .catch(() => {});
    }
  }, [isLogin]);
  return analysis;
};

function Analysis(props: { id: string }) {
  const analysis = useAnalysis(props.id);
  if (!analysis) return null;
  return (
    <div>
      Up: {analysis?.vote?.upCount} | Down: {analysis?.vote?.downCount} | Total:{" "}
      {analysis.totalView} | Unique: {analysis.uniqueView}
    </div>
  );
}

function Feedback(props: Props): JSX.Element | null {
  const { hash, status, ready } = useVoteStatus(props.path);
  const [voted, setVoted] = React.useState(false);
  const clickVote = (up: boolean) => {
    setVoted(true);
    vote(hash, up);
  };
  const canVote = ready && status === "N/A";
  React.useEffect(() => {
    if (ready && hash && process.env.NODE_ENV === "production") {
      addView(hash);
    }
  }, [ready, hash]);
  return (
    <div className={styles.feedback}>
      <Icon className={styles.icon} />
      <div>
        <Translate id="feedback.question">這篇文章有幫助到您嗎?</Translate>
      </div>
      <div className={styles["poll-options"]}>
        {voted && (
          <div>
            <Translate>謝謝</Translate>
            <Translate>！</Translate>
          </div>
        )}
        {!voted && (
          <>
            <button
              disabled={!canVote}
              onClick={() => clickVote(false)}
              className={
                status === "DOWN" ? styles.selected : styles["not-selected"]
              }
            >
              <Translate id="feedback.itDoesNotHelp">沒有</Translate>
            </button>
            <button
              disabled={!canVote}
              onClick={() => clickVote(true)}
              className={
                status === "UP" ? styles.selected : styles["not-selected"]
              }
            >
              <Translate id="feedback.itHelps">有</Translate>
            </button>
          </>
        )}
      </div>
      {hash && <Analysis id={hash} />}
    </div>
  );
}

export default function BrowserOnlyFeedback(props: Props) {
  return <BrowserOnly>{() => <Feedback {...props} />}</BrowserOnly>;
}
