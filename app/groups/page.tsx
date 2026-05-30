import { Suspense } from "react"
import { GroupsDataGate } from "@/src/components/groups/GroupsDataGate"
import { GroupsSkeleton } from "@/src/components/groups/GroupsSkeleton"

export default function GroupsPage() {
  return (
    <Suspense fallback={<GroupsSkeleton />}>
      <GroupsDataGate />
    </Suspense>
  )
}
