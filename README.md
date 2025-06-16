# POI Tracker 🗺️ (A work in progress)

A modern web application for tracking and organizing Points of Interest (POIs) with interactive mapping, filtering, and user authentication.

## 🚀 Features

- **Interactive Map**: Powered by Leaflet with marker clustering
- **Advanced Filtering**: Filter POIs by tags, city, state, region, and subregion
- **Authentication**: Google OAuth integration via Supabase Auth
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Data**: Live updates with Supabase backend
- **Data Seeding**: National Parks Service API integration for initial data

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript (ES6 modules), HTML5, CSS3
- **Styling**: Bootstrap 5.3
- **Mapping**: Leaflet.js with marker clustering
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Deployment**: Vercel
- **Data Source**: National Parks Service API

## 📋 Prerequisites

- Node.js (v16 or higher)
- A Supabase account and project
- Google OAuth credentials (for authentication)
- National Parks Service API key (for data seeding)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/poi-tracker.git
   cd poi-tracker
   ```

2. **Install development dependencies**
   ```bash
   npm install
   ```
   *Note: Main dependencies (Leaflet, Bootstrap, Supabase) are loaded via CDN for simplicity.*

3. **Environment Setup**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   NPS_API_KEY=your_nps_api_key
   ```

4. **Database Setup**
   
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
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Create enriched view for filtering
   CREATE VIEW enriched_pois AS
   SELECT 
     p.*,
     -- Add your enrichment logic here based on your data structure
   FROM pois p;
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🚀 Deployment

The application is configured for deployment on Vercel:

1. **Deploy to Vercel**
   ```bash
   npm run build
   vercel --prod
   ```

2. **Environment Variables**
   
   Set the following environment variables in your Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## 📊 Data Seeding

To populate your database with National Parks data:

```bash
cd scripts
python seeder.py
```

Make sure your NPS API key is set in your `.env` file.

## 🏗️ Project Structure

```
poi-tracker/
├── src/
│   ├── js/
│   │   ├── main.js          # Main application logic
│   │   ├── auth.js          # Authentication handling
│   │   ├── map.js           # Map initialization and controls
│   │   ├── filters.js       # Filter functionality
│   │   └── config.js        # Configuration and constants
│   ├── css/
│   │   └── styles.css       # Custom styles
│   └── assets/              # Images, icons, etc.
├── scripts/
│   ├── seeder.py           # Data seeding script
│   └── supabase_client.py  # Supabase Python client
├── public/
│   ├── index.html          # Main HTML file
│   └── favicon files       # PWA assets
├── dist/                   # Build output
├── .env.example           # Environment variables template
├── package.json
├── vite.config.js         # Vite configuration
└── README.md
```

## 🔒 Security

- API keys are stored in environment variables
- Supabase Row Level Security (RLS) policies protect user data
- Google OAuth provides secure authentication
- No sensitive data is committed to version control

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [National Parks Service](https://www.nps.gov/subjects/developer/) for the parks data API
- [Leaflet](https://leafletjs.com/) for the excellent mapping library
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Bootstrap](https://getbootstrap.com/) for the responsive design framework

## 📧 Contact

Your Name - your.email@example.com

Project Link: [https://github.com/yourusername/poi-tracker](https://github.com/yourusername/poi-tracker)

---

*Built with ❤️ for travelers and explorers* 