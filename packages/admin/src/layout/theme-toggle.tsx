import { Switch, useTheme } from '@curved/ui'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex items-center justify-between px-1">
      <span className="text-muted-foreground text-xs">Dark mode</span>
      <Switch
        checked={theme === 'dark'}
        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        size="sm"
      />
    </div>
  )
}
