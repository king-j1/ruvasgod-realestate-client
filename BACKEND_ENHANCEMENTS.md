# Backend enhancement requests for the Real Estate frontend

This is a read-only contract review report. No backend code, configuration,
dependencies, or data were changed.

## Public property search

The existing `GET /api/properties` implementation returns all currently
published, verified properties, sorts by creation time descending, and does
not implement filtering, pagination, or selectable sorting. The frontend
therefore applies region, city, area, property type, listing type, price,
bedroom, and bathroom filters in memory. Client-side filtering and pagination
are not substitutes for backend filtering and pagination, and results are
limited to the properties returned by the existing public API.

Enhance the existing public listing capability with validated server-side
filters for the supported property and address fields, selectable sorting,
and stable pagination metadata. Define the accepted query contract and its
validation before the frontend sends those values.

## Radius-based location search

The property model stores GeoJSON coordinates and has a geospatial index, but
the public property listing controller does not use them to perform a radius
search. The frontend does not advertise or implement radius-based GPS search.

Provide a separately specified, bounded geospatial search capability and
document its accepted coordinates, distance units, validation, and result
limits before adding a corresponding frontend control.

## Property enquiries

The inspected property routes expose public property reads and protected
property management operations. No property enquiry submission route or
request contract was found.

There is no frontend enquiry submission or claim that a contact request has
been sent. A future backend task would need to define an authorized enquiry
workflow, request and response contract, validation, spam controls, and
handling of customer contact information.

## Staff property owner selection and documents

Property creation requires an `ownerRecord` and checks the caller's explicit
`canViewOwner` assignment. The owner routes support owner creation and
permission-checked retrieval by a known ID, but no endpoint for listing
available owner records was found. Owner-document operations also require
individual assignment permissions.

The create form therefore requires an already assigned owner record ID. The
frontend does not list owner records, infer document permissions, or create
owner-document management screens. An authorized backend capability for
retrieving assigned owner records and their effective permissions would be
needed for a safe selection-based workflow; document operations must continue
to enforce individual permissions server-side.
