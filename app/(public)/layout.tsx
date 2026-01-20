import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'

/**
 * Public Layout - Layout para páginas públicas do site
 *
 * Aplicado a todas as páginas dentro do Route Group (public).
 * Inclui a Navbar e o Footer do site, criando a estrutura visual padrão
 * para visitantes e membros da igreja.
 *
 * O Route Group (public) não afeta a URL - as páginas continuam acessíveis
 * em seus caminhos originais (/, /sobre, /eventos, etc.).
 *
 * @see {@link file://../layout.tsx} Root Layout (configurações globais)
 * @see {@link file://../admin/layout.tsx} Layout para painel administrativo (com Sidebar)
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
