import React from "react";
import Icon from "@site/static/img/icon.svg";
import styles from "./styles.module.css";

interface Props {
  path: string;
}

const useHash = (path: string) => {
  const [hash, setHash] = React.useState(null);
  if (!path.endsWith("/")) path += "/";
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

export default function Feedback(props: Props): JSX.Element | null {
  const hash = useHash(props.path);
  console.log(hash);
  return (
    <div className={styles.feedback}>
      <Icon className={styles.icon} />
      <div>這篇文章有幫助到您嗎?</div>
      <div className={styles["poll-options"]}>
        <button>沒有</button>
        <button>有</button>
      </div>
    </div>
  );
}
