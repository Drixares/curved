import { Link } from 'react-router-dom'
import { Button, Switch } from '@curved/ui'

export default function AppHeader({
  darkMode,
  onDarkModeChange,
}: {
  darkMode: boolean
  onDarkModeChange: (value: boolean) => void
}) {
  return (
    <header className="border-border border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link to="/" className="text-lg font-semibold">
          Curved
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Dark</span>
            <Switch checked={darkMode} onCheckedChange={onDarkModeChange} size="sm" />
          </div>
          <Link to="/sign-in">
            <Button variant="outline" size="sm">
              Sign in
            </Button>
          </Link>
          <Link to="/sign-up">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
