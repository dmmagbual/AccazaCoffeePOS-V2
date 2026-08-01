# Manufacturing and Production

Production transforms raw ingredients and semi-finished products into a traceable output batch. Production recipes are centrally governed, versioned BOMs. Store operations create and execute production orders only against an approved version.

The completion application use case delegates every input issue to the shared inventory-consumption engine with `PRODUCTION` as its consumption type. That engine remains the only FIFO allocator. Completion records actual yield, calculates total and per-unit cost, and creates a batch with a shelf-life-derived expiry date.

Operational records are store scoped. Recipe governance is organization scoped. Cashiers have no production permissions; kitchen users execute approved work; managers approve and complete it.
