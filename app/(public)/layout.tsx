import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'

/**
 * Public Layout — layout for the public-facing pages.
 *
 * Applied to every page inside the (public) Route Group. Renders the
 * site's Navbar and Footer, providing the default visual frame for
 * visitors and church members.
 *
 * The (public) Route Group does not affect the URL — pages remain
 * reachable at their original paths (/, /sobre, /eventos, etc.).
 *
 * @see {@link file://../layout.tsx} Root Layout (global config)
 * @see {@link file://../admin/layout.tsx} Admin-panel layout (with Sidebar)
 * @see https://nextjs.org/docs/app/building-your-application/routing/route-groups
 */
export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}
