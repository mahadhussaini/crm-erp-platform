"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Home, LogIn } from "lucide-react"

const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration. Please contact support.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The verification token has expired or has already been used.",
  Default: "An error occurred during authentication. Please try again.",
  CredentialsSignin: "Invalid email or password. Please check your credentials.",
  EmailSignin: "Unable to send verification email. Please try again.",
  OAuthSignin: "Unable to sign in with the selected provider.",
  OAuthCallback: "Unable to complete sign in with the selected provider.",
  OAuthCreateAccount: "Unable to create account with the selected provider.",
  EmailCreateAccount: "Unable to create account with the provided email.",
  Callback: "Unable to complete the authentication process.",
  OAuthAccountNotLinked: "This account is already linked to another provider.",
  SessionRequired: "You must be signed in to access this page.",
}

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error") || "Default"

  const getErrorMessage = (error: string) => {
    return errorMessages[error] || errorMessages.Default
  }

  const getErrorTitle = (error: string) => {
    switch (error) {
      case "Configuration":
        return "Configuration Error"
      case "AccessDenied":
        return "Access Denied"
      case "Verification":
        return "Verification Error"
      case "CredentialsSignin":
        return "Invalid Credentials"
      default:
        return "Authentication Error"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-600">
            {getErrorTitle(error)}
          </CardTitle>
          <CardDescription>
            {getErrorMessage(error)}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">What you can do:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Go back and try signing in again</li>
              <li>Check your email and password</li>
              <li>Make sure your account is active</li>
              <li>Contact support if the problem persists</li>
            </ul>
          </div>

          <div className="flex flex-col space-y-3">
            <Link href="/auth/signin">
              <Button className="w-full">
                <LogIn className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            </Link>

            <Link href="/">
              <Button variant="outline" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            </Link>
          </div>

          {error === "Configuration" && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Configuration Issue:</strong> This usually means there&apos;s a problem with the server setup.
                Please check that all environment variables are properly configured.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}
