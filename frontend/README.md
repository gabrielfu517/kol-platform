# KOL Platform Frontend

React TypeScript application for KOL management.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Available Scripts

### `npm start`

Runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.
The build is optimized and ready to be deployed.

## Project Structure

```
src/
├── components/
│   ├── Navbar.tsx         # Navigation bar component
│   └── PrivateRoute.tsx   # Protected route wrapper
├── contexts/
│   └── AuthContext.tsx    # Authentication context
├── pages/
│   ├── Login.tsx          # Login page
│   ├── Register.tsx       # Registration page
│   ├── Dashboard.tsx      # Dashboard page
│   ├── KOLs.tsx          # KOL list page
│   ├── KOLDetail.tsx     # KOL details page
│   ├── KOLForm.tsx       # KOL create/edit form
│   ├── Campaigns.tsx     # Campaign list page
│   └── CampaignForm.tsx  # Campaign create/edit form
├── services/
│   └── api.ts            # API service layer
├── App.tsx               # Main app component
├── App.css              # Global styles
└── index.css            # CSS variables and reset
```

## Features

### Authentication
- JWT-based authentication
- Protected routes
- Persistent login with localStorage
- Auto-redirect on logout

### KOL Management
- Browse KOLs with filtering
- View detailed KOL profiles
- Create and edit KOLs
- Delete KOLs
- Beautiful card-based layout

### Campaign Management
- Create marketing campaigns
- Assign KOLs to campaigns
- Track campaign status
- Edit and delete campaigns

### UI/UX
- Modern, responsive design
- Custom CSS with variables
- Smooth transitions
- Loading states
- Error handling

## API Configuration

The frontend connects to the backend API at `http://localhost:5000/api`.

To change the API URL, edit `src/services/api.ts`:

```typescript
const API_URL = 'http://localhost:5000/api';
```

## Authentication Flow

1. User registers or logs in
2. Backend returns JWT token
3. Token stored in localStorage
4. Token sent with all authenticated requests
5. On page reload, token validated with backend
6. If invalid, user redirected to login

## Styling

The app uses custom CSS with CSS variables for theming:

```css
:root {
  --primary-color: #667eea;
  --primary-dark: #5a67d8;
  --secondary-color: #48bb78;
  --danger-color: #f56565;
  --text-primary: #2d3748;
  --text-secondary: #718096;
}
```

To customize the theme, edit these variables in `src/index.css`.

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

### Deploying

**Static Hosting (Netlify, Vercel, etc.):**

1. Build the app: `npm run build`
2. Deploy the `build` folder
3. Configure redirects for client-side routing

**Netlify example (_redirects file):**
```
/*    /index.html   200
```

**Nginx example:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Then use it in code:
```typescript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

## TypeScript

The project uses TypeScript for type safety. Key types are defined in `src/services/api.ts`:

- `User` - User model
- `KOL` - KOL model
- `Campaign` - Campaign model

## Common Issues

### CORS Errors

If you see CORS errors, ensure the backend has CORS enabled and configured properly.

### API Connection Failed

Check that:
1. Backend is running on port 5000
2. API_URL is correct in `api.ts`
3. Network tab shows the correct request URL

### Build Warnings

Some warnings about vulnerabilities in dependencies are normal for development.
For production, run: `npm audit fix`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

The app is optimized with:
- Code splitting with React.lazy (can be added)
- Efficient re-renders with React hooks
- Memoization where needed
- Optimized bundle size

## Future Improvements

- Add React.lazy for code splitting
- Implement caching with React Query
- Add form validation library (e.g., Formik, React Hook Form)
- Add UI component library (e.g., Material-UI, Chakra UI)
- Add unit and integration tests
- Implement accessibility features
