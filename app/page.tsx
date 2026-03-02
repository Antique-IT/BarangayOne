import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, Shield, BarChart3, Bell, Home } from "lucide-react"

export default function HomePage() {
  const features = [
    { icon: Users, title: "Resident Management", description: "Manage resident records, household information, and demographics." },
    { icon: FileText, title: "Document Processing", description: "Issue barangay clearances, certificates, and other documents." },
    { icon: Shield, title: "Blotter Records", description: "Record and manage incident reports and dispute resolutions." },
    { icon: BarChart3, title: "Reports & Analytics", description: "Generate comprehensive reports and visualize barangay data." },
    { icon: Bell, title: "Announcements", description: "Post and manage community announcements and notices." },
    { icon: Home, title: "Project Tracking", description: "Monitor barangay projects, budgets, and timelines." },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold">B</span>
            </div>
            <span className="text-xl font-bold">BarangayOne</span>
          </div>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </header>

      <section className="py-20 px-4 text-center">
        <Badge className="mb-4" variant="secondary">Barangay Management System</Badge>
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Modern Governance for<br />Your Barangay
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          BarangayOne streamlines barangay operations with digital tools for resident management,
          document processing, and community governance.
        </p>
        <Link href="/login">
          <Button size="lg">Get Started</Button>
        </Link>
      </section>

      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t py-8 px-4 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} BarangayOne. All rights reserved.</p>
      </footer>
    </div>
  )
}
