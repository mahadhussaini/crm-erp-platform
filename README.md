# CRM/ERP Platform

A comprehensive, modular CRM/ERP platform built with Next.js, TypeScript, and modern web technologies. This platform combines Customer Relationship Management (CRM) with Enterprise Resource Planning (ERP) features in a single, scalable solution.

## 🚀 Features

### Core Features
- **Authentication & Authorization**: Secure user authentication with role-based access control
- **Multi-tenant Architecture**: Support for multiple organizations
- **Responsive Design**: Modern, mobile-first UI built with Tailwind CSS
- **Real-time Updates**: WebSocket integration for live notifications
- **API-First Design**: RESTful APIs with comprehensive documentation

### CRM Module
- **Contact Management**: Complete customer and prospect database
- **Lead Pipeline**: Drag-and-drop kanban board for lead management
- **Opportunity Tracking**: Sales opportunity management with forecasting
- **Company Profiles**: Detailed company information and relationships
- **Communication Log**: Track all customer interactions
- **Task Management**: Assign and track tasks across the team

### ERP Module
- **Inventory Management**: Product catalog with stock tracking
- **Order Processing**: Complete order lifecycle management
- **Project Management**: Project planning with resource allocation
- **HR Management**: Employee attendance and time tracking
- **Financial Tracking**: Basic invoicing and payment processing

### Administration
- **User Management**: Create and manage user accounts
- **Role Management**: Granular permission system
- **System Configuration**: Customizable settings and preferences
- **Module Management**: Enable/disable platform features
- **Audit Logs**: Complete activity tracking

### Integrations
- **Payment Processing**: Stripe integration for payments
- **SMS Communication**: Twilio integration for messaging
- **Email Services**: SendGrid/Mailgun integration
- **OAuth Providers**: Google, Microsoft authentication
- **Webhook Support**: Real-time data synchronization

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **State Management**: React Query (TanStack)
- **Real-time**: Socket.io
- **Deployment**: Docker, Docker Compose
- **API**: REST with OpenAPI specification
- **Testing**: Jest, React Testing Library
- **Monitoring**: Built-in logging and error tracking

## 📋 Prerequisites

- Node.js 18.x or higher
- Docker and Docker Compose
- PostgreSQL (if running locally)
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/crm-erp-platform.git
cd crm-erp-platform
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Edit environment variables
nano .env.local
```

Required environment variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/crm_erp_db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
STRIPE_SECRET_KEY="sk_test_..."
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
```

### 3. Development with Docker

```bash
# Start development environment
./deploy.sh development

# Or manually with docker-compose
docker-compose -f docker-compose.dev.yml up --build
```

### 4. Manual Setup (Alternative)

```bash
# Install dependencies
npm install

# Set up database
npx prisma migrate dev
npx prisma db seed

# Start development server
npm run dev
```

## 🐳 Docker Deployment

### Development
```bash
docker-compose -f docker-compose.dev.yml up --build
```

### Production
```bash
docker-compose up --build -d
```

### Deployment Script
```bash
# Deploy to development
./deploy.sh development

# Deploy to production
./deploy.sh production

# View logs
./deploy.sh development logs

# Stop application
./deploy.sh development stop
```

## 📖 API Documentation

### REST API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/session` - Get current session

#### CRM APIs
- `GET /api/contacts` - List contacts
- `POST /api/contacts` - Create contact
- `GET /api/leads` - List leads
- `POST /api/leads` - Create lead
- `GET /api/companies` - List companies
- `GET /api/opportunities` - List opportunities

#### ERP APIs
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/orders` - List orders
- `GET /api/projects` - List projects

#### Integrations
- `POST /api/payments/create-intent` - Create Stripe payment intent
- `POST /api/sms/send` - Send SMS via Twilio
- `POST /api/webhooks/stripe` - Stripe webhook handler
- `POST /api/webhooks/twilio` - Twilio webhook handler

### API Response Format

```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

## 🔧 Configuration

### Database Configuration

The application uses Prisma ORM with MySQL. Configure your database connection in `.env.local`:

#### For Local Development
```env
DATABASE_URL="file:./dev.db"
```

#### For Vercel/Production (Recommended)
```env
DATABASE_URL="mysql://username:password@host:port/database?sslaccept=strict"
```

**For Vercel deployment, use PlanetScale MySQL database (free tier available)**

### Vercel Deployment
The platform is optimized for Vercel deployment:

1. **Connect your GitHub repository** to Vercel
2. **Set up PlanetScale database** (recommended for Vercel)
3. **Configure environment variables** in Vercel dashboard
4. **Deploy automatically** on every push

**📖 [Complete Vercel Deployment Guide](VERCEL-DEPLOYMENT.md)**

### Troubleshooting Vercel Issues
If you encounter deployment errors:

**📖 [Vercel Fix Guide](VERCEL-FIX-GUIDE.md)** - Complete troubleshooting for common issues

**Quick Commands:**
```bash
# Test your Vercel deployment
npm run vercel:test https://your-app.vercel.app

# Check deployment status
npm run deploy:status

# Run full troubleshooting
npm run troubleshoot
```

**Common Issues:**
- **Database Connection Error**: Check PlanetScale setup and DATABASE_URL
- **Prisma Client Error**: Ensure `prisma generate` runs in build
- **Environment Variables**: Verify all required vars are set in Vercel

### Troubleshooting
If you encounter deployment issues or 500 errors:

**📖 [500 Error Troubleshooting Guide](DEBUG-500-ERROR.md)**

**Quick commands:**
```bash
# Check deployment readiness
npm run deploy:status

# Run comprehensive troubleshooting
npm run troubleshoot all

# Test database connection
npm run troubleshoot db
```

### Authentication Configuration

Configure NextAuth.js settings:

```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key"
```

### Third-party Integrations

#### Stripe (Payments)
```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

#### Twilio (SMS)
```env
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1234567890"
```

#### OAuth Providers
```env
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
MICROSOFT_CLIENT_ID="..."
MICROSOFT_CLIENT_SECRET="..."
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📊 Monitoring & Logging

### Application Logs
```bash
# View application logs
docker-compose logs -f app

# View database logs
docker-compose logs -f db
```

### Health Checks
- Application health: `http://localhost:3000/health`
- Database connectivity: Built-in database health checks

## 🔐 Security

### Authentication
- JWT-based authentication with NextAuth.js
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Session management with secure cookies

### API Security
- Rate limiting on API endpoints
- Input validation with Zod
- SQL injection prevention with Prisma
- CORS configuration

### Data Protection
- SSL/TLS encryption in production
- Sensitive data encryption
- Audit logging for all data changes
- GDPR compliance features

## 🚀 Performance

### Optimization Features
- **Server-Side Rendering**: Next.js SSR for better SEO and performance
- **Code Splitting**: Automatic code splitting for smaller bundles
- **Image Optimization**: Next.js Image component for optimized images
- **Caching**: Redis integration for session and data caching
- **Database Indexing**: Optimized database queries with proper indexing

### Monitoring
- **Performance Metrics**: Built-in performance monitoring
- **Error Tracking**: Comprehensive error logging and reporting
- **Database Monitoring**: Query performance and connection monitoring

## 📚 Project Structure

```
crm-erp-platform/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── crm/               # CRM module pages
│   │   ├── erp/               # ERP module pages
│   │   └── dashboard/         # Dashboard pages
│   ├── components/            # React components
│   │   ├── ui/                # Reusable UI components
│   │   ├── layout/            # Layout components
│   │   ├── crm/               # CRM-specific components
│   │   └── erp/               # ERP-specific components
│   ├── lib/                   # Utility libraries
│   │   ├── auth.ts            # Authentication utilities
│   │   ├── db.ts              # Database connection
│   │   ├── stripe.ts          # Stripe integration
│   │   ├── twilio.ts          # Twilio integration
│   │   └── utils.ts           # General utilities
│   └── types/                 # TypeScript type definitions
├── prisma/                    # Database schema and migrations
├── public/                    # Static assets
├── docker/                    # Docker-related files
├── docs/                      # Documentation
├── tests/                     # Test files
├── docker-compose.yml         # Production Docker setup
├── docker-compose.dev.yml     # Development Docker setup
├── Dockerfile                 # Production container
├── Dockerfile.dev             # Development container
├── deploy.sh                  # Deployment script
└── nginx.conf                 # Nginx configuration
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write comprehensive tests for new features
- Update documentation for any API changes
- Ensure all tests pass before submitting PR
- Use conventional commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- 📧 Email: support@crm-erp-platform.com
- 📖 Documentation: [docs.crm-erp-platform.com](https://docs.crm-erp-platform.com)
- 🐛 Bug Reports: [GitHub Issues](https://github.com/your-username/crm-erp-platform/issues)
- 💬 Community: [Discord](https://discord.gg/crm-erp-platform)

## 🎯 Roadmap

### Version 2.0
- [ ] Advanced analytics and reporting dashboard
- [ ] Mobile application (React Native)
- [ ] Multi-language support (i18n)
- [ ] Advanced workflow automation
- [ ] Integration marketplace
- [ ] AI-powered lead scoring
- [ ] Advanced project management features

### Version 2.1
- [ ] Offline-first functionality
- [ ] Advanced permission system
- [ ] Custom field builder
- [ ] Advanced reporting engine
- [ ] API rate limiting and usage analytics

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Prisma team for the excellent ORM
- Tailwind CSS for the utility-first CSS framework
- All contributors and the open-source community

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.