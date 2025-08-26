import LiveBlocksProvider from '@/components/LiveblocksProvider'

function PageLayout({children} : {children: React.ReactNode}) {
  return (
    <LiveBlocksProvider>{children}</LiveBlocksProvider>
  )
}

export default PageLayout