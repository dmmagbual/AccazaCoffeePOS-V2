# Ingredient and Inventory Master — Part 1

Part 1 defines organization-owned ingredient categories and ingredient master
records. Creating an ingredient creates no inventory quantity, batch, movement,
supplier link, conversion, or procurement record. Historical ingredients are
deactivated rather than deleted. Inventory enters only through controlled opening
balance and receiving workflows in later parts.

The service validates codes, hierarchy, organization isolation, stock thresholds,
and `ingredients.manage` permission before returning auditable domain events.
