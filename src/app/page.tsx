import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Salesforce - Business Management Solution',
  description: 'Your comprehensive business management solution for CRM and ERP needs.',
}

export const viewport = "width=device-width, initial-scale=1"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8 text-center px-4">
        <div className="space-y-4">
          <div className="mx-auto">
            <Image
              src="/logo.svg"
              alt="Salesforce"
              width={80}
              height={80}
              className="h-20 w-auto mx-auto mb-4"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Salesforce</h1>
          <p className="text-xl text-gray-600">
            Your comprehensive business management solution
          </p>
          <p className="text-gray-500">
            Manage customers, track leads, process orders, and grow your business with our powerful platform.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/auth/signin"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block"
          >
            Get Started
          </Link>
          <div className="text-sm text-gray-500">
            <Link href="/auth/signup" className="text-blue-600 hover:text-blue-500">
              Create a new account
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">CRM</div>
            <div className="text-sm text-gray-600">Customer Management</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">ERP</div>
            <div className="text-sm text-gray-600">Business Operations</div>
          </div>
        </div>
      </div>
    </div>
  )
}
