# Backend gaps for frontend completion

This document records frontend features that cannot be completed without
additional real-estate backend capabilities. The frontend must not substitute
mock records or unrelated vehicle workflows for these APIs.

## Existing capabilities used by the frontend

- Public property browsing uses the existing published/verified property API.
- Staff property workflows use the protected property list, create, update,
  image, review, verification, and publication APIs.
- Authentication and session restoration use the existing login, registration,
  and current-user APIs.
- Staff customer directory and detail screens use the protected staff customer
  APIs.
- Owner screens use existing owner creation/retrieval, verification, document,
  and explicit staff-access APIs. Owner document operations continue to depend
  on backend authorization.
- Frontend role guards only control navigation and screen access; backend
  authorization remains authoritative.

## Missing or incomplete capabilities

| Feature | Existing API availability | Missing backend capability / data | Suggested backend work | Frontend dependency |
|---|---|---|---|---|
| Public property search | Public listing returns published and verified properties. It does not provide the full filter, sort, or pagination contract needed for large result sets. | Validated server-side filters, selectable sorting, and stable pagination metadata. | Extend the existing listing API with a documented, bounded query contract. | Replace in-memory filtering/pagination with API-driven search and pagination. |
| Owner directory and selection | Owners can be created and retrieved by known ID; owner access can be granted/revoked. No owner list/search endpoint was found. | Authorized, searchable owner records and effective permissions for the requesting staff member. | Add a permission-filtered owner directory/search endpoint and define its response/limits. | Replace manual known-owner-ID lookup and enable safe owner selection for property creation. |
| Owner profile editing | Owner creation, retrieval, and verification operations exist. No owner identity/contact edit operation was found. | Validated update rules and an authorized owner update endpoint. | Add an audited, permission-checked owner update operation. | Add editable owner contact/identity fields only after the API contract exists. |
| Customer property enquiries | No real-estate property enquiry submission API was found. | Enquiry records, validation, spam controls, ownership/customer association, and status lifecycle. | Define a protected/publicly callable enquiry workflow with appropriate abuse controls and staff access. | Enable property enquiry forms and customer/staff enquiry views. |
| Viewing requests and real-estate bookings | No real-estate viewing or booking API was found. Existing booking APIs are vehicle-oriented and are not substitutes. | Property viewing requests, availability, scheduling, and status history. | Define property-specific booking records, validation, permissions, and lifecycle endpoints. | Add customer viewing requests and staff scheduling/management screens. |
| Saved properties | No saved/favorite property API was found. | Per-customer saved-property records and access rules. | Add authenticated save/list/remove operations for published properties. | Add favorites controls and a saved-properties view. |
| Customer profile and real-estate workspace | Authentication/current-user and staff customer details are available. No complete property-customer activity API was found. | Customer profile update contract and customer-scoped property activity. | Define which customer fields are editable and customer-scoped activity endpoints. | Add profile editing and populate customer workspace sections from actual records. |
| Real-estate sales and rentals | No property transaction API was found. Existing sales APIs are vehicle-oriented. | Property sale/rental transactions, parties, amounts, statuses, and audit history. | Define real-estate transaction models and permission-checked endpoints. | Add transaction lists and detail screens using returned records only. |
| Real-estate payments and revenue | No real-estate payment API was found. Existing payment APIs are vehicle-oriented. | Property payment records, transaction references, statuses, and any supported financial summaries. | Define real-estate payment contracts and safe reporting rules. | Add payment and revenue views only after the API provides real estate data. |
| Partner referrals | No property partner/referral API was found. | Referral records, attribution, assignment, progress, and role permissions. | Define referral lifecycle and partner/staff access endpoints. | Add referral workspace and status tracking. |
| Reports and analytics | Property, staff, and customer records can be fetched for supported staff roles. No dedicated real-estate analytics/reporting API was found. | Defined metrics, date ranges, aggregation semantics, and authorization. | Add documented reporting endpoints based on real-estate records. | Add charts/reports only against these server-provided metrics. |
| Audit logs | No real-estate audit-log API was found. | Searchable, permission-filtered audit events and record details. | Provide an immutable audit event model and authorized read endpoints. | Add audit history screens without synthesizing activity. |
| Administrative settings | No real-estate administrative settings API was found. | Supported settings, validation, persistence, and permissions. | Define settings that are intentionally managed by the application and expose authorized operations. | Add settings UI only for those documented controls. |

These are API-contract gaps, not frontend failures. In particular, vehicle
booking, sales, and payment endpoints must not be presented as real-estate
operations. Do not write to the database or infer support from similarly named
vehicle routes.

## Phase 3 operational module audit

The following contract checks were made against the current backend routes,
controllers, models, and middleware. A similarly named vehicle operation is
not treated as a real-estate capability.

| Module | Existing backend support | Frontend implementation | Remaining limitations / backend work |
|---|---|---|---|
| Property verification | `GET /api/properties/staff/all`, submission to review, verify/reject, publish/unpublish. Staff routes are restricted to admin/manager. Verification requires a verified owner and at least one active verified owner document. Owner-document endpoints enforce per-owner access permissions. | Added a pending-review queue and connected it to the existing property details review actions. Owner document workflows remain on the existing protected owner screen. | Backend does not accept a property rejection reason, return property verification history, or include safe owner/document verification status with each property. The UI displays backend validation errors and does not bypass owner/document requirements. |
| Bookings and viewings | Booking routes and models refer to vehicle rentals (`vehicle`, rental dates, vehicle availability). Admin/manager/rental can list/update those vehicle bookings. | No real-estate booking/viewing workflow added. | Requires property viewing/booking APIs, property references, schedules, lifecycle/status contract, and customer/staff authorization. |
| Sales | Sale routes/controllers/models create vehicle sales and store a vehicle reference. Admin/manager/sales/finance can read vehicle sales; status changes are limited to admin/manager/sales. | No real-estate sales workflow added. | Requires property transaction records and documented real-estate transaction permissions/status rules. Vehicle sale records are not shown as property sales. |
| Payments | Payment operations initialize/verify Paystack payments for vehicle bookings or vehicle sales. They are customer-owned; no staff payment directory/reporting API exists. Payment data is embedded on vehicle booking/sale records rather than a real-estate payment model. | No real-estate payment workflow added. | Requires real-estate transaction/payment records, staff read authorization, safe searchable payment APIs, and provider-confirmed status/reporting. |
| GPS / property location | Property model stores GeoJSON Point coordinates as longitude/latitude and has a `2dsphere` index. Property create validates coordinate pairs; public and staff property APIs return property location data. | Public and staff property details display coordinates only when the backend returns a valid pair. | No map provider or map configuration exists. A map/marker interface requires an approved provider and privacy/configuration decision; no geolocation tracking or external map service was added. |
| Customer verification | User model has account role and active status but no customer identity-verification fields or document relation. Staff APIs expose customer account details only. | No customer verification UI added. | Requires customer verification status, document handling, review history, and authorized queue/detail/action APIs. Owner verification is a distinct workflow and is not reused. |
| Customer care | No support, ticket, enquiry, or customer-care routes/models were found in the inspected backend source. | No customer-care queue or ticket UI added. | Requires support case records, categories, status/priority, assignment, notes/follow-up, resolution data, and role-protected APIs. |

Audit scope included `bookingRoutes.js`, `paymentRoutes.js`, `saleRoutes.js`,
`propertyRoutes.js`, `propertyOwnerRoutes.js`,
`propertyOwnerDocumentRoutes.js`, `propertyOwnerAccessRoutes.js`,
`staffRoutes.js`, `authRoutes.js`; their relevant controllers, `Property`,
`Booking`, `Sale`, `User`, and `PropertyOwnerDocument` models; and staff/owner
access middleware.
