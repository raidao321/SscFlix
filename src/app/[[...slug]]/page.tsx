import { Suspense } from "react";
import AppExperience from "@/components/AppExperience";

export default function CatchAllPage() {
  return <Suspense fallback={null}><AppExperience /></Suspense>;
}
