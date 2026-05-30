"use client"

import { use } from "react"
import { loadGroupsBundle } from "@/src/data/loaders"
import { GroupsPageContent } from "./GroupsPageContent"

export function GroupsDataGate() {
  const bundle = use(loadGroupsBundle())
  return <GroupsPageContent bundle={bundle} />
}
