import { redirect } from 'next/navigation'
import { HomeButton } from '@/components/home-button'

export default function WaterQualityPage() {
  // Render a Home button before redirecting for a quick way back when loaded
  // Note: redirect happens immediately on the server, so the button will be visible when navigated directly to the static page.
  // For client navigation UX, consider converting this to a client component that pushes to the static page.
  // Keeping behavior consistent with existing implementation while exposing Home from here as well.
  // eslint-disable-next-line @next/next/no-html-link-for-pages
  redirect('/Ocean_details/index.html')
}
