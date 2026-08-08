# Artificial Formatters

**Purpose:** This file declares procedures to format routine invokations.

## Declares

<!-- WIP create tools to replace formatters -->

### Routine: Generate Routine Invokation (#all)

**Generates:** A formatted process invocation reference.

**Inputs:**

- `%routine`: The Routine to invoke.
- `%context`: The inputs of the Routine.
- `%outcome`: The outcome, or outputs, of the Routine.

**Outputs:**

- `%invokation` (see examples below)

**Process:**

With the inputs, execute the following actions:

1.  Prepare the `%invokation` using the pattern "execute the **{`%routine.name`}**`. Expected Result: "execute the **Routine: Add Items to Parking Lot**".
2.  If `%context` is provided, prepend it using the pattern "With {`%context`}, `%invokation`". Expected Result: "With the generated items, execute the **Routine: Add Items to Parking Lot**".
3.  If outcome is provided, append it using the pattern "{`%invokation`} to {`%outcome`}". Expected Result: "With the generated items, execute the **routine for Adding Items to Parking Lot** to keep track of progress".
4.  Return the `%invokation`.

**Examples**

- Correct: `Execute the **Process for Adding Items to Parking Lot** to keep track of progress.`
- Correct: `Execute the **Process for Adding Items to Parking Lot** with the generated items to keep track of progress.`
- Correct: `With the generated items, execute the **Process for Adding Items to Parking Lot** to keep track of progress.`
