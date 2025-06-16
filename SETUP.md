# POI Tracker - Setup Guide

This guide will help you set up the refactored POI Tracker project for development and deployment.

## 🏗️ Project Structure

```
poi-tracker/
├── src/                     # Source code
│   ├── js/                  # JavaScript modules
│   │   ├── main.js          # Main application entry point
│   │   ├── config.js        # Configuration and environment variables
│   │   ├── supabase.js      # Supabase client and auth helpers
│   │   ├── map.js           # Leaflet map management
│   │   ├── filters.js       # POI filtering functionality
│   │   ├── poi.js           # POI data management
│   │   └── auth.js          # Authentication management
│   └── css/
│       └── styles.css       # Custom application styles
├── scripts/                 # Data seeding and utility scripts
│   ├── seeder.py           # National Parks data seeder
│   ├── supabase_client.py  # Python Supabase client
│   └── requirements.txt    # Python dependencies
├── public/                  # Static assets
│   ├── favicon files       # App icons and manifests
│   └── index.js.old        # Original code (backup)
├── dist/                   # Build output (generated)
├── index.html              # Main HTML file
├── package.json            # Node.js dependencies and scripts
├── vite.config.js          # Vite build configuration
├── .env.example           # Environment variables template
├── .gitignore             # Git ignore rules
├── LICENSE                # MIT license
├── README.md              # Project documentation
└── SETUP.md               # This setup guide
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies (for data seeding)
cd scripts
pip install -r requirements.txt
cd ..
```

### 2. Environment Configuration

Create a `.env` file in the project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# National Parks Service API (for data seeding)
NPS_API_KEY=your_nps_api_key

# Development
NODE_ENV=development
```

### 3. Database Setup

Run the following SQL in your Supabase SQL editor:

```sql
-- Create the POIs table
CREATE TABLE pois (
  id SERIAL PRIMARY KEY,
  place_name VARCHAR(255) NOT NULL,
  description TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  city_id INTEGER,
  created_by UUID REFERENCES auth.users(id),
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  -- Additional NPS fields
  park_code VARCHAR(10),
  states VARCHAR(50),
  website VARCHAR(500),
  phone VARCHAR(20),
  email VARCHAR(100)
);

-- Create enriched view for filtering (customize based on your data structure)
CREATE VIEW enriched_pois AS
SELECT 
  p.*,
  -- Add city, state, region data based on your location enrichment
  'Unknown' as city,
  'Unknown' as state,
  'Unknown' as subregion,
  'Unknown' as region,
  ARRAY[]::text[] as tags
FROM pois p;

-- Enable Row Level Security
ALTER TABLE pois ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access" ON pois
  FOR SELECT USING (is_private = false OR auth.uid() = created_by);

-- Create policies for authenticated users to insert/update their own POIs
CREATE POLICY "Allow authenticated users to insert" ON pois
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow users to update their own POIs" ON pois
  FOR UPDATE USING (auth.uid() = created_by);
```

### 4. Development Server

```bash
npm run dev
```

### 5. Data Seeding (Optional)

To populate your database with National Parks data:

```bash
cd scripts
python seeder.py
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint JavaScript code
- `npm run format` - Format code with Prettier

### Key Features

1. **Modular Architecture**: Code is split into logical modules for maintainability
2. **Environment Variables**: Secure configuration management
3. **TypeScript Ready**: Easy to migrate to TypeScript if needed
4. **Modern Build Tools**: Vite for fast development and optimized builds
5. **Security Best Practices**: No hardcoded credentials, RLS policies
6. **Responsive Design**: Works on desktop and mobile
7. **PWA Ready**: Includes manifest and service worker setup

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🔒 Security Considerations

- Environment variables are properly configured
- API keys are not exposed in client code
- Supabase RLS policies protect user data
- Input validation and sanitization implemented
- HTTPS enforced in production

## 🎯 Professional Presentation Tips

1. **Clean README**: Comprehensive documentation with screenshots
2. **Live Demo**: Deploy and include link in README
3. **Code Quality**: Consistent formatting and commenting
4. **Git History**: Meaningful commit messages
5. **Issue Tracking**: Use GitHub Issues for improvements
6. **Testing**: Add unit tests for critical functions
7. **Performance**: Optimize bundle size and loading times

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📈 Next Steps for Enhancement

1. Add unit tests with Jest/Vitest
2. Implement caching for better performance
3. Add offline support with service workers
4. Create admin dashboard for POI management
5. Add social features (sharing, ratings)
6. Implement advanced filtering (distance, categories)
7. Add data export functionality
8. Integrate with more mapping services 