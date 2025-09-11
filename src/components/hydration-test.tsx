"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useHydrated, useBrowserExtension, useWindow, useNavigator, useScreenSize } from "@/lib/hydration-utils"
import { ClientOnly } from "@/components/client-only"

/**
 * HydrationTest component to verify that hydration fixes are working
 * This component can be temporarily added to test the hydration behavior
 */
export function HydrationTest() {
  const [testResults, setTestResults] = useState({
    hydrationStatus: 'unknown',
    browserExtensions: 'unknown',
    windowAccess: 'unknown',
    navigatorAccess: 'unknown',
    screenSize: 'unknown',
    localStorage: 'unknown',
    sessionStorage: 'unknown',
    timestamp: 'unknown'
  })

  const isHydrated = useHydrated()
  const hasBrowserExtension = useBrowserExtension()
  const windowObj = useWindow()
  const navigator = useNavigator()
  const screenSize = useScreenSize()

  useEffect(() => {
    // Test localStorage
    let localStorageTest = 'not available'
    try {
      if (windowObj?.localStorage) {
        windowObj.localStorage.setItem('hydration-test', 'test-value')
        const value = windowObj.localStorage.getItem('hydration-test')
        localStorageTest = value === 'test-value' ? 'working' : 'failed'
        windowObj.localStorage.removeItem('hydration-test')
      }
    } catch {
      localStorageTest = 'blocked'
    }

    // Test sessionStorage
    let sessionStorageTest = 'not available'
    try {
      if (windowObj?.sessionStorage) {
        windowObj.sessionStorage.setItem('hydration-test', 'test-value')
        const value = windowObj.sessionStorage.getItem('hydration-test')
        sessionStorageTest = value === 'test-value' ? 'working' : 'failed'
        windowObj.sessionStorage.removeItem('hydration-test')
      }
    } catch {
      sessionStorageTest = 'blocked'
    }

    setTestResults({
      hydrationStatus: isHydrated ? 'hydrated' : 'not hydrated',
      browserExtensions: hasBrowserExtension ? 'detected' : 'not detected',
      windowAccess: windowObj ? 'available' : 'not available',
      navigatorAccess: navigator ? 'available' : 'not available',
      screenSize: screenSize.width > 0 ? `${screenSize.width}x${screenSize.height}` : 'not available',
      localStorage: localStorageTest,
      sessionStorage: sessionStorageTest,
      timestamp: new Date().toLocaleString()
    })
  }, [isHydrated, hasBrowserExtension, windowObj, navigator, screenSize])

  const runTests = () => {
    // Force re-run of tests
    if (windowObj?.location) {
      windowObj.location.reload()
    }
  }

  return (
    <ClientOnly>
      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Hydration Test Results</CardTitle>
          <CardDescription>
            This component tests various hydration-related functionality to ensure everything is working correctly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Hydration Status</h3>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                testResults.hydrationStatus === 'hydrated'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {testResults.hydrationStatus}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Browser Extensions</h3>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                testResults.browserExtensions === 'not detected'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {testResults.browserExtensions}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Window Access</h3>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                testResults.windowAccess === 'available'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {testResults.windowAccess}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Navigator Access</h3>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                testResults.navigatorAccess === 'available'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {testResults.navigatorAccess}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Screen Size</h3>
              <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {testResults.screenSize}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Local Storage</h3>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                testResults.localStorage === 'working'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {testResults.localStorage}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Session Storage</h3>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                testResults.sessionStorage === 'working'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {testResults.sessionStorage}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Timestamp</h3>
              <div className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                {testResults.timestamp}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button onClick={runTests} variant="outline" size="sm">
              Run Tests Again
            </Button>
          </div>

          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Note:</strong> If you see any red indicators, there might be browser extension interference.</p>
            <p><strong>Green indicators</strong> show everything is working correctly.</p>
            <p><strong>Yellow indicators</strong> may indicate browser extensions are present but handled.</p>
          </div>
        </CardContent>
      </Card>
    </ClientOnly>
  )
}
