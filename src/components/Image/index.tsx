import React from "react";

interface Props {
  title?: string;
  children: JSX.Element;
}

export default function Image({ children, title }: Props): JSX.Element | null {
  if (!title) return children;
  else
    return (
      <figure>
        {children}
        <figcaption>{title}</figcaption>
      </figure>
    );
}
