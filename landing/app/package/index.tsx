import { useEffect } from "react";
const url = process.env.NEXT_PUBLIC_PACKAGE_URL || "";

export default function Package() {
  useEffect(() => {
    window.location.href = url;
  }, []);

  return <div />;
}
