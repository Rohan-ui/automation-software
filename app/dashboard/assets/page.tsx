import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AssetLibraryClient, AssetWithRelations } from "./asset-library-client"

async function getAssets(): Promise<AssetWithRelations[]> {
  const assets = await prisma.asset.findMany({
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

  // Format dates or objects if needed for serialization
  return assets.map((asset) => ({
    ...asset,
    createdAt: asset.createdAt.toISOString(),
  }))
}

export default async function AssetsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/auth/signin")

  const assets = await getAssets()

  return <AssetLibraryClient initialAssets={assets} />
}

