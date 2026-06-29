"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { 
  Upload, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Eye, 
  MoreHorizontal, 
  LayoutGrid, 
  List, 
  FileText, 
  Video as VideoIcon, 
  Image as ImageIcon, 
  X, 
  ExternalLink,
  Calendar,
  Building2,
  File,
  Sparkles,
  RefreshCw
} from "lucide-react"

export type AssetWithRelations = {
  id: string
  filename: string
  url: string
  type: string | null
  size: number | null
  order: number
  createdAt: Date | string
  postId: string
  uploadedById: number | null
  isReference: boolean
  isEdited: boolean
  post?: {
    id: string
    title: string
    status: string
    project?: {
      id: string
      name: string
      client: {
        id: string
        name: string
      }
    }
  } | null
}

interface AssetLibraryClientProps {
  initialAssets: AssetWithRelations[]
}

export function AssetLibraryClient({ initialAssets }: AssetLibraryClientProps) {
  const [assets] = useState<AssetWithRelations[]>(initialAssets)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("ALL")
  const [selectedClient, setSelectedClient] = useState<string>("ALL")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedAsset, setSelectedAsset] = useState<AssetWithRelations | null>(null)
  const [imageError, setImageError] = useState<Record<string, boolean>>({})

  // Extract unique clients for filter dropdown
  const clientsList = useMemo(() => {
    const clientsMap = new Map<string, string>()
    assets.forEach((asset) => {
      if (asset.post?.project?.client) {
        clientsMap.set(asset.post.project.client.id, asset.post.project.client.name)
      }
    })
    return Array.from(clientsMap.entries()).map(([id, name]) => ({ id, name }))
  }, [assets])

  // Filter assets based on search query, type, and client
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      // Search query filter
      const matchesSearch =
        searchQuery === "" ||
        asset.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (asset.post?.title && asset.post.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (asset.post?.project?.client.name &&
          asset.post.project.client.name.toLowerCase().includes(searchQuery.toLowerCase()))

      // Type filter
      let matchesType = true
      if (selectedType !== "ALL") {
        if (selectedType === "IMAGE") {
          matchesType = asset.type === "IMAGE" || Boolean(asset.filename.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i))
        } else if (selectedType === "VIDEO") {
          matchesType = asset.type === "VIDEO" || Boolean(asset.filename.match(/\.(mp4|webm|ogg|mov)$/i))
        } else if (selectedType === "DOCUMENT") {
          matchesType = asset.type !== "IMAGE" && asset.type !== "VIDEO" && !asset.filename.match(/\.(jpg|jpeg|png|webp|gif|svg|mp4|webm|ogg|mov)$/i)
        }
      }

      // Client filter
      let matchesClient = true
      if (selectedClient !== "ALL") {
        matchesClient = asset.post?.project?.client.id === selectedClient
      }

      return matchesSearch && matchesType && matchesClient
    })
  }, [assets, searchQuery, selectedType, selectedClient])

  const formatBytes = (bytes?: number | null) => {
    if (!bytes || bytes === 0) return "Unknown size"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  const isImageAsset = (asset: AssetWithRelations) => {
    if (asset.type === "IMAGE") return true
    return Boolean(asset.filename.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i))
  }

  const isVideoAsset = (asset: AssetWithRelations) => {
    if (asset.type === "VIDEO") return true
    return Boolean(asset.filename.match(/\.(mp4|webm|ogg|mov)$/i))
  }

  const resetFilters = () => {
    setSearchQuery("")
    setSelectedType("ALL")
    setSelectedClient("ALL")
  }

  const handleImageError = (id: string) => {
    setImageError((prev) => ({ ...prev, [id]: true }))
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asset Library</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage, filter, and preview all your media assets and creative files.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="shadow-sm">
            <Upload className="h-4 w-4 mr-2" />
            Upload Assets
          </Button>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <Card className="shadow-sm border-border/60">
        <CardContent className="p-4 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between md:gap-4">
          <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, post, client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter by Asset Type */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Asset Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="IMAGE">Images</SelectItem>
                <SelectItem value="VIDEO">Videos</SelectItem>
                <SelectItem value="DOCUMENT">Documents</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter by Client */}
            {clientsList.length > 0 && (
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="w-full sm:w-48">
                  <Building2 className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Clients</SelectItem>
                  {clientsList.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {(searchQuery || selectedType !== "ALL" || selectedClient !== "ALL") && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs h-9">
                <RefreshCw className="h-3.5 w-3.5 mr-1" /> Reset
              </Button>
            )}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center justify-between sm:justify-end gap-2 border-t pt-3 md:border-t-0 md:pt-0">
            <span className="text-xs text-muted-foreground mr-1 hidden sm:inline-block">
              {filteredAssets.length} {filteredAssets.length === 1 ? "asset" : "assets"}
            </span>
            <div className="flex items-center rounded-lg border bg-muted/40 p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2.5 text-xs font-medium"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-3.5 w-3.5 mr-1.5" /> Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                className="h-7 px-2.5 text-xs font-medium"
                onClick={() => setViewMode("list")}
              >
                <List className="h-3.5 w-3.5 mr-1.5" /> List
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div>
          {filteredAssets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredAssets.map((asset) => {
                const isImg = isImageAsset(asset)
                const isVid = isVideoAsset(asset)
                const hasImgError = imageError[asset.id]

                return (
                  <Card
                    key={asset.id}
                    className="group overflow-hidden border-border/60 hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      {/* Media Thumbnail Container */}
                      <div
                        className="relative aspect-video sm:aspect-square bg-muted/60 overflow-hidden cursor-pointer flex items-center justify-center border-b border-border/40"
                        onClick={() => setSelectedAsset(asset)}
                      >
                        {isImg && !hasImgError ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={asset.url}
                            alt={asset.filename}
                            onError={() => handleImageError(asset.id)}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : isVid ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/90 text-slate-100 relative group-hover:bg-slate-900 transition-colors">
                            <VideoIcon className="h-10 w-10 text-primary animate-pulse" />
                            <span className="text-xs mt-2 font-medium px-2 py-0.5 rounded bg-black/60">Video</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-muted-foreground p-4">
                            <File className="h-10 w-10 mb-2 opacity-60" />
                            <span className="text-xs uppercase font-semibold tracking-wider">
                              {asset.type || "FILE"}
                            </span>
                          </div>
                        )}

                        {/* Hover Overlay with Preview Trigger */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                          <Button size="sm" variant="secondary" className="h-8 text-xs bg-white/90 text-black hover:bg-white">
                            <Eye className="h-3.5 w-3.5 mr-1.5" /> Quick Preview
                          </Button>
                        </div>

                        {/* Type Badge Header */}
                        <div className="absolute top-2 left-2">
                          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-[10px] uppercase font-semibold">
                            {asset.type || (isImg ? "IMAGE" : isVid ? "VIDEO" : "FILE")}
                          </Badge>
                        </div>
                      </div>

                      {/* Card Info */}
                      <div className="p-3.5 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3
                            className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors cursor-pointer"
                            title={asset.filename}
                            onClick={() => setSelectedAsset(asset)}
                          >
                            {asset.filename}
                          </h3>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-foreground">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedAsset(asset)}>
                                <Eye className="h-4 w-4 mr-2" /> Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <a href={asset.url} target="_blank" rel="noopener noreferrer" download>
                                  <Download className="h-4 w-4 mr-2" /> Download
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{formatBytes(asset.size)}</span>
                          <span>{new Date(asset.createdAt).toLocaleDateString()}</span>
                        </div>

                        {asset.post && (
                          <div className="pt-2 border-t border-border/40 space-y-1">
                            <p className="text-xs font-medium line-clamp-1 text-foreground/80" title={asset.post.title}>
                              {asset.post.title}
                            </p>
                            {asset.post.project?.client && (
                              <Badge variant="outline" className="text-[10px] text-muted-foreground font-normal py-0">
                                {asset.post.project.client.name}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-1">No matching assets found</h3>
                <p className="text-muted-foreground text-sm mb-4">Try adjusting your filters or search keywords</p>
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <Card className="shadow-sm border-border/60 overflow-hidden">
          <CardHeader className="p-4 border-b bg-muted/20">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Assets ({filteredAssets.length})</h2>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredAssets.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-16 text-center">Preview</TableHead>
                    <TableHead>Asset File</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Associated Post</TableHead>
                    <TableHead>Client / Project</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-16 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.map((asset) => {
                    const isImg = isImageAsset(asset)
                    const isVid = isVideoAsset(asset)
                    const hasImgError = imageError[asset.id]

                    return (
                      <TableRow key={asset.id} className="hover:bg-muted/40">
                        <TableCell className="text-center p-2">
                          <div
                            className="h-11 w-11 rounded-md overflow-hidden bg-muted flex items-center justify-center cursor-pointer mx-auto border hover:ring-2 hover:ring-primary/50 transition-all"
                            onClick={() => setSelectedAsset(asset)}
                          >
                            {isImg && !hasImgError ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={asset.url}
                                alt={asset.filename}
                                onError={() => handleImageError(asset.id)}
                                className="h-full w-full object-cover"
                              />
                            ) : isVid ? (
                              <div className="h-full w-full bg-slate-900 flex items-center justify-center text-primary">
                                <VideoIcon className="h-5 w-5" />
                              </div>
                            ) : (
                              <FileText className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <p
                              className="font-medium text-sm hover:text-primary cursor-pointer line-clamp-1"
                              onClick={() => setSelectedAsset(asset)}
                              title={asset.filename}
                            >
                              {asset.filename}
                            </p>
                            <p className="text-[11px] text-muted-foreground font-mono">ID: {asset.id}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[11px] font-medium">
                            {asset.type || (isImg ? "IMAGE" : isVid ? "VIDEO" : "FILE")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatBytes(asset.size)}</TableCell>
                        <TableCell>
                          {asset.post ? (
                            <div className="space-y-1">
                              <p className="font-medium text-xs line-clamp-1">{asset.post.title}</p>
                              <Badge variant="outline" className="text-[10px] py-0">
                                {asset.post.status}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs font-italic">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {asset.post?.project ? (
                            <div className="space-y-0.5">
                              <p className="font-medium text-xs">{asset.post.project.client.name}</p>
                              <p className="text-[11px] text-muted-foreground line-clamp-1">{asset.post.project.name}</p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(asset.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right p-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedAsset(asset)}>
                                <Eye className="h-4 w-4 mr-2" /> View Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <a href={asset.url} target="_blank" rel="noopener noreferrer" download>
                                  <Download className="h-4 w-4 mr-2" /> Download
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="p-12 text-center">
                <p className="text-muted-foreground text-sm">No assets match your search or filter criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Asset Preview Modal */}
      <Dialog open={Boolean(selectedAsset)} onOpenChange={(open) => !open && setSelectedAsset(null)}>
        {selectedAsset && (
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 gap-0 border-border/80">
            <DialogHeader className="p-4 border-b bg-muted/30 flex-row items-center justify-between">
              <div className="pr-6">
                <DialogTitle className="text-lg font-semibold line-clamp-1">{selectedAsset.filename}</DialogTitle>
                <DialogDescription className="text-xs font-mono text-muted-foreground mt-0.5">
                  ID: {selectedAsset.id}
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 max-h-[calc(90vh-8rem)] overflow-y-auto">
              {/* Media Display Panel */}
              <div className="lg:col-span-2 bg-slate-950 flex items-center justify-center p-6 min-h-[320px] lg:min-h-[450px] relative group">
                {isImageAsset(selectedAsset) && !imageError[selectedAsset.id] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedAsset.url}
                    alt={selectedAsset.filename}
                    className="max-h-[420px] max-w-full object-contain rounded-md shadow-lg"
                    onError={() => handleImageError(selectedAsset.id)}
                  />
                ) : isVideoAsset(selectedAsset) ? (
                  <video
                    src={selectedAsset.url}
                    controls
                    className="max-h-[420px] max-w-full rounded-md shadow-lg"
                    poster=""
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                    <File className="h-16 w-16 mb-3 text-slate-500" />
                    <p className="font-medium text-slate-300">File Preview Not Available</p>
                    <p className="text-xs text-slate-500 mt-1">You can download this file to view its contents.</p>
                  </div>
                )}
              </div>

              {/* Asset Metadata Sidebar */}
              <div className="p-5 space-y-5 bg-background border-l border-border/50">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Asset Details
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-1 border-b border-border/40">
                      <span className="text-muted-foreground text-xs">Type</span>
                      <Badge variant="secondary" className="text-xs uppercase">
                        {selectedAsset.type || (isImageAsset(selectedAsset) ? "IMAGE" : "FILE")}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-border/40">
                      <span className="text-muted-foreground text-xs">Size</span>
                      <span className="font-medium text-xs">{formatBytes(selectedAsset.size)}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-border/40">
                      <span className="text-muted-foreground text-xs">Uploaded Date</span>
                      <span className="font-medium text-xs">
                        {new Date(selectedAsset.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Associated Post */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Associated Post
                  </h4>
                  {selectedAsset.post ? (
                    <div className="rounded-lg border p-3 bg-muted/20 space-y-2">
                      <p className="font-medium text-sm leading-snug">{selectedAsset.post.title}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Status:</span>
                        <Badge variant="outline" className="text-[10px] py-0 font-medium">
                          {selectedAsset.post.status}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No associated post</p>
                  )}
                </div>

                {/* Client / Project */}
                {selectedAsset.post?.project && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Client & Project
                    </h4>
                    <div className="rounded-lg border p-3 bg-muted/20 space-y-1">
                      <div className="flex items-center gap-1.5 font-medium text-sm">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span>{selectedAsset.post.project.client.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground pl-5">{selectedAsset.post.project.name}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="p-4 border-t bg-muted/20 flex-row items-center justify-between sm:justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(selectedAsset.url, "_blank")}
                className="text-xs"
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Open Direct Link
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedAsset(null)} className="text-xs">
                  Close
                </Button>
                <Button size="sm" asChild className="text-xs">
                  <a href={selectedAsset.url} download target="_blank" rel="noopener noreferrer">
                    <Download className="h-3.5 w-3.5 mr-1.5" /> Download
                  </a>
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
