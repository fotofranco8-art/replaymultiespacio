import { getMemberships } from '@/features/memberships/services/memberships.actions'
import { MembershipsPageClient } from './MembershipsPageClient'

export default async function MembershipsPage() {
  const memberships = await getMemberships()

  return <MembershipsPageClient memberships={memberships} />
}
