# Relation - Google Contacts 3D Network Visualizer

A desktop application that visualizes your Google contacts as an interactive 3D network graph, allowing you to organize contacts with tags and explore relationships through spatial clustering.

## Features

### Core Visualization
- **3D Contact Network**: View your contacts as interactive spheres in 3D space
- **Billboard Text Labels**: Contact names always face the camera for easy reading
- **Tag-Based Clustering**: Contacts with shared tags naturally group together
- **Spring Physics Simulation**: Realistic physics with configurable ideal distances between nodes

### Interactive Controls
- **Customizable Force System**: Real-time adjustable spring physics parameters
  - Spring strength, ideal distances, damping, and velocity limits
  - Separate ideal distances for connected vs. unconnected contacts
- **Connection Visualization**: Toggle thick transparent lines showing tag relationships
- **Collapsible UI Panels**: Clean interface with expandable Tags and Force Controls
- **3D Camera Controls**: Rotate, zoom, and pan around your contact network

### Contact Management
- **Smart Contact Filtering**: Only contacts with tags appear as nodes in the network
- **In-Place Tag Editing**: Click "Edit" next to any contact to assign/remove tags
- **Dynamic Tag System**: Tags are automatically discovered from existing contacts
- **Tag Legend**: Toggle visibility of different contact groups with live counts

### Authentication & Data
- **Persistent Authentication**: Remembers login state and auto-refreshes tokens
- **Google Integration**: Sync with your Google contacts (with fallback to demo data)
- **Local Data Storage**: Secure token storage with automatic token validation

### Design
- **Dark Theme**: Modern dark interface optimized for extended use
- **Responsive Layout**: Clean sidebar with contact list and search
- **Visual Feedback**: Hover effects, smooth animations, and intuitive interactions

## Setup Instructions

### 1. Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Cloud Console account

### 2. Google API Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google People API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "People API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Desktop application"
   - Add `http://localhost:3000/auth/callback` to authorized redirect URIs
5. Copy your Client ID and Client Secret

### 3. Configuration

1. Create a `.env` file in the project root
2. Add your Google OAuth credentials:
   ```env
   VITE_GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
   VITE_GOOGLE_CLIENT_SECRET=your-actual-client-secret
   ```
3. The app will automatically detect and use these credentials

### 4. Installation

```bash
npm install
```

### 5. Development

```bash
npm run dev
```

### 6. Building

```bash
npm run build
```

### 7. Distribution

```bash
npm run dist
```

## Usage

### Getting Started
1. **Launch the App**: Run `npm run dev` to start the development version
2. **Connect Google Account**: Click "Connect Google Account" and authorize the app
3. **View Your Network**: Your contacts will appear as 3D spheres in space
4. **Assign Tags**: Click "Edit" next to any contact in the sidebar to assign tags
5. **Explore**: Use mouse controls to rotate and zoom around your network

### Advanced Features
6. **Adjust Physics**: Open Force Controls to tune spring behavior in real-time
7. **Visualize Connections**: Toggle connection lines to see tag relationships
8. **Filter by Tags**: Use the Tags panel to show/hide different contact groups
9. **Create New Tags**: Use "Manage Tags" to add custom tags with colors

## Controls

### 3D Navigation
- **Mouse Drag**: Rotate the 3D view
- **Mouse Wheel**: Zoom in/out
- **Mouse Pan**: Right-click drag to pan the camera

### Interface Controls
- **Click Contact Node**: View contact details and hover for additional info
- **Tags Panel**: 
  - Click tag names to toggle visibility
  - Click "Manage Tags" to create/delete tags
- **Force Controls Panel**:
  - **Spring Strength**: How responsive the physics system is
  - **Default Distance**: Ideal spacing for unrelated contacts  
  - **Connected Distance**: Ideal spacing for contacts with shared tags
  - **Damping**: Friction/smoothness of movement
  - **Max Velocity**: Speed limit to prevent chaos
  - **Visualize Connections**: Show relationship lines
- **Contact Sidebar**: 
  - Search contacts by name or email
  - Click "Edit" to assign/remove tags from any contact

## File Structure

```
src/
├── components/                   # React components
│   ├── ContactNode.tsx          # 3D contact sphere with billboard labels
│   ├── ForceSystem.tsx          # Spring-based physics simulation
│   ├── ConnectionLines.tsx      # Visual connection lines between related nodes
│   ├── ForceControls.tsx        # Real-time physics parameter controls
│   ├── NetworkVisualization.tsx # Main 3D scene orchestration
│   ├── ContactSidebar.tsx       # Contact list with search and tag editing
│   ├── TagLegend.tsx           # Collapsible tag visibility controls
│   ├── TagManager.tsx          # Tag creation/editing modal
│   └── Layout.tsx              # App layout wrapper
├── services/                    # API and business logic
│   ├── googleAuth.ts           # Google OAuth flow with persistent auth
│   └── googleContacts.ts       # Google People API integration
├── stores/                     # State management
│   └── appStore.ts            # Zustand store with dynamic tag system
├── types/                      # TypeScript definitions
│   └── index.ts               # Contact, Tag, and other interfaces
└── config/                    # Configuration files
    └── google.ts             # Google API configuration
```

## Technologies Used

### Frontend & 3D Graphics
- **React 19**: Modern UI framework with latest features
- **TypeScript**: Full type safety throughout the application
- **Three.js**: 3D graphics rendering and physics
- **React Three Fiber**: React integration for Three.js
- **React Three Drei**: Additional 3D utilities (Billboard, Text, etc.)

### Styling & UI
- **Tailwind CSS v4**: Utility-first styling with dark theme
- **Custom CSS Components**: Consistent panel and control styling

### State & Data Management
- **Zustand**: Lightweight state management
- **Google People API**: Contact data synchronization
- **LocalStorage**: Secure token persistence and auto-refresh

### Build & Development
- **Vite**: Fast build tool and development server
- **Electron**: Desktop app framework
- **ESLint & TypeScript**: Code quality and type checking

## Development Notes

### Data & Privacy
- The app uses mock data by default until Google API credentials are configured
- All contact data remains local - no data is sent to external servers except Google
- Tags are stored as custom fields in your Google contacts
- Authentication tokens are securely stored in localStorage with auto-refresh

### Physics System  
- Spring-based physics simulation with configurable parameters
- Real-time force adjustments without position resets
- Only visible nodes participate in physics calculations for performance
- Separate ideal distances for connected vs. unconnected contacts

### Performance Optimizations
- Dynamic tag system built from existing contact data
- Efficient collision detection between visible nodes only
- Billboard text labels for optimal readability
- Collapsible UI panels to minimize screen clutter

## License

MIT License - feel free to use and modify as needed.