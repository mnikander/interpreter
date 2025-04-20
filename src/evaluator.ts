// Copyright (c) 2025 Marco Nikander

import { is_nd_boolean, is_nd_number, is_nd_identifier, is_nd_call, Node, NodeAtom, NodeCall, NodeIdentifier} from "./parser";

export function evaluate(ast: Node): undefined | boolean | number | string {
    // hardcode the use of a single constant OR addition
    if (is_nd_boolean(ast)) {
        return (ast as NodeAtom).value;
    }
    else if (is_nd_number(ast)) {
        return (ast as NodeAtom).value;
    }
    else if (is_nd_call(ast)) {
        const call = ast as NodeCall;
        if (is_nd_identifier(call.func)) {
            const func = call.func as NodeIdentifier;
            if (func.value === "+") {
                if(call.params.length == 2) {
                    if(is_nd_number(call.params[0]) && is_nd_number(call.params[1])) {
                        const left = call.params[0] as NodeAtom;
                        const right = call.params[1] as NodeAtom;
                        if (typeof left.value === "number" && typeof right.value === "number") {
                            return left.value + right.value;
                        }
                        else {
                            return "ERROR: invalid arguments, expected numbers";
                        }
                    }
                    else {
                        return "ERROR: invalid arguments, expected atoms"
                    }
                }
                else {
                    return "ERROR: invalid number of arguments, expected 2";
                }
            }
            else {
                return "ERROR: unknown function";
            }
        }
        else {
            return "ERROR: expected function identifier";
        }
    }
    else {
        return "ERROR: invalid expression";
    }
}
