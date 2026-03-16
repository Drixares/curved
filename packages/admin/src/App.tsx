import { useState } from 'react'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
  Badge,
  Input,
  Avatar,
  AvatarFallback,
  Separator,
  Switch,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@curved/ui'

const users = [
  { name: 'Alice Martin', email: 'alice@curved.dev', role: 'Admin', initials: 'AM' },
  { name: 'Bob Chen', email: 'bob@curved.dev', role: 'Editor', initials: 'BC' },
  { name: 'Clara Diaz', email: 'clara@curved.dev', role: 'Viewer', initials: 'CD' },
  { name: 'David Kim', email: 'david@curved.dev', role: 'Editor', initials: 'DK' },
]

const stats = [
  { label: 'Total users', value: '1,284' },
  { label: 'Active now', value: '42' },
  { label: 'Revenue', value: '$12.4k' },
  { label: 'Growth', value: '+14%' },
]

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="bg-background text-foreground min-h-screen">
        {/* Sidebar-style header */}
        <header className="border-border border-b">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold">Curved Admin</span>
              <Badge variant="outline">v0.1</Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Dark</span>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} size="sm" />
              </div>
              <Avatar size="sm">
                <AvatarFallback>MM</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-8">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label} size="sm">
                <CardHeader>
                  <CardDescription>{stat.label}</CardDescription>
                  <CardTitle className="text-2xl">{stat.value}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>

          <Separator className="my-8" />

          {/* Tabs */}
          <Tabs defaultValue="users">
            <TabsList>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-6">
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>User management</CardTitle>
                    <CardDescription>
                      {filtered.length} user{filtered.length !== 1 && 's'}
                    </CardDescription>
                  </div>
                  <CardAction>
                    <Button size="sm">Add user</Button>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="mb-4 max-w-sm"
                  />
                  <div className="space-y-3">
                    {filtered.map((user) => (
                      <div
                        key={user.email}
                        className="border-border flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar size="sm">
                            <AvatarFallback>{user.initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-muted-foreground text-xs">{user.email}</p>
                          </div>
                        </div>
                        <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </div>
                    ))}
                    {filtered.length === 0 && (
                      <p className="text-muted-foreground py-4 text-center text-sm">
                        No users found.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <Card className="max-w-lg">
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>Manage your admin preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Email notifications</p>
                      <p className="text-muted-foreground text-xs">
                        Receive alerts for new sign-ups
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Two-factor auth</p>
                      <p className="text-muted-foreground text-xs">
                        Add an extra layer of security
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Organization name</label>
                    <Input defaultValue="Curved Inc." />
                  </div>
                  <Button>Save changes</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

export default App
