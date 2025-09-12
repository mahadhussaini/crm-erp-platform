// import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Upload,
  Folder,
  File,
  Search,
  Filter,
  Grid3X3,
  List,
  FolderPlus,
  Share2,
  Download,
  MoreHorizontal,
  Eye
} from 'lucide-react'

export const metadata = {
  title: 'Documents - Salesforce',
  description: 'Manage, organize, and share your business documents',
}

// Mock data for documents
const documents = [
  {
    id: '1',
    name: 'Q3 Sales Report.pdf',
    size: '2.4 MB',
    type: 'pdf',
    category: 'GENERAL',
    lastModified: '2 hours ago',
    sharedWith: 3,
    isPublic: false
  },
  {
    id: '2',
    name: 'Client Contract - Acme Corp.docx',
    size: '1.2 MB',
    type: 'docx',
    category: 'CONTRACT',
    lastModified: '1 day ago',
    sharedWith: 1,
    isPublic: false
  },
  {
    id: '3',
    name: 'Product Presentation.pptx',
    size: '8.7 MB',
    type: 'pptx',
    category: 'PRESENTATION',
    lastModified: '3 days ago',
    sharedWith: 5,
    isPublic: true
  },
  {
    id: '4',
    name: 'Budget Spreadsheet.xlsx',
    size: '456 KB',
    type: 'xlsx',
    category: 'SPREADSHEET',
    lastModified: '1 week ago',
    sharedWith: 2,
    isPublic: false
  }
]

const folders = [
  {
    id: '1',
    name: 'Sales Materials',
    documentCount: 12,
    lastModified: '2 days ago',
    isPublic: false
  },
  {
    id: '2',
    name: 'Legal Documents',
    documentCount: 8,
    lastModified: '1 week ago',
    isPublic: false
  },
  {
    id: '3',
    name: 'Marketing Assets',
    documentCount: 24,
    lastModified: '3 days ago',
    isPublic: true
  }
]

const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return '📄'
    case 'docx':
    case 'doc':
      return '📝'
    case 'pptx':
    case 'ppt':
      return '📊'
    case 'xlsx':
    case 'xls':
      return '📈'
    case 'jpg':
    case 'jpeg':
    case 'png':
      return '🖼️'
    default:
      return '📁'
  }
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'CONTRACT':
      return 'bg-blue-100 text-blue-800'
    case 'INVOICE':
      return 'bg-green-100 text-green-800'
    case 'PROPOSAL':
      return 'bg-purple-100 text-purple-800'
    case 'PRESENTATION':
      return 'bg-orange-100 text-orange-800'
    case 'SPREADSHEET':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default async function DocumentsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600 mt-1">
            Manage, organize, and share your business documents securely
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <FolderPlus className="w-4 h-4 mr-2" />
            New Folder
          </Button>
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Upload Files
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="all">All Files</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
          <TabsTrigger value="folders">Folders</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Files</p>
                    <p className="text-2xl font-bold">1,247</p>
                  </div>
                  <File className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Storage Used</p>
                    <p className="text-2xl font-bold">2.4 GB</p>
                  </div>
                  <Upload className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Shared Files</p>
                    <p className="text-2xl font-bold">156</p>
                  </div>
                  <Share2 className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Folders</p>
                    <p className="text-2xl font-bold">28</p>
                  </div>
                  <Folder className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Documents Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {documents.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{getFileIcon(doc.type)}</div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm truncate" title={doc.name}>
                      {doc.name}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{doc.size}</span>
                      <Badge className={getCategoryColor(doc.category)} variant="secondary">
                        {doc.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">{doc.lastModified}</p>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Share2 className="w-3 h-3" />
                        <span>{doc.sharedWith}</span>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="folders" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {folders.map((folder) => (
              <Card key={folder.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">📁</div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm">{folder.name}</h3>
                    <p className="text-xs text-gray-500">
                      {folder.documentCount} documents
                    </p>
                    <p className="text-xs text-gray-500">{folder.lastModified}</p>
                    <div className="flex items-center justify-between pt-2">
                      <Badge variant={folder.isPublic ? "default" : "secondary"}>
                        {folder.isPublic ? "Public" : "Private"}
                      </Badge>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <div className="text-center py-12">
            <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Recent files will appear here</h3>
            <p className="text-gray-500">Files you&apos;ve recently viewed or modified</p>
          </div>
        </TabsContent>

        <TabsContent value="shared" className="space-y-6">
          <div className="text-center py-12">
            <Share2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Shared files will appear here</h3>
            <p className="text-gray-500">Files that have been shared with you or by you</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
