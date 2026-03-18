import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@curved/ui'
import { Link } from 'react-router-dom'
import AppHeader from './shared/components/app-header'

function App() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <AppHeader />

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <Badge variant="secondary" className="mb-4">
          Beta
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Build something curved</h1>
        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
          A modern platform with beautiful components. Fast, accessible, and ready to ship.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/sign-up">
            <Button size="lg">Start building</Button>
          </Link>
          <Button variant="outline" size="lg">
            View docs
          </Button>
        </div>
      </section>

      <Separator className="mx-auto max-w-5xl" />

      {/* Features */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <Tabs defaultValue="components">
          <TabsList className="mx-auto">
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="components" className="mt-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Buttons</CardTitle>
                  <CardDescription>Multiple variants and sizes</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Button variant="default" size="sm">
                    Default
                  </Button>
                  <Button variant="secondary" size="sm">
                    Secondary
                  </Button>
                  <Button variant="outline" size="sm">
                    Outline
                  </Button>
                  <Button variant="ghost" size="sm">
                    Ghost
                  </Button>
                  <Button variant="destructive" size="sm">
                    Destructive
                  </Button>
                  <Button variant="link" size="sm">
                    Link
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Badges</CardTitle>
                  <CardDescription>Status indicators</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Input</CardTitle>
                  <CardDescription>Form controls</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input placeholder="Your email" type="email" />
                  <Input placeholder="Disabled" disabled />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="team" className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Our team</CardTitle>
                <CardDescription>The people behind Curved</CardDescription>
              </CardHeader>
              <CardContent>
                <AvatarGroup>
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>SC</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>AB</AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback>MK</AvatarFallback>
                  </Avatar>
                </AvatarGroup>
              </CardContent>
              <CardFooter>
                <span className="text-muted-foreground text-sm">4 team members</span>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="mt-8">
            <Card className="mx-auto max-w-md">
              <CardHeader>
                <CardTitle>Get in touch</CardTitle>
                <CardDescription>We'd love to hear from you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="Name" />
                <Input placeholder="Email" type="email" />
                <Input placeholder="Message" />
              </CardContent>
              <CardFooter>
                <Button className="w-full">Send message</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}

export default App
