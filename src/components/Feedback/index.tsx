import React from "react";
import Icon from "@site/static/img/icon.svg";
import styles from "./styles.module.css";
import BrowserOnly from "@docusaurus/BrowserOnly";
import Translate from "@docusaurus/Translate";

interface Props {
  path: string;
}

const vote = async (up: boolean) => {
  window["umami"]?.track(up ? "USEFUL" : "NOT USEFUL");
};

function Feedback(props: Props): JSX.Element | null {
  const [voted, setVoted] = React.useState(false);
  const clickVote = (up: boolean) => {
    setVoted(true);
    vote(up);
  };

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
              onClick={() => clickVote(false)}
              className={styles["not-selected"]}
            >
              <Translate id="feedback.itDoesNotHelp">沒有</Translate>
            </button>
            <button
              onClick={() => clickVote(true)}
              className={styles["not-selected"]}
            >
              <Translate id="feedback.itHelps">有</Translate>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function BrowserOnlyFeedback(props: Props) {
  return <BrowserOnly>{() => <Feedback {...props} />}</BrowserOnly>;
}
