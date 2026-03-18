import { PAGES } from '@/shared/constants/pages'
import { Button, Switch, useTheme } from '@curved/ui'
import { Link } from 'react-router-dom'

export default function AppHeader() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="border-border border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link to="/" className="text-lg font-semibold">
          Curved
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Dark</span>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              size="sm"
            />
          </div>
          <Link to={PAGES.SIGN_IN}>
            <Button variant="outline" size="sm">
              Sign in
            </Button>
          </Link>
          <Link to={PAGES.SIGN_UP}>
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
