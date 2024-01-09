import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

interface Props {
  width?: string;
  height?: string;
  url: string;
}

export default function MapTiler({
  width = "500",
  height = "300",
  url,
}: Props) {
  const {
    siteConfig: { customFields },
  } = useDocusaurusContext();

  const src = url.replace("{key}", customFields.maptilerKey);

  return <iframe width={width} height={height} src={src}></iframe>;
}
