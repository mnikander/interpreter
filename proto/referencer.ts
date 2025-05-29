// Copyright (c) 2025 Marco Nikander

import { AST, RawAST, is_node_raw, LeafIdentifier, is_leaf, is_leaf_boolean, is_leaf_number, is_leaf_string, is_leaf_identifier, Reference } from "./ast";
import { error, is_error, Result } from "./error";

// TODO: 
// - enable nested environments
// - resolve variable references and check them for existence and uniqueness
// - annotate the binding site IDs in the AST (so further processing in semantic analysis and evaluation can use them)

// I could go through the AST and:
// - copy the AST one node and leaf at time, while constructing a scoped name environment
// - search for LeafIdentifiers
// - check if they are a reference (which is most of them: at least half of them if all variables are used at least once)
// - replace the LeafIdentifier with a Reference / Symbol which contains the binding id
// - return the annotated AST

// Unclear points:
// - How do I reference built-in functions? Do they get pre-assigned IDs?
// - If the built-ins do get pre-assigned IDs, how do they get them? What is the simplest way to give unique IDs to the built-in functions?
// - Once every identifier has a unique ID, and all references have been resolved so that they contain that binding ID, what do I do with that information?
// - How does the evaluator use the unique binding IDs when evaluating stuff?
// - Does reference resolution ensure scoping and identifier use is correct?
// - Is scoping information still relevant after reference resolution?

// I think I need IDs for the built-in functions first, that way I can start testing the reference resolution
// Or I implement let-bindings and test them that way, though what happens with the built-ins then? 
// Could they simply not have a binding site? But how are they distinguished from unknown identifiers then? Unknown identifiers need to throw (semantic) errors.

type ScopedNames = {
    parent: undefined | ScopedNames,
    symbols: Map<string, number>,
};

// I could create a builtin table which has unique ids for every builtin function, and set it as the root node in the ScopedNames tree structure

export function resolve_references(raw: RawAST, env: ScopedNames): Result<AST> {
    if (is_node_raw(raw)) {

        // TODO: handle the case of the node being a let-binding or lambda, for which a new environment needs to be created right here

        const mapped_data: Result<AST>[] = raw.data.map((raw: RawAST) => { return resolve_references(raw, env); });
        let first_error: undefined | Result<AST> = mapped_data.find(is_error);
        if (first_error === undefined) {
            const unpacked_mapped_data = (mapped_data as { ok: true, value: AST }[]).map((element) => { return element.value});
            const ast: AST = { kind: raw.kind, subkind: raw.subkind, token_id: raw.token_id, node_id: raw.node_id, data: unpacked_mapped_data };
            return { ok: true, value: ast };
        }
        else {
            return { ok: false, error: first_error.error };
        }
    }
    else if (is_leaf(raw)){
        if (is_leaf_identifier(raw)) {
            const id: undefined | number = lookup(raw, env);
            if (id === undefined) {
                return { ok: false, error: error("Analyzing", "undefined variable", raw.token_id)};
            }
            else {
                const ref: Reference = { kind: "Reference", token_id: raw.token_id, node_id: raw.node_id, binding_id: id};
                return { ok: true, value: ref };
            }
        }
        else if (is_leaf_boolean(raw) || is_leaf_number(raw) || is_leaf_string(raw)) {
            return { ok: true, value: raw };
        }
        else {
            return { ok: false, error: error("Analyzing", "unknown leaf type, there is a bug in the program, not all cases are covered", raw.token_id) };
        }
    }
    return { ok: false, error: error("Analyzing", "raw AST entry which is neither a RawNode nor a Leaf, there is a bug in the program, not all cases are covered", (raw as RawAST).token_id) };
}

function lookup(identifier: LeafIdentifier, environment: ScopedNames): undefined | number {
    const entry: undefined | number = environment.symbols.get(String(identifier.value));
    if (entry !== undefined) {
        return entry;
    }
    else {
        if (environment.parent !== undefined) {
            return lookup(identifier, environment.parent);
        }
        else {
            // we are already in the global context (the root node), and have nowhere left to search for the identifier
            return undefined;
        }
    }
}
