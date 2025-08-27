# 🧠 BrainBox - Collaborative Intelligence Platform

**Live Demo:** [https://brainbox-hb.vercel.app/](https://brainbox-hb.vercel.app/)

A modern, AI-powered collaborative document editing platform built with Next.js 15, featuring real-time collaboration, intelligent AI assistance, and enterprise-grade security.

## ✨ Features

### 🚀 Core Features
- **Real-time Collaboration**: Live cursors, instant updates, and seamless multi-user editing
- **AI-Powered Intelligence**: Advanced AI features for document enhancement and smart suggestions
- **Enterprise Security**: Bank-level security with end-to-end encryption and role-based access control
- **Modern UI/UX**: Professional, responsive design optimized for all devices

### 📝 Document Management
- **Rich Text Editor**: Powered by BlockNote with advanced formatting options
- **Document Sharing**: Invite up to 5 users per document (Free plan)
- **Access Control**: Role-based permissions (owner, editor)
- **Real-time Sync**: Instant synchronization across all collaborators

### 🤖 AI Features
- **Document Translation**: AI-powered translation to multiple languages
- **Chat to Document**: Interactive AI chat for document assistance
- **Smart Suggestions**: Context-aware writing enhancements
- **Content Analysis**: Word and character counting with limits

### 🔒 Security & Access Control
- **Authentication**: Secure authentication via Clerk
- **Document Access**: Server-side and client-side access validation
- **Real-time Monitoring**: Live access control and error handling
- **Data Protection**: Secure data handling and storage

## 🛠️ Tech Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **BlockNote**: Rich text editor component
- **Lucide React**: Beautiful icons

### Backend & Database
- **Firebase Admin SDK**: Server-side database operations
- **Firestore**: NoSQL database for document storage
- **Liveblocks**: Real-time collaboration infrastructure
- **Clerk**: Authentication and user management

### AI & External Services
- **Cloudflare AI**: AI-powered features (translation, chat)
- **Rate Limiting**: Built-in usage tracking and limits

### Development Tools
- **ESLint**: Code linting and quality
- **PostCSS**: CSS processing
- **Vercel**: Deployment and hosting

## 📋 Prerequisites

Before running this project, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Firebase** project with Firestore database
- **Clerk** account for authentication
- **Liveblocks** account for real-time features
- **Cloudflare AI** access for AI features

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd brainbox
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email

# Liveblocks Configuration
LIVEBLOCKS_SECRET_KEY=your_liveblocks_secret_key

# Cloudflare AI
NEXT_PUBLIC_BASE_URL=https://api.cloudflare.com/client/v4/ai/run

# Application Configuration
NEXT_PUBLIC_APP_URL=https://brainbox-hb.vercel.app/
```

### 4. Firebase Setup
1. Create a Firebase project
2. Enable Firestore database
3. Create a service account and download the JSON key
4. Place the service key as `service_key.json` in the root directory

### 5. Database Structure
The application uses the following Firestore collections:

```
/documents/{docId} - Document metadata
/rooms/{roomId} - Room information for Liveblocks
/users/{email}/rooms/{docId} - User's document access
```

### 6. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗️ Project Structure

```
brainbox/
├── actions/                 # Server actions
│   └── actions.ts          # Document management actions
├── app/                    # Next.js App Router
│   ├── auth-endpoint/      # Clerk authentication endpoint
│   ├── doc/[id]/          # Document pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── Document.tsx      # Main document component
│   ├── Editor.tsx        # BlockNote editor
│   ├── Sidebar.tsx       # Document navigation
│   └── ...               # Other components
├── lib/                  # Utility libraries
│   ├── liveblocks.ts     # Liveblocks configuration
│   ├── limits.ts         # Application limits
│   └── utils.ts          # Utility functions
├── types/                # TypeScript type definitions
└── public/              # Static assets
```

## 🔧 Configuration

### Application Limits
The application enforces the following limits (configurable in `lib/limits.ts`):

```typescript
export const APP_LIMITS = {
  MAX_DOCS_PER_USER: 5,        // Maximum documents per user
  MAX_USERS_PER_DOC: 5,        // Maximum users per document
  MAX_WORDS_PER_DOC: 5000,     // Maximum words per document
  MAX_TITLE_LENGTH: 100,       // Maximum title length
};
```

### Rate Limiting
- **AI Features**: Daily and monthly usage limits
- **Document Creation**: 5 documents per user (Free plan)
- **User Invitations**: 5 users per document (Free plan)

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production
Ensure all environment variables are set in your production environment:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `LIVEBLOCKS_SECRET_KEY`
- `NEXT_PUBLIC_BASE_URL`
- `NEXT_PUBLIC_APP_URL`

## 📱 Features in Detail

### Real-time Collaboration
- **Live Cursors**: See other users' cursors in real-time
- **Instant Updates**: Changes appear immediately across all users
- **Presence Indicators**: Know who's currently editing
- **Conflict Resolution**: Automatic conflict handling

### AI Integration
- **Document Translation**: Translate documents to multiple languages
- **AI Chat**: Interactive chat for document assistance
- **Smart Suggestions**: Context-aware writing enhancements
- **Content Analysis**: Real-time word and character counting

### Security Features
- **Authentication**: Secure user authentication via Clerk
- **Access Control**: Role-based permissions and document access
- **Data Validation**: Server-side validation for all operations
- **Error Handling**: Comprehensive error handling and user feedback

### User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Professional UI**: Modern, clean interface design
- **Intuitive Navigation**: Easy-to-use document management
- **Real-time Feedback**: Instant feedback for all user actions

## 🎯 Pricing Plans

### Free Plan
- ✅ Up to 5 documents
- ✅ Up to 5 users per document
- ✅ Basic AI features
- ✅ Real-time collaboration
- ✅ 5000 words per document

### Monthly Plan (Coming Soon)
- 🔄 Unlimited documents
- 🔄 Up to 20 users per document
- 🔄 Advanced AI features
- 🔄 Priority support
- 🔄 Unlimited words per document
- 💰 $9/month

### Yearly Plan (Coming Soon)
- 🔄 Everything in Monthly
- 🔄 Unlimited users per document
- 🔄 Enterprise features
- 🔄 24/7 support
- 🔄 Advanced analytics
- 💰 $89/year (Save 17%)

## 🔍 Troubleshooting

### Common Issues

#### Document Count Error
If you encounter "You can only create up to 5 documents" error:
- The system automatically cleans up orphaned entries
- Try creating a document again after the cleanup
- Contact support if the issue persists

#### Authentication Issues
- Ensure Clerk environment variables are correctly set
- Check that your Clerk application is properly configured
- Verify the redirect URLs in your Clerk dashboard

#### Real-time Collaboration Issues
- Check Liveblocks configuration
- Ensure all users have proper access to the document
- Verify network connectivity

### Development Issues

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

#### TypeScript Errors
```bash
# Check for type errors
npx tsc --noEmit
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🚀 Roadmap

### Upcoming Features
- [ ] Advanced AI features (Monthly/Yearly plans)
- [ ] Unlimited document storage
- [ ] Enhanced collaboration tools
- [ ] Mobile app development
- [ ] API for third-party integrations
- [ ] Advanced analytics and insights

### Planned Improvements
- [ ] Enhanced security features
- [ ] Performance optimizations
- [ ] Additional AI capabilities
- [ ] Improved user interface
- [ ] Better error handling

---

**Built with ❤️ using Next.js, Firebase, and Liveblocks**

**Live Demo:** [https://brainbox-hb.vercel.app/](https://brainbox-hb.vercel.app/)
