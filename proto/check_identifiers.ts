// Copyright (c) 2025 Marco Nikander

import { AST } from "./ast";
import { ValueEnvironment } from "./evaluator";
import { error, Result } from "./error";

export function check_identifiers(ast: AST, env: ValueEnvironment): Result<undefined> {
    return { ok: true, value: undefined };
}
