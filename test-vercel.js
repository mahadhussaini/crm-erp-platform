#!/usr/bin/env node

/**
 * Quick Vercel Deployment Test Script
 * Tests critical endpoints and provides immediate feedback
 */

const https = require('https')

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data)
          resolve({
            status: res.statusCode,
            data: jsonData,
            headers: res.headers
          })
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: data,
            headers: res.headers
          })
        }
      })
    })

    req.on('error', (error) => {
      reject(error)
    })

    if (options.method === 'POST' && options.data) {
      req.write(JSON.stringify(options.data))
    }

    req.end()
  })
}

async function testEndpoint(name, url, options = {}) {
  console.log(`🔍 Testing ${name}...`)

  try {
    const response = await makeRequest(url, options)

    if (response.status === 200 || response.status === 201) {
      console.log(`✅ ${name}: SUCCESS (${response.status})`)

      if (response.data && typeof response.data === 'object') {
        if (response.data.success === false) {
          console.log(`⚠️  ${name}: API returned error:`, response.data.error)
          return false
        } else if (response.data.database) {
          console.log(`💾 Database status: ${response.data.database.status}`)
          return response.data.database.status === 'healthy'
        }
      }

      return true
    } else {
      console.log(`❌ ${name}: FAILED (${response.status})`)
      if (response.data && response.data.error) {
        console.log(`   Error: ${response.data.error}`)
        if (response.data.details) {
          console.log(`   Details: ${response.data.details}`)
        }
      }
      return false
    }
  } catch (error) {
    console.log(`❌ ${name}: ERROR - ${error.message}`)
    return false
  }
}

async function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('❌ Please provide your Vercel app URL')
    console.log('Usage: node test-vercel.js https://your-app.vercel.app')
    console.log('Example: node test-vercel.js https://crm-erp-platform.vercel.app')
    process.exit(1)
  }

  const baseUrl = args[0].replace(/\/$/, '') // Remove trailing slash
  console.log(`🚀 Testing Vercel deployment: ${baseUrl}\n`)

  let allPassed = true

  // Test 1: Basic health check
  const healthPassed = await testEndpoint('Health Check', `${baseUrl}/api/health`)
  allPassed = allPassed && healthPassed

  // Test 2: Database connection
  const dbPassed = await testEndpoint('Database Test', `${baseUrl}/api/test-db`)
  allPassed = allPassed && dbPassed

  // Test 3: Registration API (with test data)
  const registerPassed = await testEndpoint(
    'Registration API',
    `${baseUrl}/api/auth/register`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'testpassword123'
      }
    }
  )
  allPassed = allPassed && registerPassed

  // Test 4: Sign-in page (basic connectivity)
  const signinPassed = await testEndpoint('Sign-in Page', `${baseUrl}/auth/signin`)
  // Note: This will likely return HTML, so we just check if it's reachable
  allPassed = allPassed && (signinPassed !== false)

  console.log('\n' + '='.repeat(50))

  if (allPassed) {
    console.log('🎉 ALL TESTS PASSED! Your Vercel deployment is working correctly.')
    console.log('\n✅ Next steps:')
    console.log('   1. Visit your app: ' + baseUrl)
    console.log('   2. Try registering a new user')
    console.log('   3. Start building your CRM/ERP workflows!')
  } else {
    console.log('⚠️  SOME TESTS FAILED. Check the errors above.')
    console.log('\n🔧 Troubleshooting steps:')
    console.log('   1. Check Vercel environment variables')
    console.log('   2. Verify PlanetScale database connection')
    console.log('   3. Check Vercel function logs')
    console.log('   4. See VERCEL-FIX-GUIDE.md for detailed fixes')
  }

  console.log('\n📊 Summary:')
  console.log(`   Health Check: ${healthPassed ? '✅' : '❌'}`)
  console.log(`   Database: ${dbPassed ? '✅' : '❌'}`)
  console.log(`   Registration: ${registerPassed ? '✅' : '❌'}`)
  console.log(`   App Access: ${signinPassed ? '✅' : '❌'}`)

  console.log('\n📖 For more help:')
  console.log('   - VERCEL-FIX-GUIDE.md')
  console.log('   - VERCEL-DEPLOYMENT.md')
  console.log('   - Run: npm run troubleshoot')
}

if (require.main === module) {
  main().catch(console.error)
}
