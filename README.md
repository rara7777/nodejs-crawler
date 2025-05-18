# Web Crawler API

A web crawler API service built with Fastify.

## Features

- High-performance API service using Fastify framework
- CORS support
- Web page parsing with Cheerio
- Vercel deployment integration
- Concurrent request control with p-limit

## Tech Stack

- Node.js
- Fastify
- Cheerio
- Axios
- Vercel

## Installation

1. Clone the repository
```bash
git clone [your-repo-url]
cd crawler
```

2. Install dependencies
```bash
npm install
```

3. Start the service
```bash
# Development
npm run dev

# Production
npm start
```

## API Usage

Once the service is running, you can access it through:

- Local development: `http://localhost:3000`
- Vercel deployment: `https://[your-project-name].vercel.app`

## Development

```bash
# Local development
npm run dev

# Deploy to Vercel
vercel
```

## TODO

- [ ] Add rate limiting middleware
- [ ] Implement caching mechanism
- [ ] Add more comprehensive error handling
- [ ] Write unit tests
- [ ] Add API documentation with Swagger/OpenAPI
- [ ] Implement request validation
- [ ] Add logging system
- [ ] Set up CI/CD pipeline
- [ ] Support robots.txt checking
- [ ] Support headless browser crawling

## License

ISC License
