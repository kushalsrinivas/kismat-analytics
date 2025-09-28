# Kismat Analytics Dashboard

A comprehensive analytics dashboard built with Next.js, tRPC, and Recharts for visualizing user behavior, revenue metrics, and operational insights.

## Features

### 📊 User Analytics

- **User Growth**: Track daily/weekly/monthly new user registrations
- **User Retention**: Analyze how many users return after 1, 7, 30 days
- **User Engagement**: Messages per user, session frequency, daily active users
- **Authentication Patterns**: OAuth provider usage distribution

### 📈 Usage & Behavior Analytics

- **Message Volume**: Daily message counts and peak usage hours
- **User Segmentation**: Free vs paid users, heavy vs light users
- **Feature Adoption**: Track which actions are most/least used
- **Rate Limiting Impact**: Analysis of users hitting daily limits

### 💰 Revenue Analytics

- **Conversion Funnel**: Registration → First Message → Payment Intent → Completed Payment
- **Revenue Metrics**: MRR (Monthly Recurring Revenue), ARPU (Average Revenue Per User)
- **Payment Analysis**: Success rates by tier, processing times
- **Credit Economics**: Credit consumption patterns and balance trends

### ⚙️ Operational Analytics

- **System Health**: API success rates, error patterns, response times
- **Performance Monitoring**: Track system reliability and performance metrics
- **Error Analysis**: Identify and categorize system errors
- **Operational Insights**: Actionable recommendations based on system health

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts for data visualization
- **Backend**: tRPC for type-safe API calls
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js
- **Package Manager**: Bun

## Database Schema

The analytics system uses the following key tables:

- `users` - User information and registration data
- `messageLogs` - Tracks user messages for engagement analytics
- `requestLogs` - API request logs for system health monitoring
- `userCredits` - User credit balances and transactions
- `paymentIntents` - Payment initiation tracking
- `paymentRecords` - Completed payment records
- `accounts` - OAuth account information

## Getting Started

1. **Install dependencies**:

   ```bash
   bun install
   ```

2. **Set up your database** and configure environment variables in `.env`:

   ```env
   DATABASE_URL="postgresql://..."
   NEXTAUTH_SECRET="your-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

3. **Run database migrations**:

   ```bash
   bun run db:push
   ```

4. **Start the development server**:

   ```bash
   bun run dev
   ```

5. **Access the analytics dashboard**:
   - Main app: `http://localhost:3000`
   - Analytics: `http://localhost:3000/analytics`

## Usage

### Accessing Analytics

1. **Authentication Required**: Users must be logged in to access analytics
2. **Navigate to Dashboard**: Click "Analytics Dashboard" from the home page
3. **Switch Between Views**: Use the tab navigation to switch between:
   - User Analytics
   - Usage & Behavior
   - Revenue Analytics
   - Operational Analytics

### Time Period Filtering

Most analytics views support time period filtering:

- Last 7 days
- Last 30 days
- Last 90 days
- Last year (where applicable)

### Key Metrics

#### User Analytics

- **Total Users**: Current registered user count
- **New Users**: Users registered in selected period
- **Active Users**: Users with activity in selected period
- **Retention Rates**: Percentage returning after specific intervals

#### Revenue Analytics

- **Total Revenue**: Revenue generated in selected period
- **ARPU**: Average revenue per paying user
- **Conversion Rate**: Overall registration to payment conversion
- **Monthly Trends**: Revenue and transaction volume over time

#### Operational Health

- **Success Rate**: Overall API request success rate
- **Error Count**: Total failed requests
- **Rate Limit Hits**: Users affected by rate limiting
- **System Status**: Health indicators and recommendations

## Customization

### Adding New Analytics

1. **Create API Endpoint**: Add new procedures to `src/server/api/routers/analytics.ts`
2. **Build Components**: Create React components in `src/app/_components/analytics/`
3. **Add to Dashboard**: Include in the main analytics dashboard navigation

### Modifying Visualizations

Charts are built with Recharts. Common chart types used:

- `LineChart` - Time series data
- `BarChart` - Categorical comparisons
- `PieChart` - Proportional data
- `AreaChart` - Filled time series

### Data Processing

Analytics queries are optimized for:

- **Performance**: Efficient database queries with proper indexing
- **Flexibility**: Configurable time periods and filters
- **Type Safety**: Full TypeScript support with tRPC

## Performance Considerations

- **Caching**: Analytics data is cached at the tRPC level
- **Pagination**: Large datasets are properly paginated
- **Indexing**: Database indexes on frequently queried fields
- **Lazy Loading**: Components load data only when needed

## Security

- **Authentication**: Protected routes require user authentication
- **Authorization**: Only authenticated users can access analytics
- **Data Privacy**: Personal user data is aggregated and anonymized in displays
- **Rate Limiting**: API endpoints are protected against abuse

## Contributing

When adding new analytics features:

1. Follow the existing pattern of API routes in the analytics router
2. Use TypeScript for type safety
3. Implement proper error handling
4. Add loading states for better UX
5. Include responsive design for mobile users
6. Test with various data scenarios

## Troubleshooting

### Common Issues

1. **Build Errors**: Ensure all TypeScript types are properly defined
2. **Database Connections**: Verify environment variables are correctly set
3. **Chart Rendering**: Check that data is in the expected format for Recharts
4. **Performance**: Monitor for slow queries and optimize as needed

### Development Tips

- Use the Next.js development tools for debugging
- Check browser console for client-side errors
- Monitor database query performance
- Test with realistic data volumes

## License

This project is part of the Kismat Analytics application.
