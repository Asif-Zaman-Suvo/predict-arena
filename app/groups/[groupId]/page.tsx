import { notFound } from "next/navigation"
import { groups } from "@/src/data"
import { GroupDetailContent } from "@/src/components/groups/GroupDetailContent"

interface GroupDetailPageProps {
  params: Promise<{ groupId: string }>
}

export function generateStaticParams() {
  return groups.map((group) => ({ groupId: group.id }))
}

export default async function GroupDetailPage({ params }: GroupDetailPageProps) {
  const { groupId } = await params
  const group = groups.find((entry) => entry.id === groupId)

  if (!group) {
    notFound()
  }

  return (
    <GroupDetailContent groupId={group.id} groupName={group.name} />
  )
}
