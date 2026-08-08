# Artificial Language Module

## Purpose

This module defines the artificial language used to describe and generate context resources. It provides the foundational vocabulary, syntax, and semantics for declaring structured context value types – think: data primitives and "classes".

## Architecture

The language is built on a self-describing bootstrap model where the meta-model and its instances co-define each other.

### Bootstrap Cycle

```
ValueType: Primitive describes → Primitive: Record, List, Map, Enum, Identifier, ...
Primitive: Record provides semantics for → ValueType: Primitive (and all other ValueTypes)
```

Neither exists independently; together they form the bootstrap layer. This circular dependency is intentional and necessary for a self-describing system.

### Verification

The bootstrap consistency is verified by:

1. Taking the `ValueType: Primitive` definition
2. Showing that each primitive (`Record`, `List`, `Map`, `Enum`, `Identifier`, etc.) matches its schema
3. Showing that each primitive's attributes map back to `PrimitiveName`, `PrimitiveParams`, `PrimitiveAttributes`, etc.

This verification process lives in `./_processes/verify-bootstrap__process__art.md` and is executed as part of Phase 6.
