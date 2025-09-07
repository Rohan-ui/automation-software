import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Upload, Search, Filter, Download, Trash2, Eye } from "lucide-react"

async function getAssets() {
  return await prisma.asset.findMany({
    include: {
      post: {
        include: {
          project: {
            include: {
              client: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export default async function AssetsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/signin")

  const assets = await getAssets()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Asset Library</h1>
          <p className="text-muted-foreground">Manage all your media assets and files</p>
        </div>
        <Button>
          <Upload className="h-4 w-4 mr-2" />
          Upload Assets
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search assets..." className="pl-10" />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {assets.map((asset) => (
          <Card key={asset.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="p-4">
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-3">
                {asset.type === "IMAGE" ? (
                  <img
                    src={asset.url || "/placeholder.svg"}
                    alt={asset.filename}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : asset.type === "VIDEO" ? (
                  <video src={asset.url} className="w-full h-full object-cover rounded-lg" controls={false} />
                ) : (
                  <div className="text-4xl">📄</div>
                )}
              </div>
              <div className="space-y-2">
                <h3 className="font-medium truncate">{asset.filename}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {asset.type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{(asset.size / 1024 / 1024).toFixed(1)} MB</span>
                </div>
                {asset.post && (
                  <p className="text-xs text-muted-foreground truncate">
                    {asset.post.project.client.name} - {asset.post.title}
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
                <Button size="sm" variant="outline">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {assets.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No assets found</h3>
            <p className="text-muted-foreground mb-4">Upload your first asset to get started</p>
            <Button>Upload Assets</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
