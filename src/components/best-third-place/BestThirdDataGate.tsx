"use client"

import { use } from "react"
import { loadGroupsBundle } from "@/src/data/loaders"
import { BestThirdPageContent } from "./BestThirdPageContent"

export function BestThirdDataGate() {
  const bundle = use(loadGroupsBundle())
  return <BestThirdPageContent bundle={bundle} />
}
