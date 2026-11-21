---
title: "Types as Sets of Values: Set Theory & Union Semantics"
slug: types-as-sets-unions-string-or-number
subject: typescript
abstract: An architectural, first-principles exploration of type theory through the lens of mathematical set theory. For Java developers used to nominal class hierarchies, discover why TypeScript types are sets of allowable runtime values, master the mechanics of union (|) and intersection (&) operators, resolve the infamous Union Property Paradox, and trace assignability as subset inclusion (A ⊆ B).
tags:
  - typescript
  - type-theory
  - set-theory
  - unions
  - clean-code
published: true
publishDate: Nov 20, 2026
updatedDate: Nov 20, 2026
readTime: 16m read
author:
  name: Kundan
  role: Software Engineer
  handle: '@kundan'
blueprint: deep-dive
learningPath:
  slug: typescript
  name: "TypeScript Syllabus for React"
  module: "ts-mod-00"
  moduleName: "Orientation: From Java to TypeScript"
  lesson: "0.4"
---

# Types as Sets of Values: Set Theory & Union Semantics

In [Lesson 0.3: Structural Typing vs Java's Nominal Typing](/notes/structural-typing-vs-java-nominal-typing), we explored how TypeScript compares data structures by shape rather than nominal declaration. We established that an object with surplus properties satisfies a contract requiring a subset of properties.

Now we must answer the fundamental question that governs TypeScript's type checker: **What, fundamentally, is a "Type"?**

In Java, a type is an explicit blueprint registered with the class loader. `java.lang.String` is a class with a specific memory representation, private byte buffers, and virtual method pointers. Inheritance is a directed tree rooted at `java.lang.Object`.

In TypeScript, **a type is not a blueprint, a class, or a memory template. A type is simply a set of allowable values.**

When you view TypeScript through the mathematical framework of **Set Theory**, confusing compiler behaviors suddenly crystallize into predictable, elegant logic:
- Why does `string | number` mean *"either a string or a number"*?
- Why does the union of two object interfaces allow you to access **fewer** properties than either interface alone?
- Why does `string & number` collapse into `never`?
- What does it *actually* mean when the compiler says `Type 'A' is not assignable to type 'B'`?

In this lesson, we will deconstruct TypeScript's type engine using elementary set operations, visualize the complete type hierarchy from the universal set (`unknown`) to the empty set (`never`), resolve the Union Property Paradox, and establish the mental foundation for discriminated unions in React.

---

## 01. Visual Overview: Mindmap & Decision Flowchart

Before diving into the mathematical formalisms, study this mental map of TypeScript's type space organized as mathematical sets:

### The Set-Theoretic Mindmap

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                TYPES AS SETS: THE COMPLETE TAXONOMY                                    │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

                                          THE UNIVERSAL SET (𝕌)
                                       [ unknown ] (All possible values)
                                                  │
                    ┌─────────────────────────────┼─────────────────────────────┐
                    │                             │                             │
             INFINITE SETS                  FINITE SETS                   OBJECT SHAPES
        ┌───────────────────────┐     ┌───────────────────────┐     ┌───────────────────────┐
        │ string (all strings)  │     │ boolean {true, false} │     │ { id: string }        │
        │ number (all floats)   │     │ Status ("open"|"shut")│     │ (all objects with id) │
        │ bigint (all integers) │     │ null {null}           │     │                       │
        │ symbol (all symbols)  │     │ undefined {undefined} │     │ { id: string,         │
        └───────────────────────┘     └───────────────────────┘     │   name: string }      │
                    │                             │                 │ (narrower subset!)    │
                    └─────────────────────────────┼─────────────────┴───────────────────────┘
                                                  │
                                          SINGLETON SETS (Unit)
                                  "active" | 42 | true | "admin"
                                                  │
                                          THE EMPTY SET (∅)
                                              [ never ]
                                       (Zero allowable values)
```

### The Assignability Flowchart (A ⊆ B)

When the compiler evaluates whether an assignment `const b: B = a` is legal, it executes a subset inclusion proof:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                ASSIGNABILITY DECISION FLOWCHART                                  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘

                       Evaluate assignment: const target: B = sourceValue (type A)
                                                      │
                                                      ▼
                                       Is Set A a subset of Set B?
                                                (A ⊆ B)
                                                      │
                            ┌─────────────────────────┴─────────────────────────┐
                            ▼                                                   ▼
                          [ YES ]                                             [ NO ]
                            │                                                   │
                Every possible value in A                           At least one value in A
                 is a valid member of B.                             cannot belong to B.
                            │                                                   │
                            ▼                                                   ▼
                  ✅ COMPILES CLEANLY                                 ❌ COMPILER ERROR TS2322
              "Type A is assignable to B"                        "Type A is not assignable to B"
                            │                                                   │
          Example:                                            Example:
          - A = "open" (singleton set)                        - A = string (infinite set)
          - B = string (infinite set)                         - B = "open" (singleton set)
          {"open"} ⊆ string  --> Legal!                       string ⊈ {"open"} --> Illegal!
```

---

## 02. The Core Set Hierarchy: From `never` to `unknown`

To master set theory in TypeScript, let us examine the four primary categories of sets:

### 1. The Empty Set (∅): `never`

The `never` type is the set containing **zero values**:

:::formula
never = ∅
:::

Because it contains no values, you can never assign anything to a variable of type `never`:

```typescript
let deadEnd: never;

// ❌ COMPILE ERROR: Type '123' is not assignable to type 'never'.
deadEnd = 123;
// ❌ COMPILE ERROR: Type '"hello"' is not assignable to type 'never'.
deadEnd = "hello";
```

Where does `never` appear naturally?
1. Functions that never return (infinite loops or functions that unconditionally throw).
2. Impossible intersections (e.g., `string & number`).
3. Exhaustive switch checks where all union cases have been eliminated.

### 2. Singleton Sets (Unit Types / Literals)

A literal type represents a set containing **exactly one value**:

```typescript
type Port = 8080;         // Set containing exactly one number: { 8080 }
type Protocol = "https";  // Set containing exactly one string: { "https" }
type IsActive = true;     // Set containing exactly one boolean: { true }
```

### 3. Finite Sets: The `boolean` & Literal Unions

In Java, `boolean` is a primitive primitive keyword. In TypeScript's type system, `boolean` is literally defined as a set union of two singleton sets:

:::formula
boolean = { true } ∪ { false } = true | false
:::

When you declare a string literal union:

```typescript
type DeploymentStage = "dev" | "staging" | "production";
```

You have created a finite set with a cardinality of 3:

:::formula
DeploymentStage = { "dev", "staging", "production" }
:::

### 4. Infinite Sets: `string`, `number`, `bigint`

`string` is the set of all infinitely possible sequences of characters. `number` is the set of all IEEE 754 double-precision floating-point numbers.

### 5. The Universal Set (𝕌): `unknown`

`unknown` is the set containing **every single possible value** in the JavaScript universe: numbers, strings, functions, objects, symbols, null, undefined:

:::formula
unknown = 𝕌
:::

Because every conceivable value belongs to 𝕌, **any value can be assigned to `unknown`**:

```typescript
let anything: unknown;
anything = 42;             // Legal
anything = "hello";        // Legal
anything = { id: 1 };      // Legal
```

However, because `unknown` could be anything, TypeScript forbids invoking methods or accessing properties on it until you narrow it down to a smaller subset.

:::callout{type="info" title="What About any?"}
`any` is not a mathematical set. It is a pragmatic compiler instruction to **turn off the type checker entirely**. It breaks set theory and acts as both the universal set and the empty set simultaneously. In production codebases, avoid `any`; use `unknown` with narrowing instead.
:::

---

## 03. Union Types (A ∪ B): The "Either This or That" Operator

In mathematical set theory, the union of two sets A and B contains every element that belongs to A, or belongs to B, or belongs to both:

:::formula
A ∪ B = { x | x ∈ A ∨ x ∈ B }
:::

In TypeScript, union types are expressed using the pipe (`|`) character:

```typescript
type Identifier = string | number;
```

```
┌─────────────────────────────────────────────────────────────┐
│                   SET UNION: string | number                │
└─────────────────────────────────────────────────────────────┘

         Set: string                         Set: number
    ┌────────────────────┐              ┌────────────────────┐
    │  "order_101"       │              │  101               │
    │  "usr_9921"        │  ⋃ (Union)   │  9921              │
    │  "temp_token"      │              │  3.14159           │
    └────────────────────┘              └────────────────────┘
               │                                   │
               └─────────────────┬─────────────────┘
                                 ▼
                     Allowable Value Domain:
         Any value from 'string' OR any value from 'number'
```

### Contrast with Java

In Java, how do you express that a method accepts either an `Integer` or a `String`?
1. **Method Overloading**: Write two distinct methods: `process(String s)` and `process(Integer i)`.
2. **Untyped `Object` Parameter**: Accept `Object` and write messy `instanceof` casts.
3. **Third-Party Wrapper / Either**: Use functional wrappers like `Either<String, Integer>`.
4. **Sealed Interfaces (Java 17+)**: Create a `sealed interface Identifier permits StringId, NumberId`.

In TypeScript, you simply write `string | number`. No wrappers, no class declarations, and zero runtime memory overhead.

---

## 04. The Union Property Paradox

Now consider a paradox that trips up almost every engineer:

```typescript
interface Car {
  drive(): void;
  refuelGasoline(): void;
}

interface ElectricVehicle {
  drive(): void;
  rechargeBattery(): void;
}

type Vehicle = Car | ElectricVehicle;

function serviceVehicle(v: Vehicle) {
  // ✅ Compiles!
  v.drive();

  // ❌ COMPILE ERROR:
  // Property 'refuelGasoline' does not exist on type 'Vehicle'.
  // Property 'refuelGasoline' does not exist on type 'ElectricVehicle'.
  v.refuelGasoline();

  // ❌ COMPILE ERROR:
  // Property 'rechargeBattery' does not exist on type 'Vehicle'.
  v.rechargeBattery();
}
```

Look at the error:
- `Vehicle` is a **Union** of `Car` and `ElectricVehicle`.
- In everyday English, "union" means *"everything combined together"*.
- Yet, when you access `v`, TypeScript **only lets you access `drive()`**—the property shared by both! It explicitly forbids accessing `refuelGasoline` or `rechargeBattery`.

Why does the *union* of two types result in *fewer* accessible properties?

### The Mathematical Explanation: Values vs. Properties (Duality)

The confusion arises because developers confuse the **Set of Allowable Values** with the **Set of Accessible Properties**. They are inversely related:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 THE VALUE-PROPERTY DUALITY                                       │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘

  1. VALUES SPACE: Set Union grows LARGER (More values allowed)
     The set of possible values for (Car | ElectricVehicle) contains:
     - All Car objects (Toyota, Ford, Honda)
     - All ElectricVehicle objects (Tesla, Rivian, Lucid)
     Total value domain = Car values ⋃ EV values.

  2. GUARANTEED PROPERTIES: Set Intersection shrinks SMALLER (Fewer guarantees)
     To be 100% type-safe, the compiler can only allow operations that are GUARANTEED
     to succeed on EVERY single value in that set.
     - Can the compiler guarantee that EVERY vehicle in the set has refuelGasoline()? 
       NO! (A Tesla does not have a gas tank; calling refuelGasoline() will crash with TypeError).
     - Can the compiler guarantee that EVERY vehicle in the set has rechargeBattery()? 
       NO! (A diesel Ford truck has no high-voltage battery pack).
     - Can the compiler guarantee that EVERY vehicle in the set has drive()? 
       YES! (Both Cars and EVs implement drive()).
```

:::formula{title="The Fundamental Law of Type Unions"}
Values(A | B) = Values(A) ∪ Values(B)
Guaranteed Properties(A | B) = Properties(A) ∩ Properties(B)
:::

When you take the union of types, you expand the set of allowable **values**, but you shrink the set of guaranteed **properties** to the intersection of their common keys.

---

## 05. Intersection Types (A ∩ B): The Contract Combiner

The intersection of two sets A and B contains only values that belong to **both** sets simultaneously:

:::formula
A ∩ B = { x | x ∈ A ∧ x ∈ B }
:::

In TypeScript, intersection types are expressed using the ampersand (`&`):

### 1. Intersecting Incompatible Primitives = `never`

What happens when you intersect primitive types?

```typescript
type Impossible = string & number;
```

Is there any value in JavaScript that is simultaneously a `string` AND a `number`?
No. A value is either a string or a number; it cannot be both. Therefore:

:::formula
string ∩ number = ∅ = never
:::

The TypeScript compiler simplifies `Impossible` to `never`.

### 2. Intersecting Object Types = Combined Properties

Now consider intersecting object interfaces:

```typescript
interface Identifiable {
  id: string;
}

interface Timestamped {
  createdAt: number;
  updatedAt: number;
}

interface SoftDeletable {
  isDeleted: boolean;
}

// Combine all three contracts into one
type AuditEntity = Identifiable & Timestamped & SoftDeletable;
```

What is the set of values for `AuditEntity`?
It is the set of all JavaScript objects that simultaneously satisfy:
- Having an `id: string`
- AND having `createdAt: number` and `updatedAt: number`
- AND having `isDeleted: boolean`

Notice the inverse duality in action again:
- The set of **allowable values** is **smaller** (a plain `{ id: "1" }` is rejected because it lacks timestamp properties).
- The set of **accessible properties** is the **union of all properties**: `{ id, createdAt, updatedAt, isDeleted }`.

:::formula{title="The Fundamental Law of Type Intersections"}
Values(A & B) = Values(A) ∩ Values(B)
Accessible Properties(A & B) = Properties(A) ∪ Properties(B)
:::

---

## 06. Assignability as Subset Inclusion (A ⊆ B)

Whenever the TypeScript compiler encounters an assignment:

```typescript
const target: TargetType = sourceValue; // where sourceValue has SourceType
```

It is answering one mathematical question:

:::formula
SourceType ⊆ TargetType ?
:::

Let us test this against real scenarios:

### Scenario 1: Literal assigned to primitive

```typescript
type Status = "ACTIVE";
let s: Status = "ACTIVE";
let generalStr: string = s; // ✅ Compiles!
```
- Source = `{"ACTIVE"}`
- Target = `string`
- Proof: `{"ACTIVE"} ⊆ string` is **TRUE**.

What about the reverse?
```typescript
let rawInput: string = "ACTIVE";
let statusVar: Status = rawInput; // ❌ COMPILE ERROR
```
- Source = `string`
- Target = `{"ACTIVE"}`
- Proof: `string ⊆ {"ACTIVE"}` is **FALSE** (a string could be `"PENDING"`, `"DELETED"`, etc.).

### Scenario 2: Object with surplus properties

```typescript
interface BaseUser {
  id: string;
}

interface DetailedUser {
  id: string;
  name: string;
  roles: string[];
}

let admin: DetailedUser = { id: "u_1", name: "Alice", roles: ["admin"] };
let base: BaseUser = admin; // ✅ Compiles!
```

Why is `DetailedUser` assignable to `BaseUser`?
- Every object that has `{ id, name, roles }` satisfies the condition of having `{ id }`.
- Therefore, the set of all `DetailedUser` objects is a **strict subset** of all `BaseUser` objects:

:::formula
DetailedUser ⊆ BaseUser
:::

---

## 07. Production Comparison Matrix

| Set Concept | Mathematical Symbol | TypeScript Syntax | Semantic Meaning |
| :--- | :--- | :--- | :--- |
| **Empty Set** | ∅ | `never` | Zero allowable values. Subtype of every type. |
| **Universal Set** | 𝕌 | `unknown` | All possible values. Supertype of every type. |
| **Unit / Singleton** | { x } | Literal (`"active"`, `42`) | Exactly one specific value. |
| **Set Union** | A ∪ B | `A \| B` | Values in A OR in B. Access only shared properties. |
| **Set Intersection** | A ∩ B | `A & B` | Values in A AND in B. Combines all object properties. |
| **Subset (Subtyping)** | A ⊆ B | `A extends B` / assignable | Every value in A is valid where B is expected. |
| **Complement / Difference**| A \ B | `Exclude<A, B>` | Values in set A after removing any values present in B. |

---

## 08. Summary & Checkpoint

### The Five Invariants of Set-Theoretic Typing

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       THE SET THEORY INVARIANTS                             │
└─────────────────────────────────────────────────────────────────────────────┘
  1. A type is a set of allowable values; assignability is subset inclusion (A ⊆ B).
  2. `never` is the empty set (∅); `unknown` is the universal set (𝕌).
  3. Unions (A | B) broaden the allowable values, but restrict properties to common keys.
  4. Intersections (A & B) narrow the allowable values, but combine all object properties.
  5. Literal types are singleton sets; boolean is simply the union (true | false).
```

### Module Checkpoint: Interactive Logical Verification

Test your mastery of set-theoretic typing against these real-world architectural scenarios. Unfold each drawer to verify the logical proof and compiler deduction.

:::solution{title="Question 1: The Union Property Paradox & Property Narrowing"}
**Scenario:**
Given the following interfaces:
```typescript
interface AdminUser {
  id: string;
  permissions: string[];
}

interface GuestUser {
  id: string;
  anonymousSessionId: string;
}

type AppUser = AdminUser | GuestUser;
```
Why does `user.permissions` cause a compilation error when `user` is typed as `AppUser`, and what is the exact set-theoretic reason?

**Logical Answer & Proof:**
1. **Mathematical Set Definition:**
   `Values(AppUser) = Values(AdminUser) ∪ Values(GuestUser)`
2. **The Invariant of Static Safety:**
   For an operation to be safe on a union type, it must be valid for **every element** in the union set.
3. **The Counterexample:**
   A `GuestUser` object belongs to `AppUser`. If the compiler allowed `user.permissions`, passing a `GuestUser` at runtime would cause `undefined.slice()` or `undefined.length`, resulting in a fatal `TypeError`.
4. **Conclusion:**
   The compiler restricts accessible properties to the intersection of keys:
   `Accessible(AppUser) = {"id"} ∩ ({"id", "permissions"} ∪ {"id", "anonymousSessionId"}) = {"id"}`
   To access `permissions`, you must first narrow the set using a type guard (e.g., `"permissions" in user`).
:::

:::solution{title="Question 2: Incompatible Primitive Intersections vs. Object Intersections"}
**Scenario:**
Explain why `type X = string & number` collapses to `never`, whereas `type Y = { id: string } & { age: number }` forms a completely valid composite object type.

**Logical Answer & Proof:**
1. **Primitive Values Representation:**
   Primitives are disjoint sets in JavaScript runtime memory. No scalar value can be simultaneously of primitive type string and primitive type number:
   `string ∩ number = ∅ = never`
2. **Object Shapes Representation:**
   An object type `{ id: string }` does not define a single scalar value; it defines the set of all JavaScript objects that possess at least the property `id: string`.
   - Set A = { objects with key 'id' }
   - Set B = { objects with key 'age' }
3. **The Non-Empty Intersection:**
   There exist infinite objects that possess *both* keys (for example, `{ id: "u_1", age: 30, role: "editor" }`).
   Therefore:
   `Set A ∩ Set B = { objects possessing both 'id' and 'age' } ≠ ∅`
   The intersection succeeds and yields an object type with both properties.
:::

:::solution{title="Question 3: Subset Inclusion and Width Subtyping Proof"}
**Scenario:**
In mathematics, if set A has *more* constraints than set B, explain why A is a *subset* of B (A ⊆ B), and relate this to why an object with 5 properties can be passed to a function expecting an object with only 2 properties.

**Logical Answer & Proof:**
1. **Constraint Inversion:**
   Every time you add a required property to an interface, you impose an additional filter criterion, filtering out candidates that do not meet the requirement.
   - Let B = { all objects having 'id' }. (Huge set: includes cars, users, invoices, buttons).
   - Let A = { all objects having 'id', 'name', 'email', 'role', 'avatar' }. (Much smaller, highly specialized set).
2. **Subset Inclusion:**
   Every single object in set A possesses an `id`. Therefore, every member of A is automatically a member of B:
   `A ⊆ B`
3. **Assignability Rule:**
   Because `A ⊆ B`, wherever an element of B is expected, any element of A can be safely provided without violating the contract. This is the mathematical proof of **Width Subtyping**.
:::

---

In the next lesson ([Lesson 0.5: TypeScript in 5 Minutes: Rapid Tour of Inference, Interfaces & Generics](/notes/typescript-rapid-tour-inference-interfaces-generics)), we will synthesize everything we have covered so far—static analysis, type erasure, structural compatibility, and set theory—into a high-speed practical tour of TypeScript syntax.
