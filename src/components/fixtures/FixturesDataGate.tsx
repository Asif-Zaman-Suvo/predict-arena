"use client"

import { use } from "react"
import { loadFixturesBundle } from "@/src/data/loaders"
import { FixturesPageContent } from "./FixturesPageContent"

export function FixturesDataGate() {
  const bundle = use(loadFixturesBundle())
  return <FixturesPageContent bundle={bundle} />
}
