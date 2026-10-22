import { Home } from "@/components/Home";

// Korean homepage at /ko/: pre-rendered in Korean so that crawlers see the Korean text
export default function KoreanIndex() {
  return <Home language="ko" />;
}
