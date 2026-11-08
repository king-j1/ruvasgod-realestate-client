# Ruvasgod Real Estate frontend

The frontend is a React 19 and Vite application. It uses React Router, Axios,
Tailwind CSS 4, and the existing authentication context.

## Local development

1. Install frontend dependencies with `npm install`.
2. Set `VITE_API_URL` in the frontend runtime environment to the backend origin
   (without a trailing `/api`).
3. Run `npm run dev`.

The frontend Axios client appends `/api` to `VITE_API_URL`. Do not put backend
credentials or secrets in frontend environment variables.

Available checks:

- `npm run lint`
- `npm run build`

## Public property search

The public pages call `GET /api/properties` and `GET /api/properties/:id`.
Filtering and pagination are performed in the browser over the returned public
property set. This is not equivalent to server-side filtering or pagination,
and results are limited to what the public API returns.

See [BACKEND_ENHANCEMENTS.md](./BACKEND_ENHANCEMENTS.md) for missing API
capabilities identified during frontend implementation.
