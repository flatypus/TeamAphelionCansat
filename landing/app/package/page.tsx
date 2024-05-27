const url = process.env.NEXT_PUBLIC_PACKAGE_URL || "";

export default function Package() {
  return <meta httpEquiv="refresh" content={`0;url=${url}`} />;
}
